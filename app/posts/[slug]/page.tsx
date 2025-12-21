import { notFound } from 'next/navigation';
import { getAllPosts, getPostBySlug } from "@/lib/markdown";
import Link from 'next/link';
import type { Metadata } from 'next';

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
    <main className="min-h-screen" style={{ backgroundColor: 'var(--bg-color)' }}>
      <div className="max-w-3xl mx-auto px-6 py-12">
        {/* 홈으로 돌아가기 링크 */}
        <Link 
          href="/" 
          className="inline-flex items-center mb-8 text-sm hover:opacity-60 transition-opacity"
          style={{ color: 'var(--text-color)' }}
        >
          ← 홈으로 돌아가기
        </Link>

        <article>
          <header className="mb-12">
            <h1 className="text-3xl font-black mb-4" style={{ color: 'var(--text-color)' }}>
              {post.title}
            </h1>
            <div className="flex items-center text-sm" style={{ color: 'var(--text-color)' }}>
              <p className="opacity-80">
                {typeof post.date === 'string' ? post.date : new Date(post.date).toLocaleDateString('ko-KR')} · {post.readingTime}
              </p>
            </div>
          </header>

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
      </div>
    </main>
  );
}