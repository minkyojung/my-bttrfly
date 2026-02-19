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
      padding: '12px 24px',
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'center',
      backgroundColor: 'rgba(14, 14, 14, 0.8)',
      backdropFilter: 'blur(8px)',
      WebkitBackdropFilter: 'blur(8px)',
      borderBottom: '1px solid rgba(255,255,255,0.04)',
    }}>
      <Link
        href="/"
        style={{
          color: pathname === '/' ? '#ffffff' : '#7B7B7B',
          fontFamily: "'Pretendard', sans-serif",
          fontWeight: 600,
          fontSize: '14px',
          letterSpacing: '-0.03em',
          textDecoration: 'none',
          transition: 'color 0.2s',
        }}
      >
        Minkyo Jung
      </Link>

      <div style={{ display: 'flex', gap: '20px', alignItems: 'center' }}>
        <Link
          href="/about"
          style={{
            color: pathname === '/about' ? '#ffffff' : '#7B7B7B',
            fontFamily: "'Pretendard', sans-serif",
            fontWeight: 500,
            fontSize: '13px',
            letterSpacing: '-0.02em',
            textDecoration: 'none',
            transition: 'color 0.2s',
          }}
        >
          About
        </Link>
      </div>
    </nav>
  );
}
