'use client';

import { ProfileSection } from './ProfileSection/ProfileSection';
import { PostASCII } from './PostASCII';

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
  thumbnail?: string;
  ascii?: string;
}

interface MainPageProps {
  posts: Post[];
  pinnedPosts?: Post[];
}

export function MainPage({ posts, pinnedPosts }: MainPageProps) {
  return (
    <main style={{
      backgroundColor: 'var(--bg-color)',
      height: '100vh',
      overflowY: 'auto',
      scrollSnapType: 'y mandatory',
      scrollBehavior: 'smooth'
    }}>
      {/* 프로필 섹션 - 첫 번째 화면 */}
      <section style={{
        height: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        scrollSnapAlign: 'center'
      }}>
        <ProfileSection />
      </section>

      {/* 각 포스트 - 각각 한 화면씩 */}
      {posts.length > 0 ? (
        posts.map((post) => (
          <section
            key={post.slug}
            style={{
              height: '100vh',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              scrollSnapAlign: 'center'
            }}
          >
            <article style={{
              width: '630px'
            }}>
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

                {/* 이미지/ASCII 영역 */}
                <div
                  className="mb-4"
                  style={{
                    width: '600px',
                    height: '280px',
                    overflow: 'hidden'
                  }}
                >
                  {post.thumbnail ? (
                    <img
                      src={post.thumbnail}
                      alt={post.title}
                      style={{
                        width: '100%',
                        height: '100%',
                        objectFit: 'cover'
                      }}
                    />
                  ) : (
                    <PostASCII text={post.ascii} width={600} height={280} />
                  )}
                </div>

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
          </section>
        ))
      ) : (
        <section style={{
          height: '100vh',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          scrollSnapAlign: 'center'
        }}>
          <div className="text-center">
            <p className="text-sm" style={{ color: 'var(--text-color)' }}>
              Obsidian에서 <code className="px-1" style={{ backgroundColor: 'var(--bg-color)', border: '1px solid var(--profile-border-color)', color: 'var(--text-color)' }}>content/posts</code> 폴더에
              마크다운 파일을 작성해주세요.
            </p>
          </div>
        </section>
      )}
    </main>
  );
}
