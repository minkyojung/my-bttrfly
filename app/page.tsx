import { getAllPosts } from '@/lib/markdown';
import { PostCarousel } from '@/components/PostCarousel';

export default async function Home() {
  const posts = await getAllPosts();

  // thumbnail 또는 본문 이미지가 있는 포스트만
  const postsWithImages = posts.filter(p => p.thumbnail || (p.images && p.images.length > 0));

  return (
    <main style={{
      backgroundColor: 'var(--bg-color)',
      minHeight: '100vh',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '56px 20px 40px',
    }}>
      {postsWithImages.length > 0 && (
        <PostCarousel
          posts={postsWithImages.map(p => ({
            slug: p.slug,
            title: p.title,
            images: p.images || [],
            thumbnail: p.thumbnail,
            date: p.date,
            readingTime: p.readingTime,
          }))}
        />
      )}
    </main>
  );
}
