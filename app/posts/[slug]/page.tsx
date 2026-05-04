import { notFound } from 'next/navigation';
import { getAllPosts, getPostBySlug } from '@/lib/markdown';
import { formatDate } from '@/lib/utils';
import type { Metadata } from 'next';

export async function generateStaticParams() {
  const posts = await getAllPosts();
  return posts.map((post) => ({ slug: post.slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const post = await getPostBySlug(slug);
  if (!post) return { title: 'Not found' };

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

  if (!post) notFound();

  return (
    <main className="min-h-screen" style={{ backgroundColor: 'var(--bg-color)' }}>
      {post.thumbnail && (
        <div style={{ padding: '10px' }}>
          <div
            style={{
              width: '100%',
              maxHeight: '70vh',
              overflow: 'hidden',
              borderRadius: '12px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <img
              src={post.thumbnail}
              alt={post.title}
              style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }}
            />
          </div>
        </div>
      )}

      <div
        className="max-w-3xl mx-auto px-6 py-12"
        style={{ paddingTop: post.thumbnail ? '48px' : '64px' }}
      >
        <article className="flex flex-col items-center">
          <header className="mb-12" style={{ width: '100%', maxWidth: '600px' }}>
            <h1
              className="text-center"
              style={{
                color: '#E5E5E5',
                fontFamily: 'Pretendard',
                fontWeight: 700,
                fontSize: '60px',
                lineHeight: '1.2',
                letterSpacing: '-0.05em',
                marginBottom: '16px',
              }}
            >
              {post.title}
            </h1>
            <div className="flex items-center justify-center text-sm" style={{ color: '#7B7B7B' }}>
              <p>{formatDate(post.date)}</p>
            </div>
          </header>

          <div
            dangerouslySetInnerHTML={{ __html: post.htmlContent }}
            className="prose prose-serif max-w-none
              prose-headings:font-black
              prose-h1:text-3xl prose-h1:mb-6 prose-h1:mt-10
              prose-h2:text-2xl prose-h2:mb-4 prose-h2:mt-8
              prose-h3:text-xl prose-h3:mb-3 prose-h3:mt-6
              prose-p:mb-2
              prose-blockquote:border-l-2 prose-blockquote:pl-4 prose-blockquote:italic prose-blockquote:mb-2
              prose-ul:mb-2 prose-ul:list-disc prose-ul:pl-5
              prose-ol:mb-2 prose-ol:list-decimal prose-ol:pl-5
              prose-li:mb-1
              prose-hr:my-8
              prose-img:w-full prose-img:rounded prose-img:my-4
              prose-code:px-1 prose-code:rounded prose-code:text-sm
              prose-pre:rounded prose-pre:p-4 prose-pre:mb-4
              prose-a:underline hover:prose-a:opacity-60"
            style={
              {
                width: '100%',
                maxWidth: '600px',
                fontSize: '18px',
                lineHeight: '1.7',
                fontWeight: 500,
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
              } as React.CSSProperties
            }
          />
        </article>
      </div>
    </main>
  );
}
