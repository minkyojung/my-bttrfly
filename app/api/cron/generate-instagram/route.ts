import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/db/supabase';
import { generateInstagramContent } from '@/lib/ai/instagram-generator';

/**
 * Cron Job: 분류된 기사에서 인스타그램 콘텐츠 생성
 * 스케줄: 매 2시간마다 (30분에 실행, 30 */2 * * *)
 */
export async function GET(request: NextRequest) {
  // Cron secret 검증 (프로덕션에서 활성화)
  // const authHeader = request.headers.get('authorization');
  // if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
  //   return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  // }

  console.log('📸 Starting Instagram content generation job...');

  try {
    // classified 상태이면서 아직 인스타그램 포스트가 생성되지 않은 기사 가져오기
    const { data: articles, error } = await supabaseAdmin
      .from('articles')
      .select('id, title, content, excerpt, category, thumbnail_url, relevance_score')
      .eq('status', 'classified')
      .gte('relevance_score', 6) // 관련성 점수 6점 이상만
      .limit(20);

    if (error) {
      throw error;
    }

    if (!articles || articles.length === 0) {
      console.log('ℹ️ No articles to generate Instagram content');
      return NextResponse.json({
        success: true,
        message: 'No articles to process',
        generated: 0,
      });
    }

    console.log(`📋 Found ${articles.length} articles to generate Instagram content`);

    let generated = 0;
    let failed = 0;

    for (const article of articles) {
      try {
        // 이미 인스타그램 포스트가 생성된 기사인지 확인
        const { data: existingPost } = await supabaseAdmin
          .from('instagram_posts')
          .select('id')
          .eq('article_id', article.id)
          .single();

        if (existingPost) {
          console.log(`⏭️ Skipping article ${article.id} - Instagram post already exists`);
          continue;
        }

        console.log(`🎨 Generating Instagram content for: "${article.title}"`);

        const instagramContent = await generateInstagramContent({
          title: article.title,
          category: article.category,
          excerpt: article.excerpt,
          content: article.content,
        });

        // 인스타그램 포스트 DB에 저장
        const { error: insertError } = await supabaseAdmin
          .from('instagram_posts')
          .insert({
            article_id: article.id,
            title: instagramContent.title,
            caption: instagramContent.caption,
            full_caption: instagramContent.fullCaption,
            hashtags: instagramContent.hashtags,
            alt_text: instagramContent.altText,
            image_url: article.thumbnail_url,
            status: 'draft',
          });

        if (insertError) {
          console.error(`Failed to insert Instagram post for article ${article.id}:`, insertError);
          failed++;
        } else {
          generated++;
          console.log(`✅ Generated Instagram content with ${instagramContent.hashtags.length} hashtags`);

          // 기사 상태를 'posted'로 업데이트
          await supabaseAdmin
            .from('articles')
            .update({ status: 'posted' })
            .eq('id', article.id);
        }

        // Rate limiting: 기사 간 1초 대기
        await new Promise((resolve) => setTimeout(resolve, 1000));
      } catch (error) {
        console.error(`Failed to generate Instagram content for article ${article.id}:`, error);
        failed++;
      }
    }

    console.log(`✅ Instagram generation completed: ${generated} success, ${failed} failed`);

    return NextResponse.json({
      success: true,
      total: articles.length,
      generated,
      failed,
    });
  } catch (error) {
    console.error('❌ Instagram generation job failed:', error);
    return NextResponse.json(
      {
        error: 'Instagram generation failed',
        message: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}
