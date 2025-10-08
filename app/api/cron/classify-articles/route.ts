import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/db/supabase';
import { classifyArticle } from '@/lib/ai/classifier';

/**
 * Cron Job: pending 상태 기사들을 AI로 분류
 * 스케줄: 매 2시간마다 (15분에 실행)
 */
export async function GET(request: NextRequest) {
  // Cron secret 검증 (프로덕션에서 활성화)
  // const authHeader = request.headers.get('authorization');
  // if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
  //   return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  // }

  console.log('🤖 Starting AI classification job...');

  try {
    // pending 상태 기사 가져오기 (최대 50개)
    const { data: articles, error } = await supabaseAdmin
      .from('articles')
      .select('id, title, content, excerpt')
      .eq('status', 'pending')
      .limit(50);

    if (error) {
      throw error;
    }

    if (!articles || articles.length === 0) {
      console.log('ℹ️ No articles to classify');
      return NextResponse.json({
        success: true,
        message: 'No articles to classify',
        classified: 0,
      });
    }

    console.log(`📋 Found ${articles.length} articles to classify`);

    let classified = 0;
    let failed = 0;

    // 배치 처리 (5개씩)
    const batchSize = 5;
    for (let i = 0; i < articles.length; i += batchSize) {
      const batch = articles.slice(i, i + batchSize);

      const promises = batch.map(async (article) => {
        try {
          console.log(`🔍 Classifying: "${article.title}"`);

          const classification = await classifyArticle(
            article.title,
            article.content || article.excerpt || ''
          );

          // 분류 결과를 DB에 업데이트
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
            console.error(`Failed to update article ${article.id}:`, updateError);
            failed++;
          } else {
            classified++;
            console.log(`✅ Classified as ${classification.category} (score: ${classification.relevance_score})`);
          }
        } catch (error) {
          console.error(`Failed to classify article ${article.id}:`, error);
          failed++;
        }
      });

      await Promise.all(promises);

      // 배치 간 2초 대기 (Rate limiting)
      if (i + batchSize < articles.length) {
        await new Promise((resolve) => setTimeout(resolve, 2000));
      }
    }

    console.log(`✅ Classification completed: ${classified} success, ${failed} failed`);

    return NextResponse.json({
      success: true,
      total: articles.length,
      classified,
      failed,
    });
  } catch (error) {
    console.error('❌ Classification job failed:', error);
    return NextResponse.json(
      {
        error: 'Classification failed',
        message: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}
