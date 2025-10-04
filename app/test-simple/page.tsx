'use client';

import { useState, useEffect } from 'react';

export default function SimpleTestPage() {
  const [loading, setLoading] = useState<string | null>(null);
  const [dbStatus, setDbStatus] = useState<any>(null);
  const [scrapeResult, setScrapeResult] = useState<any>(null);
  const [classifyResult, setClassifyResult] = useState<any>(null);
  const [articles, setArticles] = useState<any[]>([]);

  // 페이지 로드시 DB 상태 확인
  useEffect(() => {
    fetchArticles();
  }, []);

  async function fetchArticles() {
    try {
      const res = await fetch('/api/dashboard/articles');
      const data = await res.json();
      setArticles(data.articles || []);
    } catch (error) {
      console.error('Failed to fetch articles:', error);
    }
  }

  async function testDB() {
    setLoading('db');
    try {
      const res = await fetch('/api/test-db');
      const data = await res.json();
      setDbStatus(data);
      fetchArticles();
    } catch (error) {
      setDbStatus({ success: false, error: String(error) });
    } finally {
      setLoading(null);
    }
  }

  async function testScrape() {
    setLoading('scrape');
    setScrapeResult(null);
    try {
      const res = await fetch('/api/simple-scrape');
      const data = await res.json();
      setScrapeResult(data);
      fetchArticles(); // 기사 목록 새로고침
    } catch (error) {
      setScrapeResult({ success: false, error: String(error) });
    } finally {
      setLoading(null);
    }
  }

  async function testClassify() {
    setLoading('classify');
    setClassifyResult(null);
    try {
      const res = await fetch('/api/simple-classify');
      const data = await res.json();
      setClassifyResult(data);
      fetchArticles(); // 기사 목록 새로고침
    } catch (error) {
      setClassifyResult({ success: false, error: String(error) });
    } finally {
      setLoading(null);
    }
  }

  return (
    <div style={{ padding: '2rem', maxWidth: '1200px', margin: '0 auto', fontFamily: 'system-ui' }}>
      <h1>🔧 간단한 파이프라인 테스트</h1>
      <p>각 단계를 순서대로 테스트하세요.</p>

      {/* 테스트 버튼들 */}
      <div style={{ display: 'flex', gap: '1rem', marginTop: '2rem' }}>
        <button
          onClick={testDB}
          disabled={loading !== null}
          style={{
            padding: '1rem 2rem',
            background: loading === 'db' ? '#6b7280' : '#3b82f6',
            color: 'white',
            border: 'none',
            borderRadius: '8px',
            cursor: loading ? 'not-allowed' : 'pointer',
          }}
        >
          {loading === 'db' ? '⏳ 테스트 중...' : '1️⃣ DB 연결 테스트'}
        </button>

        <button
          onClick={testScrape}
          disabled={loading !== null}
          style={{
            padding: '1rem 2rem',
            background: loading === 'scrape' ? '#6b7280' : '#10b981',
            color: 'white',
            border: 'none',
            borderRadius: '8px',
            cursor: loading ? 'not-allowed' : 'pointer',
          }}
        >
          {loading === 'scrape' ? '⏳ 수집 중...' : '2️⃣ RSS 수집 (3개만)'}
        </button>

        <button
          onClick={testClassify}
          disabled={loading !== null}
          style={{
            padding: '1rem 2rem',
            background: loading === 'classify' ? '#6b7280' : '#f59e0b',
            color: 'white',
            border: 'none',
            borderRadius: '8px',
            cursor: loading ? 'not-allowed' : 'pointer',
          }}
        >
          {loading === 'classify' ? '⏳ 분류 중...' : '3️⃣ AI 분류 (3개만)'}
        </button>

        <button
          onClick={fetchArticles}
          style={{
            padding: '1rem 2rem',
            background: '#6b7280',
            color: 'white',
            border: 'none',
            borderRadius: '8px',
            cursor: 'pointer',
          }}
        >
          🔄 새로고침
        </button>
      </div>

      {/* 결과 표시 */}
      <div style={{ marginTop: '2rem', display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '2rem' }}>
        {/* DB 테스트 결과 */}
        {dbStatus && (
          <div style={{ background: '#f9fafb', padding: '1rem', borderRadius: '8px', border: '1px solid #e5e7eb' }}>
            <h3>DB 연결 상태</h3>
            <pre style={{ background: '#1f2937', color: '#f3f4f6', padding: '1rem', borderRadius: '4px', overflow: 'auto', fontSize: '12px' }}>
              {JSON.stringify(dbStatus, null, 2)}
            </pre>
          </div>
        )}

        {/* RSS 수집 결과 */}
        {scrapeResult && (
          <div style={{ background: '#f9fafb', padding: '1rem', borderRadius: '8px', border: '1px solid #e5e7eb' }}>
            <h3>RSS 수집 결과</h3>
            <pre style={{ background: '#1f2937', color: '#f3f4f6', padding: '1rem', borderRadius: '4px', overflow: 'auto', fontSize: '12px' }}>
              {JSON.stringify(scrapeResult, null, 2)}
            </pre>
          </div>
        )}

        {/* AI 분류 결과 */}
        {classifyResult && (
          <div style={{ background: '#f9fafb', padding: '1rem', borderRadius: '8px', border: '1px solid #e5e7eb', gridColumn: 'span 2' }}>
            <h3>AI 분류 결과</h3>
            <pre style={{ background: '#1f2937', color: '#f3f4f6', padding: '1rem', borderRadius: '4px', overflow: 'auto', fontSize: '12px' }}>
              {JSON.stringify(classifyResult, null, 2)}
            </pre>
          </div>
        )}
      </div>

      {/* 기사 목록 */}
      <div style={{ marginTop: '2rem' }}>
        <h2>📰 저장된 기사 ({articles.length}개)</h2>
        <div style={{ background: '#fff', border: '1px solid #e5e7eb', borderRadius: '8px', overflow: 'hidden' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr style={{ background: '#f3f4f6' }}>
                <th style={{ padding: '0.75rem', textAlign: 'left', borderBottom: '1px solid #e5e7eb' }}>제목</th>
                <th style={{ padding: '0.75rem', textAlign: 'left', borderBottom: '1px solid #e5e7eb' }}>상태</th>
                <th style={{ padding: '0.75rem', textAlign: 'left', borderBottom: '1px solid #e5e7eb' }}>카테고리</th>
                <th style={{ padding: '0.75rem', textAlign: 'left', borderBottom: '1px solid #e5e7eb' }}>감정</th>
              </tr>
            </thead>
            <tbody>
              {articles.map((article) => (
                <tr key={article.id} style={{ borderBottom: '1px solid #e5e7eb' }}>
                  <td style={{ padding: '0.75rem', fontSize: '14px' }}>
                    <a href={article.url} target="_blank" rel="noopener noreferrer" style={{ color: '#3b82f6' }}>
                      {article.title}
                    </a>
                  </td>
                  <td style={{ padding: '0.75rem' }}>
                    <span
                      style={{
                        padding: '0.25rem 0.5rem',
                        borderRadius: '4px',
                        fontSize: '12px',
                        background:
                          article.status === 'classified' ? '#10b981' :
                          article.status === 'pending' ? '#f59e0b' : '#6b7280',
                        color: 'white',
                      }}
                    >
                      {article.status}
                    </span>
                  </td>
                  <td style={{ padding: '0.75rem', fontSize: '14px' }}>{article.category || '-'}</td>
                  <td style={{ padding: '0.75rem', fontSize: '14px' }}>{article.sentiment || '-'}</td>
                </tr>
              ))}
            </tbody>
          </table>
          {articles.length === 0 && (
            <p style={{ padding: '2rem', textAlign: 'center', color: '#6b7280' }}>
              아직 저장된 기사가 없습니다. RSS 수집을 먼저 실행하세요.
            </p>
          )}
        </div>
      </div>
    </div>
  );
}