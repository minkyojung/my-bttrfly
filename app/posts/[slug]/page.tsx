import { notFound } from 'next/navigation';
import { getAllPosts, getPostBySlug } from "@/lib/markdown";
import type { Metadata } from 'next';
import { AudioPlayer } from '@/components/AudioPlayer';

export async function generateStaticParams() {
  const posts = await getAllPosts();
  return posts.map((post) => ({
    slug: post.slug,
  }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const post = await getPostBySlug(slug);
  
  if (!post) {
    return {
      title: '포스트를 찾을 수 없습니다',
    };
  }

  return {
    title: post.title,
    description: post.preview,
    openGraph: {
      title: post.title,
      description: post.preview,
      type: 'article',
      publishedTime: post.date,
    },
  };
}

export default async function Post({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const post = await getPostBySlug(slug);

  if (!post) {
    notFound();
  }

  return (
    <>
      <style dangerouslySetInnerHTML={{ __html: `
        .prose img {
          position: relative;
          cursor: help;
        }

        .prose img::after {
          content: attr(alt);
          position: absolute;
          bottom: 100%;
          left: 50%;
          transform: translateX(-50%) translateY(-8px);
          background: rgba(0, 0, 0, 0.9);
          color: #ffffff;
          padding: 8px 12px;
          border-radius: 6px;
          font-size: 13px;
          font-weight: 500;
          white-space: nowrap;
          pointer-events: none;
          opacity: 0;
          transition: opacity 0.2s ease;
          z-index: 100;
          font-family: 'Pretendard', sans-serif;
        }

        .prose img:hover::after {
          opacity: 1;
        }

        .prose img::before {
          content: '';
          position: absolute;
          bottom: 100%;
          left: 50%;
          transform: translateX(-50%) translateY(-2px);
          border: 6px solid transparent;
          border-top-color: rgba(0, 0, 0, 0.9);
          pointer-events: none;
          opacity: 0;
          transition: opacity 0.2s ease;
          z-index: 100;
        }

        .prose img:hover::before {
          opacity: 1;
        }

        .prose mark {
          background-color: rgba(255, 213, 79, 0.3);
          color: #E5E5E5;
          padding: 0.1em 0.3em;
          border-radius: 3px;
        }

        .prose table {
          width: 100%;
          border-collapse: collapse;
          margin: 1.5rem 0;
        }

        .prose th {
          background-color: #2A2A2A;
          color: #E5E5E5;
          font-weight: 600;
          padding: 0.75rem 1rem;
          text-align: left;
          border-bottom: 1px solid #4A4A4A;
        }

        .prose td {
          padding: 0.75rem 1rem;
          border-bottom: 1px solid #3A3A3A;
          color: #939393;
        }

        .prose tr:hover td {
          background-color: rgba(255, 255, 255, 0.02);
        }

        /* Heading with ASCII styles */
        .prose .heading-with-ascii {
          display: flex;
          align-items: stretch;
          gap: 24px;
          margin-top: 2rem;
          margin-bottom: 1rem;
        }

        .prose .heading-with-ascii h1,
        .prose .heading-with-ascii h2,
        .prose .heading-with-ascii h3,
        .prose .heading-with-ascii h4,
        .prose .heading-with-ascii h5,
        .prose .heading-with-ascii h6 {
          margin: 0;
          flex: 1;
          display: flex;
          align-items: center;
        }

        .prose .heading-ascii {
          margin: 0;
          padding: 0;
          background: transparent;
          color: #5A5A5A;
          font-family: 'Monaco', 'Menlo', 'Ubuntu Mono', monospace;
          font-size: 10px;
          line-height: 1.2;
          white-space: pre;
          display: flex;
          align-items: center;
          flex-shrink: 0;
        }

        .prose .heading-ascii-left {
          order: -1;
        }

        .prose .heading-ascii-right {
          order: 1;
        }

        /* Ghost image width variants */
        .prose .kg-image-card,
        .prose .kg-gallery-card {
          margin: 24px auto;
        }

        .prose .kg-image-card img {
          margin-left: auto;
          margin-right: auto;
          border-radius: 8px;
        }

        .prose .kg-width-wide {
          width: calc(100% + 120px);
          max-width: none;
          margin-left: -60px;
          margin-right: -60px;
        }

        .prose .kg-width-wide img {
          border-radius: 10px;
        }

        .prose .kg-width-full {
          width: 100vw;
          max-width: none;
          margin-left: calc(-50vw + 50%);
          margin-right: calc(-50vw + 50%);
          padding: 0 10px;
          box-sizing: border-box;
        }

        .prose .kg-width-wide img,
        .prose .kg-width-full img {
          width: 100%;
        }

        .prose .kg-width-full img {
          border-radius: 12px;
        }
      `}} />
      <main className="min-h-screen" style={{ backgroundColor: 'var(--bg-color)' }}>
        {post.thumbnail && (
          <div style={{
            padding: '10px',
            paddingTop: '10px',
          }}>
            <div style={{
              width: '100%',
              maxHeight: '70vh',
              overflow: 'hidden',
              borderRadius: '12px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}>
              <img
                src={post.thumbnail}
                alt={post.title}
                style={{
                  width: '100%',
                  height: '100%',
                  objectFit: 'cover',
                  display: 'block',
                }}
              />
            </div>
          </div>
        )}

        <div className="max-w-3xl mx-auto px-6 py-12" style={{ paddingTop: post.thumbnail ? '48px' : '64px' }}>
        <article className="flex flex-col items-center">
          <header className="mb-12" style={{ width: '550px' }}>
            <h1 className="text-center" style={{
              color: '#E5E5E5',
              fontFamily: 'Pretendard',
              fontWeight: 700,
              fontSize: '60px',
              lineHeight: '1.2',
              letterSpacing: '-0.05em',
              marginBottom: '16px'
            }}>
              {post.title}
            </h1>

            <div className="flex items-center justify-center text-sm" style={{ color: '#7B7B7B' }}>
              <p>
                {typeof post.date === 'string' ? post.date : new Date(post.date).toLocaleDateString('ko-KR')}
              </p>
            </div>
          </header>

          <div
            dangerouslySetInnerHTML={{ __html: post.htmlContent || '' }}
            className="prose prose-serif max-w-none
              prose-headings:font-black
              prose-h1:text-3xl prose-h1:mb-6 prose-h1:mt-10
              prose-h2:text-2xl prose-h2:mb-4 prose-h2:mt-8
              prose-h3:text-xl prose-h3:mb-3 prose-h3:mt-6
              prose-h4:text-lg prose-h4:mb-2 prose-h4:mt-5
              prose-h5:text-base prose-h5:mb-2 prose-h5:mt-4
              prose-h6:text-sm prose-h6:mb-1 prose-h6:mt-3
              prose-p:mb-2
              prose-blockquote:border-l-2
              prose-blockquote:pl-4 prose-blockquote:italic prose-blockquote:mb-2
              prose-strong:font-bold
              prose-em:italic
              prose-ul:mb-2 prose-ul:list-disc prose-ul:pl-5
              prose-ol:mb-2 prose-ol:list-decimal prose-ol:pl-5
              prose-li:mb-1
              prose-hr:my-8
              prose-img:w-full prose-img:rounded prose-img:my-4
              prose-code:px-1 prose-code:rounded prose-code:text-sm
              prose-pre:rounded prose-pre:p-4 prose-pre:mb-4
              prose-a:underline hover:prose-a:opacity-60"
            style={{
              width: '600px',
              fontSize: '18px',
              lineHeight: '1.7',
              fontWeight: 500,
              textAlign: 'justify',
              '--tw-prose-headings': '#E5E5E5',
              '--tw-prose-body': '#D4D4D4',
              '--tw-prose-bold': '#939393',
              '--tw-prose-quotes': '#939393',
              '--tw-prose-quote-borders': 'var(--profile-border-color)',
              '--tw-prose-links': '#939393',
              '--tw-prose-code': '#939393',
              '--tw-prose-pre-code': '#939393',
              '--tw-prose-pre-bg': 'var(--bg-color)',
              '--tw-prose-borders': 'var(--border-color)',
              '--tw-prose-counters': '#E5E5E5',
              '--tw-prose-bullets': '#E5E5E5',
              '--tw-prose-hr': '#5A5A5A',
              '--tw-prose-th-borders': '#4A4A4A',
              '--tw-prose-td-borders': '#3A3A3A',
              '--tw-prose-captions': '#6A6A6A'
            } as React.CSSProperties}
          />

          {/* Bottom padding for audio player */}
          <div style={{ height: '160px' }} />
        </article>
      </div>

      {/* Fixed Audio Player Widget - Only show if post has audio */}
      {post.audio && (
        <div style={{
          position: 'fixed',
          bottom: '48px',
          left: '50%',
          transform: 'translateX(-50%)',
          zIndex: 1000
        }}>
          <AudioPlayer
            src={post.audio}
            title={post.audioTitle || post.title}
            artist={post.audioArtist || 'William Jung'}
          />
        </div>
      )}
      </main>
    </>
  );
}