'use client';

import { useState, useEffect } from 'react';
import {
  CATEGORIES,
  Category,
  DEFAULT_CATEGORY_PROMPTS,
  getCategoryPrompt,
  saveCategoryPrompt,
  hasCustomPrompt,
  resetCategoryPrompt
} from '@/lib/prompts/category-prompts';
import {
  getCategoryHistory,
  saveToHistory,
  deleteHistoryEntry,
  formatHistoryTimestamp,
  PromptHistoryEntry
} from '@/lib/prompts/prompt-history';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

interface TestArticle {
  id: string;
  title: string;
  description?: string;
  content?: string;
  source?: string;
  category?: string;
  link?: string;
  pubDate?: string;
}

interface RSSArticle {
  title: string;
  link: string;
  pubDate?: string;
  content?: string;
  fullContent?: string;
  author?: string;
}

export default function PromptEditor() {
  const [selectedCategory, setSelectedCategory] = useState<Category>('general');
  const [systemPrompt, setSystemPrompt] = useState('');
  const [promptHistory, setPromptHistory] = useState<PromptHistoryEntry[]>([]);
  const [showHistory, setShowHistory] = useState(false);

  // RSS Articles
  const [rssArticles, setRssArticles] = useState<RSSArticle[]>([]);
  const [loadingRSS, setLoadingRSS] = useState(false);

  // Test Article
  const [testArticle, setTestArticle] = useState<TestArticle>({
    id: 'test-1',
    title: '삼성전자, 차세대 3나노 GAA 공정 양산 본격화... TSMC와 격차 좁히기 나서',
    description: '업계 최초 게이트올어라운드(GAA) 기술 적용한 3나노 공정으로 파운드리 시장 공략',
    content: `삼성전자가 차세대 3나노 GAA(Gate-All-Around) 공정 양산을 본격화하며 글로벌 파운드리 시장에서 TSMC와의 격차를 좁히기 위한 승부수를 던졌다.

삼성전자는 15일 경기도 화성캠퍼스에서 3나노 2세대 공정 양산 기념식을 개최하고, 주요 고객사들에게 안정적인 수율과 성능 개선을 입증했다고 밝혔다. 이번 3나노 2세대 공정은 기존 5나노 대비 전력 효율은 50% 향상되고, 성능은 30% 개선되었으며, 면적은 35% 축소된 것이 특징이다.

특히 업계 최초로 상용화에 성공한 GAA 트랜지스터 구조는 기존 FinFET 대비 누설 전류를 획기적으로 줄여 모바일 기기의 배터리 수명 연장에 기여할 것으로 기대된다.`,
    source: '전자신문',
    category: 'technology',
  });

  const [generatedSummary, setGeneratedSummary] = useState<string>('');

  // Load category-specific prompt on mount and category change
  useEffect(() => {
    const loadPrompt = async () => {
      const categoryPrompt = await getCategoryPrompt(selectedCategory);
      setSystemPrompt(categoryPrompt);
    };
    loadPrompt();
  }, [selectedCategory]);

  // Load history on mount and when category changes
  useEffect(() => {
    const history = getCategoryHistory(selectedCategory);
    setPromptHistory(history);
  }, [selectedCategory]);

  // Fetch RSS articles on mount
  const fetchRSSArticles = async () => {
    setLoadingRSS(true);
    try {
      const response = await fetch('/api/fetch-rss-articles');
      const data = await response.json();
      if (data.success) {
        setRssArticles(data.articles);
      }
    } finally {
      setLoadingRSS(false);
    }
  };

  const selectRSSArticle = (article: RSSArticle) => {
    setTestArticle({
      id: `rss-${Date.now()}`,
      title: article.title,
      content: article.fullContent || article.content || '',
      source: article.author || 'RSS Feed',
      category: 'technology',
      link: article.link,
      pubDate: article.pubDate,
    });
  };

  const generateFreetextSummary = async () => {
    try {
      setGeneratedSummary('요약 생성 중...');

      const response = await fetch('/api/generate-summary', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          systemPrompt: systemPrompt,
          article: testArticle
        })
      });

      const data = await response.json();

      if (data.success) {
        setGeneratedSummary(data.summary);
      } else {
        setGeneratedSummary(`오류: ${data.error || '요약 생성 실패'}\n${data.details || ''}`);
      }
    } catch {
      setGeneratedSummary('API 호출 중 오류가 발생했습니다.');
    }
  };

  return (
    <div className="min-h-screen bg-zinc-950">
      {/* Compact Header */}
      <div className="bg-zinc-900 border-b border-zinc-800 px-4 py-2">
        <div className="flex items-center gap-3">
          <h1 className="text-sm font-semibold text-white">프롬프트 에디터</h1>

          {/* Category Selector */}
          <div className="flex items-center gap-2">
            <span className="text-xs text-zinc-500">카테고리:</span>
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value as Category)}
              className="h-7 px-2 text-xs bg-zinc-800 text-white rounded border border-zinc-700 focus:outline-none focus:border-blue-500"
            >
              {CATEGORIES.map((cat) => (
                <option key={cat} value={cat}>
                  {DEFAULT_CATEGORY_PROMPTS[cat].label}
                  {hasCustomPrompt(cat) ? ' ✓' : ''}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-12 h-[calc(100vh-2.5rem)]">
        {/* Left: Prompt Editor (60%) */}
        <div className="col-span-7 border-r border-zinc-800 p-4 overflow-y-auto">
          {/* Header with action buttons */}
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-sm font-medium text-white">시스템 프롬프트</h2>
            <div className="flex gap-1">
              <Button
                onClick={() => generateFreetextSummary()}
                className="h-7 px-3 text-xs bg-green-600 text-white hover:bg-green-700 border-0"
              >
                ▶ Run
              </Button>
              <Button
                onClick={async () => {
                  await resetCategoryPrompt(selectedCategory);
                  setSystemPrompt(DEFAULT_CATEGORY_PROMPTS[selectedCategory].systemPrompt);
                  alert(`${DEFAULT_CATEGORY_PROMPTS[selectedCategory].label} 카테고리 기본값으로 초기화됨`);
                }}
                className="h-7 px-2 text-xs bg-zinc-800 text-zinc-300 hover:bg-zinc-700 border-0"
              >
                초기화
              </Button>
              <Button
                onClick={async () => {
                  const saved = await getCategoryPrompt(selectedCategory);
                  setSystemPrompt(saved);
                  alert(`${DEFAULT_CATEGORY_PROMPTS[selectedCategory].label} 카테고리 프롬프트 불러옴`);
                }}
                className="h-7 px-2 text-xs bg-zinc-800 text-zinc-300 hover:bg-zinc-700 border-0"
              >
                불러오기
              </Button>
              <Button
                onClick={async () => {
                  await saveCategoryPrompt(selectedCategory, systemPrompt);
                  saveToHistory(selectedCategory, systemPrompt);
                  setPromptHistory(getCategoryHistory(selectedCategory));
                  alert(`${DEFAULT_CATEGORY_PROMPTS[selectedCategory].label} 카테고리 프롬프트 저장됨`);
                }}
                className="h-7 px-2 text-xs bg-white text-black hover:bg-zinc-200 border-0"
              >
                저장
              </Button>
              <Button
                onClick={() => setShowHistory(!showHistory)}
                className="h-7 px-2 text-xs bg-blue-600 text-white hover:bg-blue-700 border-0"
              >
                히스토리
              </Button>
            </div>
          </div>

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
            className="w-full h-[calc(100vh-16rem)] px-3 py-2 text-xs bg-zinc-900 text-white rounded border border-zinc-800 focus:border-zinc-600 focus:outline-none font-mono resize-none"
            placeholder="시스템 프롬프트를 입력하세요..."
          />

          {/* Prompt History */}
          {showHistory && (
            <div className="mt-3 border-t border-zinc-800 pt-3">
              <div className="flex items-center justify-between mb-2">
                <h3 className="text-xs font-semibold text-white">프롬프트 히스토리 ({promptHistory.length})</h3>
                <Button
                  onClick={() => {
                    if (confirm('모든 히스토리를 삭제하시겠습니까?')) {
                      promptHistory.forEach(entry => deleteHistoryEntry(entry.id));
                      setPromptHistory([]);
                    }
                  }}
                  className="h-6 text-xs text-red-500 hover:text-red-400 bg-transparent hover:bg-transparent border-0"
                >
                  전체 삭제
                </Button>
              </div>
              <div className="space-y-2 max-h-60 overflow-y-auto">
                {promptHistory.length === 0 ? (
                  <p className="text-xs text-zinc-500 text-center py-4">저장된 히스토리가 없습니다</p>
                ) : (
                  promptHistory.map((entry) => (
                    <div
                      key={entry.id}
                      className="p-2 bg-zinc-900 rounded border border-zinc-800 hover:border-zinc-700 cursor-pointer group"
                      onClick={() => {
                        setSystemPrompt(entry.prompt);
                        setShowHistory(false);
                      }}
                    >
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <p className="text-xs text-zinc-400 mb-1">
                            {formatHistoryTimestamp(entry.timestamp)}
                          </p>
                          <p className="text-xs text-zinc-300 line-clamp-2">
                            {entry.prompt.substring(0, 100)}...
                          </p>
                        </div>
                        <Button
                          onClick={(e) => {
                            e.stopPropagation();
                            deleteHistoryEntry(entry.id);
                            setPromptHistory(getCategoryHistory(selectedCategory));
                          }}
                          className="ml-2 h-6 text-xs text-zinc-500 hover:text-red-500 opacity-0 group-hover:opacity-100 transition-opacity bg-transparent hover:bg-transparent border-0"
                        >
                          ✕
                        </Button>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          )}
        </div>

        {/* Right: Test Article & Preview (40%) */}
        <div className="col-span-5 p-4 overflow-y-auto">
          <Tabs defaultValue="test" className="w-full">
            <TabsList className="grid w-full grid-cols-2 bg-zinc-900 mb-3 border border-zinc-800">
              <TabsTrigger
                value="test"
                className="text-xs text-zinc-400 data-[state=active]:bg-zinc-800 data-[state=active]:text-white"
              >
                테스트 기사
              </TabsTrigger>
              <TabsTrigger
                value="preview"
                className="text-xs text-zinc-400 data-[state=active]:bg-zinc-800 data-[state=active]:text-white"
              >
                미리보기
              </TabsTrigger>
            </TabsList>

            <TabsContent value="test" className="space-y-3">
              {/* RSS Article Selection */}
              <div className="bg-zinc-900 rounded-lg p-3 border border-zinc-800">
                <div className="flex items-center justify-between mb-2">
                  <h3 className="text-xs font-medium text-white">최신 RSS 기사</h3>
                  <Button
                    onClick={fetchRSSArticles}
                    disabled={loadingRSS}
                    className="h-6 px-2 text-xs bg-blue-600 text-white hover:bg-blue-700 border-0"
                  >
                    {loadingRSS ? '불러오는 중...' : '새로고침'}
                  </Button>
                </div>

                <div className="space-y-1 max-h-64 overflow-y-auto">
                  {rssArticles.length === 0 ? (
                    <p className="text-xs text-zinc-500 text-center py-4">
                      새로고침 버튼을 눌러 최신 기사를 불러오세요
                    </p>
                  ) : (
                    rssArticles.map((article, idx) => (
                      <div
                        key={idx}
                        onClick={() => selectRSSArticle(article)}
                        className="p-2 bg-zinc-800/50 rounded border border-zinc-700 hover:border-zinc-600 cursor-pointer transition-all"
                      >
                        <p className="text-xs text-white font-medium line-clamp-2 mb-1">
                          {article.title}
                        </p>
                        <div className="flex items-center gap-2 text-xs text-zinc-500">
                          {article.author && <span>{article.author}</span>}
                          {article.pubDate && (
                            <span>{new Date(article.pubDate).toLocaleDateString('ko-KR')}</span>
                          )}
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>

              {/* Manual Article Input */}
              <div className="bg-zinc-900 rounded-lg p-3 border border-zinc-800">
                <h3 className="text-xs font-medium text-white mb-2">또는 직접 입력</h3>
                <div className="space-y-2">
                  <div>
                    <label className="text-xs text-zinc-400 block mb-1">제목</label>
                    <input
                      type="text"
                      value={testArticle.title}
                      onChange={(e) => setTestArticle({...testArticle, title: e.target.value})}
                      className="w-full px-2 py-1 text-xs bg-zinc-800 text-white rounded border border-zinc-700 focus:border-zinc-600 focus:outline-none"
                    />
                  </div>

                  <div>
                    <label className="text-xs text-zinc-400 block mb-1">내용</label>
                    <textarea
                      value={testArticle.content}
                      onChange={(e) => setTestArticle({...testArticle, content: e.target.value})}
                      className="w-full px-2 py-1 text-xs bg-zinc-800 text-white rounded border border-zinc-700 focus:border-zinc-600 focus:outline-none h-32 resize-none"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <label className="text-xs text-zinc-400 block mb-1">출처</label>
                      <input
                        type="text"
                        value={testArticle.source}
                        onChange={(e) => setTestArticle({...testArticle, source: e.target.value})}
                        className="w-full px-2 py-1 text-xs bg-zinc-800 text-white rounded border border-zinc-700 focus:border-zinc-600 focus:outline-none"
                      />
                    </div>

                    <div>
                      <label className="text-xs text-zinc-400 block mb-1">카테고리</label>
                      <select
                        value={testArticle.category}
                        onChange={(e) => setTestArticle({...testArticle, category: e.target.value})}
                        className="w-full px-2 py-1 text-xs bg-zinc-800 text-white rounded border border-zinc-700 focus:border-zinc-600 focus:outline-none"
                      >
                        <option value="technology">Technology</option>
                        <option value="business">Business</option>
                        <option value="general">General</option>
                      </select>
                    </div>
                  </div>
                </div>
              </div>
            </TabsContent>

            <TabsContent value="preview">
              <div className="bg-zinc-900 rounded-lg p-4 border border-zinc-800">
                <h3 className="text-sm font-semibold text-white mb-3">{testArticle.title}</h3>

                <div>
                  <p className="text-xs text-zinc-400 mb-1">생성된 요약:</p>
                  <div className="bg-zinc-950 rounded p-3 border border-zinc-800 min-h-[200px]">
                    <p className="text-xs text-zinc-100 leading-relaxed whitespace-pre-line">
                      {generatedSummary || 'Run 버튼을 눌러 요약을 생성하세요.'}
                    </p>
                  </div>
                </div>
              </div>
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </div>
  );
}
