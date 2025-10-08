import OpenAI from 'openai';

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

const MODEL = 'gpt-4o-mini';

export interface EnhancedClassificationResult {
  // 기본 분류
  category: string;
  subcategory: string;

  // 감정 분석
  sentiment: 'positive' | 'negative' | 'neutral';
  sentiment_score: number; // -1 to 1

  // 핵심 키워드 및 엔티티
  keywords: string[];
  entities: {
    people: string[];
    companies: string[];
    locations: string[];
    technologies: string[];
  };

  // 요약
  one_line_summary: string; // 한 줄 요약
  key_points: string[]; // 핵심 포인트 3개

  // Instagram 관련
  instagram_worthy: boolean; // 인스타그램에 적합한지
  visual_suggestion: string; // 시각적 콘텐츠 제안
  target_audience: string; // 타겟 독자층

  // 기타 메타데이터
  relevance_score: number; // 1-10
  trending_potential: number; // 1-10
  language: string; // ko, en, etc.
}

export async function enhancedClassifyArticle(
  title: string,
  content: string
): Promise<EnhancedClassificationResult> {
  const prompt = `Analyze this news article in detail and provide comprehensive classification and insights.

Article:
Title: ${title}
Content: ${content.substring(0, 2000)}

Provide a detailed JSON response with the following structure:
{
  "category": "Choose from: TECHNOLOGY, BUSINESS, SPORTS, POLITICS, ENTERTAINMENT, HEALTH, SCIENCE, LIFESTYLE",
  "subcategory": "Specific subtopic within the category",
  "sentiment": "positive, negative, or neutral",
  "sentiment_score": -1.0 to 1.0 (numeric score),
  "keywords": ["5-8 most relevant keywords"],
  "entities": {
    "people": ["mentioned people"],
    "companies": ["mentioned companies/organizations"],
    "locations": ["mentioned places"],
    "technologies": ["mentioned tech/products"]
  },
  "one_line_summary": "Concise one-line summary (max 100 chars)",
  "key_points": [
    "First key point",
    "Second key point",
    "Third key point"
  ],
  "instagram_worthy": true/false (is this suitable for Instagram?),
  "visual_suggestion": "Suggestion for visual content/imagery",
  "target_audience": "Primary audience for this content",
  "relevance_score": 1-10 (general importance),
  "trending_potential": 1-10 (viral potential),
  "language": "en, ko, or other"
}

Focus on extracting actionable insights that would help create engaging social media content.`;

  try {
    const response = await openai.chat.completions.create({
      model: MODEL,
      messages: [
        {
          role: 'system',
          content: `You are an expert news analyst and social media content strategist.
          Analyze articles for both informational value and social media potential.
          Always return valid JSON.`,
        },
        {
          role: 'user',
          content: prompt,
        },
      ],
      temperature: 0.3, // 약간의 창의성 허용
      response_format: { type: 'json_object' },
      max_tokens: 1000,
    });

    const result = response.choices[0].message.content;
    if (!result) {
      throw new Error('No response from OpenAI');
    }

    return JSON.parse(result);
  } catch (error) {
    console.error('Enhanced classification failed:', error);
    throw error;
  }
}

export async function generateExecutiveSummary(
  title: string,
  content: string
): Promise<{
  executive_summary: string;
  tldr: string;
  main_takeaway: string;
  call_to_action: string;
}> {
  const prompt = `Create an executive summary for this article.

Title: ${title}
Content: ${content.substring(0, 2000)}

Return JSON with:
{
  "executive_summary": "2-3 paragraph professional summary",
  "tldr": "One sentence TL;DR (max 150 chars)",
  "main_takeaway": "The single most important point",
  "call_to_action": "Suggested action for readers"
}`;

  try {
    const response = await openai.chat.completions.create({
      model: MODEL,
      messages: [
        {
          role: 'system',
          content: 'You are an expert at creating concise, impactful summaries.',
        },
        {
          role: 'user',
          content: prompt,
        },
      ],
      temperature: 0.2,
      response_format: { type: 'json_object' },
      max_tokens: 500,
    });

    const result = response.choices[0].message.content;
    if (!result) {
      throw new Error('No response from OpenAI');
    }

    return JSON.parse(result);
  } catch (error) {
    console.error('Summary generation failed:', error);
    throw error;
  }
}