import Link from 'next/link';

export function NavBar() {
  return (
    <nav
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        zIndex: 100,
        padding: '16px 28px',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
      }}
    >
      <Link
        href="/"
        style={{
          color: '#ffffff',
          fontFamily: "'Pretendard', sans-serif",
          fontWeight: 500,
          fontSize: '13px',
          letterSpacing: '0.02em',
          textDecoration: 'none',
        }}
      >
        MJ
      </Link>
    </nav>
  );
}
