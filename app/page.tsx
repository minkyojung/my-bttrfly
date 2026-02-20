import { getAllPosts } from '@/lib/markdown';
import { PostCarousel2D as PostCarousel } from '@/components/PostCarousel2D';

export default async function Home() {
  const posts = await getAllPosts();

  // thumbnail 또는 본문 이미지가 있는 포스트만
  const postsWithImages = posts.filter(p => p.thumbnail || (p.images && p.images.length > 0));

  return (
    <main style={{
      backgroundColor: 'var(--bg-color)',
      height: '100vh',
      overflow: 'hidden',
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
            preview: p.preview,
          }))}
        />
      )}
    </main>
  );
}
