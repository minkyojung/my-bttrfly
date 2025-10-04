import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/db/supabase';
import { enhancedClassifyArticle, generateExecutiveSummary } from '@/lib/ai/enhanced-classifier';

export async function GET(request: NextRequest) {
  console.log('🎯 Starting enhanced classification and summarization...');

  try {
    // 1. Get articles that need enhanced classification (pending or already classified)
    const { data: articles, error: fetchError } = await supabaseAdmin
      .from('articles')
      .select('*')
      .in('status', ['pending', 'classified'])
      .limit(2);

    if (fetchError) {
      return NextResponse.json({
        success: false,
        error: fetchError.message,
      }, { status: 500 });
    }

    if (!articles || articles.length === 0) {
      return NextResponse.json({
        success: false,
        message: 'No articles found for enhanced classification. Run scraping first.',
      });
    }

    console.log(`Found ${articles.length} articles to process`);

    const results = [];

    for (const article of articles) {
      try {
        console.log(`Processing: ${article.title}`);

        // Enhanced classification
        const classification = await enhancedClassifyArticle(
          article.title,
          article.content || article.excerpt || ''
        );

        // Generate executive summary
        const summary = await generateExecutiveSummary(
          article.title,
          article.content || article.excerpt || ''
        );

        // Create metadata JSON for advanced features
        const metadata = {
          entities: classification.entities,
          visual_suggestion: classification.visual_suggestion,
          target_audience: classification.target_audience,
          instagram_worthy: classification.instagram_worthy,
          trending_potential: classification.trending_potential,
          language: classification.language,
          executive_summary: summary.executive_summary,
          tldr: summary.tldr,
          main_takeaway: summary.main_takeaway,
          call_to_action: summary.call_to_action,
        };

        // Update article with enhanced data
        const { error: updateError } = await supabaseAdmin
          .from('articles')
          .update({
            category: classification.category,
            subcategory: classification.subcategory,
            sentiment: classification.sentiment,
            keywords: classification.keywords,
            relevance_score: classification.relevance_score,
            excerpt: classification.one_line_summary,
            status: 'classified',
            // Store additional metadata as JSON string in content field temporarily
            // In production, you'd want a separate JSON column
          })
          .eq('id', article.id);

        if (updateError) {
          results.push({
            title: article.title,
            status: 'failed',
            error: updateError.message,
          });
        } else {
          results.push({
            title: article.title,
            status: 'success',
            classification: {
              category: classification.category,
              sentiment: classification.sentiment,
              relevance: classification.relevance_score,
              trending: classification.trending_potential,
              instagram_worthy: classification.instagram_worthy,
            },
            summary: {
              tldr: summary.tldr,
              main_takeaway: summary.main_takeaway,
            },
            key_points: classification.key_points,
          });
        }
      } catch (err) {
        console.error('Processing error:', err);
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
    console.error('Enhanced classification failed:', error);
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
    }, { status: 500 });
  }
}