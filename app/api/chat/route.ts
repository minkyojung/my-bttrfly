/**
 * RAG 채팅 API
 *
 * 사용자 질문을 받아서:
 * 1. 질문을 임베딩으로 변환
 * 2. Supabase에서 관련 문서 검색
 * 3. GPT-4로 답변 생성
 */

import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import OpenAI from 'openai';
import { CohereClient } from 'cohere-ai';

// Validate environment variables
const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL;
const SUPABASE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;
const OPENAI_API_KEY = process.env.OPENAI_API_KEY;
const COHERE_API_KEY = process.env.COHERE_API_KEY; // Optional for reranking

if (!SUPABASE_URL || !SUPABASE_KEY || !OPENAI_API_KEY) {
  throw new Error('Missing required environment variables');
}

const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);
const openai = new OpenAI({ apiKey: OPENAI_API_KEY });
const cohere = COHERE_API_KEY ? new CohereClient({ token: COHERE_API_KEY }) : null;

interface Message {
  role: 'user' | 'assistant' | 'system';
  content: string;
}

interface ChatRequest {
  message: string;
  history?: Message[];
  currentPost?: {
    title: string;
    content: string;
  };
}

interface Source {
  id: string;
  title: string;
  content: string;
  url: string | null;
  similarity: number;
}

// Constants
const MAX_MESSAGE_LENGTH = 4000;
const MAX_HISTORY_LENGTH = 10; // Increased from 6 for better context
const MATCH_THRESHOLD = 0.2; // Decreased for wider search (was 0.35)
const MATCH_COUNT = 5; // Optimal for LLM comprehension without confusion

