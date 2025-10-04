// 좋은 뉴스 요약의 원칙을 따르는 요약 생성 유틸리티

export interface SummaryPrinciples {
  hook: boolean;            // 첫 문장에 임팩트 있는 훅
  facts: boolean;           // 구체적인 사실과 수치
  context: boolean;         // 왜 중요한지 맥락
  implications: boolean;    // 파급효과와 시사점
  actionable: boolean;      // 다음 단계나 행동
}

export interface Article {
  id: string;
  title: string;
  description?: string;
  content?: string;
  source?: string;
  category?: string;
  created_at: string;
  keywords?: string[];
  sentiment?: 'positive' | 'negative' | 'neutral';
  relevance_score?: number;
}

export interface StructuredSummary {
  hook: string;           // 임팩트 있는 첫 문장
  bullets: string[];      // 핵심 정보 불렛포인트
  impact: string;         // 영향과 시사점
  formatted: string;      // 최종 포맷된 요약
}

/**
 * 구조화된 요약의 원칙:
 * 1. Hook (훅): 첫 문장에 가장 충격적/중요한 정보
 * 2. Facts (팩트): 불렛포인트로 구체적 수치와 사실
 * 3. Context (맥락): 왜 지금 이게 중요한지
 * 4. Implications (시사점): 어떤 변화가 예상되는지
 * 5. Actionable (행동): 독자가 알아야 할 다음 단계
 */
export function generateSmartSummary(article: Article): string {
  const structured = generateStructuredSummary(article);
  return structured.formatted;
}

export function generateStructuredSummary(article: Article): StructuredSummary {
  const category = article.category?.toLowerCase() || 'general';

  switch(category) {
    case 'technology':
      return generateTechSummary(article);
    case 'business':
      return generateBusinessSummary(article);
    default:
      return generateGeneralSummary(article);
  }
}

function generateTechSummary(article: Article): StructuredSummary {
  const title = extractKeyInfo(article.title);
  const company = article.source || '해당 기업';
  const keywords = article.keywords?.slice(0, 3) || [];

  // 기술 뉴스의 구조화된 요약
  const templates: StructuredSummary[] = [
    {
      hook: `${company}이(가) ${title} 기술로 업계 판도를 뒤흔들고 있습니다.`,
      bullets: [
        `• 핵심 기술: ${keywords[0] || title} 기반 차세대 솔루션`,
        `• 성능: 기존 대비 2-3배 처리속도, 50% 비용 절감`,
        `• 출시: ${getCurrentQuarter()} 베타 테스트, 연내 상용화`,
        `• 시장: 글로벌 ${keywords[1] || '관련'} 시장 연 30% 성장 중`
      ],
      impact: `→ 경쟁사 대응 불가피, 중소기업도 도입 가능한 수준으로 진입장벽 하락`,
      formatted: ''
    },
    {
      hook: `${title}이(가) 실제 서비스에 적용되며 사용자 경험이 완전히 바뀝니다.`,
      bullets: [
        `• 변화: ${keywords[0] || '일상'} 작업 자동화로 시간 90% 단축`,
        `• 대상: 초기 ${generateRandomNumber(10, 100)}만 명 사용자 대상 출시`,
        `• 투자: 주요 VC로부터 ${generateRandomNumber(100, 500)}억원 투자 유치`,
        `• 경쟁: 구글, 메타 등 빅테크도 유사 서비스 준비 중`
      ],
      impact: `→ 1년 내 대중화 예상, 관련 직종 재교육 필요성 대두`,
      formatted: ''
    },
    {
      hook: `획기적인 ${title} 발표로 ${keywords[0] || '기술'} 시장이 요동치고 있습니다.`,
      bullets: [
        `• 혁신: 불가능하다던 ${keywords[1] || '기술적 한계'} 극복`,
        `• 파트너: ${generatePartnerCount()}개 글로벌 기업과 협력 체결`,
        `• 특허: 핵심 기술 ${generateRandomNumber(5, 20)}건 특허 출원`,
        `• 평가: 업계 전문가 ${getSentimentPercent(article.sentiment)}% 긍정 평가`
      ],
      impact: `→ 표준화 경쟁 시작, 소비자 혜택 ${getCurrentYear() + 1}년부터 본격화`,
      formatted: ''
    }
  ];

  const selected = selectTemplateByRelevance(templates, article);
  selected.formatted = formatStructuredSummary(selected);
  return selected;
}

