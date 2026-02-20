'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { CardDeck } from './CardDeck';

interface Post {
  slug: string;
  title: string;
  images: string[];
  thumbnail?: string;
  date: string;
  readingTime: string;
  preview: string;
}

interface PostCarousel2DProps {
  posts: Post[];
}

function formatDate(dateStr: string): string {
  if (!dateStr) return '';
  const parts = dateStr.split('-');
  if (parts.length === 3) {
    const d = new Date(Number(parts[0]), Number(parts[1]) - 1, Number(parts[2]));
    return d.toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' });
  }
  const d = new Date(dateStr);
  if (isNaN(d.getTime())) return '';
  return d.toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' });
}

const SPEED = 60; // pixels per second
const HOVER_SPEED_FACTOR = 0.15;
const CARD_SLOT_HEIGHT = 340; // CardDeck height (310) + gap (30)
const SNAP_LERP_SPEED = 8;

export function PostCarousel2D({ posts }: PostCarousel2DProps) {
  const router = useRouter();
  const total = posts.length;

  // scrollOffset tracks the continuous vertical scroll position in pixels.
  // It increases as cards move upward. The total loop length is total * CARD_SLOT_HEIGHT.
  const scrollOffsetRef = useRef(0);
  const hoveredRef = useRef(false);
  const rafRef = useRef<number>(0);
  const lastTimeRef = useRef<number>(0);
  const snapTargetRef = useRef<number | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  const [centerIndex, setCenterIndex] = useState(0);

  const cardRefs = useRef<Map<number, HTMLDivElement>>(new Map());

  const totalLoopHeight = total * CARD_SLOT_HEIGHT;

  // Wrap a pixel offset into [0, totalLoopHeight)
  const wrapOffset = useCallback((offset: number) => {
    return ((offset % totalLoopHeight) + totalLoopHeight) % totalLoopHeight;
  }, [totalLoopHeight]);

  useEffect(() => {
    if (total === 0) return;

    const loop = (time: number) => {
      if (lastTimeRef.current === 0) lastTimeRef.current = time;
      const dt = (time - lastTimeRef.current) / 1000;
      lastTimeRef.current = time;

      // Clamp dt to avoid large jumps on tab-switch or frame drops
      const clampedDt = Math.min(dt, 0.1);

      if (snapTargetRef.current !== null) {
        const target = snapTargetRef.current;
        const diff = target - scrollOffsetRef.current;
        if (Math.abs(diff) < 0.5) {
          scrollOffsetRef.current = target;
          snapTargetRef.current = null;
        } else {
          scrollOffsetRef.current += diff * Math.min(1, clampedDt * SNAP_LERP_SPEED);
        }
      } else {
        const speedFactor = hoveredRef.current ? HOVER_SPEED_FACTOR : 1;
        scrollOffsetRef.current += SPEED * speedFactor * clampedDt;
      }

      const containerHeight = containerRef.current?.clientHeight ?? 800;
      const viewCenterY = containerHeight / 2;
      const currentOffset = scrollOffsetRef.current;

      let closestIndex = 0;
      let closestDist = Infinity;

      for (let idx = 0; idx < total; idx++) {
        const el = cardRefs.current.get(idx);
        if (!el) continue;

        // Each card has a "home" position in the virtual strip: idx * CARD_SLOT_HEIGHT.
        // The visible Y position is computed by subtracting the scroll offset,
        // then wrapping so that cards loop seamlessly.
        const homeY = idx * CARD_SLOT_HEIGHT;
        let visibleY = homeY - wrapOffset(currentOffset);

        // Wrap into a range that keeps cards distributed around the viewport.
        // We center the wrap range so cards are roughly from -totalLoopHeight/2 to +totalLoopHeight/2
        // relative to the top of the container, then shift to center in the viewport.
        if (visibleY < -CARD_SLOT_HEIGHT) {
          visibleY += totalLoopHeight;
        }
        if (visibleY > totalLoopHeight - CARD_SLOT_HEIGHT) {
          visibleY -= totalLoopHeight;
        }

        // Shift so that offset=0 places card 0 at the vertical center
        const finalY = visibleY + viewCenterY - CARD_SLOT_HEIGHT / 2;

        el.style.transform = `translateY(${finalY}px)`;

        // Determine the center card: the one whose center is closest to the viewport center
        const cardCenterY = finalY + CARD_SLOT_HEIGHT / 2;
        const distFromCenter = Math.abs(cardCenterY - viewCenterY);
        if (distFromCenter < closestDist) {
          closestDist = distFromCenter;
          closestIndex = idx;
        }
      }

      setCenterIndex(prev => prev !== closestIndex ? closestIndex : prev);
      rafRef.current = requestAnimationFrame(loop);
    };

    rafRef.current = requestAnimationFrame(loop);
    return () => cancelAnimationFrame(rafRef.current);
  }, [total, totalLoopHeight, wrapOffset]);

  const slowDown = useCallback(() => {
    hoveredRef.current = true;
  }, []);

  const speedUp = useCallback(() => {
    hoveredRef.current = false;
    snapTargetRef.current = null;
  }, []);

  const snapToIndex = useCallback((targetIdx: number) => {
    // Snap so that the target card ends up at the viewport center.
    // At offset = targetIdx * CARD_SLOT_HEIGHT, card targetIdx is at center.
    const targetOffset = targetIdx * CARD_SLOT_HEIGHT;
    const current = scrollOffsetRef.current;

    // Find the nearest equivalent offset (accounting for wrapping)
    const wrappedCurrent = wrapOffset(current);
    let diff = targetOffset - wrappedCurrent;

    // Take the shortest path around the loop
    if (diff > totalLoopHeight / 2) diff -= totalLoopHeight;
    if (diff < -totalLoopHeight / 2) diff += totalLoopHeight;

    snapTargetRef.current = current + diff;
  }, [totalLoopHeight, wrapOffset]);

  // Keyboard navigation
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'ArrowDown' || e.key === 'ArrowRight') {
        const nextOffset = Math.round(scrollOffsetRef.current / CARD_SLOT_HEIGHT) + 1;
        snapTargetRef.current = nextOffset * CARD_SLOT_HEIGHT;
      }
      if (e.key === 'ArrowUp' || e.key === 'ArrowLeft') {
        const prevOffset = Math.round(scrollOffsetRef.current / CARD_SLOT_HEIGHT) - 1;
        snapTargetRef.current = prevOffset * CARD_SLOT_HEIGHT;
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  if (total === 0) return null;

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
        }}
        onMouseEnter={slowDown}
        onMouseLeave={speedUp}
      >
        {Array.from({ length: total }, (_, idx) => {
          const post = posts[idx];
          return (
            <div
              key={post.slug}
              ref={(el) => {
                if (el) cardRefs.current.set(idx, el);
                else cardRefs.current.delete(idx);
              }}
              style={{
                position: 'absolute',
                left: '50%',
                top: 0,
                transform: 'translateY(0px)',
                marginLeft: '-195px', // half of CardDeck width (390/2)
                willChange: 'transform',
                cursor: 'pointer',
              }}
              onClick={() => {
                if (idx === centerIndex) {
                  router.push(`/posts/${post.slug}`);
                } else {
                  snapToIndex(idx);
                }
              }}
            >
              <CardDeck
                images={post.images}
                title={post.title}
                slug={post.slug}
                thumbnail={post.thumbnail}
                isActive={idx === centerIndex}
                showTitle={false}
              />
            </div>
          );
        })}
      </div>

      {/* Right: Meta + Title + Preview */}
      <div style={{
        width: '50%',
        height: '100%',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'flex-start',
        justifyContent: 'center',
        paddingBottom: '10vh',
        paddingLeft: '40px',
        overflow: 'hidden',
      }}>
        <AnimatePresence mode="wait">
          <motion.div
            key={centerIndex}
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -16 }}
            transition={{ duration: 0.25, ease: 'easeInOut' }}
            style={{
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'flex-start',
              maxWidth: '480px',
            }}
          >
            <p style={{
              color: 'rgba(255, 255, 255, 0.45)',
              fontFamily: "-apple-system, 'SF Pro Display', 'Pretendard', sans-serif",
              fontSize: '13px',
              fontWeight: 400,
              letterSpacing: '0.02em',
              margin: '0 0 4px 0',
            }}>
              {formatDate(posts[centerIndex].date)}  ·  {posts[centerIndex].readingTime}
            </p>
            <p
              style={{
                color: '#ffffff',
                fontFamily: "-apple-system, 'SF Pro Display', 'Pretendard', sans-serif",
                fontSize: '72px',
                fontWeight: 600,
                letterSpacing: '-0.03em',
                lineHeight: 1,
                margin: 0,
                cursor: 'pointer',
              }}
              onClick={() => router.push(`/posts/${posts[centerIndex].slug}`)}
            >
              {posts[centerIndex].title}
            </p>
            <p style={{
              color: 'rgba(255, 255, 255, 0.4)',
              fontFamily: "-apple-system, 'SF Pro Display', 'Pretendard', sans-serif",
              fontSize: '15px',
              fontWeight: 400,
              lineHeight: 1.6,
              letterSpacing: '-0.01em',
              margin: '16px 0 0 0',
            }}>
              {posts[centerIndex].preview}
            </p>
          </motion.div>
        </AnimatePresence>
      </div>
    </div>
  );
}
