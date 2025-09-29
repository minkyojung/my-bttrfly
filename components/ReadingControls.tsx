'use client';

import { useState, useEffect } from 'react';

export function ReadingControls() {
  const [isLargeFont, setIsLargeFont] = useState(false);
  const [isDark, setIsDark] = useState(false);

  useEffect(() => {
    // 저장된 설정 불러오기
    const savedFont = localStorage.getItem('largeFont');
    const savedTheme = localStorage.getItem('theme');
    
    if (savedFont) {
      setIsLargeFont(savedFont === 'true');
    }
    
    if (savedTheme) {
      setIsDark(savedTheme === 'dark');
    }
  }, []);

  useEffect(() => {
    // 폰트 크기 적용 (기본 16px, 큰 글씨 18px)
    const fontSize = isLargeFont ? '18px' : '16px';
    document.documentElement.style.fontSize = fontSize;
    document.body.style.fontSize = '1rem';
    localStorage.setItem('largeFont', isLargeFont.toString());
  }, [isLargeFont]);

  useEffect(() => {
    // 테마 적용
    if (isDark) {
      document.documentElement.classList.add('dark');
      localStorage.setItem('theme', 'dark');
    } else {
      document.documentElement.classList.remove('dark');
      localStorage.setItem('theme', 'light');
    }
  }, [isDark]);

  return (
    <div className="fixed bottom-4 right-4 z-50">
      <div 
        className="flex items-center gap-1 p-2 rounded-full backdrop-blur-sm"
        style={{
          backgroundColor: 'rgba(var(--bg-color-rgb, 255, 255, 255), 0.8)',
          border: '1px solid var(--border-color)',
        }}
      >
        {/* 폰트 크기 프리셋 */}
        <button
          onClick={() => setIsLargeFont(false)}
          className={`w-7 h-7 flex items-center justify-center rounded-full hover:opacity-70 transition-opacity ${!isLargeFont ? 'opacity-100' : 'opacity-40'}`}
          style={{ color: 'var(--text-color)' }}
          title="기본 글씨"
        >
          <span className="text-xs font-medium">A</span>
        </button>
        
        <button
          onClick={() => setIsLargeFont(true)}
          className={`w-7 h-7 flex items-center justify-center rounded-full hover:opacity-70 transition-opacity ${isLargeFont ? 'opacity-100' : 'opacity-40'}`}
          style={{ color: 'var(--text-color)' }}
          title="큰 글씨"
        >
          <span className="text-sm font-medium">A</span>
        </button>

        {/* 테마 토글 */}
        <button
          onClick={() => setIsDark(!isDark)}
          className="w-7 h-7 flex items-center justify-center rounded-full hover:opacity-70 transition-opacity ml-1"
          style={{ color: 'var(--text-color)' }}
          title={isDark ? '라이트 모드' : '다크 모드'}
        >
          {isDark ? (
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <circle cx="12" cy="12" r="5" />
              <path d="M12 1v2M12 21v2M4.22 4.22l1.42 1.42M18.36 18.36l1.42 1.42M1 12h2M21 12h2M4.22 19.78l1.42-1.42M18.36 5.64l1.42-1.42" />
            </svg>
          ) : (
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z" />
            </svg>
          )}
        </button>
      </div>
    </div>
  );
}