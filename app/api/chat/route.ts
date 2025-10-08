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

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

interface Message {
  role: 'user' | 'assistant';
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

interface ChatResponse {
  message: string;
  sources: Source[];
}

export async function POST(req: NextRequest) {
  try {
    const { message, history = [] }: ChatRequest = await req.json();

    if (!message || !message.trim()) {
      return NextResponse.json(
        { error: '메시지를 입력해주세요.' },
        { status: 400 }
      );
    }

    console.log('📩 질문:', message);

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
        match_threshold: 0.2, // 20% 이상 유사도
        match_count: 5,
      }
    );

    if (searchError) {
      console.error('검색 에러:', searchError);
      return NextResponse.json(
        { error: '문서 검색 중 오류가 발생했습니다.' },
        { status: 500 }
      );
    }

    console.log(`🔍 ${documents?.length || 0}개의 관련 문서 발견`);

    // 3. 컨텍스트 구성
    const context = documents && documents.length > 0
      ? documents
          .map(
            (doc: any, i: number) => `
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

    const messages: any[] = [
      { role: 'system', content: systemPrompt },
      ...history.slice(-6), // 최근 3턴만 유지
      { role: 'user', content: message },
    ];

    // 5. 출처 정보 구성
    const sources: Source[] = documents
      ? documents.map((doc: any) => ({
          id: doc.id,
          title: doc.title || '제목 없음',
          content: doc.content.substring(0, 200) + '...',
          url: doc.url,
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

          console.log('✅ 스트리밍 답변 생성 완료');
          controller.close();

        } catch (error) {
          console.error('스트리밍 에러:', error);
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
    console.error('Chat API 에러:', error);
    return NextResponse.json(
      { error: '답변 생성 중 오류가 발생했습니다.' },
      { status: 500 }
    );
  }
}
