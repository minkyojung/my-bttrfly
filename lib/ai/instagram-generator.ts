import OpenAI from 'openai';

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

const MODEL = 'gpt-4o-mini';

export interface InstagramContent {
  title: string;
  caption: string;
  fullCaption: string;
  hashtags: string[];
  altText: string;
  emoji: string;
}

interface Article {
  title: string;
  category?: string;
  excerpt?: string;
  content?: string;
}

const CATEGORY_STYLES: Record<
  string,
  { tone: string; emojis: string[]; hashtags: string[] }
> = {
  TECHNOLOGY: {
    tone: 'informative, exciting',
    emojis: ['🚀', '💡', '🔬', '⚡'],
    hashtags: ['#TechNews', '#Innovation', '#FutureTech'],
  },
  BUSINESS: {
    tone: 'professional, insightful',
    emojis: ['📈', '💼', '💰', '🎯'],
    hashtags: ['#BusinessNews', '#Finance', '#Markets'],
  },
  SPORTS: {
    tone: 'energetic, passionate',
    emojis: ['⚽', '🏀', '🏆', '🔥'],
    hashtags: ['#Sports', '#Athletics', '#GameDay'],
  },
  POLITICS: {
    tone: 'balanced, informative',
    emojis: ['🗳️', '🌍', '📰', '⚖️'],
    hashtags: ['#Politics', '#News', '#WorldNews'],
  },
  ENTERTAINMENT: {
    tone: 'fun, engaging',
    emojis: ['🎬', '🎭', '🎵', '✨'],
    hashtags: ['#Entertainment', '#PopCulture', '#Trending'],
  },
  HEALTH: {
    tone: 'caring, informative',
    emojis: ['💚', '🧘', '💪', '🏥'],
    hashtags: ['#Health', '#Wellness', '#Healthcare'],
  },
  SCIENCE: {
    tone: 'curious, educational',
    emojis: ['🔬', '🧪', '🌌', '🧬'],
    hashtags: ['#Science', '#Research', '#Discovery'],
  },
};

export async function generateInstagramContent(
  article: Article
): Promise<InstagramContent> {
  const category = article.category || 'TECHNOLOGY';
  const style = CATEGORY_STYLES[category] || CATEGORY_STYLES.TECHNOLOGY;

  const prompt = `Create Instagram post content for this news article.

Article Title: ${article.title}
Category: ${category}
Key Points: ${article.excerpt || article.content?.substring(0, 500)}

Style Guide:
- Tone: ${style.tone}
- Suggested emojis: ${style.emojis.join(', ')}
- Base hashtags: ${style.hashtags.join(', ')}

Generate:
1. TITLE: Catchy, engaging title (max 80 characters, front-load key info)
2. CAPTION: Engaging caption for Instagram (125-150 characters ideal)
3. FULL_CAPTION: Extended caption with context (up to 2200 characters)
4. HASHTAGS: 10-15 relevant hashtags (mix of popular and niche)
5. ALT_TEXT: Descriptive alt text for accessibility (max 100 characters)
6. EMOJI: One primary emoji for visual appeal

Rules:
- Be conversational and engaging
- Use emojis strategically (1-3)
- Front-load the most important information
- Make it shareable and comment-worthy
- Avoid clickbait

Return ONLY valid JSON in this format:
{
  "title": "engaging title",
  "caption": "short engaging caption",
  "fullCaption": "longer caption with details and call-to-action",
  "hashtags": ["hashtag1", "hashtag2"],
  "altText": "image description",
  "emoji": "suggested emoji"
}`;

  try {
    const response = await openai.chat.completions.create({
      model: MODEL,
      messages: [
        {
          role: 'system',
          content:
            'You are an Instagram content creator specialized in news curation. Return only valid JSON.',
        },
        {
          role: 'user',
          content: prompt,
        },
      ],
      temperature: 0.7, // 약간 창의적
      response_format: { type: 'json_object' },
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
