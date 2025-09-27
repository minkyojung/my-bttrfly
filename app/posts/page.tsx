import Link from "next/link";
import { getAllPosts } from "@/lib/markdown";

export default async function PostsIndex() {
  const posts = await getAllPosts();

  return (
    <main className="min-h-screen bg-white pl-12 pr-6 py-12 md:py-20">
      <article className="max-w-2xl">
        <h1 className="text-4xl font-black mb-8">글 목록</h1>
        
        {posts.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-black mb-4">아직 작성된 글이 없습니다.</p>
            <p className="text-sm text-black">
              Obsidian에서 <code className="bg-white border border-black px-1">content/posts</code> 폴더에 
              <br />
              마크다운 파일을 작성해주세요.
            </p>
          </div>
        ) : (
          <div className="space-y-8">
            {posts.map((post) => (
              <div key={post.slug} className="border-b border-black pb-4">
                <Link href={`/posts/${post.slug}`} className="block hover:opacity-60 transition-opacity">
                  <h2 className="text-xl mb-2 font-black">{post.title}</h2>
                  <p className="text-sm text-black mb-2">{typeof post.date === 'string' ? post.date : new Date(post.date).toLocaleDateString('ko-KR')}</p>
                  <p className="text-base">{post.preview}</p>
                </Link>
              </div>
            ))}
          </div>
        )}
        
        <div className="mt-12 pt-8 border-t border-black">
          <Link href="/" className="text-sm underline">← 홈으로</Link>
        </div>
      </article>
    </main>
  );
}