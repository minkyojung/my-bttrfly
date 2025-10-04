# 뉴스 → 인스타그램 자동화 파이프라인

## ✅ 구현 완료

### 1. AI 모델: **gpt-4o-mini**
- 가격: $0.15 input / $0.60 output per 1M tokens
- 빠른 속도 + 경제적 가격
- JSON 모드 지원

### 2. 핵심 기능

#### 📡 RSS 수집 (`/lib/scraping/rss-fetcher.ts`)
- TechCrunch, The Verge, Hacker News 등 자동 수집
- RSS 피드 파싱
- 중복 제거

#### 🤖 AI 분류 (`/lib/ai/classifier.ts`)
- 카테고리 자동 분류 (TECHNOLOGY, BUSINESS 등)
- 키워드 추출
- 관련성 점수 (1-10)

#### 📸 인스타그램 콘텐츠 생성 (`/lib/ai/instagram-generator.ts`)
- 캡션 자동 생성 (125-150자)
- 해시태그 자동 생성 (10-15개)
- Alt text (접근성)

#### 🔄 Cron Jobs (자동화)
1. **RSS 수집**: 매 2시간 (0분) - `/api/cron/scrape-news`
2. **AI 분류**: 매 2시간 (15분) - `/api/cron/classify-articles`
3. **인스타그램 생성**: 매 2시간 (30분) - `/api/cron/generate-instagram`

#### 📊 대시보드
- 실시간 기사 모니터링
- 분류 결과 확인
- 인스타그램 포스트 미리보기
- 통계 (전체 기사, 분류 완료, 인스타그램 포스트)

## 🚀 사용 방법

### 1. 수동 테스트

#### RSS 수집 테스트
```bash
curl http://localhost:3001/api/cron/scrape-news
```

#### AI 분류 테스트
```bash
curl http://localhost:3001/api/cron/classify-articles
```

#### 인스타그램 콘텐츠 생성 테스트
```bash
curl http://localhost:3001/api/cron/generate-instagram
```

### 2. 대시보드 확인
```
http://localhost:3001/dashboard
```

### 3. 전체 파이프라인 실행
```bash
# 1. RSS 수집
curl http://localhost:3001/api/cron/scrape-news

# 2. AI 분류 (수집 후 15초 대기)
sleep 15 && curl http://localhost:3001/api/cron/classify-articles

# 3. 인스타그램 생성 (분류 후 15초 대기)
sleep 15 && curl http://localhost:3001/api/cron/generate-instagram
```

## 📁 프로젝트 구조

```
lib/
├── ai/
│   ├── classifier.ts          # AI 분류 (gpt-4o-mini)
│   └── instagram-generator.ts # 인스타그램 콘텐츠 생성
├── scraping/
│   ├── rss-fetcher.ts        # RSS 피드 수집
│   └── rate-limiter.ts       # Rate limiting
├── extraction/
│   └── content-extractor.ts  # 본문/이미지 추출
└── db/
    └── supabase.ts           # Supabase 클라이언트

app/
├── api/
│   ├── cron/
│   │   ├── scrape-news/      # RSS 수집 Cron
│   │   ├── classify-articles/ # AI 분류 Cron
│   │   └── generate-instagram/ # 인스타그램 생성 Cron
│   └── test/
│       └── rss-classify/     # 테스트 API
└── dashboard/
    └── page.tsx              # 대시보드 UI
```

## 🔧 환경 변수

```bash
# .env.local
NEXT_PUBLIC_SUPABASE_URL=your_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_key
SUPABASE_SERVICE_ROLE_KEY=your_service_key

# OpenAI API
OPENAI_API_KEY=your_openai_key

# Cron 보안 (프로덕션)
CRON_SECRET=your_random_secret
```

## 📊 데이터 흐름

```
RSS 피드
    ↓
수집 (매 2시간, 0분)
    ↓
DB 저장 (articles 테이블, status: pending)
    ↓
AI 분류 (매 2시간, 15분)
    ↓
분류 결과 업데이트 (status: classified)
    ↓
인스타그램 콘텐츠 생성 (매 2시간, 30분)
    ↓
instagram_posts 테이블에 저장 (status: draft)
    ↓
대시보드에서 확인/관리
```

## 💰 예상 비용 (월간)

### 기준: 1,000개 기사/일, 50개 인스타그램 포스트/일

| 항목 | 비용 |
|------|------|
| **OpenAI API (gpt-4o-mini)** | ~$25/월 |
| Supabase Free | $0 |
| Vercel Hobby | $0 |
| **합계** | **~$25/월** |

### 비용 최적화 팁
1. 프롬프트 캐싱 활용 (90% 절감)
2. 관련성 점수 6점 이상만 처리
3. 24시간 이내 기사만 수집

## 🎯 다음 단계

- [ ] Instagram Graph API 연동 (자동 포스팅)
- [ ] 웹 스크래핑 추가 (RSS 없는 소스)
- [ ] A/B 테스트 (캡션 최적화)
- [ ] 분석 대시보드 (인게이지먼트 추적)
- [ ] 멀티 언어 지원
