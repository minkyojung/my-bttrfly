import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/db/supabase';
import { fetchRSSFeed, POPULAR_RSS_FEEDS } from '@/lib/scraping/rss-fetcher';
import { extractArticleContent } from '@/lib/extraction/content-extractor';
import { randomDelay } from '@/lib/scraping/rate-limiter';

/**
 * Cron Job: RSS 피드에서 뉴스 수집 및 DB 저장
 * 스케줄: 매 2시간마다
 *
 * ✅ 전체 본문 추출 활성화 - 고품질 AI 요약을 위해 필수
 */
export async function GET(request: NextRequest) {
  // Cron secret 검증
  const authHeader = request.headers.get('authorization');
  if (process.env.NODE_ENV === 'production' && authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    // 모든 RSS 피드 수집
    const allFeeds = [
      ...POPULAR_RSS_FEEDS.technology,
      ...POPULAR_RSS_FEEDS.general,
    ];

    let totalArticles = 0;
    let newArticles = 0;
    let extractedArticles = 0;

    for (const feedUrl of allFeeds) {
      try {
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

          // 콘텐츠 추출 - 전체 본문을 위해 항상 웹 스크래핑 시도
          let fullContent = article.fullContent || article.content;
          let thumbnail = article.thumbnail;

          // RSS 요약본이 짧으면 웹 스크래핑으로 전체 본문 추출
          if (!fullContent || fullContent.length < 500) {
            try {
              const extracted = await extractArticleContent(article.link);

              if (extracted && extracted.content && extracted.content.length > (fullContent?.length || 0)) {
                fullContent = extracted.content;
                thumbnail = extracted.thumbnail || thumbnail;
                extractedArticles++;
              }

              // Rate limiting: 추출 후 1-3초 대기
              await randomDelay(1000, 3000);
            } catch {
              // RSS 요약본으로 fallback
            }
          }

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

          if (!error) {
            newArticles++;
          }

          totalArticles++;
        }

        // 피드 간 2초 대기
        await new Promise((resolve) => setTimeout(resolve, 2000));
      } catch {
        // Continue to next feed on error
      }
    }

    return NextResponse.json({
      success: true,
      totalArticles,
      newArticles,
      extractedArticles,
      feeds: allFeeds.length,
    });
  } catch (error) {
    return NextResponse.json(
      {
        error: 'Scraping failed',
        message: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}
