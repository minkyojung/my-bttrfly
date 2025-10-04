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

export default function PromptEditor() {
  const [templates, setTemplates] = useState<PromptTemplate[]>(DEFAULT_TEMPLATES);
  const [selectedTemplate, setSelectedTemplate] = useState<PromptTemplate | null>(templates[0]);
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

  useEffect(() => {
    if (selectedTemplate) {
      generateCustomSummary();
    }
  }, [selectedTemplate, customVariables, testArticle]);

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

  const handleSaveTemplate = () => {
    if (!editingTemplate) return;

    if (isCreatingNew) {
      const newTemplate = { ...editingTemplate, id: `custom-${Date.now()}` };
      setTemplates([...templates, newTemplate]);
    } else {
      setTemplates(templates.map(t => t.id === editingTemplate.id ? editingTemplate : t));
    }

    setEditingTemplate(null);
    setIsCreatingNew(false);
  };

  const handleDeleteTemplate = (id: string) => {
    setTemplates(templates.filter(t => t.id !== id));
    if (selectedTemplate?.id === id) {
      setSelectedTemplate(templates[0]);
    }
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

  const updateTemplateVariables = (template: PromptTemplate) => {
    const allText = template.hook + template.bullets.join('') + template.impact;
    template.variables = extractVariables(allText);
    return template;
  };

  return (
    <div className="min-h-screen bg-zinc-950 pb-24">
      <div className="grid grid-cols-12 h-screen">
        {/* Left: Template Editor */}
        <div className="col-span-3 border-r border-zinc-800 p-4 overflow-y-auto">
          <div className="mb-4">
            <h2 className="text-sm font-medium text-white mb-3">프롬프트 템플릿</h2>
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
              className="w-full text-xs px-3 py-2 bg-zinc-800 text-zinc-100 rounded-md hover:bg-zinc-700 mb-3"
            >
              + 새 템플릿 추가
            </button>

            {/* Template List */}
            <div className="space-y-2">
              {templates.map(template => (
                <div
                  key={template.id}
                  className={`p-3 rounded-md cursor-pointer border transition-all ${
                    selectedTemplate?.id === template.id
                      ? 'bg-zinc-800 border-zinc-600'
                      : 'bg-zinc-900 border-zinc-800 hover:border-zinc-700'
                  }`}
                  onClick={() => setSelectedTemplate(template)}
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <p className="text-xs font-medium text-white">{template.name}</p>
                      <p className="text-xs text-zinc-500 mt-1">{template.category}</p>
                    </div>
                    <div className="flex gap-1">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          setEditingTemplate(template);
                          setIsCreatingNew(false);
                        }}
                        className="text-xs text-zinc-400 hover:text-white px-2 py-1"
                      >
                        편집
                      </button>
                      {!template.id.startsWith('tech-') && !template.id.startsWith('biz-') && (
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            handleDeleteTemplate(template.id);
                          }}
                          className="text-xs text-red-400 hover:text-red-300 px-2 py-1"
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

          {/* Template Editor Modal */}
          {editingTemplate && (
            <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
              <div className="bg-zinc-900 rounded-lg p-6 max-w-2xl w-full max-h-[80vh] overflow-y-auto">
                <h3 className="text-sm font-medium text-white mb-4">
                  {isCreatingNew ? '새 템플릿 만들기' : '템플릿 수정'}
                </h3>

                <div className="space-y-4">
                  <div>
                    <label className="text-xs text-zinc-400 block mb-1">이름</label>
                    <input
                      type="text"
                      value={editingTemplate.name}
                      onChange={(e) => setEditingTemplate({...editingTemplate, name: e.target.value})}
                      className="w-full px-3 py-2 text-sm bg-zinc-800 text-white rounded-md border border-zinc-700 focus:border-zinc-500 focus:outline-none"
                    />
                  </div>

                  <div>
                    <label className="text-xs text-zinc-400 block mb-1">카테고리</label>
                    <select
                      value={editingTemplate.category}
                      onChange={(e) => setEditingTemplate({...editingTemplate, category: e.target.value})}
                      className="w-full px-3 py-2 text-sm bg-zinc-800 text-white rounded-md border border-zinc-700 focus:border-zinc-500 focus:outline-none"
                    >
                      <option value="technology">Technology</option>
                      <option value="business">Business</option>
                      <option value="general">General</option>
                    </select>
                  </div>

                  <div>
                    <label className="text-xs text-zinc-400 block mb-1">Hook (첫 문장)</label>
                    <input
                      type="text"
                      value={editingTemplate.hook}
                      onChange={(e) => setEditingTemplate(updateTemplateVariables({...editingTemplate, hook: e.target.value}))}
                      className="w-full px-3 py-2 text-sm bg-zinc-800 text-white rounded-md border border-zinc-700 focus:border-zinc-500 focus:outline-none"
                      placeholder="${company}이(가) ${title} 발표..."
                    />
                  </div>

                  <div>
                    <label className="text-xs text-zinc-400 block mb-1">Bullets (불렛포인트)</label>
                    {editingTemplate.bullets.map((bullet, idx) => (
                      <div key={idx} className="flex gap-2 mb-2">
                        <input
                          type="text"
                          value={bullet}
                          onChange={(e) => {
                            const newBullets = [...editingTemplate.bullets];
                            newBullets[idx] = e.target.value;
                            setEditingTemplate(updateTemplateVariables({...editingTemplate, bullets: newBullets}));
                          }}
                          className="flex-1 px-3 py-2 text-sm bg-zinc-800 text-white rounded-md border border-zinc-700 focus:border-zinc-500 focus:outline-none"
                        />
                        <button
                          onClick={() => {
                            const newBullets = editingTemplate.bullets.filter((_, i) => i !== idx);
                            setEditingTemplate(updateTemplateVariables({...editingTemplate, bullets: newBullets}));
                          }}
                          className="px-3 py-2 text-xs bg-red-900/50 text-red-300 rounded-md hover:bg-red-900/70"
                        >
                          삭제
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
                      className="text-xs text-zinc-400 hover:text-white"
                    >
                      + 불렛 추가
                    </button>
                  </div>

                  <div>
                    <label className="text-xs text-zinc-400 block mb-1">Impact (영향/시사점)</label>
                    <input
                      type="text"
                      value={editingTemplate.impact}
                      onChange={(e) => setEditingTemplate(updateTemplateVariables({...editingTemplate, impact: e.target.value}))}
                      className="w-full px-3 py-2 text-sm bg-zinc-800 text-white rounded-md border border-zinc-700 focus:border-zinc-500 focus:outline-none"
                      placeholder="→ 시장 영향..."
                    />
                  </div>

                  <div>
                    <p className="text-xs text-zinc-400 mb-2">발견된 변수: {editingTemplate.variables.join(', ')}</p>
                  </div>
                </div>

                <div className="flex justify-end gap-2 mt-6">
                  <button
                    onClick={() => {
                      setEditingTemplate(null);
                      setIsCreatingNew(false);
                    }}
                    className="px-4 py-2 text-xs bg-zinc-800 text-zinc-300 rounded-md hover:bg-zinc-700"
                  >
                    취소
                  </button>
                  <button
                    onClick={handleSaveTemplate}
                    className="px-4 py-2 text-xs bg-white text-black rounded-md hover:bg-zinc-200"
                  >
                    저장
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Middle: Test Article & Variables */}
        <div className="col-span-4 border-r border-zinc-800 p-4 overflow-y-auto">
          <h2 className="text-sm font-medium text-white mb-4">테스트 기사</h2>

          {/* Test Article Input */}
          <div className="space-y-3 mb-6">
            <div>
              <label className="text-xs text-zinc-400 block mb-1">제목</label>
              <input
                type="text"
                value={testArticle.title}
                onChange={(e) => setTestArticle({...testArticle, title: e.target.value})}
                className="w-full px-3 py-2 text-sm bg-zinc-900 text-white rounded-md border border-zinc-800 focus:border-zinc-600 focus:outline-none"
              />
            </div>

            <div>
              <label className="text-xs text-zinc-400 block mb-1">설명</label>
              <textarea
                value={testArticle.description}
                onChange={(e) => setTestArticle({...testArticle, description: e.target.value})}
                className="w-full px-3 py-2 text-sm bg-zinc-900 text-white rounded-md border border-zinc-800 focus:border-zinc-600 focus:outline-none resize-none"
                rows={2}
              />
            </div>

            <div>
              <label className="text-xs text-zinc-400 block mb-1">본문</label>
              <textarea
                value={testArticle.content}
                onChange={(e) => setTestArticle({...testArticle, content: e.target.value})}
                className="w-full px-3 py-2 text-sm bg-zinc-900 text-white rounded-md border border-zinc-800 focus:border-zinc-600 focus:outline-none resize-none"
                rows={4}
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-xs text-zinc-400 block mb-1">출처</label>
                <input
                  type="text"
                  value={testArticle.source}
                  onChange={(e) => setTestArticle({...testArticle, source: e.target.value})}
                  className="w-full px-3 py-2 text-sm bg-zinc-900 text-white rounded-md border border-zinc-800 focus:border-zinc-600 focus:outline-none"
                />
              </div>

              <div>
                <label className="text-xs text-zinc-400 block mb-1">카테고리</label>
                <select
                  value={testArticle.category}
                  onChange={(e) => setTestArticle({...testArticle, category: e.target.value})}
                  className="w-full px-3 py-2 text-sm bg-zinc-900 text-white rounded-md border border-zinc-800 focus:border-zinc-600 focus:outline-none"
                >
                  <option value="technology">Technology</option>
                  <option value="business">Business</option>
                  <option value="general">General</option>
                </select>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-xs text-zinc-400 block mb-1">감정</label>
                <select
                  value={testArticle.sentiment}
                  onChange={(e) => setTestArticle({...testArticle, sentiment: e.target.value as any})}
                  className="w-full px-3 py-2 text-sm bg-zinc-900 text-white rounded-md border border-zinc-800 focus:border-zinc-600 focus:outline-none"
                >
                  <option value="positive">Positive</option>
                  <option value="negative">Negative</option>
                  <option value="neutral">Neutral</option>
                </select>
              </div>

              <div>
                <label className="text-xs text-zinc-400 block mb-1">관련성 점수</label>
                <input
                  type="number"
                  min="0"
                  max="1"
                  step="0.1"
                  value={testArticle.relevance_score}
                  onChange={(e) => setTestArticle({...testArticle, relevance_score: parseFloat(e.target.value)})}
                  className="w-full px-3 py-2 text-sm bg-zinc-900 text-white rounded-md border border-zinc-800 focus:border-zinc-600 focus:outline-none"
                />
              </div>
            </div>
          </div>

          {/* Variables Editor */}
          <div className="border-t border-zinc-800 pt-4">
            <h3 className="text-sm font-medium text-white mb-3">변수 값 설정</h3>
            <div className="space-y-2">
              {selectedTemplate?.variables.map(variable => (
                <div key={variable} className="flex items-center gap-2">
                  <label className="text-xs text-zinc-400 w-24">${variable}</label>
                  <input
                    type="text"
                    value={customVariables[variable] || ''}
                    onChange={(e) => setCustomVariables({...customVariables, [variable]: e.target.value})}
                    className="flex-1 px-2 py-1 text-sm bg-zinc-900 text-white rounded border border-zinc-800 focus:border-zinc-600 focus:outline-none"
                  />
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Right: Preview */}
        <div className="col-span-5 p-4 overflow-y-auto">
          <h2 className="text-sm font-medium text-white mb-4">요약 미리보기</h2>

          {/* Current Template Info */}
          <div className="mb-4 p-3 bg-zinc-900 rounded-md">
            <p className="text-xs text-zinc-400">현재 템플릿</p>
            <p className="text-sm text-white mt-1">{selectedTemplate?.name}</p>
          </div>

          {/* Generated Summary */}
          <div className="p-4 bg-zinc-900/50 rounded-lg border border-zinc-800">
            <pre className="text-sm text-zinc-100 whitespace-pre-wrap font-sans">
              {generatedSummary || '템플릿을 선택하고 변수를 설정하면 요약이 표시됩니다.'}
            </pre>
          </div>

          {/* Original vs Custom Comparison */}
          <div className="mt-6">
            <h3 className="text-sm font-medium text-white mb-3">기본 생성기 비교</h3>
            <div className="p-4 bg-zinc-900/30 rounded-lg border border-zinc-800">
              <p className="text-xs text-zinc-400 mb-2">generateSmartSummary() 결과:</p>
              <pre className="text-sm text-zinc-300 whitespace-pre-wrap font-sans">
                {generateSmartSummary(testArticle)}
              </pre>
            </div>
          </div>

          {/* Tips */}
          <div className="mt-6 p-4 bg-blue-950/30 rounded-lg border border-blue-900/50">
            <h4 className="text-xs font-medium text-blue-300 mb-2">💡 변수 사용 팁</h4>
            <ul className="text-xs text-blue-200/70 space-y-1">
              <li>• ${`{variable}`} 형식으로 변수 추가</li>
              <li>• 구체적인 숫자와 수치 사용 권장</li>
              <li>• Hook은 15-20자 내외로 임팩트 있게</li>
              <li>• 불렛은 4개 이하로 유지</li>
              <li>• Impact는 → 로 시작하여 시사점 명확히</li>
            </ul>
          </div>
        </div>
      </div>

      {/* Floating Dock */}
      <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-40">
        <div className="bg-zinc-900/90 backdrop-blur-lg border border-zinc-800 rounded-lg shadow-xl p-2">
          <div className="flex items-center gap-4">
            <nav className="flex items-center gap-1">
              <a href="/dashboard/morning" className="px-3 py-1.5 rounded-md text-xs text-zinc-400 hover:text-zinc-100 hover:bg-zinc-800/50 transition-all">
                Feed
              </a>
              <a href="/dashboard/pipeline" className="px-3 py-1.5 rounded-md text-xs text-zinc-400 hover:text-zinc-100 hover:bg-zinc-800/50 transition-all">
                Pipeline
              </a>
              <a href="/dashboard/news" className="px-3 py-1.5 rounded-md text-xs text-zinc-400 hover:text-zinc-100 hover:bg-zinc-800/50 transition-all">
                Articles
              </a>
              <a href="/dashboard/prompt-editor" className="px-3 py-1.5 rounded-md text-xs font-medium text-zinc-100 bg-zinc-800">
                Prompt Editor
              </a>
            </nav>
          </div>
        </div>
      </div>
    </div>
  );
}