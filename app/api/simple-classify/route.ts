import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/db/supabase';
import { classifyArticle } from '@/lib/ai/classifier';

export async function GET(request: NextRequest) {
  console.log('🤖 Starting AI classification...');

  try {
    // 1. 분류가 필요한 기사 가져오기 (pending 상태 또는 category가 없는 기사)
    const { data: articles, error: fetchError } = await supabaseAdmin
      .from('articles')
      .select('*')
      .or('status.eq.pending,category.is.null')
      .limit(3);

    if (fetchError) {
      return NextResponse.json({
        success: false,
        error: fetchError.message,
      }, { status: 500 });
    }

    if (!articles || articles.length === 0) {
      return NextResponse.json({
        success: false,
        message: 'No pending articles found. Run RSS scraping first.',
      });
    }

    console.log(`📝 Found ${articles.length} pending articles`);

    // 2. 각 기사 분류
    const results = [];

    for (const article of articles) {
      try {
        console.log(`🔍 Classifying: ${article.title}`);

        // AI 분류 실행
        const classification = await classifyArticle(
          article.title,
          article.content || article.excerpt || ''
        );

        // DB 업데이트
        const { error: updateError } = await supabaseAdmin
          .from('articles')
          .update({
            category: classification.category,
            subcategory: classification.subcategory,
            sentiment: classification.sentiment,
            keywords: classification.keywords,
            relevance_score: classification.relevance_score,
            status: 'classified',
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
            status: 'classified',
            classification,
          });
        }
      } catch (err) {
        console.error('Classification error:', err);
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
    console.error('❌ Classification failed:', error);
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
    }, { status: 500 });
  }
}