import { NextResponse } from 'next/server';
import { fetchMultipleFeeds, POPULAR_RSS_FEEDS } from '@/lib/scraping/rss-fetcher';
import { extractArticleContent } from '@/lib/extraction/content-extractor';
import { executeWithRateLimit } from '@/lib/scraping/rate-limiter';

export async function GET() {
  try {
    // Fetch articles from technology RSS feeds
    const rssArticles = await fetchMultipleFeeds(POPULAR_RSS_FEEDS.technology);

    // Sort by date and take top 10 (reduced from 20 for faster loading)
    const sortedArticles = rssArticles
      .sort((a, b) => {
        const dateA = a.pubDate ? new Date(a.pubDate).getTime() : 0;
        const dateB = b.pubDate ? new Date(b.pubDate).getTime() : 0;
        return dateB - dateA;
      })
      .slice(0, 10);

    // Extract full content for each article with rate limiting (concurrency: 3)
    const extractionTasks = sortedArticles.map((article) => async () => {
      try {
        // Try to extract full article content from the link
        const extracted = await extractArticleContent(article.link);

        if (extracted && extracted.content) {
          return {
            ...article,
            content: extracted.content,
            fullContent: extracted.content,
            thumbnail: extracted.thumbnail || article.thumbnail,
          };
        }
      } catch {
        // Fallback to RSS content if extraction fails
      }

      return article;
    });

    const articlesWithContent = await executeWithRateLimit(extractionTasks, 3);

    return NextResponse.json({
      success: true,
      articles: articlesWithContent,
    });
  } catch {
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to fetch RSS articles',
      },
      { status: 500 }
    );
  }
}
