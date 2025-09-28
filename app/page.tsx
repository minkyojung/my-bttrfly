import { getAllPosts, getAllTags } from "@/lib/markdown";
import { ProfilePhoto } from "@/components/ProfilePhoto";
import { PostFeed } from "@/components/PostFeed";

export default async function Home() {
  const [posts, allTags] = await Promise.all([
    getAllPosts(),
    getAllTags()
  ]);
  
  return (
    <main className="min-h-screen" style={{ backgroundColor: 'var(--bg-color)' }}>
      <div className="flex flex-col lg:flex-row h-screen">
        {/* 데스크탑: 좌측 50% / 모바일: 하단 - 글 피드 */}
        <div className="w-full lg:w-1/2 pl-6 lg:pl-12 pr-6 lg:pr-8 py-6 lg:py-12 overflow-y-auto order-2 lg:order-1 scrollbar-hide">
          <PostFeed initialPosts={posts} initialTags={allTags} />
        </div>
        
        {/* 데스크탑: 우측 50% / 모바일: 상단 - 프로필 */}
        <div className="w-full lg:w-1/2 p-6 lg:p-12 border-b lg:border-b-0 lg:border-l order-1 lg:order-2 lg:overflow-hidden" style={{ borderColor: 'var(--border-color)' }}>
          <div className="flex items-center justify-center h-full min-h-[400px] lg:min-h-full">
            <div className="text-center w-full max-w-sm">
              {/* 프로필 사진 */}
              <ProfilePhoto />
              
              {/* 인사말 */}
              <h1 className="text-xl lg:text-2xl font-black mb-2 lg:mb-3" style={{ color: 'var(--text-color)' }}>정민교</h1>
              <p className="mb-4 lg:mb-5 text-sm lg:text-base leading-normal" style={{ color: 'var(--text-color)' }}>
                작동원리를 탐구하고 생각을 다듬어갑니다.
              </p>
              
              {/* 연락처 */}
              <div className="space-y-3 lg:space-y-4">
                <p className="text-sm">
                  <a href="mailto:williamjung0130@gmail.com" className="underline hover:opacity-60" style={{ color: 'var(--text-color)' }}>
                    williamjung0130@gmail.com
                  </a>
                </p>
                
                {/* Spotify */}
                <div className="w-full">
                  <iframe 
                    data-testid="embed-iframe" 
                    style={{borderRadius: '12px'}} 
                    src="https://open.spotify.com/embed/playlist/1vayy3M7MvOEcPcatjq24l?utm_source=generator&theme=0" 
                    width="100%" 
                    height="152" 
                    frameBorder="0" 
                    allowFullScreen={true}
                    allow="autoplay; clipboard-write; encrypted-media; fullscreen; picture-in-picture" 
                    loading="lazy"
                  />
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}