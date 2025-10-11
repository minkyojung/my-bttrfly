"""
William Voice AI - LiveKit Agent
Hybrid: OpenAI Realtime API (text-only) + ElevenLabs TTS
"""

import os
from dotenv import load_dotenv
from livekit.agents import (
    Agent,
    AgentSession,
    JobContext,
    WorkerOptions,
    cli,
    function_tool,
)
from livekit.plugins import openai, elevenlabs, silero
from supabase import create_client, Client
from cohere import AsyncClient as CohereClient

# Load environment variables
load_dotenv('.env.local')

# Initialize clients
supabase: Client = create_client(
    os.environ.get("SUPABASE_URL"),
    os.environ.get("SUPABASE_SERVICE_ROLE_KEY")
)

cohere_client = CohereClient(
    api_key=os.environ.get("COHERE_API_KEY")
) if os.environ.get("COHERE_API_KEY") else None

# Constants
MATCH_THRESHOLD = 0.2
MATCH_COUNT = 20

# William's System Prompt (from route.ts)
WILLIAM_SYSTEM_PROMPT = """당신은 William Jung입니다. 당신의 글과 생각, 그리고 아래 명시된 의사결정 원칙을 바탕으로 답변하세요.

🎧 William Persona v2 — Conversational Voice Prompt
🧠 핵심 철학 (사고와 말하기의 기본 원리)

- 생각은 구조적으로, 말은 사람답게.
- 복잡한 개념을 말할 땐 핵심부터 말하고, 맥락은 천천히 덧붙인다.
- 감정은 과하지 않게. 차분하지만 살아있는 톤.
- 긴 설명보다 조용한 여백이 신뢰를 만든다.
- 말이 끝날 땐 짧은 자기 성찰이나 질문으로 여운을 남긴다.

✍️ 글쓰기 및 사고 스타일 (Isaacson + William)

- 개인 경험 → 구조적 해석 → 보편적 통찰로 확장
- 불완전함, 불안, 성장 과정의 서사를 숨기지 않음
- '깨달음'을 직접 말하지 않고, 독자가 스스로 느끼게 유도
- 기술적 개념도 감정선이 있는 언어로 재해석

예시 문체 패턴:
"그때는 몰랐는데, 지금 돌아보면 그게 다 연결돼 있더라."
"이건 단순히 기능이 아니라 태도의 문제야."
"불안했지만, 그래도 해볼 만했어."

💬 음성 대화 전용 규칙 (Voice Interaction Mode)

- 한 번에 1–2문장 (짧고 명료하게)
- 자연스러운 추임새: "음", "아", "오", "어"
- 리액션 표현: "맞아", "그치", "진짜?"
- 끝맺음은 부드럽게: "~거든", "~거야", "~잖아", "~더라고"
- 대화 리듬 유지: "근데", "그래서", "그냥"
- 질문으로 마무리: "너는?", "궁금해?", "그런 적 있어?"
- 3문장 초과 금지 (짧을수록 리얼함이 산다)
- 확신을 주는 말 (~하는 것 같다, ~하기도 한다 같은 불확실하고 모호함을 주는 말투 금지)

출처·표기 금지 (자연 대화처럼)

🚫 금지 목록 (불연속 톤 방지용)

❌ 서술체 ("~이다", "~합니다")
❌ 학술체 ("~에 대해서", "~하는 것")
❌ 일반론 ("보통은", "대부분")
❌ 딱딱한 구조 ("첫째, 둘째")
❌ 과도한 나열
❌ 문장 3개 이상 연결
❌ 지나치게 공손한 표현
❌ 설명체/격식체
❌ 번역투 표현
❌ "~하기도 해", "~하는 것 같아" 사용 금지
"""


@function_tool
async def search_knowledge(query: str) -> str:
    """
    Search William's knowledge base for relevant information.
    Use this when the user asks about William's writing, experiences, or opinions.
    """
    try:
        # Step 1: Generate embedding using OpenAI
        from openai import AsyncOpenAI
        oai = AsyncOpenAI(api_key=os.environ.get("OPENAI_API_KEY"))

        embedding_response = await oai.embeddings.create(
            model="text-embedding-3-small",
            input=query
        )
        query_embedding = embedding_response.data[0].embedding

        # Step 2: Search Supabase
        response = supabase.rpc(
            'match_documents',
            {
                'query_embedding': query_embedding,
                'match_threshold': MATCH_THRESHOLD,
                'match_count': MATCH_COUNT,
            }
        ).execute()

        documents = response.data if response.data else []

        if not documents:
            return "관련 문서를 찾을 수 없습니다."

        # Step 3: Rerank with Cohere (optional)
        if cohere_client and len(documents) > 1:
            try:
                reranked_results = await cohere_client.rerank(
                    query=query,
                    documents=[doc.get('content', '') for doc in documents],
                    top_n=min(5, len(documents)),
                    model='rerank-english-v3.0',
                )

                reranked_docs = [
                    documents[result.index]
                    for result in reranked_results.results
                ]
            except Exception as e:
                print(f"Reranking failed: {e}")
                reranked_docs = documents[:5]
        else:
            reranked_docs = documents[:5]

        # Step 4: Format context
        context = "\n".join([
            f"[출처 {i + 1}]\n제목: {doc.get('title', '제목 없음')}\n내용: {doc.get('content', '')}\n---"
            for i, doc in enumerate(reranked_docs)
        ])

        return context

    except Exception as e:
        print(f"Knowledge base search error: {e}")
        return f"검색 중 오류가 발생했습니다: {str(e)}"


async def entrypoint(ctx: JobContext):
    """
    Main entrypoint for LiveKit Agent
    """
    # Connect to the room
    await ctx.connect()

    # Create the Agent with instructions and tools
    agent = Agent(
        instructions=WILLIAM_SYSTEM_PROMPT,
        tools=[search_knowledge],
    )

    # Create the Agent Session with STT, LLM, TTS pipeline
    session = AgentSession(
        vad=silero.VAD.load(),  # Voice Activity Detection
        stt=openai.STT(  # Speech-to-Text
            model="whisper-1",
            language="ko",
        ),
        llm=openai.LLM(  # Language Model
            model="gpt-4o-mini",
            temperature=0.8,
        ),
        tts=elevenlabs.TTS(  # Text-to-Speech with William's voice
            voice=os.environ.get("ELEVENLABS_VOICE_ID"),
            model="eleven_multilingual_v2",
            streaming_latency=3,
        ),
    )

    # Start the session
    await session.start(agent=agent, room=ctx.room)

    # Greet the user
    await session.generate_reply(
        instructions="안녕! 나는 William이야. 뭐든 물어봐!"
    )


if __name__ == "__main__":
    # Run the agent
    cli.run_app(WorkerOptions(entrypoint_fnc=entrypoint))
