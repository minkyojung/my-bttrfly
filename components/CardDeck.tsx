'use client';

import { useCallback, useRef, useState } from 'react';
import { motion } from 'framer-motion';

interface CardDeckProps {
  images: string[];
  title: string;
  slug: string;
  thumbnail?: string;
  isActive?: boolean;
  showTitle?: boolean;
  onHoverChange?: (hovered: boolean) => void;
}

const MAX_CARDS = 7;
const CARD_W = 330;
const CARD_H = 224;

function rand(min: number, max: number) {
  return min + Math.random() * (max - min);
}

// 카드끼리 겹치지 않게 배치 — 중앙 중력 + 충돌 회피
// 컨테이너 안에서 카드가 잘리지 않도록 scatter 범위 제한
const SCATTER_MAX_X = 120; // 좌우 최대 이동
const SCATTER_MAX_Y = -200; // 위쪽 최대 이동 (음수 = 위)
const SCATTER_MIN_Y = -20;  // 아래쪽 최소 이동

function generateScatter(count: number) {
  const placed: { x: number; y: number }[] = [];
  const results: { x: number; y: number; rotate: number }[] = [];

  for (let i = 0; i < count; i++) {
    let bestX = 0;
    let bestY = 0;
    let found = false;

    for (let attempt = 0; attempt < 80; attempt++) {
      const angle = rand(0, 360) * (Math.PI / 180);
      const maxDist = 60 + count * 20;
      const dist = rand(40, maxDist);
      let x = Math.cos(angle) * dist;
      let y = -Math.abs(Math.sin(angle) * dist) - rand(15, 40);

      // 범위 클램프
      x = Math.max(-SCATTER_MAX_X, Math.min(SCATTER_MAX_X, x));
      y = Math.max(SCATTER_MAX_Y, Math.min(SCATTER_MIN_Y, y));

      const overlaps = placed.some(p => {
        const dx = Math.abs(p.x - x);
        const dy = Math.abs(p.y - y);
        return dx < CARD_W * 0.75 && dy < CARD_H * 0.65;
      });

      if (!overlaps) {
        bestX = x;
        bestY = y;
        found = true;
        break;
      }

      if (!found || attempt === 79) {
        bestX = x;
        bestY = y;
      }
    }

    placed.push({ x: bestX, y: bestY });
    results.push({
      x: bestX,
      y: bestY,
      rotate: rand(-15, 15),
    });
  }

  return results;
}

const baseStackOffsets = [
  { x: 0,   y: 0,   rotate: -3 },
  { x: 6,   y: -2,  rotate: 5 },
  { x: -5,  y: -4,  rotate: -1.5 },
  { x: 8,   y: -3,  rotate: 3.5 },
  { x: -2,  y: -6,  rotate: -4 },
  { x: 5,   y: -5,  rotate: 2 },
  { x: -3,  y: -8,  rotate: -0.5 },
];

const fallbackColors = [
  '#2a2a2a', '#333333', '#3d3d3d', '#474747',
  '#525252', '#5c5c5c', '#686868',
];

export function CardDeck({ images, title, slug, thumbnail, isActive = true, showTitle = true, onHoverChange }: CardDeckProps) {
  const [isHovered, setIsHovered] = useState(false);

  // thumbnail을 맨 위에, 나머지 본문 이미지는 뒤에
  const allImages = thumbnail ? [thumbnail, ...images.filter(img => img !== thumbnail)] : images;
  const cardCount = Math.min(Math.max(allImages.length, 1), MAX_CARDS);
  const scatterRef = useRef(generateScatter(cardCount));

  const effectiveHover = isActive && isHovered;

  const handleEnter = useCallback(() => {
    if (!isActive) return;
    scatterRef.current = generateScatter(cardCount);
    setIsHovered(true);
    onHoverChange?.(true);
  }, [cardCount, isActive, onHoverChange]);

  const handleLeave = useCallback(() => {
    setIsHovered(false);
    onHoverChange?.(false);
  }, [onHoverChange]);

  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        gap: '0px',
        transition: 'transform 0.35s cubic-bezier(0.25, 0.46, 0.45, 0.94)',
        transform: effectiveHover ? 'scale(1.06) rotate(-2deg)' : 'scale(1) rotate(0deg)',
      }}
    >
      <div
        style={{
          position: 'relative',
          width: '390px',
          height: '310px',
          cursor: 'pointer',
        }}
        onMouseEnter={handleEnter}
        onMouseLeave={handleLeave}
      >
        {Array.from({ length: cardCount }).map((_, i) => {
          const stack = baseStackOffsets[i % baseStackOffsets.length];
          const scatter = scatterRef.current[i];
          const hasImage = i < allImages.length;

          return (
            <motion.div
              key={i}
              initial={false}
              animate={{
                x: effectiveHover ? scatter.x : stack.x,
                y: effectiveHover ? scatter.y : stack.y,
                rotate: effectiveHover ? scatter.rotate : stack.rotate,
                scale: effectiveHover ? 1.08 : 1,
                opacity: 1,
              }}
              transition={{
                type: 'spring',
                stiffness: 260 + i * 15,
                damping: 18 + i * 1.5,
                mass: 0.6 + i * 0.05,
                delay: effectiveHover ? i * 0.035 : (cardCount - 1 - i) * 0.025,
              }}
              style={{
                position: 'absolute',
                bottom: '20px',
                left: '50%',
                marginLeft: `${-CARD_W / 2}px`,
                width: `${CARD_W}px`,
                height: `${CARD_H}px`,
                borderRadius: '4px',
                border: '1px solid rgba(255, 255, 255, 0.08)',
                boxShadow: effectiveHover
                  ? `0 ${10 + i * 2}px ${20 + i * 4}px rgba(0, 0, 0, ${0.3 + i * 0.05})`
                  : '0 1px 4px rgba(0, 0, 0, 0.25)',
                zIndex: i,
                overflow: 'hidden',
                backgroundColor: hasImage ? '#1a1a1a' : fallbackColors[i % fallbackColors.length],
                backgroundImage: hasImage ? `url(${allImages[i]})` : undefined,
                backgroundSize: 'cover',
                backgroundPosition: 'center',
              }}
            />
          );
        })}
      </div>

      {showTitle && (
        <p style={{
          color: effectiveHover ? '#ffffff' : '#aaaaaa',
          fontFamily: "-apple-system, 'SF Pro Display', 'Pretendard', sans-serif",
          fontSize: '18px',
          fontWeight: 600,
          letterSpacing: '-0.03em',
          lineHeight: 1.2,
          marginTop: '-8px',
          transition: 'color 0.2s',
          textAlign: 'center',
        }}>
          {title}
        </p>
      )}
    </div>
  );
}
