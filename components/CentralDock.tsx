'use client';

import { useState, useEffect } from 'react';

interface Post {
  slug: string;
  title: string;
  date: string | Date;
  tags: string[];
  preview: string;
  content: string;
  htmlContent?: string;
  readingTime: string;
}

interface CentralDockProps {
  posts: Post[];
  onPostSelect: (post: Post) => void;
  selectedPost: Post | null;
}

export function CentralDock({ posts, onPostSelect, selectedPost }: CentralDockProps) {
  const [isLargeFont, setIsLargeFont] = useState(false);
  const [isDark, setIsDark] = useState(false);
  const [showTocPopup, setShowTocPopup] = useState(false);

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
    // 폰트 크기 적용
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

  const handlePostClick = (post: Post) => {
    onPostSelect(post);
    setShowTocPopup(false);
  };

  return (
    <>
      {/* TOC Popup */}
      {showTocPopup && (
        <div
          className="fixed bottom-24 left-1/2 -translate-x-1/2 z-50 w-96 max-h-96 overflow-y-auto rounded-lg backdrop-blur-md shadow-lg"
          style={{
            backgroundColor: 'rgba(var(--bg-color-rgb, 255, 255, 255), 0.95)',
            border: '1px solid var(--border-color)',
          }}
        >
          <div className="p-4">
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-sm font-bold" style={{ color: 'var(--text-color)' }}>목차</h3>
              <button
                onClick={() => setShowTocPopup(false)}
                className="w-6 h-6 flex items-center justify-center rounded hover:opacity-60 transition-opacity"
                style={{ color: 'var(--text-color)' }}
              >
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <line x1="18" y1="6" x2="6" y2="18" />
                  <line x1="6" y1="6" x2="18" y2="18" />
                </svg>
              </button>
            </div>
            <div className="space-y-2">
              {posts.map((post) => (
                <button
                  key={post.slug}
                  onClick={() => handlePostClick(post)}
                  className={`w-full text-left p-2 rounded transition-opacity hover:opacity-100 ${
                    selectedPost?.slug === post.slug ? 'opacity-100 font-bold' : 'opacity-60'
                  }`}
                  style={{
                    color: 'var(--text-color)',
                    backgroundColor: selectedPost?.slug === post.slug ? 'rgba(var(--bg-color-rgb), 0.5)' : 'transparent'
                  }}
                >
                  <div className="flex items-baseline gap-2">
                    <span className="flex-1 text-sm">{post.title}</span>
                    <span className="text-xs opacity-50">
                      {typeof post.date === 'string' ? post.date : new Date(post.date).toLocaleDateString('ko-KR', { month: 'short', day: 'numeric' })}
                    </span>
                  </div>
                </button>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Central Dock */}
      <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50">
        <div
          className="flex items-center gap-2 px-4 py-2 rounded-full backdrop-blur-md shadow-lg"
          style={{
            backgroundColor: 'rgba(var(--bg-color-rgb, 255, 255, 255), 0.8)',
            border: '1px solid var(--border-color)',
          }}
        >
          {/* 폰트 크기 */}
          <button
            onClick={() => setIsLargeFont(false)}
            className={`w-8 h-8 flex items-center justify-center rounded-full hover:opacity-70 transition-opacity ${!isLargeFont ? 'opacity-100' : 'opacity-40'}`}
            style={{ color: 'var(--text-color)' }}
            title="기본 글씨"
          >
            <span className="text-xs font-medium">A</span>
          </button>

          <button
            onClick={() => setIsLargeFont(true)}
            className={`w-8 h-8 flex items-center justify-center rounded-full hover:opacity-70 transition-opacity ${isLargeFont ? 'opacity-100' : 'opacity-40'}`}
            style={{ color: 'var(--text-color)' }}
            title="큰 글씨"
          >
            <span className="text-sm font-medium">A</span>
          </button>

          {/* 구분선 */}
          <div className="w-px h-6 opacity-30" style={{ backgroundColor: 'var(--text-color)' }} />

          {/* 다크모드 */}
          <button
            onClick={() => setIsDark(!isDark)}
            className="w-8 h-8 flex items-center justify-center rounded-full hover:opacity-70 transition-opacity"
            style={{ color: 'var(--text-color)' }}
            title={isDark ? '라이트 모드' : '다크 모드'}
          >
            {isDark ? (
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <circle cx="12" cy="12" r="5" />
                <path d="M12 1v2M12 21v2M4.22 4.22l1.42 1.42M18.36 18.36l1.42 1.42M1 12h2M21 12h2M4.22 19.78l1.42-1.42M18.36 5.64l1.42-1.42" />
              </svg>
            ) : (
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z" />
              </svg>
            )}
          </button>

          {/* 구분선 */}
          <div className="w-px h-6 opacity-30" style={{ backgroundColor: 'var(--text-color)' }} />

          {/* 목차 */}
          <button
            onClick={() => setShowTocPopup(!showTocPopup)}
            className={`w-8 h-8 flex items-center justify-center rounded-full hover:opacity-70 transition-opacity ${showTocPopup ? 'opacity-100' : 'opacity-60'}`}
            style={{ color: 'var(--text-color)' }}
            title="목차"
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <line x1="8" y1="6" x2="21" y2="6" />
              <line x1="8" y1="12" x2="21" y2="12" />
              <line x1="8" y1="18" x2="21" y2="18" />
              <line x1="3" y1="6" x2="3.01" y2="6" />
              <line x1="3" y1="12" x2="3.01" y2="12" />
              <line x1="3" y1="18" x2="3.01" y2="18" />
            </svg>
          </button>
        </div>
      </div>

      {/* Popup 닫기용 배경 */}
      {showTocPopup && (
        <div
          className="fixed inset-0 z-40"
          onClick={() => setShowTocPopup(false)}
        />
      )}
    </>
  );
}
