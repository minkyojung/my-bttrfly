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
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-7xl mx-auto">
        <h1 className="text-4xl font-bold mb-8">뉴스 큐레이션 대시보드</h1>

        {/* 통계 카드 */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="bg-white p-6 rounded-lg shadow">
            <h3 className="text-sm font-medium text-gray-500">전체 기사</h3>
            <p className="text-3xl font-bold mt-2">{totalArticles || 0}</p>
          </div>
          <div className="bg-white p-6 rounded-lg shadow">
            <h3 className="text-sm font-medium text-gray-500">분류 완료</h3>
            <p className="text-3xl font-bold mt-2">{classifiedArticles || 0}</p>
          </div>
          <div className="bg-white p-6 rounded-lg shadow">
            <h3 className="text-sm font-medium text-gray-500">인스타그램 포스트</h3>
            <p className="text-3xl font-bold mt-2">{instagramPostsCount || 0}</p>
          </div>
        </div>

        {/* 최근 기사 */}
        <div className="bg-white rounded-lg shadow mb-8">
          <div className="p-6 border-b border-gray-200">
            <h2 className="text-2xl font-semibold">최근 기사</h2>
          </div>
          <div className="divide-y divide-gray-200">
            {articles?.map((article) => (
              <div key={article.id} className="p-6 hover:bg-gray-50">
                <div className="flex justify-between items-start">
                  <div className="flex-1">
                    <h3 className="text-lg font-medium text-gray-900">
                      <a
                        href={article.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="hover:text-blue-600"
                      >
                        {article.title}
                      </a>
                    </h3>
                    <div className="mt-2 flex items-center gap-4 text-sm text-gray-500">
                      <span className="font-medium">{article.source}</span>
                      <span>{article.author}</span>
                      <span>
                        {article.published_at &&
                          new Date(article.published_at).toLocaleDateString('ko-KR')}
                      </span>
                    </div>
                    {article.category && (
                      <div className="mt-2 flex items-center gap-2">
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                          {article.category}
                        </span>
                        {article.subcategory && (
                          <span className="text-sm text-gray-500">
                            {article.subcategory}
                          </span>
                        )}
                        {article.relevance_score && (
                          <span className="text-sm text-gray-500">
                            Score: {article.relevance_score}/10
                          </span>
                        )}
                      </div>
                    )}
                  </div>
                  <span
                    className={`ml-4 px-2.5 py-0.5 rounded-full text-xs font-medium ${
                      article.status === 'pending'
                        ? 'bg-yellow-100 text-yellow-800'
                        : article.status === 'classified'
                        ? 'bg-green-100 text-green-800'
                        : 'bg-gray-100 text-gray-800'
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
        <div className="bg-white rounded-lg shadow">
          <div className="p-6 border-b border-gray-200">
            <h2 className="text-2xl font-semibold">인스타그램 포스트</h2>
          </div>
          <div className="divide-y divide-gray-200">
            {instagramPosts?.map((post: any) => (
              <div key={post.id} className="p-6">
                <div className="flex gap-4">
                  {post.image_url && (
                    <img
                      src={post.image_url}
                      alt={post.alt_text}
                      className="w-24 h-24 object-cover rounded"
                    />
                  )}
                  <div className="flex-1">
                    <h3 className="font-medium text-gray-900">{post.title}</h3>
                    <p className="mt-1 text-sm text-gray-600">{post.caption}</p>
                    <div className="mt-2 flex flex-wrap gap-1">
                      {post.hashtags?.slice(0, 5).map((tag: string) => (
                        <span
                          key={tag}
                          className="text-xs text-blue-600 hover:text-blue-800"
                        >
                          {tag}
                        </span>
                      ))}
                    </div>
                    <div className="mt-2 text-xs text-gray-500">
                      Source: {post.article?.title}
                    </div>
                  </div>
                  <span
                    className={`px-2.5 py-0.5 h-fit rounded-full text-xs font-medium ${
                      post.status === 'draft'
                        ? 'bg-yellow-100 text-yellow-800'
                        : post.status === 'scheduled'
                        ? 'bg-blue-100 text-blue-800'
                        : 'bg-green-100 text-green-800'
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