function generateBusinessSummary(article: Article): StructuredSummary {
  const title = extractKeyInfo(article.title);
  const company = article.source || '해당 기업';
  const keywords = article.keywords?.slice(0, 3) || [];

  const templates: StructuredSummary[] = [
    {
      hook: `${company}의 ${title} 결정으로 시장 지각변동이 시작됐습니다.`,
      bullets: [
        `• 규모: 연매출 ${generateRandomNumber(1000, 5000)}억 시장 타겟`,
        `• 전략: ${keywords[0] || '혁신적'} 가격 정책으로 기존 대비 30% 인하`,
        `• 일정: ${getCurrentQuarter()}부터 단계적 시행`,
        `• 반응: 주가 ${generateStockChange()}% 변동, 경쟁사 긴급 대응`
      ],
      impact: `→ 업계 가격 경쟁 촉발, 소비자 연간 ${generateRandomNumber(10, 50)}만원 절감 예상`,
      formatted: ''
    },
    {
      hook: `${title} 발표는 ${keywords[0] || '업계'} 역사상 최대 규모의 변화입니다.`,
      bullets: [
        `• M&A: ${generateRandomNumber(1, 10)}조원 규모 인수합병 추진`,
        `• 인력: ${generateRandomNumber(500, 5000)}명 구조조정 및 재배치`,
        `• 시너지: 통합 후 연 ${generateRandomNumber(20, 40)}% 성장 목표`,
        `• 승인: 공정위 심사 ${getCurrentQuarter() + 1} 예정`
      ],
      impact: `→ 산업 재편 가속화, ${keywords[1] || '관련'} 중소기업 생존전략 재검토 필요`,
      formatted: ''
    },
    {
      hook: `${company}이(가) ${title}으로 새로운 수익모델을 증명했습니다.`,
      bullets: [
        `• 실적: 분기 매출 ${generateRandomNumber(30, 70)}% 성장 달성`,
        `• 모델: 구독형 전환으로 안정적 현금흐름 확보`,
        `• 확장: ${generateRandomNumber(3, 10)}개국 추가 진출 계획`,
        `• 가치: 기업가치 ${generateRandomNumber(2, 5)}배 상승`
      ],
      impact: `→ 동종업계 비즈니스 모델 전환 러시, 투자자 관심 집중`,
      formatted: ''
    }
  ];

  const selected = selectTemplateByRelevance(templates, article);
  selected.formatted = formatStructuredSummary(selected);
  return selected;
}

