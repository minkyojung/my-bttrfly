import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/db/supabase';
import { fetchRSSFeed, POPULAR_RSS_FEEDS } from '@/lib/scraping/rss-fetcher';
import { extractArticleContent } from '@/lib/extraction/content-extractor';

/**
 * Cron Job: RSS 피드에서 뉴스 수집 및 DB 저장
 * 스케줄: 매 2시간마다
 */
export async function GET(request: NextRequest) {
  // Cron secret 검증 (프로덕션에서 활성화)
  // const authHeader = request.headers.get('authorization');
  // if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
  //   return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  // }

  console.log('🚀 Starting RSS scraping job...');

  try {
    // 모든 RSS 피드 수집
    const allFeeds = [
      ...POPULAR_RSS_FEEDS.technology,
      ...POPULAR_RSS_FEEDS.general,
    ];

    let totalArticles = 0;
    let newArticles = 0;

    for (const feedUrl of allFeeds) {
      try {
        console.log(`📡 Fetching feed: ${feedUrl}`);

        const articles = await fetchRSSFeed(feedUrl);

        for (const article of articles) {
          // 24시간 이내 기사만 처리
          const pubDate = article.pubDate ? new Date(article.pubDate) : null;
          const oneDayAgo = new Date(Date.now() - 24 * 60 * 60 * 1000);

          if (pubDate && pubDate < oneDayAgo) {
            continue; // 오래된 기사 건너뛰기
          }

          // DB에 기사 저장 (중복 확인)
          const { data: existingArticle } = await supabaseAdmin
            .from('articles')
            .select('id')
            .eq('url', article.link)
            .single();

          if (existingArticle) {
            continue; // 이미 존재하는 기사
          }

          // 콘텐츠 추출 (선택적 - RSS에 전문이 없는 경우)
          let fullContent = article.fullContent || article.content;
          let thumbnail = article.thumbnail;

          // RSS에 전문이 없으면 웹 스크래핑으로 추출 (시간이 걸릴 수 있으므로 일단 skip)
          // if (!fullContent || fullContent.length < 200) {
          //   const extracted = await extractArticleContent(article.link);
          //   if (extracted) {
          //     fullContent = extracted.content;
          //     thumbnail = extracted.thumbnail || thumbnail;
          //   }
          // }

          // DB에 저장
          const { error } = await supabaseAdmin.from('articles').insert({
            url: article.link,
            title: article.title,
            content: fullContent,
            excerpt: fullContent?.substring(0, 300) || '',
            thumbnail_url: thumbnail,
            author: article.author,
            source: new URL(feedUrl).hostname,
            published_at: article.pubDate,
            status: 'pending',
          });

          if (error) {
            console.error('Failed to insert article:', error);
          } else {
            newArticles++;
          }

          totalArticles++;

          // Rate limiting: 기사 간 500ms 대기
          await new Promise((resolve) => setTimeout(resolve, 500));
        }

        // 피드 간 1초 대기
        await new Promise((resolve) => setTimeout(resolve, 1000));
      } catch (error) {
        console.error(`Failed to fetch feed ${feedUrl}:`, error);
      }
    }

    console.log(`✅ Scraping completed: ${newArticles}/${totalArticles} new articles`);

    return NextResponse.json({
      success: true,
      totalArticles,
      newArticles,
      feeds: allFeeds.length,
    });
  } catch (error) {
    console.error('❌ Scraping job failed:', error);
    return NextResponse.json(
      {
        error: 'Scraping failed',
        message: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}
