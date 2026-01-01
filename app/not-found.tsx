export default function NotFound() {
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
          404
        </h1>
        <p style={{
          fontSize: '18px',
          color: '#7B7B7B',
          marginBottom: '32px'
        }}>
          페이지를 찾을 수 없습니다
        </p>
        <a
          href="/"
          style={{
            color: '#ff6b35',
            textDecoration: 'none',
            fontSize: '16px',
            fontWeight: 600
          }}
        >
          홈으로 돌아가기
        </a>
      </div>
    </main>
  );
}
