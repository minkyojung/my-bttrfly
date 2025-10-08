import OpenAI from 'openai';

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

const MODEL = 'gpt-4o-mini';

export interface InstagramContent {
  // Main content
  caption_title: string; // Eye-catching title (30 chars)
  caption_hook: string; // Hook to grab attention (50 chars)
  caption_body: string; // Main caption (200-300 chars)

  // Hashtags
  primary_hashtags: string[]; // 5-7 most relevant
  trending_hashtags: string[]; // 3-5 trending
  niche_hashtags: string[]; // 3-5 niche specific

  // Visual content
  image_alt_text: string; // Accessibility
  carousel_slides?: {
    title: string;
    content: string;
    visual_note: string;
  }[];

  // Story content
  story_text: string; // Short version for stories (100 chars)
  story_cta: string; // Call to action for stories

  // Metadata
  best_posting_time: string; // Suggested time
  content_type: 'single' | 'carousel' | 'reel_idea';
  engagement_strategy: string; // Tips for engagement
}

export async function generateInstagramContent(
  article: {
    title: string;
    category: string;
    sentiment: string;
    excerpt: string;
    keywords?: string[];
    relevance_score?: number;
  }
): Promise<InstagramContent> {
  const prompt = `Create engaging Instagram content for this news article.

Article Details:
Title: ${article.title}
Category: ${article.category}
Sentiment: ${article.sentiment}
Summary: ${article.excerpt}
Keywords: ${article.keywords?.join(', ') || 'N/A'}

Generate Instagram-optimized content following these guidelines:
1. Make it highly engaging and shareable
2. Use appropriate emojis sparingly (1-3 max)
3. Create a hook that stops scrolling
4. Include a clear call to action
5. Optimize for the Instagram algorithm

Return JSON with this structure:
{
  "caption_title": "Eye-catching title (max 30 chars)",
  "caption_hook": "Hook to grab attention (max 50 chars)",
  "caption_body": "Main caption that provides value (200-300 chars)",

  "primary_hashtags": ["5-7 most relevant hashtags"],
  "trending_hashtags": ["3-5 currently trending"],
  "niche_hashtags": ["3-5 specific to the niche"],

  "image_alt_text": "Descriptive alt text for accessibility",

  "carousel_slides": [
    {
      "title": "Slide 1 title",
      "content": "Slide 1 content",
      "visual_note": "Design suggestion"
    }
  ],

  "story_text": "Short version for stories (max 100 chars)",
  "story_cta": "Swipe up / Link in bio CTA",

  "best_posting_time": "morning/afternoon/evening",
  "content_type": "single/carousel/reel_idea",
  "engagement_strategy": "Specific tip to boost engagement"
}`;

  try {
    const response = await openai.chat.completions.create({
      model: MODEL,
      messages: [
        {
          role: 'system',
          content: `You are a social media expert specializing in Instagram content strategy.
          Create content that maximizes engagement while maintaining authenticity.
          Focus on value, clarity, and visual appeal.`,
        },
        {
          role: 'user',
          content: prompt,
        },
      ],
      temperature: 0.7, // More creative for social media
      response_format: { type: 'json_object' },
      max_tokens: 1200,
    });

    const result = response.choices[0].message.content;
    if (!result) {
      throw new Error('No response from OpenAI');
    }

    return JSON.parse(result);
  } catch (error) {
    console.error('Instagram content generation failed:', error);
    throw error;
  }
}

export async function generateInstagramBatch(
  articles: Array<{
    id: string;
    title: string;
    category: string;
    sentiment: string;
    excerpt: string;
    keywords?: string[];
  }>
): Promise<Array<{ articleId: string; content: InstagramContent }>> {
  const results = [];

  for (const article of articles) {
    try {
      const content = await generateInstagramContent(article);
      results.push({
        articleId: article.id,
        content,
      });

      // Rate limiting
      await new Promise(resolve => setTimeout(resolve, 500));
    } catch (error) {
      console.error(`Failed to generate content for article ${article.id}:`, error);
    }
  }

  return results;
}

// Generate content calendar suggestions
export async function generateContentCalendar(
  articles: Array<{
    category: string;
    sentiment: string;
    relevance_score?: number;
  }>
): Promise<{
  weekly_theme: string;
  posting_schedule: Array<{
    day: string;
    time: string;
    content_type: string;
    theme: string;
  }>;
  content_mix: {
    educational: number;
    entertaining: number;
    inspirational: number;
    promotional: number;
  };
}> {
  const categories = [...new Set(articles.map(a => a.category))];
  const avgSentiment = articles.filter(a => a.sentiment === 'positive').length / articles.length;

  const prompt = `Based on these content categories: ${categories.join(', ')}
  And sentiment ratio (positive): ${avgSentiment}

  Create a weekly Instagram content calendar with:
  1. A cohesive weekly theme
  2. Optimal posting schedule
  3. Content type mix

  Return JSON with posting schedule and content strategy.`;

  try {
    const response = await openai.chat.completions.create({
      model: MODEL,
      messages: [
        {
          role: 'system',
          content: 'You are an Instagram content strategist.',
        },
        {
          role: 'user',
          content: prompt,
        },
      ],
      temperature: 0.6,
      response_format: { type: 'json_object' },
      max_tokens: 800,
    });

    const result = response.choices[0].message.content;
    if (!result) {
      throw new Error('No response from OpenAI');
    }

    return JSON.parse(result);
  } catch (error) {
    console.error('Content calendar generation failed:', error);
    throw error;
  }
}