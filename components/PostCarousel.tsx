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

// Circle geometry
const RADIUS = 420; // px — radius of the orbit
const ANGLE_PER_CARD = (2 * Math.PI) / 8; // space 8 cards evenly even if fewer posts

// Front = angle 0 (bottom of circle, closest to viewer)
// Cards go clockwise: angle increases → moves right then back
function getCircularTransform(angle: number) {
  // angle: 0 = front-center, positive = clockwise
  // x: sin(angle) moves left-right
  // y: we use a slight vertical shift so back cards rise a bit
  // z: cos(angle) for depth — cos(0)=1 is front, cos(PI)=-1 is back
  const x = Math.sin(angle) * RADIUS;
  const z = (Math.cos(angle) - 1) * RADIUS * 0.5; // 0 at front, negative going back
  const y = (1 - Math.cos(angle)) * 40; // subtle rise for back cards

  // Scale: front=1, back=smaller
  const depthFactor = (1 + Math.cos(angle)) / 2; // 1 at front, 0 at back
  const scale = 0.45 + depthFactor * 0.55; // range: 0.45 ~ 1.0

  // Opacity: front=1, back=faded
  const opacity = 0.2 + depthFactor * 0.8; // range: 0.2 ~ 1.0

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
      if (e.key === 'ArrowRight') goNext();
      if (e.key === 'ArrowLeft') goPrev();
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [goNext, goPrev]);

  return (
    <div
      style={{
        position: 'relative',
        width: '100%',
        height: '620px',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        overflow: 'hidden',
        userSelect: 'none',
      }}
      onMouseEnter={slowDown}
      onMouseLeave={speedUp}
    >
      {/* Circular carousel */}
      <div
        style={{
          position: 'relative',
          width: '100%',
          height: '500px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
        }}
        onPointerDown={(e) => {
          const startX = e.clientX;
          const wasPaused = pausedRef.current;
          pausedRef.current = true;
          let dragged = false;

          const onMove = (me: PointerEvent) => {
            if (Math.abs(me.clientX - startX) > DRAG_THRESHOLD) {
              dragged = true;
              me.preventDefault();
            }
          };
          const onUp = (ue: PointerEvent) => {
            const dx = ue.clientX - startX;
            if (dragged && Math.abs(dx) > DRAG_THRESHOLD) {
              if (dx > 0) goPrev(); else goNext();
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

      {/* Meta + Title */}
      <div style={{
        height: '200px',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
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
              alignItems: 'center',
            }}
          >
            <p style={{
              color: 'rgba(255, 255, 255, 0.45)',
              fontFamily: "-apple-system, 'SF Pro Display', 'Pretendard', sans-serif",
              fontSize: '13px',
              fontWeight: 400,
              letterSpacing: '0.02em',
              margin: '0 0 2px 0',
              textAlign: 'center',
            }}>
              {formatDate(posts[centerIndex].date)}  ·  {posts[centerIndex].readingTime}
            </p>
            <p
              style={{
                color: '#ffffff',
                fontFamily: "-apple-system, 'SF Pro Display', 'Pretendard', sans-serif",
                fontSize: '120px',
                fontWeight: 600,
                letterSpacing: '-0.03em',
                lineHeight: 1,
                textAlign: 'center',
                margin: 0,
                cursor: 'pointer',
              }}
              onClick={() => router.push(`/posts/${posts[centerIndex].slug}`)}
            >
              {posts[centerIndex].title}
            </p>
          </motion.div>
        </AnimatePresence>
      </div>

      {/* Dots */}
      <div style={{ display: 'flex', gap: '8px', marginTop: '24px' }}>
        {posts.map((_, i) => (
          <button
            key={i}
            onClick={() => snapToPost(i)}
            style={{
              width: i === centerIndex ? '20px' : '6px',
              height: '6px',
              borderRadius: '3px',
              backgroundColor: i === centerIndex ? '#ffffff' : 'rgba(255,255,255,0.25)',
              border: 'none',
              padding: 0,
              cursor: 'pointer',
              transition: 'all 0.3s ease',
            }}
          />
        ))}
      </div>
    </div>
  );
}
