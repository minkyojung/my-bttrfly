import { getAllPosts, getIntro } from "@/lib/markdown";

export default async function Home() {
  const posts = await getAllPosts();
  const intro = await getIntro();
  
  return (
    <main className="min-h-screen bg-white pl-12 pr-6 py-12 md:py-20">
      <article className="max-w-2xl">
        {/* 소개글 섹션 - 마크다운에서 가져오기 */}
        {intro ? (
          <div 
            className="prose prose-serif max-w-none mb-16
              prose-headings:font-black prose-headings:text-black
              prose-h1:text-5xl prose-h1:tracking-tight prose-h1:mb-12
              prose-h2:text-2xl prose-h2:mb-4 prose-h2:mt-12
              prose-p:mb-2 prose-p:leading-relaxed
              prose-blockquote:border-l-2 prose-blockquote:border-black 
              prose-blockquote:pl-4 prose-blockquote:italic prose-blockquote:mb-2
              prose-strong:font-bold
              prose-em:italic
              prose-ul:mb-2 prose-ul:list-none
              prose-li:mb-1
              prose-a:underline prose-a:text-black hover:prose-a:opacity-60"
            dangerouslySetInnerHTML={{ __html: intro.htmlContent }}
          />
        ) : (
          // 폴백 콘텐츠
          <div>
            <h1 className="text-5xl font-black tracking-tight mb-12">
              어디에도 없는 곳
            </h1>
            <p className="mb-2">
              소개글을 불러올 수 없습니다. content/intro.md 파일을 확인해주세요.
            </p>
          </div>
        )}

        {/* 글 피드 섹션 */}
        {posts.length > 0 && (
          <div className="mt-16 pt-8 border-t border-black">
            <div className="space-y-16">
              {posts.map((post) => (
                <article key={post.slug} className="border-b border-gray-200 pb-16 last:border-b-0 last:pb-0">
                  <h2 className="text-2xl font-black mb-4">{post.title}</h2>
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
                </article>
              ))}
            </div>
          </div>
        )}

        {/* 푸터 */}
        <div className="mt-16 pt-8 border-t border-black">
          <p className="text-sm">
            <a href="mailto:hello@example.com" className="underline">hello@example.com</a>
          </p>
          <p className="text-xs mt-2 text-black">
            © 2024 · Seoul / NYC
          </p>
        </div>
      </article>
    </main>
  );
}