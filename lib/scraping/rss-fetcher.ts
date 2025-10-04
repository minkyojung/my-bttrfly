import Parser from 'rss-parser';

const parser = new Parser({
  customFields: {
    item: [
      ['media:thumbnail', 'thumbnail'],
      ['media:content', 'mediaContent'],
      ['content:encoded', 'fullContent'],
    ],
  },
});

export interface RSSArticle {
  title: string;
  link: string;
  pubDate?: string;
  content?: string;
  fullContent?: string;
  thumbnail?: string;
  author?: string;
  categories?: string[];
}

export async function fetchRSSFeed(url: string): Promise<RSSArticle[]> {
  try {
    const feed = await parser.parseURL(url);

    return feed.items.map((item: any) => ({
      title: item.title || 'Untitled',
      link: item.link || '',
      pubDate: item.pubDate || item.isoDate,
      content: item.content || item.contentSnippet || '',
      fullContent: item.fullContent,
      thumbnail:
        item.thumbnail?.['$']?.url ||
        item.mediaContent?.[0]?.['$']?.url ||
        item.enclosure?.url,
      author: item.creator || item.author || '',
      categories: item.categories || [],
    }));
  } catch (error) {
    console.error(`Error fetching RSS feed: ${url}`, error);
    throw error;
  }
}

export async function fetchMultipleFeeds(
  urls: string[]
): Promise<RSSArticle[]> {
  const results = await Promise.allSettled(urls.map(fetchRSSFeed));

  const articles: RSSArticle[] = [];

  results.forEach((result, index) => {
    if (result.status === 'fulfilled') {
      articles.push(...result.value);
    } else {
      console.error(`Failed to fetch feed ${urls[index]}:`, result.reason);
    }
  });

  return articles;
}

// 인기 뉴스 소스 RSS 피드 목록
export const POPULAR_RSS_FEEDS = {
  technology: [
    'https://techcrunch.com/feed/',
    'https://www.theverge.com/rss/index.xml',
    'https://news.ycombinator.com/rss',
    'https://www.wired.com/feed/rss',
  ],
  business: [
    'https://feeds.bloomberg.com/markets/news.rss',
    'https://www.cnbc.com/id/100003114/device/rss/rss.html',
  ],
  general: [
    'http://feeds.bbci.co.uk/news/rss.xml',
    'http://rss.cnn.com/rss/cnn_topstories.rss',
    'https://www.reddit.com/r/worldnews/.rss',
  ],
};
