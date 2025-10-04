import axios from 'axios';
import { Readability } from '@mozilla/readability';
import { JSDOM } from 'jsdom';
import * as cheerio from 'cheerio';

export interface ExtractedContent {
  title: string;
  content: string;
  excerpt: string;
  html: string;
  length: number;
  siteName?: string;
  thumbnail?: string;
}

/**
 * Mozilla Readability를 사용한 본문 추출
 */
export async function extractArticleContent(
  url: string
): Promise<ExtractedContent | null> {
  try {
    const { data } = await axios.get(url, {
      headers: {
        'User-Agent':
          'Mozilla/5.0 (compatible; NewsBot/1.0; +https://yoursite.com/bot)',
      },
      timeout: 10000,
    });

    const dom = new JSDOM(data, { url });
    const reader = new Readability(dom.window.document);
    const article = reader.parse();

    if (!article) {
      throw new Error('Failed to parse article');
    }

    // 썸네일 이미지 추출
    const thumbnail = await extractThumbnail(url, data);

    return {
      title: article.title,
      content: article.textContent,
      excerpt: article.excerpt || article.textContent.substring(0, 300),
      html: article.content,
      length: article.length,
      siteName: article.siteName,
      thumbnail,
    };
  } catch (error) {
    console.error('Content extraction failed:', error);
    return null;
  }
}

/**
 * 썸네일 이미지 추출 (다층 전략)
 */
export async function extractThumbnail(
  url: string,
  html: string
): Promise<string | undefined> {
  const $ = cheerio.load(html);

  // 전략 1: Open Graph 이미지 (가장 신뢰할 수 있음)
  let image = $('meta[property="og:image"]').attr('content');
  if (image) return normalizeUrl(image, url);

  // 전략 2: Twitter Card 이미지
  image = $('meta[name="twitter:image"]').attr('content');
  if (image) return normalizeUrl(image, url);

  // 전략 3: Article 내 첫 이미지
  image = $('article img').first().attr('src');
  if (image) return normalizeUrl(image, url);

  // 전략 4: 가장 큰 이미지 찾기
  const images = $('img')
    .map((i, el) => {
      const width = parseInt($(el).attr('width') || '0');
      const height = parseInt($(el).attr('height') || '0');
      return {
        src: $(el).attr('src'),
        width,
        height,
      };
    })
    .get()
    .filter((img) => img.width >= 400 && img.height >= 300)
    .sort((a, b) => b.width * b.height - a.width * a.height);

  return images[0] ? normalizeUrl(images[0].src!, url) : undefined;
}

/**
 * URL 정규화 (상대 경로 → 절대 경로)
 */
function normalizeUrl(imageUrl: string, baseUrl: string): string {
  if (!imageUrl) return '';

  // 이미 절대 URL
  if (imageUrl.startsWith('http')) return imageUrl;

  // 프로토콜 없는 URL (//cdn.example.com/image.jpg)
  if (imageUrl.startsWith('//')) {
    return 'https:' + imageUrl;
  }

  // 상대 경로
  if (imageUrl.startsWith('/')) {
    const base = new URL(baseUrl);
    return `${base.protocol}//${base.host}${imageUrl}`;
  }

  // 상대 경로 (./image.jpg 또는 image.jpg)
  const base = new URL(baseUrl);
  return new URL(imageUrl, base.href).href;
}
