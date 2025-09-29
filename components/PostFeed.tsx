'use client';

import { useState, useEffect } from 'react';
import { TagFilter } from './TagFilter';

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

interface PostFeedProps {
  initialPosts: Post[];
  initialTags: string[];
}

export function PostFeed({ initialPosts, initialTags }: PostFeedProps) {
  const [selectedTag, setSelectedTag] = useState<string | null>(null);
  const [filteredPosts, setFilteredPosts] = useState<Post[]>(initialPosts);

  // Filter posts when tag selection changes
  useEffect(() => {
    if (selectedTag === null) {
      setFilteredPosts(initialPosts);
    } else {
      setFilteredPosts(initialPosts.filter(post => 
        post.tags.includes(selectedTag)
      ));
    }
  }, [selectedTag, initialPosts]);

  const handleTagSelect = (tag: string | null) => {
    setSelectedTag(tag);
  };

  return (
    <div className="max-w-2xl">
      {/* 태그 필터 */}
      <div className="mb-8">
        <TagFilter 
          tags={initialTags} 
          selectedTag={selectedTag} 
          onTagSelect={handleTagSelect} 
        />
      </div>
      
      {/* 글 피드 섹션 */}
      {filteredPosts.length > 0 ? (
        <div className="space-y-16">
          {filteredPosts.map((post) => (
            <article 
              key={post.slug} 
              id={`post-${post.slug}`}
              className="border-b pb-16 last:border-b-0 last:pb-0 scroll-mt-6" 
              style={{ borderColor: 'var(--border-color)' }}
            >
              <h2 className="text-2xl font-black mb-4" style={{ color: 'var(--text-color)' }}>{post.title}</h2>
              <div className="flex items-center gap-3 text-sm mb-8" style={{ color: 'var(--text-color)' }}>
                <p className="opacity-80">
                  {typeof post.date === 'string' ? post.date : new Date(post.date).toLocaleDateString('ko-KR')} · {post.readingTime}
                </p>
                <div className="flex gap-1">
                  <button
                    onClick={() => {
                      const url = `${window.location.origin}/posts/${post.slug}`;
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
                    href={`/posts/${post.slug}`}
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
                dangerouslySetInnerHTML={{ __html: post.htmlContent || '' }}
              />
            </article>
          ))}
        </div>
      ) : (
        <div className="text-center py-12">
          <p className="mb-4" style={{ color: 'var(--text-color)' }}>{
            selectedTag ? `'${selectedTag}' 태그에 해당하는 글이 없습니다.` : '아직 작성된 글이 없습니다.'
          }</p>
          {!selectedTag && (
            <p className="text-sm" style={{ color: 'var(--text-color)' }}>
              Obsidian에서 <code className="px-1" style={{ backgroundColor: 'var(--bg-color)', border: '1px solid var(--profile-border-color)', color: 'var(--text-color)' }}>content/posts</code> 폴더에 
              마크다운 파일을 작성해주세요.
            </p>
          )}
        </div>
      )}
    </div>
  );
}