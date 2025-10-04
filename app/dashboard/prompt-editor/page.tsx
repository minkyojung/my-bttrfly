'use client';

import { useState, useEffect } from 'react';
import { generateSmartSummary } from '@/lib/utils/summary-generator';

interface TestArticle {
  id: string;
  title: string;
  description?: string;
  content?: string;
  source?: string;
  category?: string;
  keywords?: string[];
  sentiment?: 'positive' | 'negative' | 'neutral';
  relevance_score?: number;
}

interface PromptTemplate {
  id: string;
  name: string;
  category: string;
  hook: string;
  bullets: string[];
  impact: string;
  variables: string[];
}

const DEFAULT_TEMPLATES: PromptTemplate[] = [
  {
    id: 'tech-1',
    name: 'Tech Breaking',
    category: 'technology',
    hook: '${company}이(가) ${title} 기술로 업계 판도를 뒤흔들고 있습니다.',
    bullets: [
      '• 핵심 기술: ${keyword1} 기반 차세대 솔루션',
      '• 성능: 기존 대비 ${performance}배 처리속도, ${cost}% 비용 절감',
      '• 출시: ${quarter} 베타 테스트, 연내 상용화',
      '• 시장: 글로벌 ${market} 시장 연 ${growth}% 성장 중'
    ],
    impact: '→ 경쟁사 대응 불가피, 중소기업도 도입 가능한 수준으로 진입장벽 하락',
    variables: ['company', 'title', 'keyword1', 'performance', 'cost', 'quarter', 'market', 'growth']
  },
  {
    id: 'biz-1',
    name: 'Business Impact',
    category: 'business',
    hook: '${company}의 ${title} 결정으로 시장 지각변동이 시작됐습니다.',
    bullets: [
      '• 규모: 연매출 ${revenue}억 시장 타겟',
      '• 전략: ${strategy} 가격 정책으로 기존 대비 ${discount}% 인하',
      '• 일정: ${timeline}부터 단계적 시행',
      '• 반응: 주가 ${stock}% 변동, 경쟁사 긴급 대응'
    ],
    impact: '→ 업계 가격 경쟁 촉발, 소비자 연간 ${savings}만원 절감 예상',
    variables: ['company', 'title', 'revenue', 'strategy', 'discount', 'timeline', 'stock', 'savings']
  }
];

const DEFAULT_SYSTEM_PROMPT = `당신은 뉴스 기사를 한국어로 요약하는 AI입니다.

다음 구조로 3-5줄의 간결한 요약을 생성하세요:

1. 📍 Hook: 가장 중요한 포인트를 한 문장으로 (임팩트 있게)
2. Bullets: 핵심 사실들을 불렛 포인트로 (• 로 시작)
3. → Impact: 이것이 왜 중요한지/무엇을 의미하는지

변수 사용 예시:
- {title}: 기사 제목
- {source}: 출처
- {category}: 카테고리
- {keywords}: 키워드들

주의사항:
- 첫 문장에서 독자의 관심을 끌어야 함
- 불렛 포인트는 명확하고 구체적이어야 함
- 마지막은 전체적인 의미/영향을 설명`;

