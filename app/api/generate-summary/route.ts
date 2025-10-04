import { NextResponse } from 'next/server';
import OpenAI from 'openai';

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

export async function POST(request: Request) {
  try {
    const { systemPrompt, article } = await request.json();

    if (!systemPrompt || !article) {
      return NextResponse.json(
        { error: 'Missing required parameters: systemPrompt and article' },
        { status: 400 }
      );
    }

    // Default system prompt if none provided
    const defaultSystemPrompt = `당신은 세상에서 가장 빠르고 양질의 뉴스를 일반인들에게 전달하는 저널리스트입니다.

다음 구조로 3-5줄의 간결한 요약을 생성하세요:

1. 첫 문장을 간결하고 직설적으로 작성합니다. 도입부를 읽으면 지금 어떤 일이 벌어지고 있고, 이 문제가 왜 중요한지 알 수 있습니다.
2. 핵심 사실의 힘을 더하기 위해 구체적인 사실/숫자를 포함합니다.
3. 과하게 과장하지 않습니다.
4. 마무리는, 그래서 이 사실이 왜 중요한지 설명하는 문장으로 마무리합니다.
5. 원본 요약을 완전히 재구성합니다.`;

    // Build the user prompt with article content
    const userPrompt = `다음 뉴스 기사를 요약해주세요:

제목: ${article.title}
출처: ${article.source || '알 수 없음'}
카테고리: ${article.category || '일반'}
키워드: ${article.keywords?.join(', ') || ''}

내용:
${article.content || article.description || ''}

위 기사를 주어진 지침에 따라 요약해주세요.`;

    // Call OpenAI API
    const response = await openai.chat.completions.create({
      model: 'gpt-4o-mini',
      messages: [
        {
          role: 'system',
          content: systemPrompt || defaultSystemPrompt
        },
        {
          role: 'user',
          content: userPrompt
        }
      ],
      temperature: 0.7,
      max_tokens: 500
    });

    const summary = response.choices[0].message.content || '';

    return NextResponse.json({
      success: true,
      summary: summary,
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    console.error('Summary generation error:', error);

    // Check if it's an OpenAI API error
    if (error instanceof Error) {
      if (error.message.includes('API key')) {
        return NextResponse.json(
          {
            success: false,
            error: 'OpenAI API key not configured',
            details: 'Please set OPENAI_API_KEY in your environment variables'
          },
          { status: 500 }
        );
      }

      return NextResponse.json(
        {
          success: false,
          error: 'Failed to generate summary',
          details: error.message
        },
        { status: 500 }
      );
    }

    return NextResponse.json(
      {
        success: false,
        error: 'An unexpected error occurred'
      },
      { status: 500 }
    );
  }
}