import { NextResponse } from 'next/server';
import OpenAI from 'openai';

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

interface Article {
  id: string;
  title: string;
  description?: string;
  content?: string;
  source?: string;
  category?: string;
  keywords?: string[];
}

export async function POST(request: Request) {
  try {
    const { systemPrompt, articles } = await request.json();

    if (!articles || !Array.isArray(articles) || articles.length === 0) {
      return NextResponse.json(
        { error: 'Missing or invalid articles array' },
        { status: 400 }
      );
    }

    // Default system prompt
    const defaultSystemPrompt = `당신은 세상에서 가장 빠르고 양질의 뉴스를 일반인들에게 전달하는 저널리스트입니다.

다음 구조로 3-5줄의 간결한 요약을 생성하세요:

1. 첫 문장을 간결하고 직설적으로 작성합니다.
2. 핵심 사실의 힘을 더하기 위해 구체적인 사실/숫자를 포함합니다.
3. 과하게 과장하지 않습니다.
4. 마무리는, 그래서 이 사실이 왜 중요한지 설명하는 문장으로 마무리합니다.`;

    // Build batch prompt with all articles
    const batchPrompt = `다음 ${articles.length}개의 뉴스 기사를 각각 요약해주세요. 각 요약은 "---ARTICLE_${articles.map((_, i) => i + 1).join('---ARTICLE_')}---" 형식으로 구분해주세요.

${articles.map((article: Article, index: number) => `
--- ARTICLE ${index + 1} ---
ID: ${article.id}
제목: ${article.title}
출처: ${article.source || '알 수 없음'}
카테고리: ${article.category || '일반'}
키워드: ${article.keywords?.join(', ') || ''}

내용:
${article.content || article.description || ''}
`).join('\n')}

각 기사를 주어진 지침에 따라 요약하고, 다음 형식으로 응답해주세요:

---ARTICLE_1---
[첫 번째 기사 요약]

---ARTICLE_2---
[두 번째 기사 요약]

...`;

    console.log(`Batch processing ${articles.length} articles...`);

    // Call OpenAI API with batch request
    const response = await openai.chat.completions.create({
      model: 'gpt-4o-mini',
      messages: [
        {
          role: 'system',
          content: systemPrompt || defaultSystemPrompt
        },
        {
          role: 'user',
          content: batchPrompt
        }
      ],
      temperature: 0.7,
      max_tokens: 500 * articles.length // Scale tokens with number of articles
    });

    const batchSummary = response.choices[0].message.content || '';

    // Parse the batch response into individual summaries
    const summaryParts = batchSummary.split(/---ARTICLE_\d+---/).filter(s => s.trim());

    // Map summaries back to articles
    const results = articles.map((article: Article, index: number) => ({
      id: article.id,
      summary: summaryParts[index]?.trim() || `요약 생성 실패 (기사 ${index + 1})`,
      success: !!summaryParts[index]
    }));

    console.log(`Batch processing complete: ${results.filter(r => r.success).length}/${articles.length} successful`);

    return NextResponse.json({
      success: true,
      results: results,
      processed: articles.length,
      successful: results.filter(r => r.success).length,
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    console.error('Batch summary generation error:', error);

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
          error: 'Failed to generate batch summaries',
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