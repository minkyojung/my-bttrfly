import { supabase } from '@/lib/db/supabase';

export const dynamic = 'force-dynamic';

export default async function DashboardPage() {
  // 최근 기사 가져오기
  const { data: articles } = await supabase
    .from('articles')
    .select('*')
    .order('created_at', { ascending: false })
    .limit(20);

  // 인스타그램 포스트 가져오기
  const { data: instagramPosts } = await supabase
    .from('instagram_posts')
    .select(`
      *,
      article:articles(title, url, category)
    `)
    .order('created_at', { ascending: false })
    .limit(10);

  // 통계
  const { count: totalArticles } = await supabase
    .from('articles')
    .select('*', { count: 'exact', head: true });

  const { count: classifiedArticles } = await supabase
    .from('articles')
    .select('*', { count: 'exact', head: true })
    .eq('status', 'classified');

  const { count: instagramPostsCount } = await supabase
    .from('instagram_posts')
    .select('*', { count: 'exact', head: true });

  return (
    <div className="min-h-screen bg-zinc-950 p-8 pb-24">
      <div className="max-w-7xl mx-auto">
        <h1 className="text-3xl font-bold mb-8 text-white">뉴스 큐레이션 대시보드</h1>

        {/* 통계 카드 */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
          <div className="bg-zinc-900 p-6 rounded-md border border-zinc-800">
            <h3 className="text-sm font-medium text-zinc-500">전체 기사</h3>
            <p className="text-3xl font-bold mt-2 text-white">{totalArticles || 0}</p>
          </div>
          <div className="bg-zinc-900 p-6 rounded-md border border-zinc-800">
            <h3 className="text-sm font-medium text-zinc-500">분류 완료</h3>
            <p className="text-3xl font-bold mt-2 text-white">{classifiedArticles || 0}</p>
          </div>
          <div className="bg-zinc-900 p-6 rounded-md border border-zinc-800">
            <h3 className="text-sm font-medium text-zinc-500">인스타그램 포스트</h3>
            <p className="text-3xl font-bold mt-2 text-white">{instagramPostsCount || 0}</p>
          </div>
        </div>

        {/* 최근 기사 */}
        <div className="bg-zinc-900 rounded-md border border-zinc-800 mb-8">
          <div className="p-6 border-b border-zinc-800">
            <h2 className="text-xl font-semibold text-white">최근 기사</h2>
          </div>
          <div className="divide-y divide-zinc-800">
            {articles?.map((article) => (
              <div key={article.id} className="p-6 hover:bg-zinc-800/50 transition-colors">
                <div className="flex justify-between items-start">
                  <div className="flex-1">
                    <h3 className="text-lg font-medium text-zinc-100">
                      <a
                        href={article.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="hover:text-zinc-300"
                      >
                        {article.title}
                      </a>
                    </h3>
                    <div className="mt-2 flex items-center gap-4 text-sm text-zinc-500">
                      <span className="font-medium">{article.source}</span>
                      <span>{article.author}</span>
                      <span>
                        {article.published_at &&
                          new Date(article.published_at).toLocaleDateString('ko-KR')}
                      </span>
                    </div>
                    {article.category && (
                      <div className="mt-2 flex items-center gap-2">
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-md text-xs font-medium bg-zinc-800 text-zinc-300">
                          {article.category}
                        </span>
                        {article.subcategory && (
                          <span className="text-sm text-zinc-500">
                            {article.subcategory}
                          </span>
                        )}
                        {article.relevance_score && (
                          <span className="text-sm text-zinc-500">
                            Score: {article.relevance_score}/10
                          </span>
                        )}
                      </div>
                    )}
                  </div>
                  <span
                    className={`ml-4 px-2.5 py-0.5 rounded-md text-xs font-medium ${
                      article.status === 'pending'
                        ? 'bg-yellow-900/50 text-yellow-300'
                        : article.status === 'classified'
                        ? 'bg-green-900/50 text-green-300'
                        : 'bg-zinc-800 text-zinc-400'
                    }`}
                  >
                    {article.status}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* 인스타그램 포스트 */}
        <div className="bg-zinc-900 rounded-md border border-zinc-800">
          <div className="p-6 border-b border-zinc-800">
            <h2 className="text-xl font-semibold text-white">인스타그램 포스트</h2>
          </div>
          <div className="divide-y divide-zinc-800">
            {instagramPosts?.map((post: any) => (
              <div key={post.id} className="p-6">
                <div className="flex gap-4">
                  {post.image_url && (
                    <img
                      src={post.image_url}
                      alt={post.alt_text}
                      className="w-24 h-24 object-cover rounded-md"
                    />
                  )}
                  <div className="flex-1">
                    <h3 className="font-medium text-zinc-100">{post.title}</h3>
                    <p className="mt-1 text-sm text-zinc-400">{post.caption}</p>
                    <div className="mt-2 flex flex-wrap gap-1">
                      {post.hashtags?.slice(0, 5).map((tag: string) => (
                        <span
                          key={tag}
                          className="text-xs text-zinc-500"
                        >
                          {tag}
                        </span>
                      ))}
                    </div>
                    <div className="mt-2 text-xs text-zinc-600">
                      Source: {post.article?.title}
                    </div>
                  </div>
                  <span
                    className={`px-2.5 py-0.5 h-fit rounded-md text-xs font-medium ${
                      post.status === 'draft'
                        ? 'bg-yellow-900/50 text-yellow-300'
                        : post.status === 'scheduled'
                        ? 'bg-blue-900/50 text-blue-300'
                        : 'bg-green-900/50 text-green-300'
                    }`}
                  >
                    {post.status}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
