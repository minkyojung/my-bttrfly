'use client';

import { useState } from 'react';

export default function TestPipelinePage() {
  const [loading, setLoading] = useState<string | null>(null);
  const [results, setResults] = useState<any[]>([]);

  async function runStep(step: string, endpoint: string) {
    setLoading(step);
    try {
      const res = await fetch(endpoint);
      const data = await res.json();
      setResults((prev) => [...prev, { step, data, timestamp: new Date().toLocaleTimeString() }]);
    } catch (error) {
      setResults((prev) => [...prev, { step, error: String(error), timestamp: new Date().toLocaleTimeString() }]);
    } finally {
      setLoading(null);
    }
  }

  return (
    <div style={{ padding: '2rem', maxWidth: '1200px', margin: '0 auto' }}>
      <h1>🧪 Pipeline Test Dashboard</h1>
      <p>각 버튼을 순서대로 클릭하여 파이프라인을 테스트하세요.</p>

      <div style={{ display: 'flex', gap: '1rem', marginTop: '2rem' }}>
        <button
          onClick={() => runStep('1. RSS 수집', '/api/cron/scrape-news')}
          disabled={loading !== null}
          style={{
            padding: '1rem 2rem',
            fontSize: '16px',
            background: '#0070f3',
            color: 'white',
            border: 'none',
            borderRadius: '8px',
            cursor: loading ? 'not-allowed' : 'pointer',
            opacity: loading ? 0.5 : 1,
          }}
        >
          {loading === '1. RSS 수집' ? '⏳ 실행 중...' : '1️⃣ RSS 수집'}
        </button>

        <button
          onClick={() => runStep('2. AI 분류', '/api/cron/classify-articles')}
          disabled={loading !== null}
          style={{
            padding: '1rem 2rem',
            fontSize: '16px',
            background: '#10b981',
            color: 'white',
            border: 'none',
            borderRadius: '8px',
            cursor: loading ? 'not-allowed' : 'pointer',
            opacity: loading ? 0.5 : 1,
          }}
        >
          {loading === '2. AI 분류' ? '⏳ 실행 중...' : '2️⃣ AI 분류'}
        </button>

        <button
          onClick={() => runStep('3. 인스타그램 생성', '/api/cron/generate-instagram')}
          disabled={loading !== null}
          style={{
            padding: '1rem 2rem',
            fontSize: '16px',
            background: '#f59e0b',
            color: 'white',
            border: 'none',
            borderRadius: '8px',
            cursor: loading ? 'not-allowed' : 'pointer',
            opacity: loading ? 0.5 : 1,
          }}
        >
          {loading === '3. 인스타그램 생성' ? '⏳ 실행 중...' : '3️⃣ 인스타그램 생성'}
        </button>

        <button
          onClick={() => setResults([])}
          style={{
            padding: '1rem 2rem',
            fontSize: '16px',
            background: '#ef4444',
            color: 'white',
            border: 'none',
            borderRadius: '8px',
            cursor: 'pointer',
          }}
        >
          🗑️ 결과 초기화
        </button>
      </div>

      <div style={{ marginTop: '3rem' }}>
        <h2>📋 실행 결과</h2>
        {results.length === 0 ? (
          <p style={{ color: '#666' }}>아직 실행된 단계가 없습니다.</p>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            {results.map((result, i) => (
              <div
                key={i}
                style={{
                  background: '#f3f4f6',
                  padding: '1rem',
                  borderRadius: '8px',
                  border: '1px solid #e5e7eb',
                }}
              >
                <div style={{ fontWeight: 'bold', marginBottom: '0.5rem' }}>
                  {result.step} - {result.timestamp}
                </div>
                <pre
                  style={{
                    background: '#1f2937',
                    color: '#f3f4f6',
                    padding: '1rem',
                    borderRadius: '4px',
                    overflow: 'auto',
                    fontSize: '14px',
                  }}
                >
                  {JSON.stringify(result.data || result.error, null, 2)}
                </pre>
              </div>
            ))}
          </div>
        )}
      </div>

      <div style={{ marginTop: '3rem', padding: '1rem', background: '#fef3c7', borderRadius: '8px' }}>
        <h3>💡 사용 방법</h3>
        <ol>
          <li>1️⃣ RSS 수집 버튼을 클릭하여 뉴스 기사를 수집합니다</li>
          <li>2️⃣ AI 분류 버튼을 클릭하여 수집된 기사를 분류합니다</li>
          <li>3️⃣ 인스타그램 생성 버튼을 클릭하여 Instagram 콘텐츠를 생성합니다</li>
          <li>
            결과 확인은 <a href="/dashboard" style={{ color: '#0070f3' }}>대시보드</a>에서 가능합니다
          </li>
        </ol>
      </div>
    </div>
  );
}
