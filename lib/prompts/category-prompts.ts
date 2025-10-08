// 카테고리별 기본 프롬프트 정의

export const CATEGORIES = [
  'general',
  'technology',
  'business',
  'sports',
  'politics',
  'entertainment',
  'health',
  'science'
] as const;

export type Category = typeof CATEGORIES[number];

// Helper: Validate and normalize category
export function normalizeCategory(category: string | null | undefined): Category {
  if (!category) return 'general';

  const normalized = category.toLowerCase().trim();

  // Check if it's a valid category
  if (CATEGORIES.includes(normalized as Category)) {
    return normalized as Category;
  }

  // Map common variations
  const categoryMap: Record<string, Category> = {
    'tech': 'technology',
    'biz': 'business',
    'sport': 'sports',
    'politic': 'politics',
    'entertainment': 'entertainment',
    'medical': 'health',
    'medicine': 'health',
    'sci': 'science',
  };

  if (categoryMap[normalized]) {
    return categoryMap[normalized];
  }

  // Default fallback
  return 'general';
}

export interface CategoryPrompt {
  category: Category;
  label: string;
  systemPrompt: string;
  description: string;
}

export const DEFAULT_CATEGORY_PROMPTS: Record<Category, CategoryPrompt> = {
  general: {
    category: 'general',
    label: '일반',
    description: '모든 카테고리에 적용되는 기본 프롬프트',
    systemPrompt: `당신은 세상에서 가장 빠르고 양질의 뉴스를 일반인들에게 전달하는 저널리스트입니다.

다음 구조로 3-5줄의 간결한 요약을 생성하세요:

1. 첫 문장을 간결하고 직설적으로 작성합니다.
2. 핵심 사실의 힘을 더하기 위해 구체적인 사실/숫자를 포함합니다.
3. 과하게 과장하지 않습니다.
4. 마무리는, 그래서 이 사실이 왜 중요한지 설명하는 문장으로 마무리합니다.

불렛포인트로 절대 적지 마십시오.`
  },

  technology: {
    category: 'technology',
    label: '기술',
    description: '기술 뉴스 전문 프롬프트',
    systemPrompt: `당신은 기술 산업 전문 저널리스트입니다.

기술 뉴스를 요약할 때:

1. 기술의 혁신성과 영향력을 명확히 설명합니다.
2. 구체적인 기술 스펙, 성능 향상치, 출시 일정 등 숫자를 포함합니다.
3. 경쟁사 대비 차별점이나 시장 영향을 언급합니다.
4. 일반인도 이해할 수 있도록 쉽게 설명합니다.
5. 이 기술이 우리 삶을 어떻게 바꿀지 마무리합니다.

불렛포인트 없이 문단 형식으로 작성하세요.`
  },

  business: {
    category: 'business',
    label: '비즈니스',
    description: '비즈니스/경제 뉴스 전문 프롬프트',
    systemPrompt: `당신은 비즈니스 및 경제 전문 저널리스트입니다.

비즈니스 뉴스를 요약할 때:

1. 비즈니스 임팩트를 첫 문장에서 명확히 전달합니다.
2. 매출, 투자액, 성장률 등 구체적인 재무 수치를 포함합니다.
3. 시장 점유율, 경쟁사 현황, 산업 트렌드를 언급합니다.
4. 투자자와 소비자에게 각각 어떤 의미인지 설명합니다.
5. 향후 전망과 시사점으로 마무리합니다.

전문적이지만 이해하기 쉽게 작성하세요.`
  },

  sports: {
    category: 'sports',
    label: '스포츠',
    description: '스포츠 뉴스 전문 프롬프트',
    systemPrompt: `당신은 스포츠 전문 저널리스트입니다.

스포츠 뉴스를 요약할 때:

1. 경기 결과나 이적 소식의 핵심을 흥미롭게 전달합니다.
2. 점수, 기록, 순위 등 구체적인 수치를 포함합니다.
3. 선수/팀의 상태, 배경 스토리를 간략히 언급합니다.
4. 팬들의 관심사와 리그 전체 흐름을 고려합니다.
5. 다음 경기나 시즌 전망으로 마무리합니다.

생동감 있고 흥미진진하게 작성하세요.`
  },

  politics: {
    category: 'politics',
    label: '정치',
    description: '정치 뉴스 전문 프롬프트',
    systemPrompt: `당신은 정치 전문 저널리스트입니다.

정치 뉴스를 요약할 때:

1. 정책이나 사건의 핵심을 중립적으로 전달합니다.
2. 법안 내용, 지지율, 투표 결과 등 객관적 수치를 포함합니다.
3. 여야 입장, 시민 반응 등 다양한 관점을 균형있게 다룹니다.
4. 정치적 편향 없이 사실만 전달합니다.
5. 국민 생활에 미치는 영향으로 마무리합니다.

공정하고 객관적으로 작성하세요.`
  },

  entertainment: {
    category: 'entertainment',
    label: '엔터테인먼트',
    description: '엔터테인먼트 뉴스 전문 프롬프트',
    systemPrompt: `당신은 엔터테인먼트 전문 저널리스트입니다.

엔터테인먼트 뉴스를 요약할 때:

1. 이슈의 흥미로운 포인트를 첫 문장에서 전달합니다.
2. 개봉일, 시청률, 박스오피스 등 구체적 수치를 포함합니다.
3. 출연진, 제작진, 작품 배경 등 관련 정보를 간략히 제공합니다.
4. 팬들의 반응이나 화제성을 언급합니다.
5. 앞으로의 일정이나 기대 포인트로 마무리합니다.

경쾌하고 매력적으로 작성하세요.`
  },

  health: {
    category: 'health',
    label: '건강',
    description: '건강/의료 뉴스 전문 프롬프트',
    systemPrompt: `당신은 건강 및 의료 전문 저널리스트입니다.

건강 뉴스를 요약할 때:

1. 건강 정보의 핵심을 정확하고 명확하게 전달합니다.
2. 연구 결과, 통계, 권장 수치 등을 포함합니다.
3. 의학 용어는 쉽게 풀어서 설명합니다.
4. 전문가 의견이나 연구 출처의 신뢰성을 언급합니다.
5. 실생활 적용 방법이나 주의사항으로 마무리합니다.

정확하고 신중하게 작성하세요.`
  },

  science: {
    category: 'science',
    label: '과학',
    description: '과학 뉴스 전문 프롬프트',
    systemPrompt: `당신은 과학 전문 저널리스트입니다.

과학 뉴스를 요약할 때:

1. 과학적 발견이나 현상의 핵심을 흥미롭게 전달합니다.
2. 연구 데이터, 측정값, 확률 등 구체적 수치를 포함합니다.
3. 복잡한 과학 개념을 일반인도 이해할 수 있게 설명합니다.
4. 연구진, 연구 기관, 발표 저널 등 출처를 밝힙니다.
5. 인류나 과학 발전에 미치는 영향으로 마무리합니다.

정확하면서도 흥미롭게 작성하세요.`
  }
};

