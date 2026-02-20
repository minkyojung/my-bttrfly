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

// 화면을 빈틈없이 채우기 위해 포스트를 반복 렌더링
// 뷰포트 높이 ~1000px 기준, 슬롯 340px → 최소 4~5개 보여야 함
// 원본 포스트 수가 적으면 반복해서 충분한 슬롯 확보
function getSlotCount(total: number): number {
  const minSlots = Math.ceil(1200 / CARD_SLOT_HEIGHT) + 2; // 화면 + 여유분
  if (total >= minSlots) return total;
  return Math.ceil(minSlots / total) * total; // total의 배수로
}

export function PostCarousel2D({ posts }: PostCarousel2DProps) {
  const router = useRouter();
  const total = posts.length;
  const slotCount = getSlotCount(total);

  const scrollOffsetRef = useRef(0);
  const hoveredRef = useRef(false);
  const rafRef = useRef<number>(0);
  const lastTimeRef = useRef<number>(0);
  const snapTargetRef = useRef<number | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  const [centerIndex, setCenterIndex] = useState(0);

  const cardRefs = useRef<Map<number, HTMLDivElement>>(new Map());

  const totalLoopHeight = slotCount * CARD_SLOT_HEIGHT;

  const wrapOffset = useCallback((offset: number) => {
    return ((offset % totalLoopHeight) + totalLoopHeight) % totalLoopHeight;
  }, [totalLoopHeight]);

  useEffect(() => {
    if (total === 0) return;

    const loop = (time: number) => {
      if (lastTimeRef.current === 0) lastTimeRef.current = time;
      const dt = (time - lastTimeRef.current) / 1000;
      lastTimeRef.current = time;

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
        // 음수 방향 → 카드가 위에서 아래로 내려옴
        scrollOffsetRef.current -= SPEED * speedFactor * clampedDt;
      }

      const containerHeight = containerRef.current?.clientHeight ?? 800;
      const viewCenterY = containerHeight / 2;
      const currentOffset = wrapOffset(scrollOffsetRef.current);

      let closestSlot = 0;
      let closestDist = Infinity;

      for (let slot = 0; slot < slotCount; slot++) {
        const el = cardRefs.current.get(slot);
        if (!el) continue;

        const homeY = slot * CARD_SLOT_HEIGHT;
        let visibleY = homeY - currentOffset;

        // 범위를 [-totalLoopHeight/2, totalLoopHeight/2) 로 래핑
        while (visibleY < -totalLoopHeight / 2) visibleY += totalLoopHeight;
        while (visibleY >= totalLoopHeight / 2) visibleY -= totalLoopHeight;

        const finalY = visibleY + viewCenterY - CARD_SLOT_HEIGHT / 2;
        el.style.transform = `translateY(${finalY}px)`;

        const cardCenterY = finalY + CARD_SLOT_HEIGHT / 2;
        const distFromCenter = Math.abs(cardCenterY - viewCenterY);
        if (distFromCenter < closestDist) {
          closestDist = distFromCenter;
          closestSlot = slot;
        }
      }

      // slot → 원본 post index
      const newCenter = closestSlot % total;
      setCenterIndex(prev => prev !== newCenter ? newCenter : prev);
      rafRef.current = requestAnimationFrame(loop);
    };

    rafRef.current = requestAnimationFrame(loop);
    return () => cancelAnimationFrame(rafRef.current);
  }, [total, slotCount, totalLoopHeight, wrapOffset]);

  const slowDown = useCallback(() => {
    hoveredRef.current = true;
  }, []);

  const speedUp = useCallback(() => {
    hoveredRef.current = false;
    snapTargetRef.current = null;
  }, []);

  const snapToSlot = useCallback((slotIdx: number) => {
    const targetOffset = slotIdx * CARD_SLOT_HEIGHT;
    const current = scrollOffsetRef.current;
    const wrappedCurrent = wrapOffset(current);
    let diff = targetOffset - wrappedCurrent;

    if (diff > totalLoopHeight / 2) diff -= totalLoopHeight;
    if (diff < -totalLoopHeight / 2) diff += totalLoopHeight;

    snapTargetRef.current = current + diff;
  }, [totalLoopHeight, wrapOffset]);

  // Keyboard navigation
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'ArrowDown' || e.key === 'ArrowRight') {
        const next = Math.round(scrollOffsetRef.current / CARD_SLOT_HEIGHT) - 1;
        snapTargetRef.current = next * CARD_SLOT_HEIGHT;
      }
      if (e.key === 'ArrowUp' || e.key === 'ArrowLeft') {
        const prev = Math.round(scrollOffsetRef.current / CARD_SLOT_HEIGHT) + 1;
        snapTargetRef.current = prev * CARD_SLOT_HEIGHT;
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
        {Array.from({ length: slotCount }, (_, slot) => {
          const post = posts[slot % total];
          return (
            <div
              key={`${post.slug}-${slot}`}
              ref={(el) => {
                if (el) cardRefs.current.set(slot, el);
                else cardRefs.current.delete(slot);
              }}
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
                const postIdx = slot % total;
                if (postIdx === centerIndex) {
                  router.push(`/posts/${post.slug}`);
                } else {
                  snapToSlot(slot);
                }
              }}
            >
              <CardDeck
                images={post.images}
                title={post.title}
                slug={post.slug}
                thumbnail={post.thumbnail}
                isActive={(slot % total) === centerIndex}
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
