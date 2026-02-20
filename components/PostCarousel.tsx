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

interface PostCarouselProps {
  posts: Post[];
}

function formatDate(dateStr: string): string {
  if (!dateStr) return '';
  // YYYY-MM-DD → 명시적으로 파싱 (UTC 타임존 이슈 방지)
  const parts = dateStr.split('-');
  if (parts.length === 3) {
    const d = new Date(Number(parts[0]), Number(parts[1]) - 1, Number(parts[2]));
    return d.toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' });
  }
  const d = new Date(dateStr);
  if (isNaN(d.getTime())) return '';
  return d.toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' });
}

const SPEED = 0.12;
const HOVER_SPEED_FACTOR = 0.15; // hover 시 원래 속도의 15%로 감속
const DRAG_THRESHOLD = 50;

// Circle geometry — Y-axis ferris wheel
const RADIUS = 280; // px — vertical orbit radius
const ANGLE_PER_CARD = (2 * Math.PI) / 8;

// Front = angle 0 (closest to viewer)
// Ferris wheel: cards rotate in a vertical plane (up/down)
function getCircularTransform(angle: number) {
  // y: -sin(angle) → 위아래 이동 (주축)
  // z: cos(angle) → 깊이감 (앞/뒤)
  const x = 0;
  const y = -Math.sin(angle) * RADIUS;
  const z = (Math.cos(angle) - 1) * RADIUS * 0.5;

  // depth: cos(0)=1 앞, cos(PI)=-1 뒤
  const depthFactor = (1 + Math.cos(angle)) / 2;
  const scale = 0.45 + depthFactor * 0.55;
  const opacity = 0.15 + depthFactor * 0.85;
  const zIndex = Math.round(depthFactor * 100);

  return { x, y, z, scale, opacity, zIndex };
}

export function PostCarousel({ posts }: PostCarouselProps) {
  const router = useRouter();
  const total = posts.length;

  const rotationRef = useRef(0); // continuous float, in "card units"
  const pausedRef = useRef(false);
  const hoveredRef = useRef(false);
  const rafRef = useRef<number>(0);
  const lastTimeRef = useRef<number>(0);
  const snapTargetRef = useRef<number | null>(null);

  const [centerIndex, setCenterIndex] = useState(0);

  // Render all posts as DOM nodes
  const cardRefs = useRef<Map<number, HTMLDivElement>>(new Map());

  const wrapIndex = useCallback((i: number) => {
    return ((i % total) + total) % total;
  }, [total]);

  useEffect(() => {
    const angleStep = (2 * Math.PI) / total;

    const loop = (time: number) => {
      if (lastTimeRef.current === 0) lastTimeRef.current = time;
      const dt = (time - lastTimeRef.current) / 1000;
      lastTimeRef.current = time;

      // Snap or continuous
      if (snapTargetRef.current !== null) {
        const target = snapTargetRef.current;
        const diff = target - rotationRef.current;
        if (Math.abs(diff) < 0.005) {
          rotationRef.current = target;
          snapTargetRef.current = null;
        } else {
          rotationRef.current += diff * Math.min(1, dt * 8);
        }
      } else if (!pausedRef.current) {
        const speedFactor = hoveredRef.current ? HOVER_SPEED_FACTOR : 1;
        rotationRef.current += SPEED * speedFactor * dt;
      }

      const rotation = rotationRef.current;
      const newCenter = wrapIndex(Math.round(rotation));

      // Position every card on the circle
      for (let idx = 0; idx < total; idx++) {
        const el = cardRefs.current.get(idx);
        if (!el) continue;

        // This card's angle on the circle
        // Card 0 is at the "rotation" position, card 1 is one step further, etc.
        // We offset by rotation so the "current" card is at angle 0 (front)
        let angle = (idx - rotation) * angleStep;
        // Normalize angle to [-PI, PI]
        angle = angle - Math.round(angle / (2 * Math.PI)) * (2 * Math.PI);

        const t = getCircularTransform(angle);

        el.style.transform = `translateX(${t.x}px) translateY(${t.y}px) translateZ(${t.z}px) scale(${t.scale})`;
        el.style.opacity = `${t.opacity}`;
        el.style.zIndex = `${t.zIndex}`;
      }

      setCenterIndex(prev => prev !== newCenter ? newCenter : prev);
      rafRef.current = requestAnimationFrame(loop);
    };

    rafRef.current = requestAnimationFrame(loop);
    return () => cancelAnimationFrame(rafRef.current);
  }, [total, wrapIndex]);

  const slowDown = useCallback(() => {
    hoveredRef.current = true;
  }, []);
  const speedUp = useCallback(() => {
    hoveredRef.current = false;
    snapTargetRef.current = null;
  }, []);

  const snapTo = useCallback((targetRotation: number) => {
    snapTargetRef.current = targetRotation;
  }, []);

  const snapToPost = useCallback((index: number) => {
    const current = rotationRef.current;
    const base = Math.round(current / total) * total;
    let target = base + index;
    if (target - current > total / 2) target -= total;
    if (current - target > total / 2) target += total;
    snapTo(target);
  }, [total, snapTo]);

  const goNext = useCallback(() => {
    snapTo(Math.round(rotationRef.current) + 1);
  }, [snapTo]);

  const goPrev = useCallback(() => {
    snapTo(Math.round(rotationRef.current) - 1);
  }, [snapTo]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'ArrowRight' || e.key === 'ArrowDown') goNext();
      if (e.key === 'ArrowLeft' || e.key === 'ArrowUp') goPrev();
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [goNext, goPrev]);

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
      {/* Left: Ferris wheel carousel */}
      <div
        style={{
          position: 'relative',
          width: '50%',
          height: '100%',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
        }}
        onMouseEnter={slowDown}
        onMouseLeave={speedUp}
        onPointerDown={(e) => {
          const startY = e.clientY;
          const wasPaused = pausedRef.current;
          pausedRef.current = true;
          let dragged = false;

          const onMove = (me: PointerEvent) => {
            if (Math.abs(me.clientY - startY) > DRAG_THRESHOLD) {
              dragged = true;
              me.preventDefault();
            }
          };
          const onUp = (ue: PointerEvent) => {
            const dy = ue.clientY - startY;
            if (dragged && Math.abs(dy) > DRAG_THRESHOLD) {
              if (dy > 0) goPrev(); else goNext();
            }
            pausedRef.current = wasPaused;
            window.removeEventListener('pointermove', onMove);
            window.removeEventListener('pointerup', onUp);
          };

          window.addEventListener('pointermove', onMove);
          window.addEventListener('pointerup', onUp);
        }}
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
                willChange: 'transform, opacity',
                cursor: 'pointer',
              }}
              onClick={() => {
                const currentCenter = wrapIndex(Math.round(rotationRef.current));
                if (idx === currentCenter) {
                  router.push(`/posts/${post.slug}`);
                } else {
                  snapToPost(idx);
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
