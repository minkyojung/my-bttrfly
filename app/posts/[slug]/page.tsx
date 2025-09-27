import { getPostBySlug, getAllPosts } from "@/lib/markdown";
import Link from "next/link";

export async function generateStaticParams() {
  const posts = await getAllPosts();
  return posts.map((post) => ({
    slug: post.slug,
  }));
}

export default async function Post({ params }: { params: Promise<{ slug: string }> }) {
  const resolvedParams = await params;
  const post = await getPostBySlug(resolvedParams.slug);

  if (!post) {
    return (
      <main className="min-h-screen bg-white pl-12 pr-6 py-12 md:py-20">
        <article className="max-w-2xl">
          <h1 className="text-3xl mb-4">포스트를 찾을 수 없습니다</h1>
          <p className="text-black mb-4">
            요청하신 글을 찾을 수 없습니다.
          </p>
          <Link href="/posts" className="underline">← 글 목록으로</Link>
        </article>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-white pl-12 pr-6 py-12 md:py-20">
      <article className="max-w-2xl">
        <h1 className="text-3xl mb-6 font-black">{post.title}</h1>
        <p className="text-sm text-black mb-8">{typeof post.date === 'string' ? post.date : new Date(post.date).toLocaleDateString('ko-KR')}</p>
        
        <div 
          className="prose prose-serif max-w-none
            prose-headings:font-black prose-headings:text-black
            prose-h1:text-2xl prose-h1:mb-4 prose-h1:mt-8
            prose-h2:text-xl prose-h2:mb-3 prose-h2:mt-6
            prose-p:mb-2 prose-p:leading-relaxed
            prose-blockquote:border-l-2 prose-blockquote:border-black 
            prose-blockquote:pl-4 prose-blockquote:italic prose-blockquote:mb-2
            prose-strong:font-bold
            prose-em:italic
            prose-ul:mb-2 prose-ul:list-none
            prose-li:mb-1
            prose-img:w-full prose-img:rounded prose-img:my-4
            prose-code:bg-white prose-code:border prose-code:border-black prose-code:px-1 prose-code:rounded prose-code:text-sm
            prose-pre:bg-white prose-pre:border prose-pre:border-black 
            prose-pre:rounded prose-pre:p-4 prose-pre:mb-4
            prose-a:underline prose-a:text-black hover:prose-a:opacity-60"
          dangerouslySetInnerHTML={{ __html: post.htmlContent || '' }}
        />
        
        <div className="mt-12 pt-8 border-t border-black flex justify-between">
          <Link href="/posts" className="text-sm underline">← 글 목록</Link>
          <Link href="/" className="text-sm underline">홈</Link>
        </div>
      </article>
    </main>
  );
}