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

// Validate environment variables
const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL;
const SUPABASE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;
const OPENAI_API_KEY = process.env.OPENAI_API_KEY;

if (!SUPABASE_URL || !SUPABASE_KEY || !OPENAI_API_KEY) {
  throw new Error('Missing required environment variables');
}

const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);
const openai = new OpenAI({ apiKey: OPENAI_API_KEY });

interface Message {
  role: 'user' | 'assistant' | 'system';
  content: string;
}

interface ChatRequest {
  message: string;
  history?: Message[];
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
const MAX_HISTORY_LENGTH = 6;
const MATCH_THRESHOLD = 0.5; // Increased from 0.2 for better quality
const MATCH_COUNT = 5;

export async function POST(req: NextRequest) {
  try {
    const { message, history = [] }: ChatRequest = await req.json();

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

    // 3. 컨텍스트 구성
    interface DocumentResult {
      id: string;
      title?: string;
      content: string;
      url?: string;
      similarity: number;
    }

    const context = documents && documents.length > 0
      ? (documents as DocumentResult[])
          .map(
            (doc, i) => `
[출처 ${i + 1}]
제목: ${doc.title || '제목 없음'}
내용: ${doc.content}
---`
          )
          .join('\n')
      : '관련 문서를 찾을 수 없습니다.';

    // 4. GPT-4로 답변 생성 (스트리밍 모드)
    const systemPrompt = `당신은 William Jung의 글과 프로젝트를 학습한 AI 어시스턴트입니다.

아래 제공된 문서들을 바탕으로 사용자의 질문에 답변해주세요.

규칙:
- 제공된 문서의 내용만을 바탕으로 답변하세요
- 문서에 없는 내용은 "제공된 문서에서는 해당 내용을 찾을 수 없습니다"라고 솔직히 말하세요
- 답변 시 어느 출처에서 나온 정보인지 [출처 N] 형태로 표시하세요
- 자연스럽고 친근한 톤으로 답변하세요
- 한국어로 답변하세요

제공된 문서:
${context}`;

    const messages: Message[] = [
      { role: 'system' as const, content: systemPrompt },
      ...history.slice(-MAX_HISTORY_LENGTH),
      { role: 'user', content: message },
    ];

    // 5. 출처 정보 구성
    const sources: Source[] = documents
      ? (documents as DocumentResult[]).map((doc) => ({
          id: doc.id,
          title: doc.title || '제목 없음',
          content: doc.content.substring(0, 200) + '...',
          url: doc.url || null,
          similarity: doc.similarity,
        }))
      : [];

    // 6. 스트리밍 응답 생성
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
            temperature: 0.7,
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
