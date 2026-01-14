'use client';

import { useState } from 'react';
import { useCursor } from './cursor';

interface Photo {
  src: string;
  alt: string;
  filename: string;
}

interface GalleryBoardProps {
  photos: Photo[];
}

export function GalleryBoard({ photos }: GalleryBoardProps) {
  const [selectedPhoto, setSelectedPhoto] = useState<Photo | null>(null);
  const { setTarget } = useCursor();

  const handleMouseEnter = (e: React.MouseEvent<HTMLDivElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    setTarget(rect);
  };

  const handleMouseLeave = () => {
    setTarget(null);
  };

  return (
    <>
      {/* Masonry Grid */}
      <div
        style={{
          maxWidth: '1200px',
          margin: '0 auto',
          columnCount: 3,
          columnGap: '16px'
        }}
        className="gallery-masonry"
      >
        {photos.map((photo) => (
          <div
            key={photo.filename}
            onClick={() => setSelectedPhoto(photo)}
            onMouseEnter={handleMouseEnter}
            onMouseLeave={handleMouseLeave}
            style={{
              breakInside: 'avoid',
              marginBottom: '16px',
              cursor: 'none',
              borderRadius: '12px',
              overflow: 'hidden',
              backgroundColor: 'rgba(255,255,255,0.05)',
              transition: 'transform 0.2s, box-shadow 0.2s'
            }}
            className="gallery-item"
          >
            <img
              src={photo.src}
              alt={photo.alt}
              style={{
                width: '100%',
                height: 'auto',
                display: 'block'
              }}
              loading="lazy"
            />
          </div>
        ))}
      </div>

      {/* Lightbox Modal */}
      {selectedPhoto && (
        <div
          onClick={() => setSelectedPhoto(null)}
          style={{
            position: 'fixed',
            inset: 0,
            backgroundColor: 'rgba(0,0,0,0.9)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 1000,
            cursor: 'zoom-out',
            padding: '40px'
          }}
        >
          <div
            onClick={(e) => e.stopPropagation()}
            style={{
              maxWidth: '90vw',
              maxHeight: '90vh',
              position: 'relative'
            }}
          >
            <img
              src={selectedPhoto.src}
              alt={selectedPhoto.alt}
              style={{
                maxWidth: '100%',
                maxHeight: '85vh',
                objectFit: 'contain',
                borderRadius: '8px'
              }}
            />
            <p style={{
              color: '#ffffff',
              fontFamily: 'Pretendard',
              fontWeight: 500,
              fontSize: '14px',
              textAlign: 'center',
              marginTop: '16px'
            }}>
              {selectedPhoto.alt}
            </p>
          </div>

          {/* Close button */}
          <button
            onClick={() => setSelectedPhoto(null)}
            style={{
              position: 'absolute',
              top: '20px',
              right: '20px',
              background: 'none',
              border: 'none',
              color: '#ffffff',
              fontSize: '24px',
              cursor: 'pointer',
              padding: '8px'
            }}
          >
            ✕
          </button>
        </div>
      )}

      {/* Responsive styles */}
      <style jsx global>{`
        .gallery-masonry {
          column-count: 3;
        }

        @media (max-width: 900px) {
          .gallery-masonry {
            column-count: 2;
          }
        }

        @media (max-width: 600px) {
          .gallery-masonry {
            column-count: 1;
          }
        }

        .gallery-item:hover {
          transform: scale(1.02);
          box-shadow: 0 8px 32px rgba(0,0,0,0.3);
        }
      `}</style>
    </>
  );
}
