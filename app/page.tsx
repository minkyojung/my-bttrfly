import { getAllPosts } from '@/lib/markdown';
import { ProfileSection } from '@/components/ProfileSection/ProfileSection';
import { PostList } from '@/components/PostList';

export default async function Home() {
  const posts = await getAllPosts();

  return (
    <main
      style={{
        backgroundColor: 'var(--bg-color)',
        minHeight: '100vh',
        paddingTop: '64px',
        paddingBottom: '96px',
      }}
    >
      <div
        style={{
          width: '100%',
          maxWidth: '600px',
          margin: '0 auto',
          padding: '0 24px',
        }}
      >
        <ProfileSection />

        {posts.length > 0 && (
          <section style={{ marginTop: '64px' }}>
            <h2
              style={{
                color: 'rgba(255,255,255,0.4)',
                fontFamily: "'Pretendard', sans-serif",
                fontSize: '12px',
                fontWeight: 500,
                letterSpacing: '0.08em',
                textTransform: 'uppercase',
                marginBottom: '16px',
              }}
            >
              Writing
            </h2>
            <PostList posts={posts} />
          </section>
        )}
      </div>
    </main>
  );
}