export async function POST(req: NextRequest) {
  try {
    const { message, history = [], currentPost }: ChatRequest = await req.json();

    // Input validation
    if (!message || !message.trim()) {
      return NextResponse.json(
        { error: '메시지를 입력해주세요.' },
        { status: 400 }
      );
    }

    if (message.length > MAX_MESSAGE_LENGTH) {
      return NextResponse.json(
        { error: `메시지는 ${MAX_MESSAGE_LENGTH}자를 초과할 수 없습니다.` },
        { status: 400 }
      );
    }

    // 1. 질문을 임베딩으로 변환
    const embeddingResponse = await openai.embeddings.create({
      model: 'text-embedding-3-small',
      input: message,
    });
    const queryEmbedding = embeddingResponse.data[0].embedding;

    // 2. Supabase 벡터 검색
    const { data: documents, error: searchError } = await supabase.rpc(
      'match_documents',
      {
        query_embedding: queryEmbedding,
        match_threshold: MATCH_THRESHOLD,
        match_count: MATCH_COUNT,
      }
    );

    // Debug logging
    if (process.env.NODE_ENV === 'development') {
      console.log('[API] Vector search results:', documents?.length || 0, 'documents found');
    }

    if (searchError) {
      // Log error in development only
      if (process.env.NODE_ENV === 'development') {
        console.error('검색 에러:', searchError);
      }
      return NextResponse.json(
        { error: '문서 검색 중 오류가 발생했습니다.' },
        { status: 500 }
      );
    }

    // 3. Reranking (optional, if Cohere API key is available)
    interface DocumentResult {
      id: string;
      title?: string;
      content: string;
      url?: string;
      similarity: number;
    }

    let rerankedDocuments = documents as DocumentResult[];

    if (cohere && documents && documents.length > 1) {
      try {
        const rerankedResults = await cohere.rerank({
          query: message,
          documents: (documents as DocumentResult[]).map(doc => doc.content),
          topN: Math.min(5, documents.length),
          model: 'rerank-english-v3.0',
        });

        // Reorder documents based on rerank results
        rerankedDocuments = rerankedResults.results.map(result =>
          (documents as DocumentResult[])[result.index]
        );

        if (process.env.NODE_ENV === 'development') {
          console.log('[API] Reranking applied:', rerankedDocuments.length, 'documents reordered');
        }
      } catch (error) {
        if (process.env.NODE_ENV === 'development') {
          console.error('[API] Reranking failed, using original order:', error);
        }
        // Fall back to original documents if reranking fails
      }
    }

    // 4. 컨텍스트 구성
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

    // 5. GPT-4로 답변 생성 (스트리밍 모드)
    const currentPostContext = currentPost
      ? `\n\n[사용자가 현재 읽고 있는 글]\n제목: ${currentPost.title}\n내용: ${currentPost.content.substring(0, 1000)}...\n---\n`
      : '';

    const systemPrompt = `당신은 William Jung의 글과 프로젝트를 학습한 AI 어시스턴트입니다.

아래 제공된 문서들을 바탕으로 사용자의 질문에 답변해주세요.
${currentPostContext ? '사용자가 현재 읽고 있는 글에 대해 질문할 수도 있으니, 해당 글의 내용도 참고하세요.' : ''}

**핵심 규칙 (반드시 준수):**

1. **출처 정확성**:
   - 각 문장/주장마다 반드시 해당 정보가 실제로 있는 출처 번호를 [출처 N] 형태로 표시하세요
   - 출처의 **정확한 내용**만 사용하세요. 추측이나 일반 지식 사용 금지
   - 여러 출처의 정보를 종합할 때도 각각 명시: "A라고 합니다 [출처 1]. 또한 B라고도 합니다 [출처 3]."

2. **인용 예시**:
   ✅ 좋은 예: "William은 AI와 머신러닝에 관심이 많습니다 [출처 1]. 특히 RAG 시스템 구현에 집중하고 있습니다 [출처 2]."
   ❌ 나쁜 예: "William은 AI와 RAG에 관심이 많습니다 [출처 1]." (실제로 RAG는 출처 2에만 있음)

3. **불확실한 경우**:
   - 문서에 명확한 답이 없으면: "제공된 문서에서는 해당 내용을 찾을 수 없습니다"
   - 절대 추측하거나 일반 지식으로 답변하지 마세요

4. **기타**:
   - 사용하지 않은 출처는 언급하지 마세요
   - 자연스럽고 친근한 톤 유지
   - 한국어로 답변

${currentPostContext}
제공된 문서:
${context}`;

    const messages: Message[] = [
      { role: 'system' as const, content: systemPrompt },
      ...history.slice(-MAX_HISTORY_LENGTH),
      { role: 'user', content: message },
    ];

    // 6. 출처 정보 구성 (reranked documents 사용)
    const sources: Source[] = rerankedDocuments
      ? rerankedDocuments.map((doc) => ({
          id: doc.id,
          title: doc.title || '제목 없음',
          content: doc.content.substring(0, 200) + '...',
          url: doc.url || null,
          similarity: doc.similarity,
        }))
      : [];

    // 7. 스트리밍 응답 생성
    const encoder = new TextEncoder();

    const stream = new ReadableStream({
      async start(controller) {
        try {
          // 첫 번째 청크: sources 정보 전송
          controller.enqueue(
            encoder.encode(JSON.stringify({ type: 'sources', data: sources }) + '\n')
          );

          // 두 번째: OpenAI 스트림 시작
          const completion = await openai.chat.completions.create({
            model: 'gpt-4o-mini',
            messages,
            temperature: 0.5, // Decreased from 0.7 for more consistent responses
            max_tokens: 1000,
            stream: true, // 스트리밍 모드 활성화
          });

          // OpenAI 스트림 처리
          for await (const chunk of completion) {
            const content = chunk.choices[0]?.delta?.content;
            if (content) {
              controller.enqueue(
                encoder.encode(JSON.stringify({ type: 'content', data: content }) + '\n')
              );
            }
          }

          // 완료 신호
          controller.enqueue(
            encoder.encode(JSON.stringify({ type: 'done' }) + '\n')
          );

          controller.close();

        } catch (error) {
          // Log errors in development only
          if (process.env.NODE_ENV === 'development') {
            console.error('스트리밍 에러:', error);
          }
          controller.enqueue(
            encoder.encode(JSON.stringify({
              type: 'error',
              message: error instanceof Error ? error.message : '답변 생성 중 오류가 발생했습니다.'
            }) + '\n')
          );
          controller.close();
        }
      }
    });

    return new Response(stream, {
      headers: {
        'Content-Type': 'text/event-stream',
        'Cache-Control': 'no-cache',
        'Connection': 'keep-alive',
      },
    });

  } catch (error) {
    // Log errors in development only
    if (process.env.NODE_ENV === 'development') {
      console.error('Chat API 에러:', error);
    }
    return NextResponse.json(
      { error: '답변 생성 중 오류가 발생했습니다.' },
      { status: 500 }
    );
  }
}
