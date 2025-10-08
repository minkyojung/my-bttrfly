import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/db/supabase';
import { extractArticleContent } from '@/lib/extraction/content-extractor';

export async function POST(request: NextRequest) {
  try {
    const { articleId } = await request.json();

    if (!articleId) {
      return NextResponse.json({
        success: false,
        error: 'Article ID is required',
      }, { status: 400 });
    }

    // 1. Get article from DB
    const { data: article, error: fetchError } = await supabaseAdmin
      .from('articles')
      .select('id, url, content, html_content')
      .eq('id', articleId)
      .single();

    if (fetchError || !article) {
      return NextResponse.json({
        success: false,
        error: 'Article not found',
      }, { status: 404 });
    }

    // 2. If content is already long enough, return it
    if (article.content && article.content.length > 1000) {
      return NextResponse.json({
        success: true,
        content: article.content,
        htmlContent: article.html_content || '',
        cached: true,
      });
    }

    // 3. Extract full content from web
    console.log(`📖 Extracting full content for article: ${articleId}`);
    const extracted = await extractArticleContent(article.url);

    if (!extracted || !extracted.content) {
      return NextResponse.json({
        success: false,
        error: 'Failed to extract content',
      }, { status: 500 });
    }

    // 4. Update DB with full content (including HTML)
    await supabaseAdmin
      .from('articles')
      .update({
        content: extracted.content,
        html_content: extracted.html,
        excerpt: extracted.excerpt,
      })
      .eq('id', articleId);

    console.log(`✅ Extracted ${extracted.content.length} characters`);

    return NextResponse.json({
      success: true,
      content: extracted.content,
      htmlContent: extracted.html,
      cached: false,
      contentLength: extracted.content.length,
    });
  } catch (error) {
    console.error('❌ Content extraction failed:', error);
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
    }, { status: 500 });
  }
}
