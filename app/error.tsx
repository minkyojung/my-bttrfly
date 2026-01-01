'use client';

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <main style={{
      backgroundColor: '#0a0a0a',
      minHeight: '100vh',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      color: '#ffffff',
      fontFamily: 'Pretendard, sans-serif'
    }}>
      <div style={{ textAlign: 'center' }}>
        <h1 style={{
          fontSize: '72px',
          fontWeight: 700,
          marginBottom: '16px',
          letterSpacing: '-0.05em'
        }}>
          Error
        </h1>
        <p style={{
          fontSize: '18px',
          color: '#7B7B7B',
          marginBottom: '32px'
        }}>
          문제가 발생했습니다
        </p>
        <button
          onClick={() => reset()}
          style={{
            color: '#ff6b35',
            backgroundColor: 'transparent',
            border: '1px solid #ff6b35',
            padding: '12px 24px',
            fontSize: '16px',
            fontWeight: 600,
            borderRadius: '8px',
            cursor: 'pointer'
          }}
        >
          다시 시도
        </button>
      </div>
    </main>
  );
}
