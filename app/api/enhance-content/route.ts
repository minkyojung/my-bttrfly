import { NextResponse } from 'next/server';
import OpenAI from 'openai';

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

export async function POST(request: Request) {
  try {
    const { content, prompt, article } = await request.json();

    // Generate initial content from article if no content is provided
    if (!content && article) {
      const systemPrompt = `You are a social media content creator who creates engaging Instagram posts from news articles.
      Create compelling, concise content that drives engagement.
      Use relevant hashtags and emojis appropriately.`;

      const userPrompt = `
      Create Instagram content from this article:
      Title: ${article.title}
      Description: ${article.description || ''}
      Content: ${article.content?.substring(0, 500) || ''}

      Format: ${article.format || 'post'}

      Please provide the content in this exact JSON format:
      {
        "caption": "engaging caption with emojis",
        "hashtags": ["hashtag1", "hashtag2", ...]
      }`;

      const response = await openai.chat.completions.create({
        model: 'gpt-4o-mini',
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: userPrompt }
        ],
        response_format: { type: 'json_object' },
        temperature: 0.7,
        max_tokens: 500
      });

      const generated = JSON.parse(response.choices[0].message.content || '{}');

      return NextResponse.json({
        success: true,
        caption: generated.caption,
        hashtags: generated.hashtags
      });
    }

    // Enhance existing content
    if (content && prompt) {
      const systemPrompt = `You are an Instagram content optimizer.
      Based on the user's request, modify the Instagram content appropriately.
      Maintain the core message while applying the requested changes.
      Keep hashtags relevant and trending.`;

      const userPrompt = `
      Original Article: ${article?.title || 'N/A'}
      TLDR: ${article?.tldr || 'N/A'}

      Current Instagram Content:
      Title: ${content.title}
      Caption: ${content.caption}
      Hashtags: ${content.hashtags.join(' ')}

      User Request: ${prompt}

      Please provide the enhanced version in the exact same JSON format:
      {
        "title": "enhanced title",
        "caption": "enhanced caption",
        "hashtags": ["hashtag1", "hashtag2", ...]
      }`;

      const response = await openai.chat.completions.create({
        model: 'gpt-4o-mini',
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: userPrompt }
        ],
        response_format: { type: 'json_object' },
        temperature: 0.7,
        max_tokens: 500
      });

      const enhanced = JSON.parse(response.choices[0].message.content || '{}');

      return NextResponse.json({
        success: true,
        content: {
          ...content,
          ...enhanced
        }
      });
    }

    // Default error response if neither condition is met
    return NextResponse.json(
      { error: 'Invalid request parameters' },
      { status: 400 }
    );

  } catch (error) {
    console.error('Content enhancement error:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to enhance content' },
      { status: 500 }
    );
  }
}