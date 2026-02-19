'use client';

import { useCallback, useRef, useState } from 'react';
import { motion } from 'framer-motion';

interface CardDeckProps {
  href?: string;
}

const CARD_COUNT = 7;

function rand(min: number, max: number) {
  return min + Math.random() * (max - min);
}

function generateScatter() {
  // 카드마다 고유한 각도 슬롯을 배정하고 그 안에서 랜덤
  // → 겹치지 않으면서도 매번 다른 배치
  const angleSlotSize = 360 / CARD_COUNT;

  return Array.from({ length: CARD_COUNT }, (_, i) => {
    const baseAngle = angleSlotSize * i + rand(-15, 15);
    const rad = (baseAngle * Math.PI) / 180;
    const distance = rand(100, 180);

    return {
      x: Math.cos(rad) * distance,
      y: Math.sin(rad) * distance * -0.8 + rand(-30, -80), // 위쪽 편향
      rotate: rand(-35, 35),
    };
  });
}

// 쌓여있을 때 — 약간 어지러운 듯 자연스럽게 겹침
const stackOffsets = [
  { x: 0,   y: 0,   rotate: -3 },
  { x: 4,   y: -1,  rotate: 5 },
  { x: -3,  y: -3,  rotate: -1.5 },
  { x: 6,   y: -2,  rotate: 3.5 },
  { x: -1,  y: -5,  rotate: -4 },
  { x: 3,   y: -4,  rotate: 2 },
  { x: -2,  y: -7,  rotate: -0.5 },
];

const cardColors = [
  '#2a2a2a',
  '#333333',
  '#3d3d3d',
  '#474747',
  '#525252',
  '#5c5c5c',
  '#686868',
];

export function CardDeck({ href = '#' }: CardDeckProps) {
  const [isHovered, setIsHovered] = useState(false);
  const scatterRef = useRef(generateScatter());

  const handleEnter = useCallback(() => {
    scatterRef.current = generateScatter();
    setIsHovered(true);
  }, []);

  const handleLeave = useCallback(() => {
    setIsHovered(false);
  }, []);

  return (
    <div
      style={{
        position: 'relative',
        width: '240px',
        height: '240px',
        cursor: 'pointer',
      }}
      onMouseEnter={handleEnter}
      onMouseLeave={handleLeave}
      onClick={() => {
        if (href !== '#') window.location.href = href;
      }}
    >
      {Array.from({ length: CARD_COUNT }).map((_, i) => {
        const stack = stackOffsets[i];
        const scatter = scatterRef.current[i];

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
              delay: isHovered ? i * 0.035 : (CARD_COUNT - 1 - i) * 0.025,
            }}
            style={{
              position: 'absolute',
              bottom: '50%',
              left: '50%',
              marginLeft: '-55px',
              marginBottom: '-38px',
              width: '110px',
              height: '75px',
              backgroundColor: cardColors[i],
              borderRadius: '4px',
              border: '1px solid rgba(255, 255, 255, 0.08)',
              boxShadow: isHovered
                ? `0 ${10 + i * 2}px ${20 + i * 4}px rgba(0, 0, 0, ${0.3 + i * 0.05})`
                : '0 1px 4px rgba(0, 0, 0, 0.25)',
              zIndex: i,
            }}
          />
        );
      })}
    </div>
  );
}
