import { NextResponse } from 'next/server';
import { fetchRSSFeed } from '@/lib/scraping/rss-fetcher';
import { classifyArticle } from '@/lib/ai/classifier';

/**
 * 테스트용 API: RSS 피드를 가져와서 첫 번째 기사를 분류
 * 사용법: GET /api/test/rss-classify
 */
export async function GET() {
  try {
    console.log('📡 Fetching RSS feed from TechCrunch...');

    // TechCrunch RSS 피드에서 기사 가져오기
    const articles = await fetchRSSFeed('https://techcrunch.com/feed/');

    if (!articles || articles.length === 0) {
      return NextResponse.json(
        { error: 'No articles found in RSS feed' },
        { status: 404 }
      );
    }

    console.log(`✅ Found ${articles.length} articles`);

    // 첫 번째 기사 선택
    const article = articles[0];
    console.log(`\n📰 Classifying article: "${article.title}"`);

    // AI 분류
    const classification = await classifyArticle(
      article.title,
      article.content || ''
    );

    console.log('🤖 Classification result:', classification);

    return NextResponse.json({
      success: true,
      article: {
        title: article.title,
        link: article.link,
        pubDate: article.pubDate,
        author: article.author,
      },
      classification,
      totalArticles: articles.length,
    });
  } catch (error) {
    console.error('❌ Test failed:', error);

    return NextResponse.json(
      {
        error: 'Test failed',
        message: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}
