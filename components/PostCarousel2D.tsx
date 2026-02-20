'use client';

import { useCallback, useState } from 'react';
import { useRouter } from 'next/navigation';
import { CardDeck } from './CardDeck';
import { CarouselInfoPanel } from './CarouselInfoPanel';
import { useCarouselScroll } from '@/hooks/useCarouselScroll';
import type { CarouselPostRequired } from '@/lib/types';

interface PostCarousel2DProps {
  posts: CarouselPostRequired[];
}

const CARD_SLOT_HEIGHT = 340; // CardDeck height (310) + gap (30)

function getSlotCount(total: number): number {
  const minSlots = Math.ceil(1200 / CARD_SLOT_HEIGHT) + 2;
  if (total >= minSlots) return total;
  return Math.ceil(minSlots / total) * total;
}

export function PostCarousel2D({ posts }: PostCarousel2DProps) {
  const router = useRouter();
  const total = posts.length;
  const slotCount = getSlotCount(total);

  const [centerIndex, setCenterIndex] = useState(0);
  const [hoveredPostIndex, setHoveredPostIndex] = useState<number | null>(null);

  const onCenterChange = useCallback((slotIndex: number) => {
    const newCenter = slotIndex % total;
    setCenterIndex(prev => prev !== newCenter ? newCenter : prev);
  }, [total]);

  const { containerRef, setCardRef, slowDown, speedUp, drag } = useCarouselScroll({
    slotCount,
    slotHeight: CARD_SLOT_HEIGHT,
    onCenterChange,
  });

  if (total === 0) return null;

  const displayIndex = hoveredPostIndex !== null ? hoveredPostIndex : centerIndex;
  const displayPost = posts[displayIndex];

  return (
    <div
      style={{
        position: 'relative',
        width: '100%',
        height: '100vh',
        display: 'flex',
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        overflow: 'hidden',
        userSelect: 'none',
      }}
    >
      {/* Left: 2D vertical scrolling carousel */}
      <div
        ref={containerRef}
        style={{
          position: 'relative',
          width: '50%',
          height: '100%',
          overflow: 'hidden',
          cursor: 'grab',
        }}
        onMouseEnter={slowDown}
        onMouseLeave={speedUp}
        onPointerDown={drag.onPointerDown}
      >
        {Array.from({ length: slotCount }, (_, slot) => {
          const post = posts[slot % total];
          return (
            <div
              key={`${post.slug}-${slot}`}
              ref={(el) => setCardRef(slot, el)}
              style={{
                position: 'absolute',
                left: '50%',
                top: 0,
                transform: 'translateY(0px)',
                marginLeft: '-195px',
                willChange: 'transform',
                cursor: 'pointer',
              }}
              onClick={() => {
                if (drag.didDrag()) return;
                router.push(`/posts/${post.slug}`);
              }}
            >
              <CardDeck
                images={post.images}
                title={post.title}
                slug={post.slug}
                thumbnail={post.thumbnail}
                isActive={true}
                showTitle={false}
                onHoverChange={(hovered) => {
                  setHoveredPostIndex(hovered ? (slot % total) : null);
                }}
              />
            </div>
          );
        })}
      </div>

      <CarouselInfoPanel
        post={displayPost}
        displayKey={displayIndex}
        onTitleClick={() => router.push(`/posts/${displayPost.slug}`)}
      />
    </div>
  );
}
