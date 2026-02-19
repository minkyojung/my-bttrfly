// import { getGalleryPhotos } from '@/lib/gallery';
import { getAllPosts } from '@/lib/markdown';
// import { GalleryBoard } from '@/components/GalleryBoard';
import { CardDeck } from '@/components/CardDeck';

export default async function Home() {
  const posts = await getAllPosts();

  const postsWithImages = posts.filter(p => p.images && p.images.length > 0);

  return (
    <main style={{
      backgroundColor: 'var(--bg-color)',
      minHeight: '100vh',
      padding: '56px 20px 40px',
    }}>
      {postsWithImages.length > 0 && (
        <section style={{
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          flexWrap: 'wrap',
          gap: '48px',
          padding: '80px 0',
        }}>
          {postsWithImages.map(post => (
            <CardDeck
              key={post.slug}
              images={post.images!}
              title={post.title}
              slug={post.slug}
            />
          ))}
        </section>
      )}
    </main>
  );
}
