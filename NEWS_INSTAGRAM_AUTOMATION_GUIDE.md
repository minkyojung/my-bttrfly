# 뉴스 큐레이션 및 인스타그램 자동화 시스템 가이드

> 뉴스 사이트에서 콘텐츠를 수집하고, AI로 분류하며, 인스타그램용 콘텐츠를 자동 생성하는 시스템 구축 가이드

## 목차

1. [시스템 개요](#시스템-개요)
2. [기술 스택](#기술-스택)
3. [아키텍처](#아키텍처)
4. [1단계: 뉴스 수집](#1단계-뉴스-수집)
5. [2단계: AI 분류](#2단계-ai-분류)
6. [3단계: 콘텐츠 추출](#3단계-콘텐츠-추출)
7. [4단계: 인스타그램 콘텐츠 생성](#4단계-인스타그램-콘텐츠-생성)
8. [데이터베이스 설계](#데이터베이스-설계)
9. [자동화 및 스케줄링](#자동화-및-스케줄링)
10. [비용 분석](#비용-분석)
11. [구현 로드맵](#구현-로드맵)

---

## 시스템 개요

### 주요 기능

1. **뉴스 수집**: RSS 피드 및 웹 스크래핑으로 다양한 소스에서 뉴스 수집
2. **AI 분류**: LLM을 활용한 자동 카테고리 분류 및 키워드 추출
3. **콘텐츠 추출**: 본문과 썸네일 이미지 분리
4. **인스타그램 콘텐츠 생성**: AI로 제목, 캡션, 해시태그 자동 생성
5. **자동 포스팅**: 스케줄링에 따른 인스타그램 자동 게시

### 처리 흐름

```
뉴스 소스 (RSS/Web)
    ↓
수집 (매 2시간)
    ↓
분류 (AI - Claude/Gemini)
    ↓
콘텐츠 추출 (본문/이미지)
    ↓
인스타그램 콘텐츠 생성 (AI)
    ↓
스케줄링 및 포스팅 (하루 3회)
```

---

## 기술 스택

### 추천 스택

| 카테고리 | 기술 | 이유 |
|---------|------|------|
| **프레임워크** | Next.js 15 (App Router) | 서버 액션, API Routes, RSC 지원 |
| **데이터베이스** | Supabase (PostgreSQL) | 무료 티어, 실시간 기능, Next.js 통합 우수 |
| **AI - 분류** | Claude Haiku 3.5 | 최적 가성비 ($0.80/$4.00 per 1M tokens) |
| **AI - 콘텐츠 생성** | Claude Haiku 3.5 | 창의적 콘텐츠 생성에 적합 |
| **스케줄링** | Vercel Cron Jobs | Next.js와 네이티브 통합 |
| **호스팅** | Vercel | 제로 컨피그, 자동 배포 |

### 대안 옵션

**저예산 옵션:**
- AI: Gemini 2.5 Flash-Lite ($0.10/$0.40 per 1M tokens)
- 데이터베이스: Supabase Free Tier
- 호스팅: Vercel Hobby (무료)

**고성능 옵션:**
- AI: Claude Sonnet 4.5 (더 높은 정확도)
- 스케줄링: Convex (더 유연한 스케줄링)

---

## 아키텍처

### 시스템 구조도

```
┌─────────────────────────────────────────────────────────┐
│                     Next.js App                          │
├─────────────────────────────────────────────────────────┤
│                                                           │
│  ┌──────────────┐      ┌──────────────┐                 │
│  │   Frontend   │◄────►│   API Routes │                 │
│  │  (App Router)│      │   /api/*     │                 │
│  └──────────────┘      └───────┬──────┘                 │
│                                 │                         │
│  ┌──────────────────────────────▼──────────────────┐    │
│  │          Server Actions & Background Jobs        │    │
│  │  • 스크래핑   • 분류   • 콘텐츠 생성              │    │
│  └──────────────────────────┬──────────────────────┘    │
└─────────────────────────────┼──────────────────────────┘
                               │
      ┌────────────────────────┼────────────────────────┐
      │                        │                         │
┌─────▼─────┐         ┌───────▼───────┐       ┌────────▼────────┐
│  Database │         │  AI Services  │       │  External APIs  │
│ (Supabase)│         │ Claude/Gemini │       │ Instagram Graph │
└───────────┘         └───────────────┘       └─────────────────┘
```

### 디렉토리 구조

```
/app
  /api
    /cron
      scrape-news/route.ts
      classify-articles/route.ts
      generate-instagram-content/route.ts
      post-to-instagram/route.ts
    /webhooks
      instagram-insights/route.ts
  /dashboard
    page.tsx
    /articles
    /instagram
    /analytics

/lib
  /ai
    classifier.ts
    instagram-generator.ts
  /scraping
    rss-fetcher.ts
    scraper.ts
    dynamic-scraper.ts
    rate-limiter.ts
  /extraction
    content-extractor.ts
    image-extractor.ts
  /instagram
    poster.ts
  /db
    supabase.ts
  /utils
    deduplication.ts
    robots-checker.ts
```

---

## 1단계: 뉴스 수집

### RSS 피드 파싱 (추천 - 70%)

**장점:**
- ✅ 빠르고 안정적
- ✅ 법적/윤리적 문제 없음
- ✅ 서버 부하 적음
- ✅ 차단 위험 없음

**필요 패키지:**
```bash
npm install rss-parser
```

**구현 예시:**

```typescript
// lib/scraping/rss-fetcher.ts
import Parser from 'rss-parser';

const parser = new Parser({
  customFields: {
    item: [
      ['media:thumbnail', 'thumbnail'],
      ['media:content', 'mediaContent'],
      ['content:encoded', 'fullContent']
    ]
  }
});

export async function fetchRSSFeed(url: string) {
  try {
    const feed = await parser.parseURL(url);

    return feed.items.map(item => ({
      title: item.title,
      link: item.link,
      pubDate: item.pubDate,
      content: item.content || item.contentSnippet,
      fullContent: item.fullContent,
      thumbnail: item.thumbnail?.['$']?.url || item.mediaContent?.[0]?.['$']?.url,
      author: item.creator || item.author,
      categories: item.categories || []
    }));
  } catch (error) {
    console.error(`Error fetching RSS feed: ${url}`, error);
    throw error;
  }
}
```

**주요 뉴스 사이트 RSS 피드:**
- TechCrunch: `https://techcrunch.com/feed/`
- The Verge: `https://www.theverge.com/rss/index.xml`
- Hacker News: `https://news.ycombinator.com/rss`
- BBC: `http://feeds.bbci.co.uk/news/rss.xml`
- CNN: `http://rss.cnn.com/rss/cnn_topstories.rss`

### 웹 스크래핑 (보조 - 30%)

**정적 사이트용 (Cheerio):**

```typescript
// lib/scraping/scraper.ts
import axios from 'axios';
import * as cheerio from 'cheerio';

export async function scrapeArticle(url: string) {
  try {
    // Rate limiting
    await new Promise(resolve => setTimeout(resolve, 1000));

    const { data } = await axios.get(url, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (compatible; NewsBot/1.0; +https://yourwebsite.com/bot)'
      }
    });

    const $ = cheerio.load(data);

    return {
      title: $('meta[property="og:title"]').attr('content') || $('h1').first().text(),
      description: $('meta[property="og:description"]').attr('content'),
      image: $('meta[property="og:image"]').attr('content'),
      content: $('article').text() || $('.post-content').text(),
      publishDate: $('meta[property="article:published_time"]').attr('content'),
      author: $('meta[name="author"]').attr('content')
    };
  } catch (error) {
    console.error(`Error scraping: ${url}`, error);
    throw error;
  }
}
```

**필요 패키지:**
```bash
npm install axios cheerio
npm install -D @types/cheerio
```

### 윤리적 스크래핑 가이드라인

1. ✅ robots.txt 준수
2. ✅ User-Agent 헤더 포함 (봇 식별)
3. ✅ Rate limiting (도메인당 최대 1 요청/초)
4. ✅ 랜덤 딜레이 (사람처럼 행동)
5. ✅ 로그인 벽 뒤 콘텐츠 스크래핑 금지
6. ✅ Terms of Service 준수
7. ✅ 결과 캐싱으로 요청 최소화
8. ✅ retry-after 헤더 준수

**Rate Limiter 구현:**

```typescript
// lib/scraping/rate-limiter.ts
import pLimit from 'p-limit';

// 동시 요청 제한
const limit = pLimit(3);

function randomDelay(min = 1000, max = 3000) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

export async function scrapeWithRateLimit(urls: string[]) {
  const promises = urls.map(url =>
    limit(async () => {
      await new Promise(resolve => setTimeout(resolve, randomDelay()));
      return scrapeArticle(url);
    })
  );

  return Promise.all(promises);
}
```

---

## 2단계: AI 분류

### LLM 비교 (2025년 기준)

| 모델 | 입력 비용 (1M 토큰) | 출력 비용 | 속도 | 추천 용도 |
|------|-------------------|----------|------|----------|
| **Claude Haiku 3.5** | $0.80 | $4.00 | 빠름 | **분류 최적** |
| **Gemini 2.5 Flash-Lite** | $0.10 | $0.40 | 매우 빠름 | **최저 비용** |
| **GPT-4.1** | $2.00 | $8.00 | 보통 | 복잡한 분석 |
| **Claude Sonnet 4.5** | $3.00 | $15.00 | 느림 | 고급 추론 |

### 구현 예시

**필요 패키지:**
```bash
npm install @anthropic-ai/sdk
# 또는
npm install @google/generative-ai
```

**기본 분류:**

```typescript
// lib/ai/classifier.ts
import Anthropic from '@anthropic-ai/sdk';

const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY,
});

export async function classifyArticle(title: string, content: string) {
  const prompt = `Classify this news article and extract key information. Return ONLY valid JSON.

Article:
Title: ${title}
Content: ${content.substring(0, 1000)}

Respond with JSON in this exact format:
{
  "category": "one of: TECHNOLOGY, BUSINESS, SPORTS, POLITICS, ENTERTAINMENT, HEALTH, SCIENCE",
  "subcategory": "more specific topic",
  "sentiment": "POSITIVE, NEGATIVE, or NEUTRAL",
  "keywords": ["keyword1", "keyword2", "keyword3"],
  "relevanceScore": 1-10
}`;

  const message = await anthropic.messages.create({
    model: 'claude-haiku-3.5-20250801',
    max_tokens: 200,
    temperature: 0, // 결정론적 분류
    messages: [{
      role: 'user',
      content: prompt
    }]
  });

  return JSON.parse(message.content[0].text);
}
```

### 비용 최적화 전략

**1. 프롬프트 캐싱 (90% 절감):**

```typescript
const message = await anthropic.messages.create({
  model: 'claude-sonnet-4.5-20250801',
  max_tokens: 100,
  system: [
    {
      type: "text",
      text: "Classification instructions...", // 캐시됨
      cache_control: { type: "ephemeral" }
    }
  ],
  messages: [{ role: 'user', content: article }]
});
```

**2. 배치 처리 (50% 할인):**

```typescript
async function batchClassify(articles: Article[]) {
  const batch = articles.map(article => ({
    custom_id: article.id,
    params: {
      model: 'claude-haiku-3.5-20250801',
      max_tokens: 50,
      messages: [{
        role: 'user',
        content: `Classify: ${article.title}`
      }]
    }
  }));

  return await anthropic.batches.create({ requests: batch });
}
```

**3. 스마트 콘텐츠 절삭:**

```typescript
function prepareForClassification(article: Article) {
  // 제목 + 처음 500 단어만 사용
  const truncatedContent = article.content
    .split(' ')
    .slice(0, 500)
    .join(' ');

  return {
    title: article.title,
    content: truncatedContent
  };
}
```

---

## 3단계: 콘텐츠 추출

### Mozilla Readability 사용 (추천)

**왜 Readability?**
- Firefox Reader View에 사용되는 검증된 라이브러리
- 다양한 웹사이트 구조 자동 처리
- 광고/사이드바 등 노이즈 제거
- 활발한 유지보수

**필요 패키지:**
```bash
npm install @mozilla/readability jsdom
npm install -D @types/jsdom
```

**구현:**

```typescript
// lib/extraction/content-extractor.ts
import axios from 'axios';
import { Readability } from '@mozilla/readability';
import { JSDOM } from 'jsdom';

export async function extractArticleContent(url: string) {
  try {
    const { data } = await axios.get(url);
    const dom = new JSDOM(data, { url });
    const reader = new Readability(dom.window.document);
    const article = reader.parse();

    if (!article) {
      throw new Error('Failed to parse article');
    }

    return {
      title: article.title,
      content: article.textContent, // 깨끗한 텍스트
      excerpt: article.excerpt,
      length: article.length, // 읽기 길이
      html: article.content, // 깨끗한 HTML
      siteName: article.siteName
    };
  } catch (error) {
    console.error('Content extraction failed:', error);
    return null;
  }
}
```

### 썸네일 이미지 추출

**다층 전략:**

```typescript
// lib/extraction/image-extractor.ts
import * as cheerio from 'cheerio';

export async function extractThumbnail(url: string, html: string) {
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
    .map((i, el) => ({
      src: $(el).attr('src'),
      width: parseInt($(el).attr('width')) || 0,
      height: parseInt($(el).attr('height')) || 0
    }))
    .get()
    .filter(img => img.width >= 400 && img.height >= 300)
    .sort((a, b) => (b.width * b.height) - (a.width * a.height));

  return images[0] ? normalizeUrl(images[0].src, url) : null;
}

function normalizeUrl(imageUrl: string, baseUrl: string) {
  if (!imageUrl) return null;

  // 상대 URL 처리
  if (imageUrl.startsWith('//')) {
    return 'https:' + imageUrl;
  }
  if (imageUrl.startsWith('/')) {
    const base = new URL(baseUrl);
    return `${base.protocol}//${base.host}${imageUrl}`;
  }

  return imageUrl;
}
```

---

## 4단계: 인스타그램 콘텐츠 생성

### 인스타그램 제한사항 (2025년 기준)

| 항목 | 최대 길이 | 권장 길이 | 모범 사례 |
|------|----------|----------|----------|
| **캡션** | 2,200자 | 125-150자 | 중요 내용을 앞에 배치 |
| **해시태그** | 30개/포스트 | 10-15개 | 인기 + 니치 믹스 |
| **Alt Text** | 100자 | 80-100자 | 접근성을 위한 설명 |

**주요 인사이트:**
- 처음 125자만 "...more" 전에 표시됨
- 짧은 캡션(125-150자)이 더 좋은 성과
- 줄바꿈과 이모지로 가독성 향상

### AI 콘텐츠 생성

```typescript
// lib/ai/instagram-generator.ts
import Anthropic from '@anthropic-ai/sdk';

const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY,
});

export async function generateInstagramContent(article: Article) {
  const prompt = `Create Instagram post content for this news article.

Article Title: ${article.title}
Category: ${article.category}
Key Points: ${article.excerpt}

Generate:
1. TITLE: Catchy, engaging title (max 80 characters, front-load key info)
2. CAPTION: Engaging caption for Instagram (125-150 characters ideal)
3. FULL_CAPTION: Extended caption with context (up to 2200 characters)
4. HASHTAGS: 10-15 relevant hashtags (mix of popular and niche)
5. ALT_TEXT: Descriptive alt text for accessibility (max 100 characters)

Rules:
- Be conversational and engaging
- Use emojis strategically (1-3)
- Front-load the most important information
- Make it shareable and comment-worthy
- Avoid clickbait

Return ONLY valid JSON in this format:
{
  "title": "engaging title",
  "caption": "short engaging caption",
  "fullCaption": "longer caption with details and call-to-action",
  "hashtags": ["hashtag1", "hashtag2", ...],
  "altText": "image description",
  "emoji": "suggested emoji for visual appeal"
}`;

  const message = await anthropic.messages.create({
    model: 'claude-haiku-3.5-20250801',
    max_tokens: 800,
    temperature: 0.7, // 약간 창의적
    messages: [{
      role: 'user',
      content: prompt
    }]
  });

  return JSON.parse(message.content[0].text);
}
```

### 카테고리별 스타일 적용

```typescript
const CATEGORY_STYLES = {
  TECHNOLOGY: {
    tone: 'informative, exciting',
    emojis: ['🚀', '💡', '🔬', '⚡'],
    hashtags: ['#TechNews', '#Innovation', '#FutureTech']
  },
  BUSINESS: {
    tone: 'professional, insightful',
    emojis: ['📈', '💼', '💰', '🎯'],
    hashtags: ['#BusinessNews', '#Finance', '#Markets']
  },
  SPORTS: {
    tone: 'energetic, passionate',
    emojis: ['⚽', '🏀', '🏆', '🔥'],
    hashtags: ['#Sports', '#Athletics', '#GameDay']
  }
};
```

---

## 데이터베이스 설계

### Supabase 스키마

```sql
-- articles 테이블
CREATE TABLE articles (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  url TEXT UNIQUE NOT NULL,
  title TEXT NOT NULL,
  content TEXT,
  excerpt TEXT,
  thumbnail_url TEXT,
  author TEXT,
  source TEXT NOT NULL,
  published_at TIMESTAMP,
  scraped_at TIMESTAMP DEFAULT NOW(),

  -- 분류 결과
  category TEXT,
  subcategory TEXT,
  sentiment TEXT,
  keywords TEXT[],
  relevance_score INTEGER,

  -- 메타데이터
  reading_time INTEGER,
  word_count INTEGER,

  -- 상태
  status TEXT DEFAULT 'pending', -- pending, classified, posted, rejected

  CONSTRAINT valid_status CHECK (status IN ('pending', 'classified', 'posted', 'rejected'))
);

-- 인덱스 생성
CREATE INDEX idx_articles_category ON articles(category);
CREATE INDEX idx_articles_published_at ON articles(published_at DESC);
CREATE INDEX idx_articles_status ON articles(status);

-- instagram_posts 테이블
CREATE TABLE instagram_posts (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  article_id UUID REFERENCES articles(id) ON DELETE CASCADE,

  title TEXT NOT NULL,
  caption TEXT NOT NULL,
  full_caption TEXT,
  hashtags TEXT[],
  alt_text TEXT,

  image_url TEXT,

  -- 상태 추적
  status TEXT DEFAULT 'draft', -- draft, scheduled, posted, failed
  scheduled_for TIMESTAMP,
  posted_at TIMESTAMP,
  instagram_media_id TEXT,

  -- 인게이지먼트 메트릭
  likes_count INTEGER DEFAULT 0,
  comments_count INTEGER DEFAULT 0,

  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- scraping_sources 테이블
CREATE TABLE scraping_sources (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  url TEXT NOT NULL,
  type TEXT NOT NULL, -- rss, static, dynamic
  enabled BOOLEAN DEFAULT true,
  last_scraped_at TIMESTAMP,
  articles_count INTEGER DEFAULT 0,
  error_count INTEGER DEFAULT 0,

  -- 설정
  scrape_frequency INTEGER DEFAULT 3600, -- 초 단위
  selectors JSONB, -- 웹 스크래핑용

  created_at TIMESTAMP DEFAULT NOW()
);

-- scraping_jobs 테이블 (추적용)
CREATE TABLE scraping_jobs (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  source_id UUID REFERENCES scraping_sources(id),
  status TEXT DEFAULT 'running', -- running, completed, failed
  articles_found INTEGER DEFAULT 0,
  articles_new INTEGER DEFAULT 0,
  error_message TEXT,
  started_at TIMESTAMP DEFAULT NOW(),
  completed_at TIMESTAMP
);
```

---

## 자동화 및 스케줄링

### Vercel Cron Jobs 설정

**vercel.json:**

```json
{
  "crons": [
    {
      "path": "/api/cron/scrape-news",
      "schedule": "0 */2 * * *"
    },
    {
      "path": "/api/cron/classify-articles",
      "schedule": "15 */2 * * *"
    },
    {
      "path": "/api/cron/generate-instagram-content",
      "schedule": "30 */2 * * *"
    },
    {
      "path": "/api/cron/post-to-instagram",
      "schedule": "0 9,14,18 * * *"
    }
  ]
}
```

**스케줄 설명:**
- **뉴스 수집**: 매 2시간마다 (0분)
- **분류**: 매 2시간마다 (15분) - 수집 후 15분 뒤
- **콘텐츠 생성**: 매 2시간마다 (30분) - 분류 후 15분 뒤
- **인스타그램 포스팅**: 하루 3회 (오전 9시, 오후 2시, 오후 6시)

### API Route 예시

```typescript
// app/api/cron/scrape-news/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { fetchRSSFeed } from '@/lib/scraping/rss-fetcher';

export async function GET(request: NextRequest) {
  // Cron secret 검증
  const authHeader = request.headers.get('authorization');
  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_KEY!
  );

  try {
    // 활성화된 소스 가져오기
    const { data: sources } = await supabase
      .from('scraping_sources')
      .select('*')
      .eq('enabled', true);

    let totalArticles = 0;

    for (const source of sources!) {
      // Job 레코드 생성
      const { data: job } = await supabase
        .from('scraping_jobs')
        .insert({
          source_id: source.id,
          status: 'running'
        })
        .select()
        .single();

      try {
        let articles = [];

        if (source.type === 'rss') {
          articles = await fetchRSSFeed(source.url);
        }

        // 새 기사 삽입
        const { data: inserted } = await supabase
          .from('articles')
          .insert(
            articles.map(a => ({
              url: a.link,
              title: a.title,
              content: a.content,
              thumbnail_url: a.thumbnail,
              source: source.name,
              published_at: a.pubDate
            }))
          )
          .onConflict('url') // 중복 건너뛰기
          .select();

        totalArticles += inserted?.length || 0;

        // Job 업데이트
        await supabase
          .from('scraping_jobs')
          .update({
            status: 'completed',
            articles_found: articles.length,
            articles_new: inserted?.length || 0,
            completed_at: new Date().toISOString()
          })
          .eq('id', job!.id);

      } catch (error) {
        // 에러 로깅
        await supabase
          .from('scraping_jobs')
          .update({
            status: 'failed',
            error_message: (error as Error).message,
            completed_at: new Date().toISOString()
          })
          .eq('id', job!.id);
      }
    }

    return NextResponse.json({
      success: true,
      sources: sources!.length,
      articlesScraped: totalArticles
    });

  } catch (error) {
    console.error('Scraping cron failed:', error);
    return NextResponse.json(
      { error: 'Scraping failed' },
      { status: 500 }
    );
  }
}
```

---

## 비용 분석

### 월간 운영 비용 (기사 1,000개/일, 인스타 포스트 50개/일 기준)

#### 추천 구성 (~$76/월)

| 항목 | 서비스 | 월 비용 |
|------|--------|---------|
| 데이터베이스 | Supabase Pro | $25.00 |
| AI 분류 | Claude Haiku 3.5 | $18.00 |
| AI 콘텐츠 생성 | Claude Haiku 3.5 | $13.20 |
| 호스팅/스케줄링 | Vercel Pro | $20.00 |
| **합계** | | **$76.20** |

#### 저예산 구성 (~$30/월)

| 항목 | 서비스 | 월 비용 |
|------|--------|---------|
| 데이터베이스 | Supabase Free | $0.00 |
| AI 분류 | Gemini Flash-Lite | $2.10 |
| AI 콘텐츠 생성 | Gemini Flash-Lite | $1.35 |
| 호스팅/스케줄링 | Vercel Hobby | $0.00 |
| **합계** | | **$3.45** |

**제한사항:**
- Supabase Free: 500MB DB, 2GB 파일 저장
- Vercel Hobby: 2개 Cron jobs, 하루 1회만 실행

#### 프리미엄 구성 (~$150/월)

| 항목 | 서비스 | 월 비용 |
|------|--------|---------|
| 데이터베이스 | Supabase Pro | $25.00 |
| AI 분류/생성 | Claude Sonnet 4.5 | $100.00 |
| 호스팅/스케줄링 | Vercel Pro | $20.00 |
| **합계** | | **$145.00** |

### AI 비용 상세 계산

**가정:**
- 기사당 평균 500 토큰 (입력)
- 분류 응답 50 토큰 (출력)
- 인스타 콘텐츠 200 토큰 (입력) + 400 토큰 (출력)

**Claude Haiku 3.5 기준:**

```
분류 (1,000 기사/일):
  입력: 500 토큰 × 1,000 = 500K 토큰/일 = 15M 토큰/월
  출력: 50 토큰 × 1,000 = 50K 토큰/일 = 1.5M 토큰/월
  비용: (15M × $0.80/M) + (1.5M × $4.00/M) = $12 + $6 = $18/월

콘텐츠 생성 (50 포스트/일):
  입력: 200 토큰 × 50 = 10K 토큰/일 = 300K 토큰/월
  출력: 400 토큰 × 50 = 20K 토큰/일 = 600K 토큰/월
  비용: (0.3M × $0.80/M) + (0.6M × $4.00/M) = $0.24 + $2.40 = $2.64/월
```

---

## 구현 로드맵

### Phase 1: MVP (1-2주)

**목표: 기본 파이프라인 구축**

- [ ] Next.js + Supabase 프로젝트 설정
- [ ] RSS 피드 파싱 구현 (5-10개 소스)
- [ ] 데이터베이스 스키마 생성
- [ ] Claude Haiku 분류 통합
- [ ] 간단한 관리자 대시보드
- [ ] 수동 인스타그램 콘텐츠 생성

**결과물:**
- 뉴스 수집 및 분류 작동
- 데이터베이스에 기사 저장
- 기본 UI로 확인 가능

### Phase 2: 자동화 (3-4주)

**목표: 완전 자동화 파이프라인**

- [ ] Vercel Cron Jobs 설정
- [ ] 자동 분류 파이프라인
- [ ] 인스타그램 콘텐츠 자동 생성
- [ ] 스케줄링 시스템
- [ ] 중복 제거 로직
- [ ] 에러 핸들링 및 재시도

**결과물:**
- 완전 자동 뉴스→인스타그램 파이프라인
- 2시간마다 자동 실행
- 에러 복구 기능

### Phase 3: 고도화 (5-6주)

**목표: 품질 개선 및 확장**

- [ ] 웹 스크래핑 추가 (RSS 없는 소스)
- [ ] Instagram Graph API 통합
- [ ] 인게이지먼트 추적
- [ ] 분석 대시보드
- [ ] 프롬프트 최적화 (성능 기반)
- [ ] A/B 테스트 기능

**결과물:**
- 더 많은 소스 지원
- 자동 인스타그램 포스팅
- 성과 메트릭 추적

### Phase 4: 스케일링 (7-8주)

**목표: 대규모 운영 및 최적화**

- [ ] 큐 시스템 구현
- [ ] 더 많은 뉴스 소스 추가
- [ ] AI 비용 최적화 (캐싱, 배치)
- [ ] 캡션 A/B 테스트
- [ ] 피드백 루프 (낮은 인게이지먼트 = 프롬프트 조정)
- [ ] 멀티 언어 지원

**결과물:**
- 대규모 처리 능력
- 비용 효율적 운영
- 높은 인게이지먼트율

---

## 주요 과제 및 해결책

### 1. 웹사이트 차단

**문제:** 웹사이트가 스크래핑 차단

**해결책:**
- RSS 피드 우선 사용
- User-Agent 로테이션
- 프록시 로테이션 (ScraperAPI ~$29/월)
- 랜덤 딜레이
- robots.txt 준수
- 필요시에만 헤드리스 브라우저 사용

### 2. 콘텐츠 품질 및 정확도

**문제:** AI가 기사를 잘못 분류하거나 낮은 품질의 인스타그램 콘텐츠 생성

**해결책:**
- 관련성 점수 구현 (고품질 기사만 포스팅)
- 첫 주는 사람이 검토
- 다양한 프롬프트 A/B 테스트
- 인게이지먼트 메트릭 추적 및 조정
- Few-shot learning 사용
- 피드백 루프 구현

### 3. Instagram API 제한

**문제:** 하루 25-50개 포스트 제한, 스토리 미지원, 비즈니스 계정 필요

**해결책:**
- 전략적 스케줄링 (최적 시간대만)
- 양보다 질
- 스토리는 수동 포스팅
- Buffer/Later.com 대안 고려 ($15-$25/월)
- 우선순위 큐 시스템

### 4. 중복 콘텐츠

**문제:** 여러 소스에서 같은 기사

**해결책:**
- URL 기반 중복 제거 (DB 제약조건)
- 제목 유사도 검사 (Levenshtein distance)
- 콘텐츠 핑거프린팅 (처음 500 단어 해시)
- 첫 발견만 유지

### 5. 오래된 콘텐츠

**문제:** 오래된 뉴스가 수집될 수 있음

**해결책:**
- 발행일 필터링 (최근 24-48시간만)
- 최신순 정렬
- 트렌딩 토픽 확인
- 신선도 점수 구현

### 6. 법적/윤리적 문제

**문제:** 저작권, ToS 위반, GDPR

**해결책:**
- 항상 링크로 출처 표시
- 발췌만 사용 (전체 기사 아님)
- robots.txt 준수
- 개인정보 보호정책 포함
- 유료 콘텐츠 스크래핑 금지
- ToS 변경 모니터링
- 퍼블리셔와 API 파트너십 고려

---

## 환경 변수

```bash
# .env.local

# Supabase
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key
SUPABASE_SERVICE_KEY=your_service_key

# AI APIs (하나 선택 또는 여러 개 사용)
ANTHROPIC_API_KEY=your_anthropic_key
OPENAI_API_KEY=your_openai_key
GOOGLE_AI_API_KEY=your_google_key

# Instagram
INSTAGRAM_ACCESS_TOKEN=your_instagram_token
INSTAGRAM_ACCOUNT_ID=your_account_id

# Cron 보안
CRON_SECRET=your_random_secret_key

# Optional: 스크래핑용 프록시
SCRAPER_API_KEY=your_scraper_api_key
```

---

## 필요 패키지 전체 목록

```bash
# 코어 의존성
npm install @supabase/supabase-js
npm install @anthropic-ai/sdk
npm install rss-parser
npm install axios cheerio
npm install @mozilla/readability jsdom
npm install p-limit

# 개발 의존성
npm install -D @types/cheerio
npm install -D @types/jsdom

# Optional: 고급 스크래핑
npm install playwright

# Optional: 다른 AI 제공자
npm install @google/generative-ai
npm install openai
```

---

## 다음 단계

1. **프로젝트 설정**
   ```bash
   npx create-next-app@latest news-instagram-automation
   cd news-instagram-automation
   npm install @supabase/supabase-js @anthropic-ai/sdk rss-parser
   ```

2. **Supabase 프로젝트 생성**
   - https://supabase.com 방문
   - 새 프로젝트 생성
   - 데이터베이스 스키마 실행

3. **첫 RSS 피드 테스트**
   - `lib/scraping/rss-fetcher.ts` 생성
   - 테스트 피드로 실행
   - 콘솔에 결과 확인

4. **AI 분류 테스트**
   - Anthropic API 키 획득
   - `lib/ai/classifier.ts` 생성
   - 샘플 기사로 테스트

5. **대시보드 구축**
   - `/app/dashboard` 페이지 생성
   - 기사 목록 표시
   - 분류 결과 확인

---

## 유용한 리소스

### 문서
- [Next.js 문서](https://nextjs.org/docs)
- [Supabase 문서](https://supabase.com/docs)
- [Anthropic API 문서](https://docs.anthropic.com)
- [Instagram Graph API](https://developers.facebook.com/docs/instagram-api)

### 도구
- [RSS Feed Finder](https://rss.app)
- [Postman](https://www.postman.com) - API 테스트
- [Supabase Studio](https://supabase.com/docs/guides/platform/studio) - DB 관리

### 커뮤니티
- [Next.js Discord](https://discord.gg/nextjs)
- [Supabase Discord](https://discord.supabase.com)

---

**마지막 업데이트:** 2025-10-02
**버전:** 1.0.0
