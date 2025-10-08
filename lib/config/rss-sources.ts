export interface RSSSource {
  name: string;
  url: string;
  category: 'technology' | 'business' | 'ai' | 'crypto' | 'general';
  limit: number;
  enabled: boolean;
}

/**
 * RSS Feed Sources Configuration
 * 다양한 뉴스 소스에서 기사를 수집합니다.
 */
export const RSS_SOURCES: RSSSource[] = [
  // Technology - General
  {
    name: 'TechCrunch',
    url: 'https://techcrunch.com/feed/',
    category: 'technology',
    limit: 15,
    enabled: true,
  },
  {
    name: 'The Verge',
    url: 'https://www.theverge.com/rss/index.xml',
    category: 'technology',
    limit: 15,
    enabled: true,
  },
  {
    name: 'Ars Technica',
    url: 'https://feeds.arstechnica.com/arstechnica/index',
    category: 'technology',
    limit: 10,
    enabled: true,
  },
  {
    name: 'Wired',
    url: 'https://www.wired.com/feed/rss',
    category: 'technology',
    limit: 10,
    enabled: true,
  },
  {
    name: 'Engadget',
    url: 'https://www.engadget.com/rss.xml',
    category: 'technology',
    limit: 10,
    enabled: true,
  },

  // Developer & Hacker News
  {
    name: 'Hacker News',
    url: 'https://hnrss.org/frontpage',
    category: 'technology',
    limit: 20,
    enabled: true,
  },

  // AI & Machine Learning
  {
    name: 'AI News (MIT)',
    url: 'http://news.mit.edu/topic/mitartificial-intelligence2-rss.xml',
    category: 'ai',
    limit: 10,
    enabled: true,
  },
  {
    name: 'DeepMind Blog',
    url: 'https://deepmind.google/blog/rss.xml',
    category: 'ai',
    limit: 5,
    enabled: true,
  },

  // Crypto & Web3
  {
    name: 'CoinDesk',
    url: 'https://www.coindesk.com/arc/outboundfeeds/rss/',
    category: 'crypto',
    limit: 10,
    enabled: true,
  },
  {
    name: 'Decrypt',
    url: 'https://decrypt.co/feed',
    category: 'crypto',
    limit: 10,
    enabled: true,
  },

  // Business & Startups
  {
    name: 'VentureBeat',
    url: 'https://venturebeat.com/feed/',
    category: 'business',
    limit: 10,
    enabled: true,
  },
  {
    name: 'Business Insider Tech',
    url: 'https://www.businessinsider.com/sai/rss',
    category: 'business',
    limit: 10,
    enabled: true,
  },
];

/**
 * Get enabled RSS sources
 */
export function getEnabledSources(): RSSSource[] {
  return RSS_SOURCES.filter((source) => source.enabled);
}

/**
 * Get sources by category
 */
export function getSourcesByCategory(
  category: RSSSource['category']
): RSSSource[] {
  return RSS_SOURCES.filter(
    (source) => source.enabled && source.category === category
  );
}
