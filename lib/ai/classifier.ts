import OpenAI from 'openai';

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

// 최신 모델: gpt-4o-mini (가성비 최고, $0.15 input / $0.60 output per 1M tokens)
const MODEL = 'gpt-4o-mini';

export interface ClassificationResult {
  category: string;
  subcategory: string;
  sentiment: 'positive' | 'negative' | 'neutral';
  keywords: string[];
  relevance_score: number;
}

export async function classifyArticle(
  title: string,
  content: string
): Promise<ClassificationResult> {
  const prompt = `Classify this news article and extract key information. Return ONLY valid JSON.

Article:
Title: ${title}
Content: ${content.substring(0, 1000)}

Respond with JSON in this exact format:
{
  "category": "one of: TECHNOLOGY, BUSINESS, SPORTS, POLITICS, ENTERTAINMENT, HEALTH, SCIENCE",
  "subcategory": "more specific topic",
  "sentiment": "positive, negative, or neutral",
  "keywords": ["keyword1", "keyword2", "keyword3"],
  "relevance_score": 1-10
}`;

  try {
    const response = await openai.chat.completions.create({
      model: MODEL,
      messages: [
        {
          role: 'system',
          content: 'You are a news classification assistant. Return only valid JSON.',
        },
        {
          role: 'user',
          content: prompt,
        },
      ],
      temperature: 0, // 결정론적 분류
      response_format: { type: 'json_object' }, // JSON 모드 강제
    });

    const result = response.choices[0].message.content;
    if (!result) {
      throw new Error('No response from OpenAI');
    }

    return JSON.parse(result);
  } catch (error) {
    console.error('Classification failed:', error);
    throw error;
  }
}

export async function batchClassifyArticles(
  articles: Array<{ title: string; content: string }>
): Promise<ClassificationResult[]> {
  // Rate limiting: 동시에 최대 5개 처리
  const batchSize = 5;
  const results: ClassificationResult[] = [];

  for (let i = 0; i < articles.length; i += batchSize) {
    const batch = articles.slice(i, i + batchSize);
    const promises = batch.map((article) =>
      classifyArticle(article.title, article.content)
    );

    const batchResults = await Promise.all(promises);
    results.push(...batchResults);

    // Rate limiting: 배치 간 1초 대기
    if (i + batchSize < articles.length) {
      await new Promise((resolve) => setTimeout(resolve, 1000));
    }
  }

  return results;
}