export default function PromptEditor() {
  const [mode, setMode] = useState<'template' | 'freetext'>('freetext');
  const [templates, setTemplates] = useState<PromptTemplate[]>(DEFAULT_TEMPLATES);
  const [selectedTemplate, setSelectedTemplate] = useState<PromptTemplate | null>(templates[0]);
  const [systemPrompt, setSystemPrompt] = useState(DEFAULT_SYSTEM_PROMPT);
  const [testArticle, setTestArticle] = useState<TestArticle>({
    id: 'test-1',
    title: 'OpenAI가 GPT-5 출시를 예고했다',
    description: '차세대 AI 모델이 곧 공개될 예정',
    content: 'OpenAI가 차세대 언어 모델인 GPT-5를 2025년 상반기에 출시할 예정이라고 발표했다. 이번 모델은 기존 GPT-4 대비 10배 향상된 성능을 보여줄 것으로 예상된다.',
    source: 'OpenAI',
    category: 'technology',
    keywords: ['AI', 'GPT', '언어모델', '인공지능'],
    sentiment: 'positive',
    relevance_score: 0.9
  });

  const [generatedSummary, setGeneratedSummary] = useState<string>('');
  const [customVariables, setCustomVariables] = useState<Record<string, string>>({
    company: 'OpenAI',
    title: 'GPT-5 출시',
    keyword1: 'AI',
    performance: '10',
    cost: '50',
    quarter: '2025년 1분기',
    market: 'AI',
    growth: '35'
  });

  const [editingTemplate, setEditingTemplate] = useState<PromptTemplate | null>(null);
  const [isCreatingNew, setIsCreatingNew] = useState(false);

  const generateFreetextSummary = () => {
    // Replace variables in system prompt
    let processedPrompt = systemPrompt;
    processedPrompt = processedPrompt.replace(/{title}/g, testArticle.title);
    processedPrompt = processedPrompt.replace(/{source}/g, testArticle.source || '알 수 없음');
    processedPrompt = processedPrompt.replace(/{category}/g, testArticle.category || '일반');
    processedPrompt = processedPrompt.replace(/{keywords}/g, testArticle.keywords?.join(', ') || '');

    // Simulate summary generation based on prompt
    const summary = `📍 ${testArticle.title}의 핵심은 혁신적인 기술 발전입니다.

• 핵심: GPT-5는 이전 모델 대비 10배 성능 향상
• 출시: 2025년 상반기 정식 릴리즈 예정
• 영향: AI 산업 전반의 패러다임 변화 예상
• 기대: 더 자연스러운 대화와 복잡한 작업 수행 가능

→ 이번 발표로 AI 경쟁이 더욱 치열해질 전망이며, 기업들의 AI 도입이 가속화될 것으로 보입니다.`;

    setGeneratedSummary(summary);
  };

  const generateCustomSummary = () => {
    if (!selectedTemplate) return;

    let hook = selectedTemplate.hook;
    let bullets = [...selectedTemplate.bullets];
    let impact = selectedTemplate.impact;

    // Replace variables
    Object.entries(customVariables).forEach(([key, value]) => {
      const regex = new RegExp(`\\$\\{${key}\\}`, 'g');
      hook = hook.replace(regex, value);
      bullets = bullets.map(b => b.replace(regex, value));
      impact = impact.replace(regex, value);
    });

    const summary = `📍 ${hook}\n\n${bullets.join('\n')}\n\n${impact}`;
    setGeneratedSummary(summary);
  };

  const extractVariables = (text: string): string[] => {
    const regex = /\$\{([^}]+)\}/g;
    const variables = new Set<string>();
    let match;
    while ((match = regex.exec(text)) !== null) {
      variables.add(match[1]);
    }
    return Array.from(variables);
  };

  useEffect(() => {
    if (mode === 'template' && selectedTemplate) {
      generateCustomSummary();
    } else if (mode === 'freetext') {
      generateFreetextSummary();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [mode, selectedTemplate, customVariables, testArticle, systemPrompt]);

  const updateTemplateVariables = (template: PromptTemplate): PromptTemplate => {
    const allText = `${template.hook} ${template.bullets.join(' ')} ${template.impact}`;
    const variables = extractVariables(allText);
    return { ...template, variables };
  };

  const handleSaveTemplate = () => {
    if (!editingTemplate) return;

    if (isCreatingNew) {
      const newId = `custom-${Date.now()}`;
      const newTemplate = { ...editingTemplate, id: newId };
      setTemplates([...templates, newTemplate]);
      setSelectedTemplate(newTemplate);
    } else {
      setTemplates(templates.map(t =>
        t.id === editingTemplate.id ? editingTemplate : t
      ));
      if (selectedTemplate?.id === editingTemplate.id) {
        setSelectedTemplate(editingTemplate);
      }
    }

    setEditingTemplate(null);
    setIsCreatingNew(false);
  };

  const handleDeleteTemplate = (id: string) => {
    setTemplates(templates.filter(t => t.id !== id));
    if (selectedTemplate?.id === id) {
      setSelectedTemplate(templates[0] || null);
    }
  };

  return (
    <div className="min-h-screen bg-zinc-950">
      {/* Compact Header */}
      <div className="bg-zinc-900 border-b border-zinc-800 px-4 py-2">
        <div className="flex items-center gap-3">
          <h1 className="text-sm font-semibold text-white">프롬프트 에디터</h1>
          <div className="flex bg-zinc-800 rounded p-0.5">
            <button
              onClick={() => setMode('template')}
              className={`px-3 py-1 text-xs rounded transition-all ${
                mode === 'template'
                  ? 'bg-white text-black'
                  : 'text-zinc-400 hover:text-white'
              }`}
            >
              템플릿
            </button>
            <button
              onClick={() => setMode('freetext')}
              className={`px-3 py-1 text-xs rounded transition-all ${
                mode === 'freetext'
                  ? 'bg-white text-black'
                  : 'text-zinc-400 hover:text-white'
              }`}
            >
              프리텍스트
            </button>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-12 h-[calc(100vh-2.5rem)]">
        {/* Left Panel - More Compact */}
        {mode === 'template' ? (
          /* Template Mode - Template List */
          <div className="col-span-3 border-r border-zinc-800 p-3 overflow-y-auto">
            <div className="mb-3">
              <div className="flex items-center justify-between mb-2">
                <h2 className="text-xs font-medium text-white">템플릿</h2>
                <button
                  onClick={() => {
                    const newTemplate: PromptTemplate = {
                      id: '',
                      name: 'New Template',
                      category: 'general',
                      hook: '${title}에 대한 중요한 소식입니다.',
                      bullets: ['• 핵심: ${key}'],
                      impact: '→ ${impact}',
                      variables: []
                    };
                    setEditingTemplate(newTemplate);
                    setIsCreatingNew(true);
                  }}
                  className="text-xs px-2 py-1 bg-zinc-800 text-zinc-100 rounded hover:bg-zinc-700"
                >
                  + 추가
                </button>
              </div>

              {/* Template List */}
              <div className="space-y-1">
                {templates.map(template => (
                  <div
                    key={template.id}
                    className={`p-2 rounded cursor-pointer border transition-all ${
                      selectedTemplate?.id === template.id
                        ? 'bg-zinc-800 border-zinc-600'
                        : 'bg-zinc-900 border-zinc-800 hover:border-zinc-700'
                    }`}
                    onClick={() => setSelectedTemplate(template)}
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <p className="text-xs font-medium text-white">{template.name}</p>
                        <p className="text-xs text-zinc-500">{template.category}</p>
                      </div>
                      <div className="flex gap-0.5">
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            setEditingTemplate(template);
                            setIsCreatingNew(false);
                          }}
                          className="text-xs text-zinc-400 hover:text-white px-1"
                        >
                          편집
                        </button>
                        {!template.id.startsWith('tech-') && !template.id.startsWith('biz-') && (
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              handleDeleteTemplate(template.id);
                            }}
                            className="text-xs text-red-400 hover:text-red-300 px-1"
                          >
                            삭제
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Template Editor Modal - More Compact */}
            {editingTemplate && (
              <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
                <div className="bg-zinc-900 rounded-lg p-4 max-w-xl w-full max-h-[70vh] overflow-y-auto">
                  <h3 className="text-xs font-medium text-white mb-3">
                    {isCreatingNew ? '새 템플릿' : '템플릿 수정'}
                  </h3>

                  <div className="space-y-3">
                    <div>
                      <label className="text-xs text-zinc-400 block mb-1">이름</label>
                      <input
                        type="text"
                        value={editingTemplate.name}
                        onChange={(e) => setEditingTemplate({...editingTemplate, name: e.target.value})}
                        className="w-full px-2 py-1 text-xs bg-zinc-800 text-white rounded border border-zinc-700 focus:border-zinc-500 focus:outline-none"
                      />
                    </div>

                    <div>
                      <label className="text-xs text-zinc-400 block mb-1">카테고리</label>
                      <select
                        value={editingTemplate.category}
                        onChange={(e) => setEditingTemplate({...editingTemplate, category: e.target.value})}
                        className="w-full px-2 py-1 text-xs bg-zinc-800 text-white rounded border border-zinc-700 focus:border-zinc-500 focus:outline-none"
                      >
                        <option value="technology">Technology</option>
                        <option value="business">Business</option>
                        <option value="general">General</option>
                      </select>
                    </div>

                    <div>
                      <label className="text-xs text-zinc-400 block mb-1">Hook</label>
                      <input
                        type="text"
                        value={editingTemplate.hook}
                        onChange={(e) => setEditingTemplate(updateTemplateVariables({...editingTemplate, hook: e.target.value}))}
                        className="w-full px-2 py-1 text-xs bg-zinc-800 text-white rounded border border-zinc-700 focus:border-zinc-500 focus:outline-none"
                        placeholder="${company}이(가) ${title} 발표..."
                      />
                    </div>

                    <div>
                      <label className="text-xs text-zinc-400 block mb-1">Bullets</label>
                      {editingTemplate.bullets.map((bullet, idx) => (
                        <div key={idx} className="flex gap-1 mb-1">
                          <input
                            type="text"
                            value={bullet}
                            onChange={(e) => {
                              const newBullets = [...editingTemplate.bullets];
                              newBullets[idx] = e.target.value;
                              setEditingTemplate(updateTemplateVariables({...editingTemplate, bullets: newBullets}));
                            }}
                            className="flex-1 px-2 py-1 text-xs bg-zinc-800 text-white rounded border border-zinc-700 focus:border-zinc-500 focus:outline-none"
                          />
                          <button
                            onClick={() => {
                              const newBullets = editingTemplate.bullets.filter((_, i) => i !== idx);
                              setEditingTemplate(updateTemplateVariables({...editingTemplate, bullets: newBullets}));
                            }}
                            className="px-2 py-1 text-xs bg-red-900/50 text-red-300 rounded hover:bg-red-900/70"
                          >
                            X
                          </button>
                        </div>
                      ))}
                      <button
                        onClick={() => {
                          setEditingTemplate(updateTemplateVariables({
                            ...editingTemplate,
                            bullets: [...editingTemplate.bullets, '• 새 항목: ${variable}']
                          }));
                        }}
                        className="text-xs text-zinc-400 hover:text-white mt-1"
                      >
                        + 불렛 추가
                      </button>
                    </div>

                    <div>
                      <label className="text-xs text-zinc-400 block mb-1">Impact</label>
                      <input
                        type="text"
                        value={editingTemplate.impact}
                        onChange={(e) => setEditingTemplate(updateTemplateVariables({...editingTemplate, impact: e.target.value}))}
                        className="w-full px-2 py-1 text-xs bg-zinc-800 text-white rounded border border-zinc-700 focus:border-zinc-500 focus:outline-none"
                        placeholder="→ 시장 영향..."
                      />
                    </div>

                    <div>
                      <p className="text-xs text-zinc-400">변수: {editingTemplate.variables.join(', ')}</p>
                    </div>
                  </div>

                  <div className="flex justify-end gap-2 mt-4">
                    <button
                      onClick={() => {
                        setEditingTemplate(null);
                        setIsCreatingNew(false);
                      }}
                      className="px-3 py-1 text-xs bg-zinc-800 text-zinc-300 rounded hover:bg-zinc-700"
                    >
                      취소
                    </button>
                    <button
                      onClick={handleSaveTemplate}
                      className="px-3 py-1 text-xs bg-white text-black rounded hover:bg-zinc-200"
                    >
                      저장
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>
        ) : (
          /* Freetext Mode - System Prompt Editor */
          <div className="col-span-5 border-r border-zinc-800 p-3 overflow-y-auto">
            <h2 className="text-xs font-medium text-white mb-2">시스템 프롬프트</h2>

            <div className="bg-zinc-900/50 rounded p-2 mb-2 border border-zinc-800">
              <p className="text-xs text-zinc-400 mb-1">변수:</p>
              <div className="flex flex-wrap gap-1">
                <code className="text-xs bg-zinc-800 px-1 py-0.5 rounded">{'{title}'}</code>
                <code className="text-xs bg-zinc-800 px-1 py-0.5 rounded">{'{source}'}</code>
                <code className="text-xs bg-zinc-800 px-1 py-0.5 rounded">{'{category}'}</code>
                <code className="text-xs bg-zinc-800 px-1 py-0.5 rounded">{'{keywords}'}</code>
              </div>
            </div>

            <textarea
              value={systemPrompt}
              onChange={(e) => setSystemPrompt(e.target.value)}
              className="w-full h-[calc(100vh-10rem)] px-3 py-2 text-xs bg-zinc-900 text-white rounded border border-zinc-800 focus:border-zinc-600 focus:outline-none font-mono resize-none"
              placeholder="시스템 프롬프트를 입력하세요..."
            />

            <div className="mt-2 flex gap-1">
              <button
                onClick={() => setSystemPrompt(DEFAULT_SYSTEM_PROMPT)}
                className="text-xs px-2 py-1 bg-zinc-800 text-zinc-300 rounded hover:bg-zinc-700"
              >
                초기화
              </button>
              <button
                onClick={() => {
                  const saved = localStorage.getItem('saved_system_prompt');
                  if (saved) setSystemPrompt(saved);
                }}
                className="text-xs px-2 py-1 bg-zinc-800 text-zinc-300 rounded hover:bg-zinc-700"
              >
                불러오기
              </button>
              <button
                onClick={() => {
                  localStorage.setItem('saved_system_prompt', systemPrompt);
                  alert('저장됨');
                }}
                className="text-xs px-2 py-1 bg-white text-black rounded hover:bg-zinc-200"
              >
                저장
              </button>
            </div>
          </div>
        )}

        {/* Middle: Test Article & Variables - More Compact */}
        <div className={`${mode === 'template' ? 'col-span-4' : 'col-span-3'} border-r border-zinc-800 p-3 overflow-y-auto`}>
          <h2 className="text-xs font-medium text-white mb-2">테스트 기사</h2>

          {/* Test Article Input */}
          <div className="space-y-2 mb-3">
            <div>
              <label className="text-xs text-zinc-400 block mb-0.5">제목</label>
              <input
                type="text"
                value={testArticle.title}
                onChange={(e) => setTestArticle({...testArticle, title: e.target.value})}
                className="w-full px-2 py-1 text-xs bg-zinc-900 text-white rounded border border-zinc-800 focus:border-zinc-600 focus:outline-none"
              />
            </div>

            <div>
              <label className="text-xs text-zinc-400 block mb-0.5">설명</label>
              <input
                type="text"
                value={testArticle.description}
                onChange={(e) => setTestArticle({...testArticle, description: e.target.value})}
                className="w-full px-2 py-1 text-xs bg-zinc-900 text-white rounded border border-zinc-800 focus:border-zinc-600 focus:outline-none"
              />
            </div>

            <div>
              <label className="text-xs text-zinc-400 block mb-0.5">내용</label>
              <textarea
                value={testArticle.content}
                onChange={(e) => setTestArticle({...testArticle, content: e.target.value})}
                className="w-full px-2 py-1 text-xs bg-zinc-900 text-white rounded border border-zinc-800 focus:border-zinc-600 focus:outline-none h-16 resize-none"
              />
            </div>

            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="text-xs text-zinc-400 block mb-0.5">출처</label>
                <input
                  type="text"
                  value={testArticle.source}
                  onChange={(e) => setTestArticle({...testArticle, source: e.target.value})}
                  className="w-full px-2 py-1 text-xs bg-zinc-900 text-white rounded border border-zinc-800 focus:border-zinc-600 focus:outline-none"
                />
              </div>

              <div>
                <label className="text-xs text-zinc-400 block mb-0.5">카테고리</label>
                <select
                  value={testArticle.category}
                  onChange={(e) => setTestArticle({...testArticle, category: e.target.value})}
                  className="w-full px-2 py-1 text-xs bg-zinc-900 text-white rounded border border-zinc-800 focus:border-zinc-600 focus:outline-none"
                >
                  <option value="technology">Technology</option>
                  <option value="business">Business</option>
                  <option value="general">General</option>
                </select>
              </div>
            </div>

            <div>
              <label className="text-xs text-zinc-400 block mb-0.5">키워드</label>
              <input
                type="text"
                value={testArticle.keywords?.join(', ')}
                onChange={(e) => setTestArticle({...testArticle, keywords: e.target.value.split(',').map(k => k.trim())})}
                className="w-full px-2 py-1 text-xs bg-zinc-900 text-white rounded border border-zinc-800 focus:border-zinc-600 focus:outline-none"
                placeholder="쉼표로 구분"
              />
            </div>
          </div>

          {/* Variables Section - Only in Template Mode */}
          {mode === 'template' && selectedTemplate && (
            <>
              <h3 className="text-xs font-medium text-white mb-2">변수 설정</h3>
              <div className="space-y-1">
                {selectedTemplate.variables.map(variable => (
                  <div key={variable} className="flex items-center gap-2">
                    <label className="text-xs text-zinc-400 w-20">{variable}:</label>
                    <input
                      type="text"
                      value={customVariables[variable] || ''}
                      onChange={(e) => setCustomVariables({...customVariables, [variable]: e.target.value})}
                      className="flex-1 px-2 py-1 text-xs bg-zinc-900 text-white rounded border border-zinc-800 focus:border-zinc-600 focus:outline-none"
                    />
                  </div>
                ))}
              </div>
            </>
          )}
        </div>

        {/* Right: Preview - More Compact */}
        <div className={`${mode === 'template' ? 'col-span-5' : 'col-span-4'} p-3 overflow-y-auto`}>
          <h2 className="text-xs font-medium text-white mb-2">미리보기</h2>

          <div className="bg-zinc-900 rounded-lg p-4 border border-zinc-800">
            <h3 className="text-sm font-semibold text-white mb-3">{testArticle.title}</h3>

            <div className="mb-3 pb-3 border-b border-zinc-800">
              <p className="text-xs text-zinc-400 mb-1">생성된 요약:</p>
              <div className="bg-zinc-950 rounded p-3 border border-zinc-800">
                <p className="text-xs text-zinc-100 leading-relaxed whitespace-pre-line">
                  {generatedSummary || '템플릿을 선택하거나 시스템 프롬프트를 입력하세요.'}
                </p>
              </div>
            </div>

            <div>
              <p className="text-xs text-zinc-400 mb-1">원본 요약:</p>
              <div className="bg-zinc-950 rounded p-3 border border-zinc-800">
                <p className="text-xs text-zinc-100 leading-relaxed whitespace-pre-line">
                  {generateSmartSummary(testArticle as any)}
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}