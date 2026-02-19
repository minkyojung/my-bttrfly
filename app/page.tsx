import { getGalleryPhotos } from '@/lib/gallery';
import { GalleryBoard } from '@/components/GalleryBoard';
import { CardDeck } from '@/components/CardDeck';

export default async function Home() {
  const photos = await getGalleryPhotos();

  return (
    <main style={{
      backgroundColor: 'var(--bg-color)',
      minHeight: '100vh',
      padding: '56px 20px 40px',
    }}>
      {/* Card Deck 실험 영역 */}
      <section style={{
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        padding: '80px 0',
      }}>
        <CardDeck />
      </section>

      {photos.length > 0 ? (
        <GalleryBoard photos={photos} />
      ) : (
        <div style={{
          textAlign: 'center',
          color: '#7B7B7B',
          fontFamily: 'Pretendard',
          marginTop: '100px',
        }}>
          <p>No photos yet.</p>
        </div>
      )}
    </main>
  );
}
