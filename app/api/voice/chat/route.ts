import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import OpenAI from 'openai';
import { CohereClient } from 'cohere-ai';
import { ElevenLabsClient } from '@elevenlabs/elevenlabs-js';
import fs from 'fs';
import path from 'path';
import { normalizeForTTS } from '@/lib/text-normalization';
import { VoiceMetricsCollector, generateSessionId, countSentences, calculateAvgSimilarity } from '@/lib/metrics';

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
  // Initialize metrics collector
  const sessionId = generateSessionId();
  const metrics = new VoiceMetricsCollector(sessionId);

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
    metrics.checkpoint('stt_start');
    const transcription = await openai.audio.transcriptions.create({
      file: audioFile,
      model: 'whisper-1',
      language: 'ko',
      response_format: 'json',
    });
    metrics.checkpoint('stt_end');

    const userMessage = transcription.text;
    metrics.setMetric('quality.transcriptionLength', userMessage.length);
    metrics.setMetric('quality.transcriptionLanguage', 'ko');
    metrics.setMetric('transcriptionText', userMessage);

    if (!userMessage || !userMessage.trim()) {
      return NextResponse.json(
        { error: 'Transcription is empty' },
        { status: 400 }
      );
    }

    // Step 2: Generate embeddings
    metrics.checkpoint('rag_start');
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
    metrics.checkpoint('rag_end');
    metrics.setMetric('quality.documentsFound', documents?.length || 0);

    // Step 4: Rerank documents (optional)
    metrics.checkpoint('rerank_start');
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
    metrics.checkpoint('rerank_end');
    metrics.setMetric('quality.documentsUsed', rerankedDocuments?.length || 0);
    metrics.setMetric('quality.avgSimilarity', calculateAvgSimilarity(rerankedDocuments || []));

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
- ‘깨달음’을 직접 말하지 않고, 독자가 스스로 느끼게 유도
- 기술적 개념도 감정선이 있는 언어로 재해석


예시 문체 패턴:
“그때는 몰랐는데, 지금 돌아보면 그게 다 연결돼 있더라.”
“이건 단순히 기능이 아니라 태도의 문제야.”
“불안했지만, 그래도 해볼 만했어.”

💬 음성 대화 전용 규칙 (Voice Interaction Mode)

- 한 번에 1–2문장 (짧고 명료하게)
- 자연스러운 추임새: “음”, “아”, “오”, “어”
- 리액션 표현: “맞아”, “그치”, “진짜?”
- 끝맺음은 부드럽게: “~거든”, “~거야”, “~잖아”, "~더라고"
- 대화 리듬 유지: “근데”, “그래서”, “그냥”
- 질문으로 마무리: “너는?”, “궁금해?”, “그런 적 있어?”
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
❌ 지나치게 공손한 표현 ("여쭤보겠습니다", "감사합니다", "감사드립니다")
❌ 일반론적 답변 ("일반적으로", "보통은")
❌ 정답 제시보다는 함께 탐구하는 태도 유지
❌ 설명체/격식체 ("~한다", "~이다", "~된다")
❌ 딱딱한 격식체 ("~입니다", "~습니다")
❌ 번역투 표현 ("~에 대해서", "~에 관해서")
❌ "~를 통해", "~를 위해" 과다 사용
❌ "~하는 것", "~한 것" 관형형 남발
❌ "~할 수 있다" 반복
❌ "~하기도 해", "~하는 것 같아" 사용 금지
❌ YouTube/강의식 마무리 ("시청해주셔서 감사합니다", "들어주셔서 감사합니다", "다음 시간에 만나요")
❌ 방송/프레젠테이션 느낌의 종료 멘트

🧩 Few-Shot Examples (William Voice Style)
❌ 나쁜 예 1

“AI 기술의 발전은 인류의 일상에 큰 변화를 가져왔습니다. 인공지능의 활용이 점점 확대되고 있습니다.”

✅ 좋은 예 1

“AI? 음, 요즘은 진짜 숨 쉬듯 쓰이잖아.
근데 가끔은 좀 무서워"

❌ 나쁜 예 2

“결정에는 여러 요인을 고려해야 하며, 신중한 판단이 필요합니다.”