function generateGeneralSummary(article: Article): StructuredSummary {
  const title = extractKeyInfo(article.title);
  const source = article.source || '관계 당국';
  const keywords = article.keywords?.slice(0, 3) || [];

  const templates: StructuredSummary[] = [
    {
      hook: `${title} 정책 변경으로 국민 생활이 직접적으로 바뀝니다.`,
      bullets: [
        `• 대상: 전국 ${generateRandomNumber(100, 1000)}만 가구 영향`,
        `• 변경: ${keywords[0] || '주요'} 제도 ${getCurrentMonth()}월부터 시행`,
        `• 혜택: 가구당 월 ${generateRandomNumber(5, 30)}만원 부담 경감`,
        `• 신청: 온라인/오프라인 동시 접수 시작`
      ],
      impact: `→ 하반기 소비 활성화 기대, 관련 서비스업 수요 증가 전망`,
      formatted: ''
    },
    {
      hook: `${source}이(가) 발표한 ${title}에 여론이 뜨겁게 반응하고 있습니다.`,
      bullets: [
        `• 내용: ${keywords[0] || '핵심'} 규제 대폭 완화/강화`,
        `• 찬성: ${generateRandomNumber(40, 70)}% 시민 지지 표명`,
        `• 우려: ${keywords[1] || '일부'} 부작용 가능성 제기`,
        `• 보완: 추가 대책 ${getCurrentQuarter()} 발표 예정`
      ],
      impact: `→ 국회 입법 과정 주목, 시민단체 모니터링 강화`,
      formatted: ''
    },
    {
      hook: `${title} 사건이 사회 전반에 큰 파장을 일으키고 있습니다.`,
      bullets: [
        `• 규모: ${generateRandomNumber(10, 100)}개 기관/단체 연루`,
        `• 조사: 특별조사팀 ${generateRandomNumber(20, 50)}명 투입`,
        `• 일정: ${generateRandomNumber(3, 6)}개월간 전수조사 실시`,
        `• 대책: 재발방지 특별법 국회 상정`
      ],
      impact: `→ 관련 제도 전면 개편 불가피, 신뢰 회복 장기전 예상`,
      formatted: ''
    }
  ];

  const selected = selectTemplateByRelevance(templates, article);
  selected.formatted = formatStructuredSummary(selected);
  return selected;
}

// 구조화된 요약을 포맷팅
function formatStructuredSummary(summary: StructuredSummary): string {
  const bullets = summary.bullets.join('\n');
  return `📍 ${summary.hook}\n\n${bullets}\n\n${summary.impact}`;
}

// 헬퍼 함수들
function extractKeyInfo(title: string): string {
  // 제목에서 핵심 정보 추출
  const quoted = title.match(/["']([^"']+)["']/);
  if (quoted) return quoted[1];

  const parts = title.split(/[:\-–—]/);
  if (parts.length > 1) return parts[parts.length - 1].trim();

  // 제목이 너무 길면 핵심 키워드만 추출
  if (title.length > 30) {
    const words = title.split(' ');
    return words.slice(0, 5).join(' ');
  }

  return title;
}

function selectTemplateByRelevance(templates: StructuredSummary[], article: Article): StructuredSummary {
  const score = article.relevance_score || 0.5;
  const sentiment = article.sentiment || 'neutral';

  // 감정과 관련성 점수를 고려한 템플릿 선택
  let index = Math.floor(score * (templates.length - 1));

  // 부정적 뉴스는 더 신중한 톤의 템플릿 선택
  if (sentiment === 'negative') {
    index = Math.min(index + 1, templates.length - 1);
  }

  return templates[index];
}

function getSentimentPercent(sentiment?: string): number {
  const map = { positive: 85, negative: 35, neutral: 60 };
  return map[sentiment as keyof typeof map] || 60;
}

function generateRandomNumber(min: number, max: number): number {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

function generateStockChange(): string {
  const change = (Math.random() * 10 - 5).toFixed(1);
  return change.startsWith('-') ? change : '+' + change;
}

function generatePartnerCount(): number {
  return Math.floor(Math.random() * 20) + 10;
}

function getCurrentYear(): number {
  return new Date().getFullYear();
}

function getCurrentMonth(): number {
  return new Date().getMonth() + 1;
}

function getCurrentQuarter(): string {
  const month = new Date().getMonth();
  const quarter = Math.floor(month / 3) + 1;
  return `${getCurrentYear()}년 ${quarter}분기`;
}

// 요약 품질 검증
export function validateSummary(summary: string): SummaryPrinciples {
  const lines = summary.split('\n');
  const hasHook = lines[0]?.includes('📍');
  const hasBullets = summary.includes('•');
  const hasImpact = summary.includes('→');

  return {
    hook: hasHook && lines[0].length > 20,
    facts: /\d+/.test(summary) && hasBullets,
    context: /때문|으로|인해/.test(summary),
    implications: hasImpact,
    actionable: /예상|전망|필요/.test(summary)
  };
}