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
  const [selectedTag, setSelectedTag] = useState<string | null>(null);

  // Get all unique tags from posts
  const allTags = Array.from(new Set(posts.flatMap(post => post.tags))).sort();

  // Filter posts by selected tag
  const filteredPosts = selectedTag
    ? posts.filter(post => post.tags.includes(selectedTag))
    : posts;

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
          className="fixed bottom-20 left-1/2 -translate-x-1/2 z-50 w-80 rounded-lg backdrop-blur-md shadow-lg"
          style={{
            backgroundColor: 'rgba(var(--bg-color-rgb, 255, 255, 255), 0.95)',
            border: '1px solid var(--border-color)',
          }}
        >
          <div className="p-3">
            {/* Tag Filter */}
            <div className="mb-2">
              <div className="flex flex-wrap gap-1">
                <button
                  onClick={() => setSelectedTag(null)}
                  className={`px-2 py-1 text-[10px] rounded transition-all ${
                    selectedTag === null ? 'font-medium' : 'opacity-50 hover:opacity-70'
                  }`}
                  style={{
                    color: 'var(--text-color)',
                    backgroundColor: selectedTag === null ? 'rgba(128, 128, 128, 0.15)' : 'transparent'
                  }}
                >
                  전체
                </button>
                {allTags.map((tag) => (
                  <button
                    key={tag}
                    onClick={() => setSelectedTag(tag)}
                    className={`px-2 py-1 text-[10px] rounded transition-all ${
                      selectedTag === tag ? 'font-medium' : 'opacity-50 hover:opacity-70'
                    }`}
                    style={{
                      color: 'var(--text-color)',
                      backgroundColor: selectedTag === tag ? 'rgba(128, 128, 128, 0.15)' : 'transparent'
                    }}
                  >
                    {tag}
                  </button>
                ))}
              </div>
            </div>

            {/* Posts List - Max 8 items visible, scrollable */}
            <div className="max-h-64 overflow-y-auto scrollbar-hide space-y-1">
              {filteredPosts.length > 0 ? (
                filteredPosts.map((post) => (
                  <button
                    key={post.slug}
                    onClick={() => handlePostClick(post)}
                    className={`w-full text-left px-2 py-1.5 rounded transition-all hover:opacity-100 ${
                      selectedPost?.slug === post.slug ? 'opacity-100 font-bold' : 'opacity-50'
                    }`}
                    style={{
                      color: 'var(--text-color)',
                    }}
                  >
                    <div className="flex items-baseline gap-2">
                      <span className="flex-1 text-xs">{post.title}</span>
                      <span className="text-[10px] opacity-40">
                        {typeof post.date === 'string' ? post.date.slice(5) : new Date(post.date).toLocaleDateString('ko-KR', { month: '2-digit', day: '2-digit' })}
                      </span>
                    </div>
                  </button>
                ))
              ) : (
                <div className="text-center py-4 text-xs opacity-50" style={{ color: 'var(--text-color)' }}>
                  해당 태그의 글이 없습니다
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Central Dock */}
      <div className="fixed bottom-5 left-1/2 -translate-x-1/2 z-50">
        <div
          className="flex items-center gap-1.5 px-3 py-2 rounded-full backdrop-blur-md shadow-lg"
          style={{
            backgroundColor: 'rgba(var(--bg-color-rgb, 255, 255, 255), 0.85)',
            border: '1px solid var(--border-color)',
          }}
        >
          {/* 폰트 크기 */}
          <button
            onClick={() => {
              console.log('Small font clicked');
              setIsLargeFont(false);
            }}
            className={`w-8 h-8 flex items-center justify-center rounded-full hover:opacity-70 transition-opacity ${!isLargeFont ? 'opacity-100' : 'opacity-40'}`}
            style={{ color: 'var(--text-color)' }}
            title="기본 글씨"
          >
            <span className="text-xs font-medium">A</span>
          </button>

          <button
            onClick={() => {
              console.log('Large font clicked');
              setIsLargeFont(true);
            }}
            className={`w-8 h-8 flex items-center justify-center rounded-full hover:opacity-70 transition-opacity ${isLargeFont ? 'opacity-100' : 'opacity-40'}`}
            style={{ color: 'var(--text-color)' }}
            title="큰 글씨"
          >
            <span className="text-sm font-medium">A</span>
          </button>

          {/* 구분선 */}
          <div className="w-px h-5 opacity-20 mx-0.5" style={{ backgroundColor: 'var(--text-color)' }} />

          {/* 다크모드 */}
          <button
            onClick={() => {
              console.log('Theme clicked, current:', isDark);
              setIsDark(!isDark);
            }}
            className="w-8 h-8 flex items-center justify-center rounded-full hover:opacity-70 transition-opacity"
            style={{ color: 'var(--text-color)' }}
            title={isDark ? '라이트 모드' : '다크 모드'}
          >
            {isDark ? (
              <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                <circle cx="12" cy="12" r="5" />
                <path d="M12 1v2M12 21v2M4.22 4.22l1.42 1.42M18.36 18.36l1.42 1.42M1 12h2M21 12h2M4.22 19.78l1.42-1.42M18.36 5.64l1.42-1.42" />
              </svg>
            ) : (
              <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z" />
              </svg>
            )}
          </button>

          {/* 구분선 */}
          <div className="w-px h-5 opacity-20 mx-0.5" style={{ backgroundColor: 'var(--text-color)' }} />

          {/* 목차 */}
          <button
            onClick={() => {
              console.log('TOC clicked, current:', showTocPopup);
              setShowTocPopup(!showTocPopup);
            }}
            className={`w-8 h-8 flex items-center justify-center rounded-full hover:opacity-70 transition-opacity ${showTocPopup ? 'opacity-100' : 'opacity-60'}`}
            style={{ color: 'var(--text-color)' }}
            title="목차"
          >
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
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
