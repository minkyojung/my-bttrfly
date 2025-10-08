'use client';

import { useState, useEffect, useMemo } from 'react';
import { Dialog, DialogContent, DialogTitle } from '@/components/ui/dialog';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Button } from '@/components/ui/button';
import { generateSmartSummary } from '@/lib/utils/summary-generator';
import {
  getCategoryPrompt,
  saveCategoryPrompt,
  resetCategoryPrompt,
  normalizeCategory,
  Category,
  CATEGORIES,
  DEFAULT_CATEGORY_PROMPTS
} from '@/lib/prompts/category-prompts';
import { Inter } from 'next/font/google';

const inter = Inter({ subsets: ['latin'] });

interface Article {
  id: string;
  title: string;
  description?: string;
  content?: string;
  html_content?: string;
  url?: string;
  source?: string;
  category?: string;
  created_at: string;
  thumbnail?: string;
  keywords?: string[];
  sentiment?: 'positive' | 'negative' | 'neutral';
  relevance_score?: number;
  summary?: string;
  status?: string;
  instagram_post_id?: string;
  [key: string]: unknown;
}

interface InstagramContent {
  title: string;
  caption: string;
  hashtags: string[];
  format: 'post' | 'reel' | 'story';
  originalArticle: Article;
}

type ViewMode = 'feed' | 'table' | 'pipeline';
type DateFilter = 'today' | 'week' | 'all';
type StatusFilter = 'all' | 'pending' | 'classified' | 'posted';

