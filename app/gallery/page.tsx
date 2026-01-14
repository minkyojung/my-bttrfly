import { getGalleryPhotos } from '@/lib/gallery';
import { GalleryBoard } from '@/components/GalleryBoard';
import Link from 'next/link';

export const metadata = {
  title: 'Gallery',
  description: 'Photo gallery'
};

export default async function GalleryPage() {
  const photos = await getGalleryPhotos();

  return (
    <main style={{
      backgroundColor: 'var(--bg-color)',
      minHeight: '100vh',
      padding: '40px 20px'
    }}>
      {/* 헤더 */}
      <header style={{
        maxWidth: '1200px',
        margin: '0 auto 40px',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center'
      }}>
        <Link
          href="/"
          style={{
            color: '#7B7B7B',
            fontFamily: 'Pretendard',
            fontWeight: 500,
            fontSize: '14px',
            textDecoration: 'none'
          }}
        >
          ← Back
        </Link>
        <h1 style={{
          color: '#ffffff',
          fontFamily: 'Pretendard',
          fontWeight: 700,
          fontSize: '24px',
          letterSpacing: '-0.05em'
        }}>
          Gallery
        </h1>
        <span style={{
          color: '#7B7B7B',
          fontFamily: 'Pretendard',
          fontWeight: 500,
          fontSize: '14px'
        }}>
          {photos.length} photos
        </span>
      </header>

      {/* 갤러리 보드 */}
      {photos.length > 0 ? (
        <GalleryBoard photos={photos} />
      ) : (
        <div style={{
          textAlign: 'center',
          color: '#7B7B7B',
          fontFamily: 'Pretendard',
          marginTop: '100px'
        }}>
          <p>No photos yet.</p>
          <p style={{ fontSize: '14px', marginTop: '8px' }}>
            Add images to <code style={{ backgroundColor: 'rgba(255,255,255,0.1)', padding: '2px 6px', borderRadius: '4px' }}>public/images/gallery/</code>
          </p>
        </div>
      )}
    </main>
  );
}
