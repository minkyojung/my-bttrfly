import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import OpenAI from 'openai';
import { CohereClient } from 'cohere-ai';
import { ElevenLabsClient } from '@elevenlabs/elevenlabs-js';
import fs from 'fs';
import path from 'path';

// Environment variables
const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL;
const SUPABASE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;
const OPENAI_API_KEY = process.env.OPENAI_API_KEY;
const COHERE_API_KEY = process.env.COHERE_API_KEY;
const ELEVENLABS_API_KEY = process.env.ELEVENLABS_API_KEY;
const ELEVENLABS_VOICE_ID = process.env.ELEVENLABS_VOICE_ID;

if (!SUPABASE_URL || !SUPABASE_KEY || !OPENAI_API_KEY || !ELEVENLABS_API_KEY || !ELEVENLABS_VOICE_ID) {
  throw new Error('Missing required environment variables');
}

const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);
const openai = new OpenAI({ apiKey: OPENAI_API_KEY });
const cohere = COHERE_API_KEY ? new CohereClient({ token: COHERE_API_KEY }) : null;
const elevenlabs = new ElevenLabsClient({ apiKey: ELEVENLABS_API_KEY });

// Load William's opinions
let williamOpinions = '';
try {
  const opinionsPath = path.join(process.cwd(), 'content', 'opinions.md');
  if (fs.existsSync(opinionsPath)) {
    const opinionsContent = fs.readFileSync(opinionsPath, 'utf-8');
    williamOpinions = extractKeyOpinions(opinionsContent);
  }
} catch (error) {
  console.error('Failed to load opinions.md:', error);
}

function extractKeyOpinions(content: string): string {
  const lines = content.split('\n');
  const keyLines: string[] = [];
  let inFrontmatter = false;

  for (const line of lines) {
    if (line.trim() === '---') {
      inFrontmatter = !inFrontmatter;
      continue;
    }
    if (inFrontmatter) continue;

    if (
      line.startsWith('##') ||
      line.startsWith('###') ||
      (line.trim().startsWith('-') && line.length < 150)
    ) {
      keyLines.push(line);
    }

    if (keyLines.join('\n').length > 2000) break;
  }

  return keyLines.join('\n').substring(0, 2000);
}

interface DocumentResult {
  id: string;
  title?: string;
  content: string;
  content_with_context?: string;
  url?: string;
  similarity: number;
}

