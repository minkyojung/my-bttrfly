'use client';

import { useState, useEffect } from 'react';

export default function NewsDashboard() {
  const [articles, setArticles] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [filter, setFilter] = useState('all');
  const [stats, setStats] = useState({
    total: 0,
    pending: 0,
    classified: 0,
    posted: 0,
  });

  useEffect(() => {
    fetchArticles();
  }, [filter]);

  async function fetchArticles() {
    setLoading(true);
    try {
      const res = await fetch('/api/dashboard/articles');
      const data = await res.json();

      let filtered = data.articles || [];
      if (filter !== 'all') {
        filtered = filtered.filter((a: any) => a.status === filter);
      }

      setArticles(filtered);

      const allArticles = data.articles || [];
      setStats({
        total: allArticles.length,
        pending: allArticles.filter((a: any) => a.status === 'pending').length,
        classified: allArticles.filter((a: any) => a.status === 'classified').length,
        posted: allArticles.filter((a: any) => a.status === 'posted').length,
      });
    } catch (error) {
      console.error('Failed to fetch articles:', error);
    } finally {
      setLoading(false);
    }
  }

  async function classifyArticle(id: string) {
    try {
      const res = await fetch('/api/classify-single', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id }),
      });
      if (res.ok) {
        fetchArticles();
      }
    } catch (error) {
      console.error('Classification failed:', error);
    }
  }

  async function runPipeline(step: string) {
    setLoading(true);
    try {
      const endpoints: Record<string, string> = {
        scrape: '/api/simple-scrape',
        classify: '/api/simple-classify',
        generate: '/api/cron/generate-instagram',
      };

      const res = await fetch(endpoints[step]);
      if (res.ok) {
        fetchArticles();
      }
    } catch (error) {
      console.error('Pipeline error:', error);
    } finally {
      setLoading(false);
    }
  }

  if (loading && articles.length === 0) {
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
              <h1 className="text-sm font-medium text-white">News Dashboard</h1>
              <nav className="flex items-center space-x-6 text-sm">
                <a href="/dashboard/morning" className="text-gray-400 hover:text-white transition-colors">
                  Morning
                </a>
                <a href="/dashboard/news" className="text-white">
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

      {/* Stats Bar */}
      <div className="px-6 py-4 border-b border-gray-800">
        <div className="grid grid-cols-4 gap-4">
          <div>
            <p className="text-xs text-gray-500">Total</p>
            <p className="text-xl font-semibold text-white">{stats.total}</p>
          </div>
          <div>
            <p className="text-xs text-gray-500">Pending</p>
            <p className="text-xl font-semibold text-white">{stats.pending}</p>
          </div>
          <div>
            <p className="text-xs text-gray-500">Classified</p>
            <p className="text-xl font-semibold text-white">{stats.classified}</p>
          </div>
          <div>
            <p className="text-xs text-gray-500">Posted</p>
            <p className="text-xl font-semibold text-white">{stats.posted}</p>
          </div>
        </div>
      </div>

      {/* Controls */}
      <div className="px-6 py-4 border-b border-gray-800">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            {/* Filter */}
            <select
              value={filter}
              onChange={(e) => setFilter(e.target.value)}
              className="text-xs px-3 py-1.5 border border-gray-700 rounded bg-gray-900 text-white focus:outline-none focus:border-gray-500"
            >
              <option value="all">All Articles</option>
              <option value="pending">Pending</option>
              <option value="classified">Classified</option>
              <option value="posted">Posted</option>
            </select>

            {/* Pipeline Actions */}
            <div className="flex items-center space-x-2">
              <button
                onClick={() => runPipeline('scrape')}
                disabled={loading}
                className="text-xs px-3 py-1.5 border border-gray-700 rounded text-gray-300 hover:bg-gray-800 transition-colors disabled:opacity-50"
              >
                Scrape News
              </button>
              <button
                onClick={() => runPipeline('classify')}
                disabled={loading}
                className="text-xs px-3 py-1.5 border border-gray-700 rounded text-gray-300 hover:bg-gray-800 transition-colors disabled:opacity-50"
              >
                Classify All
              </button>
              <button
                onClick={() => runPipeline('generate')}
                disabled={loading}
                className="text-xs px-3 py-1.5 bg-white text-black rounded hover:bg-gray-200 transition-colors disabled:opacity-50"
              >
                Generate Instagram
              </button>
            </div>
          </div>
          <button
            onClick={fetchArticles}
            disabled={loading}
            className="text-xs text-gray-500 hover:text-gray-300"
          >
            Refresh
          </button>
        </div>
      </div>

      {/* Articles Table */}
      <div className="px-6 py-4">
        {articles.length === 0 ? (
          <div className="text-center py-20">
            <p className="text-sm text-gray-500">No articles found</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-gray-800">
                  <th className="text-left py-3 px-4 text-xs font-medium text-gray-400">Title</th>
                  <th className="text-left py-3 px-4 text-xs font-medium text-gray-400">Source</th>
                  <th className="text-left py-3 px-4 text-xs font-medium text-gray-400">Category</th>
                  <th className="text-left py-3 px-4 text-xs font-medium text-gray-400">Status</th>
                  <th className="text-left py-3 px-4 text-xs font-medium text-gray-400">Relevance</th>
                  <th className="text-left py-3 px-4 text-xs font-medium text-gray-400">Created</th>
                  <th className="text-left py-3 px-4 text-xs font-medium text-gray-400">Actions</th>
                </tr>
              </thead>
              <tbody>
                {articles.map((article) => (
                  <tr key={article.id} className="border-b border-gray-900 hover:bg-gray-900">
                    <td className="py-3 px-4">
                      <p className="text-sm text-white line-clamp-2">{article.title}</p>
                    </td>
                    <td className="py-3 px-4">
                      <span className="text-xs text-gray-400">{article.source || 'Unknown'}</span>
                    </td>
                    <td className="py-3 px-4">
                      {article.category ? (
                        <span className="text-xs px-2 py-0.5 bg-gray-800 text-gray-300 rounded">
                          {article.category}
                        </span>
                      ) : (
                        <span className="text-xs text-gray-500">-</span>
                      )}
                    </td>
                    <td className="py-3 px-4">
                      <span className={`text-xs px-2 py-0.5 rounded ${
                        article.status === 'posted'
                          ? 'bg-gray-700 text-white'
                          : article.status === 'classified'
                          ? 'bg-gray-800 text-gray-200'
                          : 'bg-gray-900 text-gray-400'
                      }`}>
                        {article.status || 'pending'}
                      </span>
                    </td>
                    <td className="py-3 px-4">
                      {article.relevance_score ? (
                        <span className="text-xs text-gray-300">
                          {Math.round(article.relevance_score * 100)}%
                        </span>
                      ) : (
                        <span className="text-xs text-gray-500">-</span>
                      )}
                    </td>
                    <td className="py-3 px-4">
                      <span className="text-xs text-gray-400">
                        {new Date(article.created_at).toLocaleDateString()}
                      </span>
                    </td>
                    <td className="py-3 px-4">
                      <div className="flex items-center space-x-2">
                        {article.status === 'pending' && (
                          <button
                            onClick={() => classifyArticle(article.id)}
                            className="text-xs text-gray-400 hover:text-white"
                          >
                            Classify
                          </button>
                        )}
                        {article.instagram_post_id && (
                          <a
                            href={`/dashboard/instagram/${article.instagram_post_id}`}
                            className="text-xs text-gray-300 hover:text-white"
                          >
                            View Post
                          </a>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}