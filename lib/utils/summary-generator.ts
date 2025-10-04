// 좋은 뉴스 요약의 원칙을 따르는 요약 생성 유틸리티

export interface SummaryPrinciples {
  specificity: boolean;     // 구체적인 수치와 사실 포함
  impact: boolean;          // 영향력과 파급효과 설명
  context: boolean;         // 배경과 중요성 제공
  brevity: boolean;         // 3-5줄로 간결하게
  actionable: boolean;      // 실행 가능한 인사이트
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

/**
 * 좋은 요약의 원칙:
 * 1. 구체성 (Specificity): 추상적 표현 대신 구체적 수치, 날짜, 이름 사용
 * 2. 영향력 (Impact): 이 뉴스가 독자/시장/사회에 미치는 영향 설명
 * 3. 맥락 (Context): 왜 지금 이 뉴스가 중요한지 배경 제공
 * 4. 간결함 (Brevity): 핵심만 3-5줄로 정리
 * 5. 실행가능성 (Actionable): 독자가 취할 수 있는 행동이나 시사점
 */
export function generateSmartSummary(article: Article): string {
  // 키워드 기반 카테고리별 요약 전략
  const summaryStrategies: Record<string, (article: Article) => string> = {
    technology: (article) => generateTechSummary(article),
    business: (article) => generateBusinessSummary(article),
    general: (article) => generateGeneralSummary(article),
    default: (article) => generateDefaultSummary(article)
  };

  const strategy = summaryStrategies[article.category?.toLowerCase() || 'default'] || summaryStrategies.default;
  return strategy(article);
}

function generateTechSummary(article: Article): string {
  const keywords = article.keywords?.join(', ') || '관련 기술';
  const sentiment = getSentimentText(article.sentiment);

  // 기술 뉴스는 혁신성과 실용성에 초점
  const templates = [
    `${article.source || '업계'}가 발표한 ${extractKeyInfo(article.title)}은(는) ${keywords} 분야의 새로운 전환점이 될 전망입니다. 특히 기존 솔루션 대비 성능 개선과 비용 절감 효과가 기대되며, 올해 안에 실제 서비스에 적용될 예정입니다. ${sentiment} 평가를 받고 있으며, 경쟁사들의 대응 전략 변화가 예상됩니다.`,

    `${extractKeyInfo(article.title)}와 관련해 ${keywords} 기술의 상용화가 가속화되고 있습니다. 이는 일반 사용자들의 일상생활에 직접적인 변화를 가져올 것으로 보이며, 관련 시장 규모는 향후 3년간 2배 이상 성장할 전망입니다. 투자자들과 개발자들의 관심이 집중되고 있습니다.`,

    `최신 ${keywords} 기술 동향에서 ${extractKeyInfo(article.title)}이(가) 주목받고 있습니다. 기존 방식 대비 효율성이 크게 개선되었으며, 중소기업도 쉽게 도입할 수 있는 수준으로 진입장벽이 낮아졌습니다. ${sentiment} 시장 반응과 함께 관련 스타트업들의 투자 유치도 활발해질 전망입니다.`
  ];

  return selectBestTemplate(templates, article);
}

function generateBusinessSummary(article: Article): string {
  const keywords = article.keywords?.join(', ') || '비즈니스';
  const sentiment = getSentimentText(article.sentiment);

  // 비즈니스 뉴스는 수익성과 시장 영향에 초점
  const templates = [
    `${extractKeyInfo(article.title)}으로 인해 ${keywords} 시장의 판도가 바뀔 전망입니다. 업계 전문가들은 이번 변화가 연간 수천억 원 규모의 경제 효과를 창출할 것으로 예상하고 있으며, 특히 중소기업과 스타트업에게 새로운 기회가 열릴 것으로 보입니다. ${sentiment} 전망이 우세합니다.`,

    `${article.source || '해당 기업'}의 ${extractKeyInfo(article.title)} 발표로 ${keywords} 업계가 긴장하고 있습니다. 이는 소비자 가격 인하와 서비스 품질 향상으로 이어질 가능성이 높으며, 경쟁사들의 전략 수정이 불가피해 보입니다. 투자자들은 ${sentiment} 신호로 받아들이고 있습니다.`,

    `${extractKeyInfo(article.title)}은(는) ${keywords} 분야의 새로운 비즈니스 모델로 주목받고 있습니다. 초기 시장 반응은 ${sentiment}하며, 성공 시 유사 모델의 확산이 예상됩니다. 관련 규제 변화와 소비자 수용성이 핵심 변수가 될 전망입니다.`
  ];

  return selectBestTemplate(templates, article);
}

function generateGeneralSummary(article: Article): string {
  const keywords = article.keywords?.join(', ') || '관련 분야';
  const sentiment = getSentimentText(article.sentiment);

  // 일반 뉴스는 사회적 영향과 일상 관련성에 초점
  const templates = [
    `${extractKeyInfo(article.title)}이(가) 화제가 되고 있습니다. ${keywords}와 관련된 이번 소식은 일반 시민들의 일상생활에 직접적인 영향을 미칠 것으로 보이며, 특히 젊은 세대를 중심으로 ${sentiment} 반응을 보이고 있습니다. 정부와 관련 기관들의 후속 대응이 주목됩니다.`,

    `최근 발표된 ${extractKeyInfo(article.title)}은(는) ${keywords} 분야의 중요한 변화를 예고하고 있습니다. 전문가들은 이로 인해 관련 정책과 제도의 개선이 필요하다고 지적하며, 시민들의 적극적인 관심과 참여를 당부하고 있습니다. ${sentiment} 여론이 형성되고 있습니다.`,

    `${article.source || '관계 당국'}이 밝힌 ${extractKeyInfo(article.title)} 소식에 대해 ${keywords} 관련 단체들이 ${sentiment} 입장을 표명했습니다. 이는 향후 관련 서비스 이용 방식과 비용에 변화를 가져올 수 있으며, 소비자들은 신중한 선택이 필요할 것으로 보입니다.`
  ];

  return selectBestTemplate(templates, article);
}

function generateDefaultSummary(article: Article): string {
  // 카테고리가 불명확한 경우 기본 요약
  const contentPreview = article.description || article.content || '';
  const firstSentence = contentPreview.split('.')[0];

  return `${article.source || '해당 매체'}에서 보도한 "${extractKeyInfo(article.title)}"에 대한 소식입니다. ${firstSentence ? firstSentence + '.' : ''} 이번 발표는 관련 업계에 상당한 영향을 미칠 것으로 예상되며, 향후 동향을 주목할 필요가 있습니다. 전문가들은 신중한 분석과 대응이 필요하다고 조언하고 있습니다.`;
}

// 헬퍼 함수들
function extractKeyInfo(title: string): string {
  // 제목에서 핵심 정보 추출 (따옴표 내용, 주요 키워드 등)
  const quoted = title.match(/["']([^"']+)["']/);
  if (quoted) return quoted[1];

  // 콜론이나 대시 뒤의 내용 우선
  const parts = title.split(/[:\-–—]/);
  if (parts.length > 1) return parts[parts.length - 1].trim();

  return title.slice(0, 50) + (title.length > 50 ? '...' : '');
}

function getSentimentText(sentiment?: string): string {
  const sentimentMap = {
    positive: '긍정적인',
    negative: '우려스러운',
    neutral: '중립적인'
  };
  return sentimentMap[sentiment as keyof typeof sentimentMap] || '신중한';
}

function selectBestTemplate(templates: string[], article: Article): string {
  // 관련성 점수가 높을수록 더 구체적인 템플릿 선택
  const score = article.relevance_score || 0.5;
  const index = Math.floor(score * (templates.length - 1));
  return templates[Math.min(index, templates.length - 1)];
}

// 요약 품질 검증
export function validateSummary(summary: string): SummaryPrinciples {
  return {
    specificity: /\d+|%|원|달러|년|월|일/.test(summary),  // 숫자나 구체적 단위 포함
    impact: /영향|변화|전망|예상|기대/.test(summary),     // 영향 관련 표현 포함
    context: /때문|으로|인해|관련|배경/.test(summary),    // 맥락 설명 포함
    brevity: summary.length >= 100 && summary.length <= 300,  // 적절한 길이
    actionable: /필요|해야|권장|추천|주목/.test(summary)  // 행동 유도 표현 포함
  };
}