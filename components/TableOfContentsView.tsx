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

interface TableOfContentsViewProps {
  initialPosts: Post[];
  initialTags: string[];
}

export function TableOfContentsView({ initialPosts, initialTags }: TableOfContentsViewProps) {
  const [selectedTag, setSelectedTag] = useState<string | null>(null);
  const [filteredPosts, setFilteredPosts] = useState<Post[]>(initialPosts);
  const [selectedPost, setSelectedPost] = useState<Post | null>(
    initialPosts.length > 0 ? initialPosts[0] : null
  );

  // Filter posts when tag selection changes
  useEffect(() => {
    const filtered = selectedTag === null
      ? initialPosts
      : initialPosts.filter(post => post.tags.includes(selectedTag));

    setFilteredPosts(filtered);

    // Reset selected post when filter changes
    if (filtered.length > 0) {
      setSelectedPost(filtered[0]);
    } else {
      setSelectedPost(null);
    }
  }, [selectedTag, initialPosts]);

  const handleTagSelect = (tag: string | null) => {
    setSelectedTag(tag);
  };

  const handlePostSelect = (post: Post) => {
    setSelectedPost(post);
  };

  return (
    <div className="h-full flex flex-col">
      {/* Table of Contents with Tag Filter */}
      <div className="mb-6 pb-6 border-b" style={{ borderColor: 'var(--border-color)' }}>
        <div className="flex items-center justify-between gap-4 mb-3">
          <h2 className="text-lg font-bold" style={{ color: 'var(--text-color)' }}>목차</h2>
          <div className="flex-1">
            <TagFilter
              tags={initialTags}
              selectedTag={selectedTag}
              onTagSelect={handleTagSelect}
            />
          </div>
        </div>
        {filteredPosts.length > 0 ? (
          <div className="space-y-2">
            {filteredPosts.map((post) => (
              <button
                key={post.slug}
                onClick={() => handlePostSelect(post)}
                className={`w-full text-left text-sm transition-opacity ${
                  selectedPost?.slug === post.slug ? 'font-bold' : 'opacity-60 hover:opacity-100'
                }`}
                style={{ color: 'var(--text-color)' }}
              >
                <div className="flex items-baseline gap-2">
                  <span className="flex-1">{post.title}</span>
                  <span className="text-xs opacity-50">
                    {typeof post.date === 'string' ? post.date : new Date(post.date).toLocaleDateString('ko-KR', { month: 'short', day: 'numeric' })}
                  </span>
                </div>
              </button>
            ))}
          </div>
        ) : (
          <p className="text-sm opacity-60" style={{ color: 'var(--text-color)' }}>
            {selectedTag ? `'${selectedTag}' 태그에 해당하는 글이 없습니다.` : '작성된 글이 없습니다.'}
          </p>
        )}
      </div>

      {/* Selected Post Content */}
      <div className="flex-1 overflow-y-auto scrollbar-hide">
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
    </div>
  );
}
