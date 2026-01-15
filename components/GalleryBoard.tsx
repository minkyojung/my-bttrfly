'use client';

import { useState } from 'react';
import { useCursor } from './cursor';

interface PhotoMetadata {
  date?: string;
  location?: string;
  camera?: string;
  description?: string;
}

interface Photo {
  src: string;
  alt: string;
  filename: string;
  metadata?: PhotoMetadata;
}

interface GalleryBoardProps {
  photos: Photo[];
}

export function GalleryBoard({ photos }: GalleryBoardProps) {
  const [hoveredPhoto, setHoveredPhoto] = useState<string | null>(null);
  const { setTarget } = useCursor();

  const handleMouseEnter = (e: React.MouseEvent<HTMLDivElement>, filename: string) => {
    const rect = e.currentTarget.getBoundingClientRect();
    setTarget(rect);
    setHoveredPhoto(filename);
  };

  const handleMouseLeave = () => {
    setTarget(null);
    setHoveredPhoto(null);
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
            onMouseEnter={(e) => handleMouseEnter(e, photo.filename)}
            onMouseLeave={handleMouseLeave}
            style={{
              breakInside: 'avoid',
              marginBottom: '16px',
              cursor: 'none',
              borderRadius: '12px',
              overflow: 'hidden',
              backgroundColor: 'rgba(255,255,255,0.05)',
              transition: 'transform 0.2s, box-shadow 0.2s',
              position: 'relative'
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

            {/* Metadata Overlay */}
            {hoveredPhoto === photo.filename && photo.metadata && (
              <div
                style={{
                  position: 'absolute',
                  bottom: 0,
                  left: 0,
                  right: 0,
                  background: 'linear-gradient(transparent, rgba(0,0,0,0.8))',
                  padding: '24px 16px 16px',
                  color: '#ffffff',
                  fontFamily: 'Pretendard',
                  pointerEvents: 'none'
                }}
              >
                {photo.metadata.description && (
                  <p style={{
                    fontSize: '14px',
                    fontWeight: 500,
                    marginBottom: '8px',
                    lineHeight: 1.4
                  }}>
                    {photo.metadata.description}
                  </p>
                )}
                <div style={{
                  display: 'flex',
                  flexWrap: 'wrap',
                  gap: '12px',
                  fontSize: '12px',
                  opacity: 0.8
                }}>
                  {photo.metadata.date && (
                    <span>{photo.metadata.date}</span>
                  )}
                  {photo.metadata.location && (
                    <span>{photo.metadata.location}</span>
                  )}
                  {photo.metadata.camera && (
                    <span>{photo.metadata.camera}</span>
                  )}
                </div>
              </div>
            )}
          </div>
        ))}
      </div>

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
