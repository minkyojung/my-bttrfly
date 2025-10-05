import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/db/supabase';
import { fetchRSSFeed } from '@/lib/scraping/rss-fetcher';
import { extractArticleContent } from '@/lib/extraction/content-extractor';

export async function GET(request: NextRequest) {
  console.log('🚀 Starting simple RSS scraping...');

  try {
    // 1. 단일 RSS 피드만 테스트
    const feedUrl = 'https://techcrunch.com/feed/';
    console.log(`📡 Fetching: ${feedUrl}`);

    // 2. RSS 가져오기
    const articles = await fetchRSSFeed(feedUrl);
    console.log(`📰 Found ${articles.length} articles`);

    if (articles.length === 0) {
      return NextResponse.json({
        success: false,
        message: 'No articles found in RSS feed',
      });
    }

    // 3. 첫 3개 기사만 처리 (테스트용)
    const articlesToProcess = articles.slice(0, 3);
    const results = [];

    for (const article of articlesToProcess) {
      try {
        // 중복 체크
        const { data: existing } = await supabaseAdmin
          .from('articles')
          .select('id')
          .eq('url', article.link)
          .single();

        if (existing) {
          results.push({
            title: article.title,
            status: 'skipped',
            reason: 'Already exists',
          });
          continue;
        }

        // 전체 본문 추출
        let fullContent = article.content || article.title;
        let thumbnail = article.thumbnail;
        let extractionStatus = 'rss';

        // RSS 요약본이 짧으면 웹 스크래핑으로 전체 본문 추출
        if (fullContent.length < 500) {
          console.log(`📖 Extracting full content for: ${article.title.substring(0, 50)}...`);
          try {
            const extracted = await extractArticleContent(article.link);

            if (extracted && extracted.content && extracted.content.length > fullContent.length) {
              fullContent = extracted.content;
              thumbnail = extracted.thumbnail || thumbnail;
              extractionStatus = 'extracted';
              console.log(`✅ Extracted ${extracted.content.length} chars`);
            }
          } catch (extractError) {
            console.log(`⚠️ Extraction failed, using RSS content`);
          }
        }

        // DB 저장
        const { data: saved, error } = await supabaseAdmin
          .from('articles')
          .insert({
            url: article.link,
            title: article.title,
            content: fullContent,
            excerpt: fullContent.substring(0, 300),
            thumbnail_url: thumbnail,
            source: 'TechCrunch',
            published_at: article.pubDate,
            status: 'pending',
          })
          .select()
          .single();

        if (error) {
          console.error('Insert error:', error);
          results.push({
            title: article.title,
            status: 'failed',
            error: error.message,
          });
        } else {
          results.push({
            title: article.title,
            status: 'saved',
            id: saved.id,
            contentLength: fullContent.length,
            extractionStatus,
          });
        }
      } catch (err) {
        console.error('Article processing error:', err);
        results.push({
          title: article.title,
          status: 'error',
          error: err instanceof Error ? err.message : 'Unknown error',
        });
      }
    }

    return NextResponse.json({
      success: true,
      totalFound: articles.length,
      processed: results.length,
      results,
    });
  } catch (error) {
    console.error('❌ Scraping failed:', error);
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
    }, { status: 500 });
  }
}