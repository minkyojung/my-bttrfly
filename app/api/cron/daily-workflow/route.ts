import { NextRequest, NextResponse } from 'next/server';

/**
 * Unified Daily Workflow Cron Job
 *
 * Executes three tasks sequentially:
 * 1. Scrape news from RSS feeds
 * 2. Classify pending articles with AI
 * 3. Generate Instagram content from classified articles
 *
 * Schedule: Once daily at 9 AM
 */
export async function GET(request: NextRequest) {
  // Cron secret 검증
  const authHeader = request.headers.get('authorization');
  if (process.env.NODE_ENV === 'production' && authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  console.log('🚀 Starting daily workflow...');

  const results = {
    scrapeNews: null as any,
    classifyArticles: null as any,
    generateInstagram: null as any,
    errors: [] as string[],
  };

  try {
    // 1. Scrape News
    console.log('📰 Step 1: Scraping news...');
    try {
      const baseUrl = process.env.VERCEL_URL
        ? `https://${process.env.VERCEL_URL}`
        : 'http://localhost:3000';

      const scrapeResponse = await fetch(`${baseUrl}/api/cron/scrape-news`, {
        headers: {
          'authorization': `Bearer ${process.env.CRON_SECRET}`,
        },
      });

      if (scrapeResponse.ok) {
        results.scrapeNews = await scrapeResponse.json();
        console.log(`✅ Scraped ${results.scrapeNews.newArticles} new articles`);
      } else {
        const error = await scrapeResponse.text();
        results.errors.push(`Scrape news failed: ${error}`);
        console.error('❌ Scrape news failed:', error);
      }
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Unknown error';
      results.errors.push(`Scrape news error: ${message}`);
      console.error('❌ Scrape news error:', error);
    }

    // 2초 대기
    await new Promise(resolve => setTimeout(resolve, 2000));

    // 2. Classify Articles
    console.log('🤖 Step 2: Classifying articles...');
    try {
      const baseUrl = process.env.VERCEL_URL
        ? `https://${process.env.VERCEL_URL}`
        : 'http://localhost:3000';

      const classifyResponse = await fetch(`${baseUrl}/api/cron/classify-articles`, {
        headers: {
          'authorization': `Bearer ${process.env.CRON_SECRET}`,
        },
      });

      if (classifyResponse.ok) {
        results.classifyArticles = await classifyResponse.json();
        console.log(`✅ Classified ${results.classifyArticles.classified} articles`);
      } else {
        const error = await classifyResponse.text();
        results.errors.push(`Classify articles failed: ${error}`);
        console.error('❌ Classify articles failed:', error);
      }
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Unknown error';
      results.errors.push(`Classify articles error: ${message}`);
      console.error('❌ Classify articles error:', error);
    }

    // 2초 대기
    await new Promise(resolve => setTimeout(resolve, 2000));

    // 3. Generate Instagram Content
    console.log('📸 Step 3: Generating Instagram content...');
    try {
      const baseUrl = process.env.VERCEL_URL
        ? `https://${process.env.VERCEL_URL}`
        : 'http://localhost:3000';

      const instagramResponse = await fetch(`${baseUrl}/api/cron/generate-instagram`, {
        headers: {
          'authorization': `Bearer ${process.env.CRON_SECRET}`,
        },
      });

      if (instagramResponse.ok) {
        results.generateInstagram = await instagramResponse.json();
        console.log(`✅ Generated ${results.generateInstagram.generated} Instagram posts`);
      } else {
        const error = await instagramResponse.text();
        results.errors.push(`Generate Instagram failed: ${error}`);
        console.error('❌ Generate Instagram failed:', error);
      }
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Unknown error';
      results.errors.push(`Generate Instagram error: ${message}`);
      console.error('❌ Generate Instagram error:', error);
    }

    console.log('✅ Daily workflow completed');

    return NextResponse.json({
      success: results.errors.length === 0,
      timestamp: new Date().toISOString(),
      results,
    });

  } catch (error) {
    console.error('❌ Daily workflow failed:', error);
    return NextResponse.json(
      {
        error: 'Daily workflow failed',
        message: error instanceof Error ? error.message : 'Unknown error',
        results,
      },
      { status: 500 }
    );
  }
}
