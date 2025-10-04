'use client';

import { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogTitle } from '@/components/ui/dialog';
import { ScrollArea } from '@/components/ui/scroll-area';

interface Article {
  id: string;
  title: string;
  description?: string;
  content?: string;
  source?: string;
  category?: string;
  created_at: string;
  thumbnail?: string;
  keywords?: string[];
  sentiment?: 'positive' | 'negative' | 'neutral';
  relevance_score?: number;
}

interface InstagramContent {
  title: string;
  caption: string;
  hashtags: string[];
  format: 'post' | 'reel' | 'story';
  originalArticle: Article;
}

export default function MorningReviewDashboard() {
  const [articles, setArticles] = useState<Article[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [processingArticle, setProcessingArticle] = useState<string | null>(null);
  const [selectedArticle, setSelectedArticle] = useState<Article | null>(null);
  const [generatedContent, setGeneratedContent] = useState<InstagramContent | null>(null);
  const [editedContent, setEditedContent] = useState<InstagramContent | null>(null);
  const [contentFormat, setContentFormat] = useState<'post' | 'reel' | 'story'>('post');

  useEffect(() => {
    fetchTodayArticles();
  }, []);

  const fetchTodayArticles = async () => {
    try {
      const res = await fetch('/api/dashboard/articles');
      const data = await res.json();

      if (data.success && data.articles) {
        const today = new Date().toDateString();
        const todayArticles = data.articles
          .filter((article: Article) => {
            const articleDate = new Date(article.created_at).toDateString();
            return articleDate === today;
          })
          .sort((a: Article, b: Article) => (b.relevance_score || 0) - (a.relevance_score || 0));

        setArticles(todayArticles);
      } else {
        setArticles([]);
      }
    } catch (error) {
      console.error('Failed to fetch articles:', error);
      setArticles([]);
    } finally {
      setLoading(false);
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
      console.error('Failed to generate content:', error);
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
    } catch (error) {
      console.error('Failed to save content:', error);
    }
  };

  const filteredArticles = articles.filter(article =>
    selectedCategory === 'all' || article.category?.toLowerCase() === selectedCategory
  );

  const categories = ['all', 'technology', 'business', 'general'];

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-950 flex items-center justify-center">
        <div className="animate-pulse text-sm text-gray-400">Loading...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-950">
      {/* Minimal Header */}
      <div className="border-b border-gray-800">
        <div className="px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-8">
              <h1 className="text-sm font-medium text-white">Morning Review</h1>
              <nav className="flex items-center space-x-6 text-sm">
                <a href="/dashboard/morning" className="text-white">
                  Morning
                </a>
                <a href="/dashboard/news" className="text-gray-400 hover:text-white transition-colors">
                  Articles
                </a>
              </nav>
            </div>
            <div className="flex items-center space-x-2">
              <span className="text-xs text-gray-500">
                {new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Category Filter - Dark Vercel Style */}
      <div className="px-6 py-3 border-b border-gray-800">
        <div className="flex items-center space-x-4">
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={`text-xs px-3 py-1.5 rounded-full transition-all ${
                selectedCategory === cat
                  ? 'bg-white text-black'
                  : 'text-gray-400 hover:text-white hover:bg-gray-800'
              }`}
            >
              {cat.charAt(0).toUpperCase() + cat.slice(1)}
            </button>
          ))}
          <div className="ml-auto text-xs text-gray-500">
            {filteredArticles.length} articles
          </div>
        </div>
      </div>

      {/* Main Content - Compact Grid */}
      <div className="p-6">
        {filteredArticles.length === 0 ? (
          <div className="text-center py-20">
            <p className="text-sm text-gray-500">No articles for today</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredArticles.map((article) => (
              <div
                key={article.id}
                className="group border border-gray-800 rounded-lg p-4 hover:border-gray-600 transition-all bg-gray-900"
              >
                {/* Thumbnail */}
                {article.thumbnail && (
                  <div className="mb-3 overflow-hidden rounded bg-gray-800">
                    <img
                      src={article.thumbnail}
                      alt={article.title}
                      className="w-full h-32 object-cover"
                    />
                  </div>
                )}

                {/* Content */}
                <div className="space-y-2">
                  <h3 className="text-sm font-medium text-white line-clamp-2">
                    {article.title}
                  </h3>

                  {article.description && (
                    <p className="text-xs text-gray-400 line-clamp-2">
                      {article.description}
                    </p>
                  )}

                  {/* Meta Info */}
                  <div className="flex items-center justify-between pt-2">
                    <div className="flex items-center space-x-2">
                      {article.relevance_score && (
                        <span className="text-xs px-2 py-0.5 bg-gray-800 text-gray-300 rounded">
                          {Math.round(article.relevance_score * 100)}%
                        </span>
                      )}
                      {article.sentiment && (
                        <span className={`text-xs px-2 py-0.5 rounded ${
                          article.sentiment === 'positive' ? 'bg-gray-800 text-white' :
                          article.sentiment === 'negative' ? 'bg-gray-700 text-gray-300' :
                          'bg-gray-800 text-gray-400'
                        }`}>
                          {article.sentiment}
                        </span>
                      )}
                    </div>
                    <span className="text-xs text-gray-500">
                      {article.source || 'Unknown'}
                    </span>
                  </div>

                  {/* Keywords */}
                  {article.keywords && article.keywords.length > 0 && (
                    <div className="flex flex-wrap gap-1 pt-2">
                      {article.keywords.slice(0, 3).map((keyword, idx) => (
                        <span key={idx} className="text-xs text-gray-500">
                          #{keyword}
                        </span>
                      ))}
                    </div>
                  )}

                  {/* Actions */}
                  <div className="flex items-center space-x-2 pt-3">
                    <button
                      onClick={() => handleGenerateContent(article)}
                      disabled={processingArticle === article.id}
                      className={`flex-1 text-xs py-1.5 px-3 rounded border transition-all ${
                        processingArticle === article.id
                          ? 'bg-gray-800 text-gray-500 border-gray-700'
                          : 'bg-white text-black border-white hover:bg-gray-200'
                      }`}
                    >
                      {processingArticle === article.id ? 'Processing...' : 'Generate'}
                    </button>
                    <button className="text-xs py-1.5 px-3 rounded border border-gray-700 text-gray-300 hover:bg-gray-800 transition-all">
                      Save
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Content Editor Modal - Dark Vercel Style */}
      <Dialog
        open={!!selectedArticle && !!generatedContent}
        onOpenChange={() => {
          setSelectedArticle(null);
          setGeneratedContent(null);
          setEditedContent(null);
        }}
      >
        <DialogContent className="max-w-4xl p-0 gap-0 bg-gray-900 border-gray-800">
          <DialogTitle className="sr-only">Instagram Content Editor</DialogTitle>
          <div className="grid grid-cols-2 h-[600px]">
            {/* Instagram Preview */}
            <div className="border-r border-gray-800 p-8 bg-gray-950 flex items-center justify-center">
              <div className="w-full max-w-sm">
                <div className="bg-black border border-gray-800 rounded-lg shadow-sm">
                  {/* Instagram Header */}
                  <div className="p-3 border-b border-gray-800 flex items-center space-x-2">
                    <div className="w-8 h-8 bg-gray-700 rounded-full"></div>
                    <span className="text-xs font-medium text-white">yourhandle</span>
                  </div>

                  {/* Instagram Content */}
                  <div className="aspect-square bg-gradient-to-br from-gray-800 to-gray-900 flex items-center justify-center p-6">
                    <p className="text-center text-sm text-gray-200">
                      {editedContent?.caption.slice(0, 100)}...
                    </p>
                  </div>

                  {/* Instagram Footer */}
                  <div className="p-3 space-y-2">
                    <div className="flex space-x-3">
                      <button className="text-gray-300">
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                        </svg>
                      </button>
                      <button className="text-gray-300">
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                        </svg>
                      </button>
                      <button className="text-gray-300">
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m9.032 4.026a9.001 9.001 0 01-7.432 0m9.032-4.026A9.001 9.001 0 0112 3c-4.474 0-8.268 3.12-9.032 7.326m0 0A9.001 9.001 0 0012 21c4.474 0 8.268-3.12 9.032-7.326" />
                        </svg>
                      </button>
                    </div>
                    <p className="text-xs">
                      <span className="font-medium text-white">yourhandle</span>{' '}
                      <span className="text-gray-400">{editedContent?.caption.slice(0, 50)}...</span>
                    </p>
                    {editedContent?.hashtags && (
                      <p className="text-xs text-gray-400">
                        {editedContent.hashtags.slice(0, 3).map(tag => `#${tag}`).join(' ')}
                      </p>
                    )}
                  </div>
                </div>
              </div>
            </div>

            {/* Edit Panel */}
            <div className="p-6 bg-gray-900">
              <div className="h-full flex flex-col">
                <div className="mb-4">
                  <h3 className="text-sm font-medium text-white mb-1">
                    Content Editor
                  </h3>
                  <p className="text-xs text-gray-400">
                    Edit and customize your Instagram content
                  </p>
                </div>

                <ScrollArea className="flex-1 pr-4">
                  <div className="space-y-4">
                    {/* Title */}
                    <div>
                      <label className="text-xs text-gray-400 block mb-1">Title</label>
                      <input
                        type="text"
                        value={editedContent?.title || ''}
                        onChange={(e) => setEditedContent(prev => prev ? {...prev, title: e.target.value} : null)}
                        className="w-full px-3 py-2 text-sm border border-gray-700 rounded bg-gray-800 text-white focus:outline-none focus:border-gray-500"
                      />
                    </div>

                    {/* Caption */}
                    <div>
                      <label className="text-xs text-gray-400 block mb-1">Caption</label>
                      <textarea
                        value={editedContent?.caption || ''}
                        onChange={(e) => setEditedContent(prev => prev ? {...prev, caption: e.target.value} : null)}
                        className="w-full px-3 py-2 text-sm border border-gray-700 rounded bg-gray-800 text-white focus:outline-none focus:border-gray-500 resize-none"
                        rows={4}
                      />
                    </div>

                    {/* Hashtags */}
                    <div>
                      <label className="text-xs text-gray-400 block mb-1">Hashtags</label>
                      <input
                        type="text"
                        value={editedContent?.hashtags.join(', ') || ''}
                        onChange={(e) => setEditedContent(prev =>
                          prev ? {...prev, hashtags: e.target.value.split(',').map(h => h.trim())} : null
                        )}
                        className="w-full px-3 py-2 text-sm border border-gray-700 rounded bg-gray-800 text-white focus:outline-none focus:border-gray-500"
                        placeholder="tag1, tag2, tag3"
                      />
                    </div>

                    {/* Format */}
                    <div>
                      <label className="text-xs text-gray-400 block mb-1">Format</label>
                      <div className="flex space-x-2">
                        {['post', 'reel', 'story'].map((format) => (
                          <button
                            key={format}
                            onClick={() => {
                              setContentFormat(format as 'post' | 'reel' | 'story');
                              setEditedContent(prev => prev ? {...prev, format: format as 'post' | 'reel' | 'story'} : null);
                            }}
                            className={`text-xs px-3 py-1.5 rounded border transition-all ${
                              editedContent?.format === format
                                ? 'bg-white text-black border-white'
                                : 'border-gray-700 text-gray-300 hover:bg-gray-800'
                            }`}
                          >
                            {format.charAt(0).toUpperCase() + format.slice(1)}
                          </button>
                        ))}
                      </div>
                    </div>

                    {/* Quick Actions */}
                    <div>
                      <label className="text-xs text-gray-400 block mb-1">Quick Actions</label>
                      <div className="grid grid-cols-2 gap-2">
                        <button className="text-xs py-1.5 px-3 border border-gray-700 rounded text-gray-300 hover:bg-gray-800">
                          Make Shorter
                        </button>
                        <button className="text-xs py-1.5 px-3 border border-gray-700 rounded text-gray-300 hover:bg-gray-800">
                          Add Emojis
                        </button>
                        <button className="text-xs py-1.5 px-3 border border-gray-700 rounded text-gray-300 hover:bg-gray-800">
                          Professional
                        </button>
                        <button className="text-xs py-1.5 px-3 border border-gray-700 rounded text-gray-300 hover:bg-gray-800">
                          Trending Tags
                        </button>
                      </div>
                    </div>
                  </div>
                </ScrollArea>

                {/* Actions */}
                <div className="flex items-center justify-between pt-4 mt-4 border-t border-gray-800">
                  <button className="text-xs text-gray-500 hover:text-gray-300">
                    Regenerate
                  </button>
                  <div className="flex space-x-2">
                    <button
                      onClick={handleSaveContent}
                      className="text-xs py-1.5 px-4 bg-white text-black rounded hover:bg-gray-200"
                    >
                      Save
                    </button>
                    <button className="text-xs py-1.5 px-4 border border-white text-white rounded hover:bg-gray-800">
                      Schedule Now
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}