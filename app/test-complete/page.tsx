'use client';

import { useState, useEffect } from 'react';

export default function CompleteTestPage() {
  const [loading, setLoading] = useState<string | null>(null);
  const [results, setResults] = useState<any>({});
  const [articles, setArticles] = useState<any[]>([]);
  const [instagramPosts, setInstagramPosts] = useState<any[]>([]);

  useEffect(() => {
    fetchData();
  }, []);

  async function fetchData() {
    try {
      const [articlesRes, postsRes] = await Promise.all([
        fetch('/api/dashboard/articles'),
        fetch('/api/dashboard/instagram-posts').catch(() => ({ json: () => ({ posts: [] }) }))
      ]);

      const articlesData = await articlesRes.json();
      const postsData = await postsRes.json();

      setArticles(articlesData.articles || []);
      setInstagramPosts(postsData.posts || []);
    } catch (error) {
      console.error('Failed to fetch data:', error);
    }
  }

  async function runStep(name: string, endpoint: string) {
    setLoading(name);
    try {
      const res = await fetch(endpoint);
      const data = await res.json();
      setResults(prev => ({ ...prev, [name]: data }));
      fetchData();
    } catch (error) {
      setResults(prev => ({ ...prev, [name]: { error: String(error) } }));
    } finally {
      setLoading(null);
    }
  }

  return (
    <div style={{ padding: '2rem', maxWidth: '1400px', margin: '0 auto', fontFamily: 'system-ui' }}>
      <h1 style={{ fontSize: '2rem', fontWeight: 'bold', marginBottom: '1rem' }}>
        Complete Pipeline Test
      </h1>

      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
        gap: '1rem',
        marginBottom: '2rem'
      }}>
        <button
          onClick={() => runStep('scrape', '/api/simple-scrape')}
          disabled={loading !== null}
          style={{
            padding: '1rem',
            background: loading === 'scrape' ? '#6b7280' : '#3b82f6',
            color: 'white',
            border: 'none',
            borderRadius: '8px',
            cursor: loading ? 'not-allowed' : 'pointer',
            opacity: loading && loading !== 'scrape' ? 0.5 : 1,
            fontSize: '14px',
            fontWeight: '500',
          }}
        >
          {loading === 'scrape' ? 'Scraping...' : '1. Scrape RSS'}
        </button>

        <button
          onClick={() => runStep('classify', '/api/simple-classify')}
          disabled={loading !== null}
          style={{
            padding: '1rem',
            background: loading === 'classify' ? '#6b7280' : '#10b981',
            color: 'white',
            border: 'none',
            borderRadius: '8px',
            cursor: loading ? 'not-allowed' : 'pointer',
            opacity: loading && loading !== 'classify' ? 0.5 : 1,
            fontSize: '14px',
            fontWeight: '500',
          }}
        >
          {loading === 'classify' ? 'Classifying...' : '2. Basic Classify'}
        </button>

        <button
          onClick={() => runStep('enhance', '/api/enhanced-classify')}
          disabled={loading !== null}
          style={{
            padding: '1rem',
            background: loading === 'enhance' ? '#6b7280' : '#8b5cf6',
            color: 'white',
            border: 'none',
            borderRadius: '8px',
            cursor: loading ? 'not-allowed' : 'pointer',
            opacity: loading && loading !== 'enhance' ? 0.5 : 1,
            fontSize: '14px',
            fontWeight: '500',
          }}
        >
          {loading === 'enhance' ? 'Enhancing...' : '3. Enhanced Analysis'}
        </button>

        <button
          onClick={() => runStep('instagram', '/api/generate-instagram-content')}
          disabled={loading !== null}
          style={{
            padding: '1rem',
            background: loading === 'instagram' ? '#6b7280' : '#f59e0b',
            color: 'white',
            border: 'none',
            borderRadius: '8px',
            cursor: loading ? 'not-allowed' : 'pointer',
            opacity: loading && loading !== 'instagram' ? 0.5 : 1,
            fontSize: '14px',
            fontWeight: '500',
          }}
        >
          {loading === 'instagram' ? 'Generating...' : '4. Generate Instagram'}
        </button>

        <button
          onClick={fetchData}
          style={{
            padding: '1rem',
            background: '#6b7280',
            color: 'white',
            border: 'none',
            borderRadius: '8px',
            cursor: 'pointer',
            fontSize: '14px',
            fontWeight: '500',
          }}
        >
          Refresh Data
        </button>
      </div>

      {/* Status Overview */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(4, 1fr)',
        gap: '1rem',
        marginBottom: '2rem'
      }}>
        <div style={{
          padding: '1rem',
          background: '#f3f4f6',
          borderRadius: '8px',
          textAlign: 'center'
        }}>
          <div style={{ fontSize: '12px', color: '#6b7280', marginBottom: '0.5rem' }}>
            Total Articles
          </div>
          <div style={{ fontSize: '24px', fontWeight: 'bold' }}>{articles.length}</div>
        </div>

        <div style={{
          padding: '1rem',
          background: '#fef3c7',
          borderRadius: '8px',
          textAlign: 'center'
        }}>
          <div style={{ fontSize: '12px', color: '#92400e', marginBottom: '0.5rem' }}>
            Pending
          </div>
          <div style={{ fontSize: '24px', fontWeight: 'bold' }}>
            {articles.filter(a => a.status === 'pending').length}
          </div>
        </div>

        <div style={{
          padding: '1rem',
          background: '#dbeafe',
          borderRadius: '8px',
          textAlign: 'center'
        }}>
          <div style={{ fontSize: '12px', color: '#1e40af', marginBottom: '0.5rem' }}>
            Classified
          </div>
          <div style={{ fontSize: '24px', fontWeight: 'bold' }}>
            {articles.filter(a => a.status === 'classified').length}
          </div>
        </div>

        <div style={{
          padding: '1rem',
          background: '#d1fae5',
          borderRadius: '8px',
          textAlign: 'center'
        }}>
          <div style={{ fontSize: '12px', color: '#065f46', marginBottom: '0.5rem' }}>
            Instagram Ready
          </div>
          <div style={{ fontSize: '24px', fontWeight: 'bold' }}>
            {articles.filter(a => a.status === 'generated').length}
          </div>
        </div>
      </div>

      {/* Results Display */}
      {Object.keys(results).length > 0 && (
        <div style={{ marginBottom: '2rem' }}>
          <h2 style={{ fontSize: '1.5rem', fontWeight: 'bold', marginBottom: '1rem' }}>
            Operation Results
          </h2>
          <div style={{
            background: '#1f2937',
            color: '#f3f4f6',
            padding: '1rem',
            borderRadius: '8px',
            overflow: 'auto',
            maxHeight: '300px',
            fontSize: '12px',
            fontFamily: 'monospace'
          }}>
            <pre>{JSON.stringify(results, null, 2)}</pre>
          </div>
        </div>
      )}

      {/* Articles Table */}
      <div style={{ marginBottom: '2rem' }}>
        <h2 style={{ fontSize: '1.5rem', fontWeight: 'bold', marginBottom: '1rem' }}>
          Articles Pipeline Status
        </h2>
        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', background: 'white' }}>
            <thead>
              <tr style={{ borderBottom: '2px solid #e5e7eb' }}>
                <th style={{ padding: '0.75rem', textAlign: 'left', fontSize: '14px' }}>Title</th>
                <th style={{ padding: '0.75rem', textAlign: 'left', fontSize: '14px' }}>Status</th>
                <th style={{ padding: '0.75rem', textAlign: 'left', fontSize: '14px' }}>Category</th>
                <th style={{ padding: '0.75rem', textAlign: 'left', fontSize: '14px' }}>Sentiment</th>
                <th style={{ padding: '0.75rem', textAlign: 'left', fontSize: '14px' }}>Score</th>
                <th style={{ padding: '0.75rem', textAlign: 'left', fontSize: '14px' }}>Instagram</th>
              </tr>
            </thead>
            <tbody>
              {articles.slice(0, 10).map((article) => (
                <tr key={article.id} style={{ borderBottom: '1px solid #e5e7eb' }}>
                  <td style={{ padding: '0.75rem', fontSize: '14px' }}>
                    <a
                      href={article.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      style={{ color: '#3b82f6', textDecoration: 'none' }}
                    >
                      {article.title?.substring(0, 60)}...
                    </a>
                  </td>
                  <td style={{ padding: '0.75rem' }}>
                    <span style={{
                      padding: '0.25rem 0.5rem',
                      borderRadius: '4px',
                      fontSize: '12px',
                      background:
                        article.status === 'pending' ? '#fef3c7' :
                        article.status === 'classified' ? '#dbeafe' :
                        article.status === 'generated' ? '#d1fae5' : '#f3f4f6',
                      color:
                        article.status === 'pending' ? '#92400e' :
                        article.status === 'classified' ? '#1e40af' :
                        article.status === 'generated' ? '#065f46' : '#374151',
                    }}>
                      {article.status}
                    </span>
                  </td>
                  <td style={{ padding: '0.75rem', fontSize: '14px' }}>
                    {article.category || '-'}
                  </td>
                  <td style={{ padding: '0.75rem', fontSize: '14px' }}>
                    <span style={{
                      padding: '0.25rem 0.5rem',
                      borderRadius: '4px',
                      fontSize: '12px',
                      background:
                        article.sentiment === 'positive' ? '#d1fae5' :
                        article.sentiment === 'negative' ? '#fee2e2' : '#f3f4f6',
                      color:
                        article.sentiment === 'positive' ? '#065f46' :
                        article.sentiment === 'negative' ? '#991b1b' : '#374151',
                    }}>
                      {article.sentiment || '-'}
                    </span>
                  </td>
                  <td style={{ padding: '0.75rem', fontSize: '14px', fontFamily: 'monospace' }}>
                    {article.relevance_score || '-'}
                  </td>
                  <td style={{ padding: '0.75rem', fontSize: '14px' }}>
                    {instagramPosts.some(p => p.article_id === article.id) ? '✓' : '-'}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}