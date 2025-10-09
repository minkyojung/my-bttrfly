'use client';

import { useState } from 'react';
import { MessageSquare } from 'lucide-react';
import { ProfilePhoto } from "@/components/ProfilePhoto";
import { ProfileHistory } from "@/components/ProfileHistory";
import { PinnedPosts } from "@/components/PinnedPosts";
import { CentralDock } from "@/components/CentralDock";
import ChatWidget from "@/components/ChatWidget";

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
  pinnedPosts: Post[];
}

export function MainPage({ posts, pinnedPosts }: MainPageProps) {
  const [selectedPost, setSelectedPost] = useState<Post | null>(
    posts.length > 0 ? posts[0] : null
  );
  const [isChatOpen, setIsChatOpen] = useState(false);

  return (
    <main className="min-h-screen" style={{ backgroundColor: 'var(--bg-color)' }}>
      <div className="flex flex-col lg:flex-row h-screen">
        {/* 데스크탑: 좌측 50% / 모바일: 하단 - 선택된 콘텐츠 */}
        <div className="w-full lg:w-1/2 pl-6 lg:pl-12 pr-6 lg:pr-8 py-6 lg:py-12 overflow-y-auto order-2 lg:order-1 scrollbar-hide">
          {selectedPost ? (
            <article>
              <h1 className="text-3xl font-black mb-4" style={{ color: 'var(--text-color)' }}>
                {selectedPost.title}
              </h1>
              <div className="flex items-center gap-3 text-sm mb-8" style={{ color: 'var(--text-color)' }}>
                <p className="opacity-80">
                  {typeof selectedPost.date === 'string' ? selectedPost.date : new Date(selectedPost.date).toLocaleDateString('ko-KR')} · {selectedPost.readingTime}
                </p>
                <div className="flex gap-1">
                  <button
                    onClick={() => {
                      const url = `${window.location.origin}/posts/${selectedPost.slug}`;
                      navigator.clipboard.writeText(url);
                    }}
                    className="p-1 hover:opacity-60 transition-opacity"
                    style={{ color: 'var(--text-color)' }}
                    title="링크 복사"
                  >
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                      <path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71" />
                      <path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71" />
                    </svg>
                  </button>
                  <a
                    href={`/posts/${selectedPost.slug}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="p-1 hover:opacity-60 transition-opacity inline-block"
                    style={{ color: 'var(--text-color)' }}
                    title="새 탭에서 열기"
                  >
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                      <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6" />
                      <polyline points="15 3 21 3 21 9" />
                      <line x1="10" y1="14" x2="21" y2="3" />
                    </svg>
                  </a>
                </div>
              </div>

              <div
                className="prose prose-serif max-w-none
                  prose-headings:font-black
                  prose-h1:text-2xl prose-h1:mb-4 prose-h1:mt-8
                  prose-h2:text-xl prose-h2:mb-3 prose-h2:mt-6
                  prose-p:mb-2
                  prose-blockquote:border-l-2
                  prose-blockquote:pl-4 prose-blockquote:italic prose-blockquote:mb-2
                  prose-strong:font-bold
                  prose-em:italic
                  prose-ul:mb-2 prose-ul:list-none
                  prose-li:mb-1
                  prose-img:w-full prose-img:rounded prose-img:my-4
                  prose-code:px-1 prose-code:rounded prose-code:text-sm
                  prose-pre:rounded prose-pre:p-4 prose-pre:mb-4
                  prose-a:underline hover:prose-a:opacity-60"
                style={{
                  lineHeight: '1.9',
                  '--tw-prose-headings': 'var(--text-color)',
                  '--tw-prose-body': 'var(--text-color)',
                  '--tw-prose-bold': 'var(--text-color)',
                  '--tw-prose-quotes': 'var(--text-color)',
                  '--tw-prose-quote-borders': 'var(--profile-border-color)',
                  '--tw-prose-links': 'var(--text-color)',
                  '--tw-prose-code': 'var(--text-color)',
                  '--tw-prose-pre-code': 'var(--text-color)',
                  '--tw-prose-pre-bg': 'var(--bg-color)',
                  '--tw-prose-borders': 'var(--border-color)',
                  '--tw-prose-counters': 'var(--text-color)',
                  '--tw-prose-bullets': 'var(--text-color)',
                  '--tw-prose-hr': 'var(--border-color)',
                  '--tw-prose-th-borders': 'var(--border-color)',
                  '--tw-prose-td-borders': 'var(--border-color)'
                } as React.CSSProperties}
                dangerouslySetInnerHTML={{ __html: selectedPost.htmlContent || '' }}
              />
            </article>
          ) : (
            <div className="text-center py-12">
              <p className="text-sm" style={{ color: 'var(--text-color)' }}>
                Obsidian에서 <code className="px-1" style={{ backgroundColor: 'var(--bg-color)', border: '1px solid var(--profile-border-color)', color: 'var(--text-color)' }}>content/posts</code> 폴더에
                마크다운 파일을 작성해주세요.
              </p>
            </div>
          )}
        </div>

        {/* 데스크탑: 우측 50% / 모바일: 상단 - 프로필 또는 Chat */}
        <div className="w-full lg:w-1/2 border-b lg:border-b-0 lg:border-l order-1 lg:order-2 flex" style={{ borderColor: 'var(--border-color)' }}>
          {!isChatOpen ? (
            <div className="w-full p-6 lg:p-12 flex items-center justify-center">
              <div className="w-full max-w-sm">
                {/* 프로필 사진 */}
                <ProfilePhoto />

                {/* 인사말 */}
                <h1 className="text-2xl lg:text-3xl font-black mb-2 text-center" style={{ color: 'var(--text-color)' }}>정민교</h1>
                <p className="mb-1 text-base leading-normal text-center" style={{ color: 'var(--text-color)' }}>
                  작동원리를 탐구하고 생각을 다듬어갑니다.
                </p>
                <p className="text-sm text-center mb-10 opacity-60">
                  <a href="mailto:williamjung0130@gmail.com" className="underline hover:opacity-100" style={{ color: 'var(--text-color)' }}>
                    williamjung0130@gmail.com
                  </a>
                </p>

                {/* 고정된 글 */}
                <PinnedPosts posts={pinnedPosts} />

                {/* 이력 */}
                <ProfileHistory />

                {/* Spotify */}
                <div className="mt-10">
                  <iframe
                    data-testid="embed-iframe"
                    style={{borderRadius: '0'}}
                    src="https://open.spotify.com/embed/playlist/1vayy3M7MvOEcPcatjq24l?utm_source=generator&theme=0"
                    width="100%"
                    height="152"
                    frameBorder="0"
                    allowFullScreen={true}
                    allow="autoplay; clipboard-write; encrypted-media; fullscreen; picture-in-picture"
                    loading="lazy"
                  />
                </div>

                {/* Chat 버튼 - Terminal Style */}
                <button
                  onClick={() => setIsChatOpen(true)}
                  className="w-full mt-6 px-4 py-3 rounded-lg font-mono transition-all hover:opacity-80 flex items-center justify-center gap-2 shadow-lg"
                  style={{
                    backgroundColor: '#1a1a1a',
                    color: '#00ff00',
                    border: '1px solid #2d2d2d',
                  }}
                >
                  <MessageSquare className="w-5 h-5" />
                  <span className="text-sm">Open Terminal Chat</span>
                </button>
              </div>
            </div>
          ) : (
            <div className="w-full">
              <ChatWidget
                isOpen={isChatOpen}
                onClose={() => setIsChatOpen(false)}
                currentPostContext={selectedPost ? {
                  title: selectedPost.title,
                  content: selectedPost.content,
                } : undefined}
              />
            </div>
          )}
        </div>
      </div>

      {/* Central Dock */}
      <CentralDock
        posts={posts}
        onPostSelect={setSelectedPost}
        selectedPost={selectedPost}
      />
    </main>
  );
}
