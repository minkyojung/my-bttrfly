'use client';

import { useCallback, useRef, useState } from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';

interface CardDeckProps {
  images: string[];
  title: string;
  slug: string;
}

const MAX_CARDS = 7;
const CARD_W = 130;
const CARD_H = 88;

function rand(min: number, max: number) {
  return min + Math.random() * (max - min);
}

// 카드끼리 겹치지 않게 배치 — 중앙 중력 + 충돌 회피
function generateScatter(count: number) {
  const placed: { x: number; y: number }[] = [];
  const results: { x: number; y: number; rotate: number }[] = [];

  for (let i = 0; i < count; i++) {
    let bestX = 0;
    let bestY = 0;
    let found = false;

    // 여러 후보 중 겹치지 않는 가장 가까운 위치 선택
    for (let attempt = 0; attempt < 80; attempt++) {
      const angle = rand(0, 360) * (Math.PI / 180);
      // 카드 수에 따라 거리 조절 — 적을수록 가까이
      const maxDist = 40 + count * 18;
      const dist = rand(30, maxDist);
      const x = Math.cos(angle) * dist;
      // 위쪽으로만 분포 (y는 음수 = 위)
      const y = -Math.abs(Math.sin(angle) * dist) - rand(10, 40);

      // 기존 카드와 겹침 검사
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

      // 겹치더라도 가장 멀리 떨어진 후보 저장
      if (!found || attempt === 79) {
        bestX = x;
        bestY = y;
      }
    }

    placed.push({ x: bestX, y: bestY });
    results.push({
      x: bestX,
      y: bestY,
      rotate: rand(-20, 20),
    });
  }

  return results;
}

const baseStackOffsets = [
  { x: 0,   y: 0,   rotate: -3 },
  { x: 4,   y: -1,  rotate: 5 },
  { x: -3,  y: -3,  rotate: -1.5 },
  { x: 6,   y: -2,  rotate: 3.5 },
  { x: -1,  y: -5,  rotate: -4 },
  { x: 3,   y: -4,  rotate: 2 },
  { x: -2,  y: -7,  rotate: -0.5 },
];

const fallbackColors = [
  '#2a2a2a', '#333333', '#3d3d3d', '#474747',
  '#525252', '#5c5c5c', '#686868',
];

export function CardDeck({ images, title, slug }: CardDeckProps) {
  const router = useRouter();
  const [isHovered, setIsHovered] = useState(false);
  const cardCount = Math.min(Math.max(images.length, 1), MAX_CARDS);
  const scatterRef = useRef(generateScatter(cardCount));

  const handleEnter = useCallback(() => {
    scatterRef.current = generateScatter(cardCount);
    setIsHovered(true);
  }, [cardCount]);

  const handleLeave = useCallback(() => {
    setIsHovered(false);
  }, []);

  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        gap: '0px',
      }}
    >
      <div
        style={{
          position: 'relative',
          width: '240px',
          height: '180px',
          cursor: 'pointer',
        }}
        onMouseEnter={handleEnter}
        onMouseLeave={handleLeave}
        onClick={() => router.push(`/posts/${slug}`)}
      >
        {Array.from({ length: cardCount }).map((_, i) => {
          const stack = baseStackOffsets[i % baseStackOffsets.length];
          const scatter = scatterRef.current[i];
          const hasImage = i < images.length;

          return (
            <motion.div
              key={i}
              initial={false}
              animate={{
                x: isHovered ? scatter.x : stack.x,
                y: isHovered ? scatter.y : stack.y,
                rotate: isHovered ? scatter.rotate : stack.rotate,
                scale: isHovered ? 1.08 : 1,
                opacity: isHovered ? 1 : 0.6 + i * 0.06,
              }}
              transition={{
                type: 'spring',
                stiffness: 260 + i * 15,
                damping: 18 + i * 1.5,
                mass: 0.6 + i * 0.05,
                delay: isHovered ? i * 0.035 : (cardCount - 1 - i) * 0.025,
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
                boxShadow: isHovered
                  ? `0 ${10 + i * 2}px ${20 + i * 4}px rgba(0, 0, 0, ${0.3 + i * 0.05})`
                  : '0 1px 4px rgba(0, 0, 0, 0.25)',
                zIndex: i,
                overflow: 'hidden',
                backgroundColor: hasImage ? '#1a1a1a' : fallbackColors[i % fallbackColors.length],
                backgroundImage: hasImage ? `url(${images[i]})` : undefined,
                backgroundSize: 'cover',
                backgroundPosition: 'center',
              }}
            />
          );
        })}
      </div>

      <p style={{
        color: isHovered ? '#ffffff' : '#aaaaaa',
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
    </div>
  );
}
