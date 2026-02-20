'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';

export function NavBar() {
  const pathname = usePathname();

  return (
    <nav style={{
      position: 'fixed',
      top: 0,
      left: 0,
      right: 0,
      zIndex: 100,
      padding: '16px 28px',
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'center',
    }}>
      <Link
        href="/"
        style={{
          color: '#ffffff',
          fontFamily: "'Pretendard', sans-serif",
          fontWeight: 500,
          fontSize: '13px',
          letterSpacing: '0.02em',
          textDecoration: 'none',
          opacity: pathname === '/' ? 1 : 0.5,
          transition: 'opacity 0.3s',
        }}
      >
        MJ
      </Link>

      <Link
        href="/about"
        style={{
          color: '#ffffff',
          fontFamily: "'Pretendard', sans-serif",
          fontWeight: 400,
          fontSize: '12px',
          letterSpacing: '0.04em',
          textDecoration: 'none',
          opacity: pathname === '/about' ? 1 : 0.4,
          transition: 'opacity 0.3s',
        }}
      >
        About
      </Link>
    </nav>
  );
}