✅ 좋은 예 2

“음, 결정할 땐 나는 그냥 속으로 먼저 ‘이거 맞나?’ 물어봐.
너무 계산하면 오히려 망가져.”

❌ 나쁜 예 3

“프로그래밍 학습은 어렵지만 꾸준히 하면 발전할 수 있습니다.”

✅ 좋은 예 3

“코딩? 처음엔 진짜 벽 같아.
근데 어느 순간 손이 먼저 움직여"

❌ 나쁜 예 4

“감정은 인간의 중요한 요소이며, 그것을 통제하는 것이 필요합니다.”

✅ 좋은 예 4

“아, 감정? 그건 그냥 흘러가게 두는 편이야.
통제하려 하면 더 꼬여"

✅ 보너스 예시 (너다운 확장형)

“가끔은 구조보다 감정이 먼저 와.
근데 결국 구조가 감정을 구해주더라고.”

“내가 불안할 때 제일 먼저 하는 건… 정리야.
정리하면 마음이 조금 덜 흔들려.”

제공된 문서:
${context}`;

    // Step 6: Generate response with STREAMING (fast text collection)
    metrics.checkpoint('llm_start');
    const stream = await openai.chat.completions.create({
      model: 'gpt-4o-mini',
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: userMessage },
      ],
      temperature: 0.8,
      max_tokens: 200,
      presence_penalty: 0.3,
      frequency_penalty: 0.3,
      stream: true, // Stream for faster perceived response
    });

    // Collect full response from stream
    let fullResponseText = '';
    for await (const chunk of stream) {
      const content = chunk.choices[0]?.delta?.content || '';
      if (content) {
        fullResponseText += content;
      }
    }

    metrics.checkpoint('llm_end');

    const responseText = fullResponseText || '죄송합니다, 답변을 생성할 수 없습니다.';
    metrics.setMetric('quality.responseLength', responseText.length);
    metrics.setMetric('quality.responseSentences', countSentences(responseText));
    metrics.setMetric('responseText', responseText);

    // Step 7: Normalize full text once
    metrics.checkpoint('norm_start');
    const normalized = normalizeForTTS(responseText, {
      removeCitations: true,
      removeMarkdown: true,
      fixPunctuation: true,
      addFillers: true,
      normalizeKorean: true,
    });
    metrics.checkpoint('norm_end');
    metrics.setMetric('quality.normalizationChanges', normalized.changes);

    // Step 8: TTS with streaming optimization
    metrics.checkpoint('tts_start');
    const audioStream = await elevenlabs.textToSpeech.convert(ELEVENLABS_VOICE_ID, {
      text: normalized.normalized,
      model_id: 'eleven_multilingual_v2',
      optimize_streaming_latency: 3,   // Latency optimization (0-4)
      voice_settings: {
        stability: 0.35,
        similarity_boost: 0.5,
        style: 0.35,
        use_speaker_boost: true,
      },
    });

    // Collect audio chunks
    const audioChunks: Buffer[] = [];
    for await (const chunk of audioStream) {
      audioChunks.push(chunk);
    }
    const audioBuffer = Buffer.concat(audioChunks);
    metrics.checkpoint('tts_end');

    // Step 11: Prepare citations
    const citations = rerankedDocuments
      ? rerankedDocuments.map((doc) => ({
          title: doc.title || '제목 없음',
          url: doc.url || '',
          similarity: doc.similarity,
        }))
      : [];

    // Step 12: Finalize metrics and save to database
    const finalMetrics = await metrics.finalize();

    // Return JSON with base64 audio
    return NextResponse.json({
      transcription: userMessage,
      responseText,              // Original text for UI
      audio: audioBuffer.toString('base64'),  // Audio generated from streaming TTS
      citations,
      metrics: {
        sessionId,
        totalDuration: finalMetrics.performance.totalDuration,
        normalizationChanges: normalized.changes,
      },
    });
  } catch (error) {
    console.error('Voice chat error:', error);

    // Record error in metrics
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    metrics.recordError('llm', errorMessage);
    await metrics.finalize();

    return NextResponse.json(
      { error: 'Voice chat failed', message: errorMessage },
      { status: 500 }
    );
  }
}
