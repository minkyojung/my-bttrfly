'use client';

import { AudioPlayer } from './AudioPlayer';
import { LiquidGlassTest } from './LiquidGlassTest';

interface Post {
  slug: string;
  title: string;
  date: string | Date;
  tags: string[];
  preview: string;
  content: string;
  htmlContent?: string;
  readingTime: string;
  pinned?: boolean;
  pinnedOrder?: number;
}

interface MainPageProps {
  posts: Post[];
}

export function MainPage({ posts }: MainPageProps) {

  return (
    <main style={{
      height: '100vh',
      overflowY: 'scroll',
      scrollSnapType: 'y mandatory',
      scrollBehavior: 'smooth',
      backgroundColor: 'var(--bg-color)'
    }}>
        {/* Three.js Test Section */}
        <div style={{
          minHeight: '100vh',
          scrollSnapAlign: 'center',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          padding: '0 24px',
          gap: '24px'
        }}>
          <h2 style={{ color: '#ffffff', fontFamily: 'Pretendard', fontWeight: 700 }}>
            Three.js Test
          </h2>
          <LiquidGlassTest />
          <AudioPlayer
            src="/audio/sample.mp3"
            title="Sample Track"
            artist="Artist Name"
          />
        </div>

        {posts.length > 0 ? (
          posts.map((post) => (
            <article
              key={post.slug}
              style={{
                minHeight: '100vh',
                scrollSnapAlign: 'center',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                padding: '0 24px'
              }}
            >
              <a
                href={`/posts/${post.slug}`}
                className="block hover:opacity-80 transition-opacity"
              >
                {/* 제목과 날짜 */}
                <div className="mb-6" style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'flex-end',
                  width: '600px'
                }}>
                  <h2 style={{
                    color: '#ffffff',
                    fontFamily: 'Pretendard',
                    fontWeight: 700,
                    fontSize: '42px',
                    lineHeight: '1.2',
                    letterSpacing: '-0.05em'
                  }}>
                    {post.title}
                  </h2>

                  <p style={{
                    color: '#7B7B7B',
                    fontFamily: 'Pretendard',
                    fontWeight: 600,
                    fontSize: '16px',
                    lineHeight: '1.4',
                    letterSpacing: '-0.05em',
                    whiteSpace: 'nowrap',
                    marginLeft: '16px'
                  }}>
                    {typeof post.date === 'string' ? post.date : new Date(post.date).toLocaleDateString('ko-KR')} · {post.readingTime}
                  </p>
                </div>

                {/* 이미지 영역 (나중에 이미지 추가) */}
                <div
                  className="mb-4"
                  style={{
                    width: '600px',
                    height: '280px',
                    backgroundColor: '#1a1a1a',
                    borderRadius: '8px'
                  }}
                />

                {/* 부제목 */}
                <p style={{
                  color: '#7B7B7B',
                  fontFamily: 'Pretendard',
                  fontWeight: 600,
                  fontSize: '16px',
                  lineHeight: '1.4',
                  letterSpacing: '-0.05em',
                  maxWidth: '600px'
                }}>
                  {post.preview}
                </p>
              </a>
            </article>
          ))
        ) : (
          <div className="text-center py-12">
            <p className="text-sm" style={{ color: 'var(--text-color)' }}>
              Obsidian에서 <code className="px-1" style={{ backgroundColor: 'var(--bg-color)', border: '1px solid var(--profile-border-color)', color: 'var(--text-color)' }}>content/posts</code> 폴더에
              마크다운 파일을 작성해주세요.
            </p>
          </div>
        )}
    </main>
  );
}
