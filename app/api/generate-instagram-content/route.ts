import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/db/supabase';
import { generateInstagramContent } from '@/lib/ai/instagram-content-generator';

export async function GET(request: NextRequest) {
  console.log('📱 Starting Instagram content generation...');

  try {
    // First get existing instagram posts
    const { data: existingPosts } = await supabaseAdmin
      .from('instagram_posts')
      .select('article_id');

    const existingArticleIds = existingPosts?.map(p => p.article_id) || [];

    // Get classified articles
    const { data: allClassified, error: fetchError } = await supabaseAdmin
      .from('articles')
      .select('*')
      .eq('status', 'classified')
      .limit(10);

    // Filter out articles that already have Instagram posts (client-side filtering)
    const articles = allClassified?.filter(
      article => !existingArticleIds.includes(article.id)
    ).slice(0, 3) || [];

    if (fetchError) {
      return NextResponse.json({
        success: false,
        error: fetchError.message,
      }, { status: 500 });
    }

    if (articles.length === 0) {
      return NextResponse.json({
        success: false,
        message: 'No classified articles ready for Instagram content. Run classification first or all articles already have Instagram posts.',
      });
    }

    console.log(`Found ${articles.length} articles to process`);

    const results = [];

    for (const article of articles) {
      try {
        console.log(`Generating Instagram content for: ${article.title}`);

        // Generate Instagram content
        const content = await generateInstagramContent({
          title: article.title,
          category: article.category || 'GENERAL',
          sentiment: article.sentiment || 'neutral',
          excerpt: article.excerpt || article.title,
          keywords: article.keywords,
          relevance_score: article.relevance_score,
        });

        // Save to instagram_posts table
        const { data: savedPost, error: saveError } = await supabaseAdmin
          .from('instagram_posts')
          .insert({
            article_id: article.id,
            generated_title: content.caption_title,
            short_caption: content.caption_hook,
            full_caption: `${content.caption_title}\n\n${content.caption_body}\n\n${content.primary_hashtags.map(h => `#${h}`).join(' ')}`,
            hashtags: [
              ...content.primary_hashtags,
              ...content.trending_hashtags,
              ...content.niche_hashtags,
            ],
            alt_text: content.image_alt_text,
            status: 'draft',
          })
          .select()
          .single();

        if (saveError) {
          results.push({
            title: article.title,
            status: 'failed',
            error: saveError.message,
          });
        } else {
          // Update article status
          await supabaseAdmin
            .from('articles')
            .update({ status: 'generated' })
            .eq('id', article.id);

          results.push({
            title: article.title,
            status: 'success',
            instagram_post: {
              id: savedPost.id,
              caption_preview: content.caption_title,
              hashtag_count: content.primary_hashtags.length + content.trending_hashtags.length,
              content_type: content.content_type,
              posting_time: content.best_posting_time,
            },
          });
        }
      } catch (err) {
        console.error('Content generation error:', err);
        results.push({
          title: article.title,
          status: 'error',
          error: err instanceof Error ? err.message : 'Unknown error',
        });
      }
    }

    return NextResponse.json({
      success: true,
      processed: results.length,
      results,
    });
  } catch (error) {
    console.error('Instagram generation failed:', error);
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
    }, { status: 500 });
  }
}