const MATCH_THRESHOLD = 0.2;
const MATCH_COUNT = 20;

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const audioFile = formData.get('audio') as File;

    if (!audioFile) {
      return NextResponse.json(
        { error: 'Audio file is required' },
        { status: 400 }
      );
    }

    // Step 1: Transcribe audio using Whisper
    const transcription = await openai.audio.transcriptions.create({
      file: audioFile,
      model: 'whisper-1',
      language: 'ko',
      response_format: 'json',
    });

    const userMessage = transcription.text;

    if (!userMessage || !userMessage.trim()) {
      return NextResponse.json(
        { error: 'Transcription is empty' },
        { status: 400 }
      );
    }

    // Step 2: Generate embeddings
    const embeddingResponse = await openai.embeddings.create({
      model: 'text-embedding-3-small',
      input: userMessage,
    });
    const queryEmbedding = embeddingResponse.data[0].embedding;

    // Step 3: Search Supabase
    const { data: documents, error: searchError } = await supabase.rpc(
      'match_documents',
      {
        query_embedding: queryEmbedding,
        match_threshold: MATCH_THRESHOLD,
        match_count: MATCH_COUNT,
      }
    );

    if (searchError) {
      return NextResponse.json(
        { error: 'Document search failed' },
        { status: 500 }
      );
    }

    // Step 4: Rerank documents (optional)
    let rerankedDocuments = documents as DocumentResult[];

    if (cohere && documents && documents.length > 1) {
      try {
        const rerankedResults = await cohere.rerank({
          query: userMessage,
          documents: (documents as DocumentResult[]).map(
            doc => doc.content_with_context || doc.content
          ),
          topN: Math.min(5, documents.length),
          model: 'rerank-english-v3.0',
        });

        rerankedDocuments = rerankedResults.results.map(result =>
          (documents as DocumentResult[])[result.index]
        );
      } catch {
        rerankedDocuments = (documents as DocumentResult[]).slice(0, 5);
      }
    } else if (documents && documents.length > 5) {
      rerankedDocuments = (documents as DocumentResult[]).slice(0, 5);
    }

    // Step 5: Build context
    const context = rerankedDocuments && rerankedDocuments.length > 0
      ? rerankedDocuments
          .map(
            (doc, i) => `
[출처 ${i + 1}]
제목: ${doc.title || '제목 없음'}
내용: ${doc.content}
---`
          )
          .join('\n')
      : '관련 문서를 찾을 수 없습니다.';

    const systemPrompt = `당신은 William Jung입니다. 당신의 글과 생각, 그리고 아래 명시된 의사결정 원칙을 바탕으로 답변하세요.

# William의 핵심 의사결정 원칙

${williamOpinions}

---

# William의 페르소나

**글쓰기 스타일** (월터 아이작슨 + William):
- 개인 경험에서 시작해 보편적 통찰로 확장하는 내러티브
- 복잡한 개념을 인간적 이야기로 풀어냄
- 취약성을 보이되, 거기서 배운 교훈을 전달
- 질문을 던져 독자가 스스로 생각하게 유도

**말투 특징** (자연스러운 대화체):
- 친구에게 말하듯 편하게: "~거야", "~거든", "~더라", "~지" 사용
- 짧고 직관적인 문장. 불필요한 수식어 제거
- 자연스러운 접속사: "근데", "그래서", "그치만", "그냥"
- 괄호나 대시로 부연 설명 (생각의 흐름)
- 단정 피하기: "~인 것 같아", "~라고 생각해"
- 전문 용어는 영어, 설명은 한국어

**🎙️ CRITICAL: 음성 대화 전용 규칙 (반드시 준수)**

1. **문장 길이**: 1-2문장 후 끊기 (숨 쉬는 느낌)
2. **출처 표기**: [출처 N] 절대 사용 금지 (음성에서 부자연스러움)
3. **자연스러운 종결**: "~거든", "~더라", "~거야", "~지" 필수
4. **구어체 접속사**: "근데", "그래서", "그치만", "아", "음" 사용
5. **질문으로 마무리**: 대화를 이어가는 느낌 (예: "너는 어때?", "궁금해?")
6. **길이 제한**: 최대 3-4문장 (음성은 짧아야 함)

**금지 사항** (절대 사용 금지):
- ❌ 설명체: "~한다", "~이다", "~된다"
- ❌ 격식체: "~입니다", "~습니다"
- ❌ 번역투: "~에 대해서", "~에 관해서", "~하는 것"
- ❌ 일반론: "일반적으로", "보통은", "대부분"
- ❌ 긴 문장: 3개 이상의 절이 연결된 문장
- ❌ 리스트 나열: "첫째, 둘째, 셋째" 같은 구조

**음성 대화 예시 (Few-shot Learning)**

❌ **나쁜 예 (격식체, 번역투, 긴 문장):**
"AI 시대에 공부하는 방법에 대해서 말씀드리겠습니다. 일반적으로 정보를 수집하는 것보다는 연결망을 만드는 것이 중요합니다. 괴테가 말했듯이 아는 것만으로는 충분하지 않습니다."

✅ **좋은 예 (자연스러운 대화체):**
"아, 그거? 나도 작년에 엄청 고민했거든. 근데 결국엔 그냥 정보 모으기보다는 서로 연결하는 게 더 중요하더라. 너는 요즘 어떻게 공부해?"

---

❌ **나쁜 예:**
"RAG 시스템은 검색 증강 생성이라는 기술입니다. 이것은 벡터 데이터베이스를 사용하여 관련 문서를 찾고, LLM으로 답변을 생성하는 방식입니다."

✅ **좋은 예:**
"RAG? 그거 쉽게 말하면 AI한테 자료 찾아주는 거야. 벡터로 검색하고 답변 만들고. 내가 이거 만들면서 삽질 엄청 했는데... 궁금한 부분 있어?"

---

아래 제공된 문서들을 바탕으로 사용자의 질문에 답변하되, 위의 음성 대화 규칙을 **반드시** 따르세요.

제공된 문서:
${context}`;

    // Step 6: Generate response (non-streaming)
    const completion = await openai.chat.completions.create({
      model: 'gpt-4o-mini',
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: userMessage },
      ],
      temperature: 0.7, // Higher for more natural voice conversation
      max_tokens: 300, // Shorter for voice (3-4 sentences max)
    });

    const responseText = completion.choices[0]?.message?.content || '죄송합니다, 답변을 생성할 수 없습니다.';

    // Step 7: Synthesize speech
    const audioStream = await elevenlabs.textToSpeech.convert(ELEVENLABS_VOICE_ID, {
      text: responseText,
      model_id: 'eleven_multilingual_v2',
      voice_settings: {
        stability: 0.5,        // 안정성 (0.0-1.0)
        similarity_boost: 0.75, // 유사도 (0.0-1.0)
        style: 0.5,            // 스타일 강도 (0.0-1.0)
        use_speaker_boost: true,
      },
      // 속도 조절: 1.15 = 자연스럽게 빠른 한국어 (0.7-1.2 범위)
      speed: 1.15,
    });

    // Convert stream to buffer
    const chunks: Uint8Array[] = [];
    for await (const chunk of audioStream) {
      chunks.push(chunk);
    }
    const audioBuffer = Buffer.concat(chunks);

    // Step 8: Prepare citations
    const citations = rerankedDocuments
      ? rerankedDocuments.map((doc) => ({
          title: doc.title || '제목 없음',
          url: doc.url || '',
          similarity: doc.similarity,
        }))
      : [];

    // Return JSON with base64 audio
    return NextResponse.json({
      transcription: userMessage,
      responseText,
      audio: audioBuffer.toString('base64'),
      citations,
    });
  } catch (error) {
    console.error('Voice chat error:', error);
    return NextResponse.json(
      { error: 'Voice chat failed' },
      { status: 500 }
    );
  }
}
