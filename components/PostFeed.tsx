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
            <article key={post.slug} className="border-b pb-16 last:border-b-0 last:pb-0" style={{ borderColor: 'var(--border-color)' }}>
              <h2 className="text-2xl font-black mb-4" style={{ color: 'var(--text-color)' }}>{post.title}</h2>
              <p className="text-sm mb-8" style={{ color: 'var(--text-color)' }}>
                {typeof post.date === 'string' ? post.date : new Date(post.date).toLocaleDateString('ko-KR')} · {post.readingTime}
              </p>
              
              <div 
                className="prose prose-serif max-w-none
                  prose-headings:font-black 
                  prose-h1:text-2xl prose-h1:mb-4 prose-h1:mt-8
                  prose-h2:text-xl prose-h2:mb-3 prose-h2:mt-6
                  prose-p:mb-2 prose-p:leading-relaxed
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