// Get prompt for category from Supabase or default
export async function getCategoryPrompt(category: Category | string): Promise<string> {
  // Normalize category to ensure it's valid
  const validCategory = typeof category === 'string' ? normalizeCategory(category) : category;

  // Server-side: return default
  if (typeof window === 'undefined') {
    return DEFAULT_CATEGORY_PROMPTS[validCategory].systemPrompt;
  }

  // Client-side: fetch from Supabase via API
  try {
    const response = await fetch(`/api/prompts/${validCategory}`);
    if (!response.ok) throw new Error('Failed to fetch prompt');

    const { prompt } = await response.json();
    return prompt?.system_prompt || DEFAULT_CATEGORY_PROMPTS[validCategory].systemPrompt;
  } catch (error) {
    console.error('Error fetching prompt:', error);
    return DEFAULT_CATEGORY_PROMPTS[validCategory].systemPrompt;
  }
}

// Synchronous version for server-side (returns default)
export function getCategoryPromptSync(category: Category | string): string {
  const validCategory = typeof category === 'string' ? normalizeCategory(category) : category;
  return DEFAULT_CATEGORY_PROMPTS[validCategory].systemPrompt;
}

// Save prompt for category to Supabase
export async function saveCategoryPrompt(category: Category | string, prompt: string): Promise<boolean> {
  const validCategory = typeof category === 'string' ? normalizeCategory(category) : category;
  if (typeof window === 'undefined') return false;

  try {
    const response = await fetch('/api/prompts', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ category: validCategory, systemPrompt: prompt }),
    });

    if (!response.ok) throw new Error('Failed to save prompt');
    return true;
  } catch (error) {
    console.error('Error saving prompt:', error);
    return false;
  }
}

// Check if category has custom prompt
export async function hasCustomPrompt(category: Category | string): Promise<boolean> {
  const validCategory = typeof category === 'string' ? normalizeCategory(category) : category;
  if (typeof window === 'undefined') return false;

  try {
    const response = await fetch(`/api/prompts/${validCategory}`);
    if (!response.ok) return false;

    const { prompt } = await response.json();
    return prompt !== null;
  } catch (error) {
    console.error('Error checking custom prompt:', error);
    return false;
  }
}

// Reset to default prompt
export async function resetCategoryPrompt(category: Category | string): Promise<boolean> {
  const validCategory = typeof category === 'string' ? normalizeCategory(category) : category;
  if (typeof window === 'undefined') return false;

  try {
    const response = await fetch(`/api/prompts/${validCategory}`, {
      method: 'DELETE',
    });

    if (!response.ok) throw new Error('Failed to reset prompt');
    return true;
  } catch (error) {
    console.error('Error resetting prompt:', error);
    return false;
  }
}

// Get all custom prompts
export async function getAllCustomPrompts(): Promise<Record<Category, string | null>> {
  if (typeof window === 'undefined') {
    return CATEGORIES.reduce((acc, cat) => ({ ...acc, [cat]: null }), {} as Record<Category, string | null>);
  }

  try {
    const response = await fetch('/api/prompts');
    if (!response.ok) throw new Error('Failed to fetch prompts');

    const { prompts } = await response.json() as { prompts: { category: string; system_prompt: string }[] };

    return CATEGORIES.reduce((acc, cat) => {
      const found = prompts.find(p => p.category === cat);
      return { ...acc, [cat]: found?.system_prompt || null };
    }, {} as Record<Category, string | null>);
  } catch (error) {
    console.error('Error fetching all prompts:', error);
    return CATEGORIES.reduce((acc, cat) => ({ ...acc, [cat]: null }), {} as Record<Category, string | null>);
  }
}