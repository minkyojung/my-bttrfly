import { getAllPosts, getAllTags, getPinnedPosts } from "@/lib/markdown";
import { ProfilePhoto } from "@/components/ProfilePhoto";
import { ProfileHistory } from "@/components/ProfileHistory";
import { PinnedPosts } from "@/components/PinnedPosts";
import { PostFeed } from "@/components/PostFeed";
import { ReadingControls } from "@/components/ReadingControls";

export default async function Home() {
  const [posts, allTags, pinnedPosts] = await Promise.all([
    getAllPosts(),
    getAllTags(),
    getPinnedPosts()
  ]);
  
  return (
    <main className="min-h-screen" style={{ backgroundColor: 'var(--bg-color)' }}>
      <div className="flex flex-col lg:flex-row h-screen">
        {/* 데스크탑: 좌측 50% / 모바일: 하단 - 글 피드 */}
        <div className="w-full lg:w-1/2 pl-6 lg:pl-12 pr-6 lg:pr-8 py-6 lg:py-12 overflow-y-auto order-2 lg:order-1 scrollbar-hide">
          <PostFeed initialPosts={posts} initialTags={allTags} />
        </div>
        
        {/* 데스크탑: 우측 50% / 모바일: 상단 - 프로필 */}
        <div className="w-full lg:w-1/2 p-6 lg:p-12 border-b lg:border-b-0 lg:border-l order-1 lg:order-2 flex items-center justify-center" style={{ borderColor: 'var(--border-color)' }}>
          <div className="w-full max-w-sm">
            {/* 프로필 사진 */}
            <ProfilePhoto />
            
            {/* 인사말 */}
            <h1 className="text-2xl lg:text-3xl font-black mb-2 text-center" style={{ color: 'var(--text-color)' }}>정민교</h1>
            <p className="mb-1 text-base leading-normal text-center" style={{ color: 'var(--text-color)' }}>
              작동원리를 탐구하고 생각을 다듬어갑니다.
            </p>
            <p className="text-sm text-center mb-10 opacity-60">
              <a href="mailto:williamjung0130@gmail.com" className="underline hover:opacity-100" style={{ color: 'var(--text-color)' }}>
                williamjung0130@gmail.com
              </a>
            </p>
            
            {/* 고정된 글 */}
            <PinnedPosts posts={pinnedPosts} />
            
            {/* 이력 */}
            <ProfileHistory />
            
            {/* Spotify */}
            <div className="mt-10">
              <iframe 
                data-testid="embed-iframe" 
                style={{borderRadius: '0'}} 
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
      
      {/* 읽기 컨트롤 */}
      <ReadingControls />
    </main>
  );
}