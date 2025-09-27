import { getAllPosts } from "@/lib/markdown";
import Image from "next/image";

export default async function Home() {
  const posts = await getAllPosts();
  
  return (
    <main className="min-h-screen bg-white">
      <div className="flex flex-col lg:flex-row h-screen">
        {/* 데스크탑: 좌측 50% / 모바일: 하단 - 글 피드 */}
        <div className="w-full lg:w-1/2 pl-6 lg:pl-12 pr-6 lg:pr-8 py-6 lg:py-12 overflow-y-auto order-2 lg:order-1 scrollbar-hide">
          <div className="max-w-2xl">
            {/* 글 피드 섹션 */}
            {posts.length > 0 ? (
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
            ) : (
              <div className="text-center py-12">
                <p className="text-black mb-4">아직 작성된 글이 없습니다.</p>
                <p className="text-sm text-black">
                  Obsidian에서 <code className="bg-white border border-black px-1">content/posts</code> 폴더에 
                  마크다운 파일을 작성해주세요.
                </p>
              </div>
            )}
          </div>
        </div>
        
        {/* 데스크탑: 우측 50% / 모바일: 상단 - 프로필 */}
        <div className="w-full lg:w-1/2 p-6 lg:p-12 border-b lg:border-b-0 lg:border-l border-gray-200 order-1 lg:order-2 lg:overflow-hidden">
          <div className="flex items-center justify-center h-full min-h-[400px] lg:min-h-full">
            <div className="text-center">
              {/* 프로필 사진 */}
              <div className="w-16 h-16 lg:w-20 lg:h-20 mx-auto mb-3 lg:mb-4 relative">
                <Image
                  src="/images/profile.png"
                  alt="Profile"
                  fill
                  className="object-cover border-2 border-black"
                  sizes="(max-width: 1024px) 64px, 80px"
                />
              </div>
              
              {/* 인사말 */}
              <h1 className="text-xl lg:text-2xl font-black mb-2 lg:mb-3">정민교</h1>
              <p className="mb-4 lg:mb-5 text-black text-sm lg:text-base leading-normal">
                작동원리를 탐구하고 생각을 다듬어갑니다.
              </p>
              
              {/* 연락처 */}
              <div className="space-y-1 lg:space-y-2">
                <p className="text-sm">
                  <a href="mailto:hello@minkyojung.com" className="underline hover:opacity-60">
                    hello@minkyojung.com
                  </a>
                </p>
                <p className="text-xs text-black">
                  © 2024 · Seoul / NYC
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}