export default function UnifiedDashboard() {
  // View & Filter State
  const [view, setView] = useState<ViewMode>('feed');
  const [dateFilter, setDateFilter] = useState<DateFilter>('today');
  const [statusFilter, setStatusFilter] = useState<StatusFilter>('all');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');

  // Data State
  const [articles, setArticles] = useState<Article[]>([]);
  const [loading, setLoading] = useState(true);
  const [pipelineLoading, setPipelineLoading] = useState<string | null>(null);
  const [processingArticle, setProcessingArticle] = useState<string | null>(null);
  const [expandedArticles, setExpandedArticles] = useState<Set<string>>(new Set());
  const [fullContentMap, setFullContentMap] = useState<Map<string, { text: string; html: string }>>(new Map());
  const [loadingFullContent, setLoadingFullContent] = useState<Set<string>>(new Set());
  const [selectedArticleForReading, setSelectedArticleForReading] = useState<Article | null>(null);

  // Modal State
  const [selectedArticle, setSelectedArticle] = useState<Article | null>(null);
  const [generatedContent, setGeneratedContent] = useState<InstagramContent | null>(null);
  const [editedContent, setEditedContent] = useState<InstagramContent | null>(null);

  // Command Palette
  const [commandPaletteOpen, setCommandPaletteOpen] = useState(false);

  // Context Menu
  const [contextMenu, setContextMenu] = useState<{ x: number; y: number; article: Article } | null>(null);

  // Prompt Panel
  const [isPromptPanelOpen, setIsPromptPanelOpen] = useState(false);
  const [promptPanelCategory, setPromptPanelCategory] = useState<Category>('general');
  const [promptPanelText, setPromptPanelText] = useState('');
  const [promptPanelTestArticle, setPromptPanelTestArticle] = useState<Article | null>(null);
  const [promptPanelTestResult, setPromptPanelTestResult] = useState('');
  const [promptPanelTesting, setPromptPanelTesting] = useState(false);

  // Stats
  const [stats, setStats] = useState({
    total: 0,
    today: 0,
    pending: 0,
    classified: 0,
    posted: 0,
  });

  // Keyboard Shortcuts
  useEffect(() => {
    const handleKeyPress = (e: KeyboardEvent) => {
      // Command Palette
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        setCommandPaletteOpen(true);
        return;
      }

      // Skip if typing in input
      if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement) return;

      switch (e.key.toLowerCase()) {
        case 's':
          e.preventDefault();
          handleScrape();
          break;
        case 'c':
          e.preventDefault();
          handleClassify();
          break;
        case 'g':
          e.preventDefault();
          handleGenerateAll();
          break;
        case 'v':
          e.preventDefault();
          cycleView();
          break;
        case 'r':
          e.preventDefault();
          fetchArticles();
          break;
        case 'f':
          e.preventDefault();
          document.getElementById('search-input')?.focus();
          break;
      }
    };

    window.addEventListener('keydown', handleKeyPress);
    return () => window.removeEventListener('keydown', handleKeyPress);
  }, [view]);

  // Close context menu on click
  useEffect(() => {
    const handleClick = () => setContextMenu(null);
    window.addEventListener('click', handleClick);
    return () => window.removeEventListener('click', handleClick);
  }, []);

  useEffect(() => {
    fetchArticles();
  }, []); // 초기 로드 1회만

  const cycleView = () => {
    const views: ViewMode[] = ['feed', 'table', 'pipeline'];
    const currentIndex = views.indexOf(view);
    setView(views[(currentIndex + 1) % views.length]);
  };

  const fetchArticles = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/dashboard/articles');
      const data = await res.json();

      if (data.success && data.articles) {
        let allArticles = data.articles;

        // Sort by relevance (한 번만)
        allArticles = allArticles.sort((a: Article, b: Article) => (b.relevance_score || 0) - (a.relevance_score || 0));

        // Generate summaries for feed view (비동기로 진행, 페이지 로드 블로킹 안 함)
        if (view === 'feed') {
          const articlesNeedingSummaries = allArticles.filter((a: Article) => !a.summary);

          if (articlesNeedingSummaries.length > 0) {
            // 클라이언트 템플릿으로 먼저 표시
            allArticles = allArticles.map((article: Article) => ({
              ...article,
              summary: article.summary || generateSmartSummary(article)
            }));
          }
        }

        setArticles(allArticles);

        // Calculate stats
        const today = new Date().toDateString();
        setStats({
          total: allArticles.length,
          today: allArticles.filter((a: Article) => new Date(a.created_at).toDateString() === today).length,
          pending: allArticles.filter((a: Article) => a.status === 'pending').length,
          classified: allArticles.filter((a: Article) => a.status === 'classified').length,
          posted: allArticles.filter((a: Article) => a.status === 'posted').length,
        });
      } else {
        setArticles([]);
      }
    } catch (error) {
      setArticles([]);
    } finally {
      setLoading(false);
    }
  };

  const handleScrape = async () => {
    setPipelineLoading('scrape');
    try {
      const res = await fetch('/api/simple-scrape');
      if (res.ok) {
        await fetchArticles();
      }
    } catch (error) {
      // Error handled
    } finally {
      setPipelineLoading(null);
    }
  };

  const handleClassify = async () => {
    setPipelineLoading('classify');
    try {
      const res = await fetch('/api/simple-classify');
      if (res.ok) {
        await fetchArticles();
      }
    } catch (error) {
      // Error handled
    } finally {
      setPipelineLoading(null);
    }
  };

  const handleGenerateAll = async () => {
    setPipelineLoading('generate');
    try {
      const res = await fetch('/api/cron/generate-instagram');
      if (res.ok) {
        await fetchArticles();
      }
    } catch (error) {
      // Error handled
    } finally {
      setPipelineLoading(null);
    }
  };

  const handleGenerateContent = async (article: Article) => {
    setProcessingArticle(article.id);
    setSelectedArticle(article);

    try {
      const res = await fetch('/api/enhance-content', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ article, format: 'post' }),
      });
      const data = await res.json();

      const content: InstagramContent = {
        title: article.title,
        caption: data.caption,
        hashtags: data.hashtags,
        format: 'post',
        originalArticle: article,
      };

      setGeneratedContent(content);
      setEditedContent(content);
    } catch (error) {
      // Error handled
    } finally {
      setProcessingArticle(null);
    }
  };

  const handleSaveContent = async () => {
    if (!editedContent) return;

    try {
      await fetch('/api/dashboard/instagram-posts', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(editedContent),
      });

      setSelectedArticle(null);
      setGeneratedContent(null);
      setEditedContent(null);
      await fetchArticles();
    } catch (error) {
      // Error handled
    }
  };

  const classifyArticle = async (id: string) => {
    try {
      const res = await fetch('/api/classify-single', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id }),
      });
      if (res.ok) {
        await fetchArticles();
      }
    } catch (error) {
      // Error handled
    }
  };

  const handleContextMenu = (e: React.MouseEvent, article: Article) => {
    e.preventDefault();
    setContextMenu({ x: e.clientX, y: e.clientY, article });
  };

  // Prompt Panel Handlers
  const handleOpenPromptPanel = async () => {
    setIsPromptPanelOpen(true);
    const prompt = await getCategoryPrompt(promptPanelCategory);
    setPromptPanelText(prompt);
  };

  const handlePromptPanelCategoryChange = async (category: Category) => {
    setPromptPanelCategory(category);
    const prompt = await getCategoryPrompt(category);
    setPromptPanelText(prompt);
  };

  const handlePromptPanelTest = async () => {
    if (!promptPanelTestArticle) {
      alert('테스트할 기사를 선택해주세요');
      return;
    }

    setPromptPanelTesting(true);
    setPromptPanelTestResult('');

    try {
      const response = await fetch('/api/generate-summary', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          systemPrompt: promptPanelText,
          article: promptPanelTestArticle
        })
      });

      if (!response.ok) throw new Error('Failed to generate summary');

      const data = await response.json();
      setPromptPanelTestResult(data.summary);
    } catch (error) {
      console.error('Error testing prompt:', error);
      alert('프롬프트 테스트 실패');
    } finally {
      setPromptPanelTesting(false);
    }
  };

  const handlePromptPanelSave = async () => {
    const success = await saveCategoryPrompt(promptPanelCategory, promptPanelText);
    if (success) {
      alert(`${DEFAULT_CATEGORY_PROMPTS[promptPanelCategory].label} 카테고리 프롬프트 저장됨`);
    } else {
      alert('프롬프트 저장 실패');
    }
  };

  const handlePromptPanelReset = async () => {
    const success = await resetCategoryPrompt(promptPanelCategory);
    if (success) {
      setPromptPanelText(DEFAULT_CATEGORY_PROMPTS[promptPanelCategory].systemPrompt);
      alert(`${DEFAULT_CATEGORY_PROMPTS[promptPanelCategory].label} 카테고리 기본값으로 초기화됨`);
    } else {
      alert('프롬프트 초기화 실패');
    }
  };

  const handlePromptPanelLoad = async () => {
    const prompt = await getCategoryPrompt(promptPanelCategory);
    setPromptPanelText(prompt);
    alert(`${DEFAULT_CATEGORY_PROMPTS[promptPanelCategory].label} 카테고리 프롬프트 불러옴`);
  };

  const handleToggleFullContent = async (articleId: string) => {
    // If already expanded, just collapse it
    if (expandedArticles.has(articleId)) {
      setExpandedArticles(prev => {
        const next = new Set(prev);
        next.delete(articleId);
        return next;
      });
      return;
    }

    // If we already have the full content, just expand it
    if (fullContentMap.has(articleId)) {
      setExpandedArticles(prev => new Set(prev).add(articleId));
      return;
    }

    // Otherwise, fetch the full content
    setLoadingFullContent(prev => new Set(prev).add(articleId));

    try {
      const res = await fetch('/api/extract-full-content', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ articleId }),
      });

      const data = await res.json();

      if (data.success && data.content) {
        setFullContentMap(prev => new Map(prev).set(articleId, {
          text: data.content,
          html: data.htmlContent || '',
        }));
        setExpandedArticles(prev => new Set(prev).add(articleId));
      }
    } catch (error) {
      console.error('Failed to fetch full content:', error);
    } finally {
      setLoadingFullContent(prev => {
        const next = new Set(prev);
        next.delete(articleId);
        return next;
      });
    }
  };

  // 클라이언트 사이드 필터링 (useMemo로 최적화)
  const filteredArticles = useMemo(() => {
    let result = articles;

    // 날짜 필터
    if (dateFilter === 'today') {
      const today = new Date().toDateString();
      result = result.filter((article: Article) => {
        const articleDate = new Date(article.created_at).toDateString();
        return articleDate === today;
      });
    } else if (dateFilter === 'week') {
      const weekAgo = new Date();
      weekAgo.setDate(weekAgo.getDate() - 7);
      result = result.filter((article: Article) => {
        return new Date(article.created_at) >= weekAgo;
      });
    }

    // 상태 필터
    if (statusFilter !== 'all') {
      result = result.filter((article: Article) => article.status === statusFilter);
    }

    // 카테고리 필터
    if (selectedCategory !== 'all') {
      result = result.filter((article: Article) => normalizeCategory(article.category) === selectedCategory);
    }

    // 검색 쿼리
    if (searchQuery) {
      result = result.filter((article: Article) =>
        article.title.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    return result;
  }, [articles, dateFilter, statusFilter, selectedCategory, searchQuery]);

  const categories = ['all', 'technology', 'business', 'general'];

  if (loading && articles.length === 0) {
    return (
      <div className="min-h-screen bg-zinc-950 flex items-center justify-center">
        <div className="animate-pulse text-sm text-zinc-400">Loading...</div>
      </div>
    );
  }

  return (
    <div className={`min-h-screen bg-zinc-950 pb-24 ${inter.className}`}>
      {/* Action Bar */}
      <div className="bg-zinc-900 border-b border-zinc-800 px-4 py-2 sticky top-0 z-20">
        <div className="max-w-7xl mx-auto flex items-center justify-between gap-3">
          {/* Pipeline Actions */}
          <div className="flex items-center gap-1.5">
            <button
              onClick={handleScrape}
              disabled={!!pipelineLoading}
              className="text-xs px-3 py-1.5 bg-zinc-800 text-zinc-300 rounded hover:bg-zinc-700 transition-colors disabled:opacity-50 flex items-center gap-1.5"
            >
              Scrape {pipelineLoading === 'scrape' && <span className="animate-pulse">...</span>}
              <kbd className="ml-1 px-1 py-0.5 text-[10px] bg-zinc-700 rounded">S</kbd>
            </button>
            <button
              onClick={handleClassify}
              disabled={!!pipelineLoading}
              className="text-xs px-3 py-1.5 bg-zinc-800 text-zinc-300 rounded hover:bg-zinc-700 transition-colors disabled:opacity-50 flex items-center gap-1.5"
            >
              Classify {pipelineLoading === 'classify' && <span className="animate-pulse">...</span>}
              <kbd className="ml-1 px-1 py-0.5 text-[10px] bg-zinc-700 rounded">C</kbd>
            </button>
            <button
              onClick={handleGenerateAll}
              disabled={!!pipelineLoading}
              className="text-xs px-3 py-1.5 bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors disabled:opacity-50 flex items-center gap-1.5"
            >
              Generate {pipelineLoading === 'generate' && <span className="animate-pulse">...</span>}
              <kbd className="ml-1 px-1 py-0.5 text-[10px] bg-blue-700 rounded">G</kbd>
            </button>
          </div>

          {/* Stats */}
          <div className="flex items-center gap-3 text-xs text-zinc-400">
            <span className="flex items-center gap-1">
              <span className="text-zinc-500">Total:</span>
              <span className="text-white font-medium">{stats.total}</span>
            </span>
            <span className="text-zinc-700">•</span>
            <span className="flex items-center gap-1">
              <span className="text-zinc-500">Today:</span>
              <span className="text-white font-medium">{stats.today}</span>
            </span>
            <span className="text-zinc-700">•</span>
            <span className="flex items-center gap-1">
              <span className="text-zinc-500">Pending:</span>
              <span className="text-amber-500 font-medium">{stats.pending}</span>
            </span>
            <span className="text-zinc-700">•</span>
            <span className="flex items-center gap-1">
              <span className="text-zinc-500">Posted:</span>
              <span className="text-green-500 font-medium">{stats.posted}</span>
            </span>
          </div>

          {/* Refresh */}
          <button
            onClick={fetchArticles}
            disabled={loading}
            className="text-xs px-3 py-1.5 bg-zinc-800 text-zinc-300 rounded hover:bg-zinc-700 transition-colors disabled:opacity-50 flex items-center gap-1.5"
          >
            {loading ? '...' : 'Refresh'}
            <kbd className="ml-1 px-1 py-0.5 text-[10px] bg-zinc-700 rounded">R</kbd>
          </button>
        </div>
      </div>

      {/* Control Panel */}
      <div className="bg-zinc-900/50 border-b border-zinc-800 px-4 py-2">
        <div className="max-w-7xl mx-auto flex items-center justify-between gap-3">
          {/* View Switcher */}
          <div className="flex items-center gap-1 bg-zinc-900 rounded-lg p-1">
            <button
              onClick={() => setView('feed')}
              className={`text-xs px-3 py-1.5 rounded transition-all ${
                view === 'feed'
                  ? 'bg-white text-black font-medium'
                  : 'text-zinc-400 hover:text-zinc-200'
              }`}
            >
              Feed
            </button>
            <button
              onClick={() => setView('table')}
              className={`text-xs px-3 py-1.5 rounded transition-all ${
                view === 'table'
                  ? 'bg-white text-black font-medium'
                  : 'text-zinc-400 hover:text-zinc-200'
              }`}
            >
              Table
            </button>
          </div>

          {/* Filters */}
          <div className="flex items-center gap-1.5">
            {/* Search */}
            <input
              id="search-input"
              type="text"
              placeholder="Search... (F)"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="text-xs px-3 py-1.5 bg-zinc-900 border border-zinc-800 text-zinc-300 rounded focus:outline-none focus:border-zinc-600 w-48"
            />

            {/* Date Filter */}
            <select
              value={dateFilter}
              onChange={(e) => setDateFilter(e.target.value as DateFilter)}
              className="text-xs px-3 py-1.5 bg-zinc-900 border border-zinc-800 text-zinc-300 rounded focus:outline-none focus:border-zinc-600"
            >
              <option value="today">Today</option>
              <option value="week">This Week</option>
              <option value="all">All Time</option>
            </select>

            {/* Status Filter */}
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value as StatusFilter)}
              className="text-xs px-3 py-1.5 bg-zinc-900 border border-zinc-800 text-zinc-300 rounded focus:outline-none focus:border-zinc-600"
            >
              <option value="all">All Status</option>
              <option value="pending">Pending</option>
              <option value="classified">Classified</option>
              <option value="posted">Posted</option>
            </select>

            {/* Category Filter */}
            {view === 'feed' && (
              <select
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
                className="text-xs px-3 py-1.5 bg-zinc-900 border border-zinc-800 text-zinc-300 rounded focus:outline-none focus:border-zinc-600"
              >
                {categories.map((cat) => (
                  <option key={cat} value={cat}>
                    {cat.charAt(0).toUpperCase() + cat.slice(1)}
                  </option>
                ))}
              </select>
            )}

            {/* Command Palette Trigger */}
            <button
              onClick={() => setCommandPaletteOpen(true)}
              className="text-xs px-3 py-1.5 bg-zinc-900 border border-zinc-800 text-zinc-400 rounded hover:border-zinc-600 hover:text-zinc-200 transition-all flex items-center gap-1.5"
            >
              ⌘K
            </button>
          </div>
        </div>
      </div>

      {/* Content Area */}
      <div className="px-4 pt-6">
        {filteredArticles.length === 0 ? (
          <div className="text-center py-20">
            <p className="text-sm text-zinc-500">No articles found</p>
          </div>
        ) : view === 'feed' ? (
          // Feed View - 2 Column Layout
          <div className="max-w-7xl mx-auto">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Left Column - Article List */}
              <div className="space-y-4">
                {filteredArticles.map((article) => (
                  <article
                    key={article.id}
                    onClick={() => {
                      setSelectedArticleForReading(article);
                      if (!fullContentMap.has(article.id)) {
                        handleToggleFullContent(article.id);
                      }
                    }}
                    className={`rounded-lg overflow-hidden bg-zinc-950 hover:bg-zinc-900/50 transition-all cursor-pointer group ${
                      selectedArticleForReading?.id === article.id ? 'ring-2 ring-blue-500/50' : ''
                    }`}
                    onContextMenu={(e) => handleContextMenu(e, article)}
                  >
                    {article.thumbnail && (
                      <div className="w-full aspect-[16/9] bg-zinc-900 overflow-hidden">
                        <img
                          src={article.thumbnail}
                          alt={article.title}
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                        />
                      </div>
                    )}

                    <div className="p-4">
                      <div className="flex items-center gap-2 mb-2">
                        <span className="text-xs text-zinc-500">{article.source || 'Unknown'}</span>
                        {article.category && (
                          <>
                            <span className="text-xs text-zinc-600">•</span>
                            <span className="text-xs text-zinc-500">{article.category}</span>
                          </>
                        )}
                        <span className="text-xs text-zinc-600">•</span>
                        <span className="text-xs text-zinc-500">
                          {new Date(article.created_at).toLocaleTimeString('en-US', {
                            hour: 'numeric',
                            minute: '2-digit'
                          })}
                        </span>
                      </div>

                      <h2 className="text-base font-semibold text-zinc-100 leading-snug mb-2">
                        {article.title}
                      </h2>

                      {article.summary && (
                        <p className="text-sm text-zinc-400 line-clamp-4">
                          {article.summary}
                        </p>
                      )}

                      <div className="flex items-center justify-between pt-3 mt-3">
                        <div className="flex items-center gap-2">
                          {article.relevance_score && (
                            <span className="text-xs text-zinc-500">
                              {Math.round(article.relevance_score * 100)}% relevant
                            </span>
                          )}
                        </div>

                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            handleGenerateContent(article);
                          }}
                          disabled={processingArticle === article.id}
                          className={`text-xs px-3 py-1.5 rounded-md font-medium transition-all ${
                            processingArticle === article.id
                              ? 'bg-zinc-800 text-zinc-500'
                              : 'bg-zinc-100 text-zinc-900 hover:bg-white'
                          }`}
                        >
                          {processingArticle === article.id ? '...' : 'Generate'}
                        </button>
                      </div>
                    </div>
                  </article>
                ))}
              </div>

              {/* Right Column - Full Article Content */}
              <div className="lg:sticky lg:top-20 lg:h-[calc(100vh-6rem)] lg:overflow-y-auto">
                {selectedArticleForReading ? (
                  <div className="rounded-lg bg-zinc-950 p-6">
                    {/* Article Header */}
                    <div className="mb-6">
                      <div className="flex items-center gap-2 mb-3">
                        <span className="text-xs text-zinc-500">
                          {selectedArticleForReading.source || 'Unknown'}
                        </span>
                        {selectedArticleForReading.category && (
                          <>
                            <span className="text-xs text-zinc-600">•</span>
                            <span className="text-xs text-zinc-500">{selectedArticleForReading.category}</span>
                          </>
                        )}
                        <span className="text-xs text-zinc-600">•</span>
                        <span className="text-xs text-zinc-500">
                          {new Date(selectedArticleForReading.created_at).toLocaleString('en-US', {
                            month: 'short',
                            day: 'numeric',
                            hour: 'numeric',
                            minute: '2-digit'
                          })}
                        </span>
                      </div>

                      <h1 className="text-2xl font-bold text-zinc-100 leading-tight mb-4">
                        {selectedArticleForReading.title}
                      </h1>

                      {selectedArticleForReading.thumbnail && (
                        <div className="w-full aspect-[16/9] bg-zinc-900 rounded-lg overflow-hidden mb-4">
                          <img
                            src={selectedArticleForReading.thumbnail}
                            alt={selectedArticleForReading.title}
                            className="w-full h-full object-cover"
                          />
                        </div>
                      )}
                    </div>

                    {/* Article Content */}
                    <div className="prose prose-invert prose-zinc max-w-none">
                      {loadingFullContent.has(selectedArticleForReading.id) ? (
                        <div className="flex items-center justify-center py-12">
                          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-zinc-400"></div>
                        </div>
                      ) : (() => {
                        const cachedContent = fullContentMap.get(selectedArticleForReading.id);
                        const htmlContent = cachedContent?.html || selectedArticleForReading.html_content;

                        if (htmlContent) {
                          return (
                            <div
                              className="text-sm text-zinc-300 leading-relaxed prose-img:rounded-lg prose-img:my-4"
                              dangerouslySetInnerHTML={{ __html: htmlContent }}
                            />
                          );
                        }

                        return (
                          <div className="text-sm text-zinc-300 leading-relaxed whitespace-pre-line">
                            {cachedContent?.text || selectedArticleForReading.content || selectedArticleForReading.summary}
                          </div>
                        );
                      })()}
                    </div>

                    {/* Article Footer */}
                    <div className="mt-6 pt-6">
                      {selectedArticleForReading.keywords && selectedArticleForReading.keywords.length > 0 && (
                        <div className="flex flex-wrap gap-2 mb-4">
                          {selectedArticleForReading.keywords.slice(0, 10).map((keyword, idx) => (
                            <span key={idx} className="text-xs px-2 py-1 bg-zinc-900 text-zinc-400 rounded">
                              #{keyword.toLowerCase().replace(/\s+/g, '')}
                            </span>
                          ))}
                        </div>
                      )}

                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          {selectedArticleForReading.relevance_score && (
                            <span className="text-xs text-zinc-500">
                              {Math.round(selectedArticleForReading.relevance_score * 100)}% relevant
                            </span>
                          )}
                          {selectedArticleForReading.sentiment && (
                            <span className={`text-xs ${
                              selectedArticleForReading.sentiment === 'positive' ? 'text-emerald-500' :
                              selectedArticleForReading.sentiment === 'negative' ? 'text-rose-500' :
                              'text-zinc-500'
                            }`}>
                              {selectedArticleForReading.sentiment}
                            </span>
                          )}
                        </div>

                        <a
                          href={selectedArticleForReading.url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-xs px-3 py-1.5 bg-zinc-800 text-zinc-300 rounded-md hover:bg-zinc-700 transition-colors"
                        >
                          원문 링크
                        </a>
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="rounded-lg bg-zinc-950 p-12 flex items-center justify-center text-center">
                    <div>
                      <p className="text-zinc-500 text-sm mb-2">기사를 선택해주세요</p>
                      <p className="text-zinc-600 text-xs">왼쪽에서 읽고 싶은 기사를 클릭하세요</p>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        ) : (
          // Table View
          <div className="max-w-7xl mx-auto">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-zinc-800">
                    <th className="text-left py-3 px-4 text-xs font-medium text-zinc-400">Title</th>
                    <th className="text-left py-3 px-4 text-xs font-medium text-zinc-400">Source</th>
                    <th className="text-left py-3 px-4 text-xs font-medium text-zinc-400">Category</th>
                    <th className="text-left py-3 px-4 text-xs font-medium text-zinc-400">Status</th>
                    <th className="text-left py-3 px-4 text-xs font-medium text-zinc-400">Relevance</th>
                    <th className="text-left py-3 px-4 text-xs font-medium text-zinc-400">Created</th>
                    <th className="text-left py-3 px-4 text-xs font-medium text-zinc-400">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredArticles.map((article) => (
                    <tr
                      key={article.id}
                      className="border-b border-zinc-900 hover:bg-zinc-900/50 transition-colors"
                      onContextMenu={(e) => handleContextMenu(e, article)}
                    >
                      <td className="py-3 px-4">
                        <p className="text-sm text-white line-clamp-2">{article.title}</p>
                      </td>
                      <td className="py-3 px-4">
                        <span className="text-xs text-zinc-400">{article.source || 'Unknown'}</span>
                      </td>
                      <td className="py-3 px-4">
                        {article.category ? (
                          <span className="text-xs px-2 py-0.5 bg-zinc-800 text-zinc-300 rounded">
                            {article.category}
                          </span>
                        ) : (
                          <span className="text-xs text-zinc-500">-</span>
                        )}
                      </td>
                      <td className="py-3 px-4">
                        <span className={`text-xs px-2 py-0.5 rounded ${
                          article.status === 'posted'
                            ? 'bg-zinc-700 text-white'
                            : article.status === 'classified'
                            ? 'bg-zinc-800 text-zinc-200'
                            : 'bg-zinc-900 text-zinc-400'
                        }`}>
                          {article.status || 'pending'}
                        </span>
                      </td>
                      <td className="py-3 px-4">
                        {article.relevance_score ? (
                          <span className="text-xs text-zinc-300">
                            {Math.round(article.relevance_score * 100)}%
                          </span>
                        ) : (
                          <span className="text-xs text-zinc-500">-</span>
                        )}
                      </td>
                      <td className="py-3 px-4">
                        <span className="text-xs text-zinc-400">
                          {new Date(article.created_at).toLocaleDateString()}
                        </span>
                      </td>
                      <td className="py-3 px-4">
                        <div className="flex items-center space-x-2">
                          {article.status === 'pending' && (
                            <button
                              onClick={() => classifyArticle(article.id)}
                              className="text-xs text-zinc-400 hover:text-white"
                            >
                              Classify
                            </button>
                          )}
                          <button
                            onClick={() => handleGenerateContent(article)}
                            className="text-xs text-zinc-300 hover:text-white"
                          >
                            Generate
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>

      {/* Context Menu */}
      {contextMenu && (
        <div
          className="fixed bg-zinc-900 border border-zinc-800 rounded-lg shadow-xl py-1 z-50"
          style={{ top: contextMenu.y, left: contextMenu.x }}
        >
          <button
            onClick={() => {
              classifyArticle(contextMenu.article.id);
              setContextMenu(null);
            }}
            className="w-full text-left px-4 py-2 text-xs text-zinc-300 hover:bg-zinc-800 transition-colors"
          >
            Classify this
          </button>
          <button
            onClick={() => {
              handleGenerateContent(contextMenu.article);
              setContextMenu(null);
            }}
            className="w-full text-left px-4 py-2 text-xs text-zinc-300 hover:bg-zinc-800 transition-colors"
          >
            Generate Instagram
          </button>
          <div className="border-t border-zinc-800 my-1"></div>
          <button
            className="w-full text-left px-4 py-2 text-xs text-red-400 hover:bg-zinc-800 transition-colors"
          >
            Delete
          </button>
        </div>
      )}

      {/* Command Palette */}
      <Dialog open={commandPaletteOpen} onOpenChange={setCommandPaletteOpen}>
        <DialogContent className="max-w-2xl p-0 gap-0 bg-zinc-900 border-zinc-800">
          <DialogTitle className="sr-only">Command Palette</DialogTitle>
          <div className="p-4">
            <input
              type="text"
              placeholder="Type a command..."
              className="w-full px-4 py-3 bg-zinc-950 border border-zinc-800 text-white rounded-lg focus:outline-none focus:border-zinc-600"
              autoFocus
            />
            <div className="mt-4 space-y-1">
              <button
                onClick={() => { handleScrape(); setCommandPaletteOpen(false); }}
                className="w-full text-left px-4 py-2 text-sm text-zinc-300 hover:bg-zinc-800 rounded transition-colors flex items-center justify-between"
              >
                <span>Scrape News</span>
                <kbd className="text-xs bg-zinc-800 px-2 py-1 rounded">S</kbd>
              </button>
              <button
                onClick={() => { handleClassify(); setCommandPaletteOpen(false); }}
                className="w-full text-left px-4 py-2 text-sm text-zinc-300 hover:bg-zinc-800 rounded transition-colors flex items-center justify-between"
              >
                <span>Classify All</span>
                <kbd className="text-xs bg-zinc-800 px-2 py-1 rounded">C</kbd>
              </button>
              <button
                onClick={() => { handleGenerateAll(); setCommandPaletteOpen(false); }}
                className="w-full text-left px-4 py-2 text-sm text-zinc-300 hover:bg-zinc-800 rounded transition-colors flex items-center justify-between"
              >
                <span>Generate Instagram</span>
                <kbd className="text-xs bg-zinc-800 px-2 py-1 rounded">G</kbd>
              </button>
              <div className="border-t border-zinc-800 my-2"></div>
              <button
                onClick={() => { setView('feed'); setCommandPaletteOpen(false); }}
                className="w-full text-left px-4 py-2 text-sm text-zinc-300 hover:bg-zinc-800 rounded transition-colors"
              >
                Switch to Feed View
              </button>
              <button
                onClick={() => { setView('table'); setCommandPaletteOpen(false); }}
                className="w-full text-left px-4 py-2 text-sm text-zinc-300 hover:bg-zinc-800 rounded transition-colors"
              >
                Switch to Table View
              </button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Content Editor Modal */}
      <Dialog
        open={!!selectedArticle && !!generatedContent}
        onOpenChange={() => {
          setSelectedArticle(null);
          setGeneratedContent(null);
          setEditedContent(null);
        }}
      >
        <DialogContent className="max-w-4xl p-0 gap-0 bg-zinc-900 border-zinc-800">
          <DialogTitle className="sr-only">Instagram Content Editor</DialogTitle>
          <div className="grid grid-cols-2 h-[600px]">
            {/* Instagram Preview */}
            <div className="border-r border-zinc-800 p-8 bg-zinc-950 flex items-center justify-center">
              <div className="w-full max-w-sm">
                <div className="bg-black border border-zinc-800 rounded-lg shadow-sm">
                  <div className="p-3 border-b border-zinc-800 flex items-center space-x-2">
                    <div className="w-8 h-8 bg-zinc-700 rounded-full"></div>
                    <span className="text-xs font-medium text-white">yourhandle</span>
                  </div>

                  <div className="aspect-square bg-gradient-to-br from-zinc-800 to-zinc-900 flex items-center justify-center p-6">
                    <p className="text-center text-sm text-zinc-200">
                      {editedContent?.caption.slice(0, 100)}...
                    </p>
                  </div>

                  <div className="p-3 space-y-2">
                    <div className="flex space-x-3">
                      <button className="text-zinc-300">
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                        </svg>
                      </button>
                    </div>
                    <p className="text-xs">
                      <span className="font-medium text-white">yourhandle</span>{' '}
                      <span className="text-zinc-400">{editedContent?.caption.slice(0, 50)}...</span>
                    </p>
                    {editedContent?.hashtags && (
                      <p className="text-xs text-zinc-400">
                        {editedContent.hashtags.slice(0, 3).map(tag => `#${tag}`).join(' ')}
                      </p>
                    )}
                  </div>
                </div>
              </div>
            </div>

            {/* Edit Panel */}
            <div className="p-6 bg-zinc-900">
              <div className="h-full flex flex-col">
                <div className="mb-4">
                  <h3 className="text-sm font-medium text-white mb-1">Content Editor</h3>
                  <p className="text-xs text-zinc-400">Edit and customize your Instagram content</p>
                </div>

                <ScrollArea className="flex-1 pr-4">
                  <div className="space-y-4">
                    <div>
                      <label className="text-xs text-zinc-400 block mb-1">Title</label>
                      <input
                        type="text"
                        value={editedContent?.title || ''}
                        onChange={(e) => setEditedContent(prev => prev ? {...prev, title: e.target.value} : null)}
                        className="w-full px-3 py-2 text-sm border border-zinc-700 rounded bg-zinc-800 text-white focus:outline-none focus:border-zinc-500"
                      />
                    </div>

                    <div>
                      <label className="text-xs text-zinc-400 block mb-1">Caption</label>
                      <textarea
                        value={editedContent?.caption || ''}
                        onChange={(e) => setEditedContent(prev => prev ? {...prev, caption: e.target.value} : null)}
                        className="w-full px-3 py-2 text-sm border border-zinc-700 rounded bg-zinc-800 text-white focus:outline-none focus:border-zinc-500 resize-none"
                        rows={4}
                      />
                    </div>

                    <div>
                      <label className="text-xs text-zinc-400 block mb-1">Hashtags</label>
                      <input
                        type="text"
                        value={editedContent?.hashtags.join(', ') || ''}
                        onChange={(e) => setEditedContent(prev =>
                          prev ? {...prev, hashtags: e.target.value.split(',').map(h => h.trim())} : null
                        )}
                        className="w-full px-3 py-2 text-sm border border-zinc-700 rounded bg-zinc-800 text-white focus:outline-none focus:border-zinc-500"
                        placeholder="tag1, tag2, tag3"
                      />
                    </div>

                    <div>
                      <label className="text-xs text-zinc-400 block mb-1">Format</label>
                      <div className="flex space-x-2">
                        {['post', 'reel', 'story'].map((format) => (
                          <button
                            key={format}
                            onClick={() => {
                              setEditedContent(prev => prev ? {...prev, format: format as 'post' | 'reel' | 'story'} : null);
                            }}
                            className={`text-xs px-3 py-1.5 rounded border transition-all ${
                              editedContent?.format === format
                                ? 'bg-white text-black border-white'
                                : 'border-zinc-700 text-zinc-300 hover:bg-zinc-800'
                            }`}
                          >
                            {format.charAt(0).toUpperCase() + format.slice(1)}
                          </button>
                        ))}
                      </div>
                    </div>
                  </div>
                </ScrollArea>

                <div className="flex items-center justify-between pt-4 mt-4 border-t border-zinc-800">
                  <button className="text-xs text-zinc-500 hover:text-zinc-300">
                    Regenerate
                  </button>
                  <div className="flex space-x-2">
                    <button
                      onClick={handleSaveContent}
                      className="text-xs py-1.5 px-4 bg-white text-black rounded hover:bg-zinc-200"
                    >
                      Save
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Floating Prompt Button */}
      <button
        onClick={handleOpenPromptPanel}
        className="fixed bottom-6 left-6 z-50 bg-blue-600 hover:bg-blue-700 text-white rounded-full p-4 shadow-lg transition-all"
        title="프롬프트 편집기"
      >
        <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
        </svg>
      </button>

      {/* Prompt Panel Slide-in */}
      <div
        className={`fixed top-0 right-0 h-full w-[500px] bg-zinc-950 border-l border-zinc-800 shadow-2xl z-50 transition-transform duration-300 ease-in-out ${
          isPromptPanelOpen ? 'translate-x-0' : 'translate-x-full'
        }`}
      >
        <div className="h-full flex flex-col">
          {/* Header */}
          <div className="flex items-center justify-between p-4 border-b border-zinc-800">
            <h2 className="text-lg font-semibold text-zinc-100">프롬프트 편집기</h2>
            <button
              onClick={() => setIsPromptPanelOpen(false)}
              className="text-zinc-400 hover:text-zinc-100 transition-colors"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          <ScrollArea className="flex-1 p-4">
            {/* Category Select */}
            <div className="mb-4">
              <label className="block text-xs text-zinc-400 mb-2">카테고리</label>
              <select
                value={promptPanelCategory}
                onChange={(e) => handlePromptPanelCategoryChange(e.target.value as Category)}
                className="w-full bg-zinc-900 text-zinc-100 border border-zinc-800 rounded px-3 py-2 text-sm"
              >
                {CATEGORIES.map((cat) => (
                  <option key={cat} value={cat}>
                    {DEFAULT_CATEGORY_PROMPTS[cat].label}
                  </option>
                ))}
              </select>
            </div>

            {/* Prompt Text */}
            <div className="mb-4">
              <label className="block text-xs text-zinc-400 mb-2">시스템 프롬프트</label>
              <textarea
                value={promptPanelText}
                onChange={(e) => setPromptPanelText(e.target.value)}
                className="w-full h-64 bg-zinc-900 text-zinc-100 border border-zinc-800 rounded px-3 py-2 text-sm font-mono resize-none"
                placeholder="프롬프트를 입력하세요..."
              />
            </div>

            {/* Test Article Select */}
            <div className="mb-4">
              <label className="block text-xs text-zinc-400 mb-2">테스트 기사</label>
              <select
                value={promptPanelTestArticle?.id || ''}
                onChange={(e) => {
                  const article = articles.find(a => a.id === e.target.value);
                  setPromptPanelTestArticle(article || null);
                }}
                className="w-full bg-zinc-900 text-zinc-100 border border-zinc-800 rounded px-3 py-2 text-sm"
              >
                <option value="">기사 선택...</option>
                {articles.slice(0, 10).map((article) => (
                  <option key={article.id} value={article.id}>
                    {article.title.substring(0, 50)}...
                  </option>
                ))}
              </select>
            </div>

            {/* Test Button */}
            <div className="mb-4">
              <Button
                onClick={handlePromptPanelTest}
                disabled={promptPanelTesting || !promptPanelTestArticle}
                className="w-full bg-green-600 hover:bg-green-700 text-white"
              >
                {promptPanelTesting ? '테스트 중...' : '▶ 프롬프트 테스트'}
              </Button>
            </div>

            {/* Test Result */}
            {promptPanelTestResult && (
              <div className="mb-4">
                <label className="block text-xs text-zinc-400 mb-2">테스트 결과</label>
                <div className="bg-zinc-900 border border-zinc-800 rounded p-3 text-sm text-zinc-300">
                  {promptPanelTestResult}
                </div>
              </div>
            )}

            {/* Action Buttons */}
            <div className="grid grid-cols-3 gap-2">
              <Button
                onClick={handlePromptPanelReset}
                className="bg-zinc-800 hover:bg-zinc-700 text-zinc-300"
              >
                초기화
              </Button>
              <Button
                onClick={handlePromptPanelLoad}
                className="bg-zinc-800 hover:bg-zinc-700 text-zinc-300"
              >
                불러오기
              </Button>
              <Button
                onClick={handlePromptPanelSave}
                className="bg-white hover:bg-zinc-200 text-black"
              >
                저장
              </Button>
            </div>
          </ScrollArea>
        </div>
      </div>

      {/* Floating Help */}
      <div className="fixed bottom-6 right-6 z-50">
        <div className="bg-zinc-900/90 backdrop-blur-lg border border-zinc-800 rounded-lg shadow-xl p-3 text-xs text-zinc-400">
          <div className="font-medium text-zinc-300 mb-2">Shortcuts</div>
          <div className="space-y-1">
            <div><kbd className="bg-zinc-800 px-1 rounded">⌘K</kbd> Command Palette</div>
            <div><kbd className="bg-zinc-800 px-1 rounded">S</kbd> Scrape</div>
            <div><kbd className="bg-zinc-800 px-1 rounded">C</kbd> Classify</div>
            <div><kbd className="bg-zinc-800 px-1 rounded">G</kbd> Generate</div>
            <div><kbd className="bg-zinc-800 px-1 rounded">V</kbd> Switch View</div>
            <div><kbd className="bg-zinc-800 px-1 rounded">R</kbd> Refresh</div>
            <div><kbd className="bg-zinc-800 px-1 rounded">F</kbd> Search</div>
          </div>
        </div>
      </div>
    </div>
  );
}
