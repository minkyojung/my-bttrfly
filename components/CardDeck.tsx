'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';

interface CardDeckProps {
  href?: string;
}

const CARD_COUNT = 5;

// 각 카드가 흩어질 때의 위치/회전 값
const scatterPositions = [
  { x: -120, y: -80, rotate: -18 },
  { x: -50, y: -120, rotate: -8 },
  { x: 10, y: -130, rotate: 3 },
  { x: 70, y: -110, rotate: 12 },
  { x: 130, y: -70, rotate: 22 },
];

// 쌓여있을 때의 미세한 어긋남
const stackOffsets = [
  { x: 0, y: 0, rotate: -2 },
  { x: 3, y: -2, rotate: 1 },
  { x: -2, y: -4, rotate: -1 },
  { x: 4, y: -6, rotate: 2.5 },
  { x: -1, y: -8, rotate: -0.5 },
];

const cardColors = [
  '#3a3a3a',
  '#4a4a4a',
  '#5a5a5a',
  '#6a6a6a',
  '#7a7a7a',
];

export function CardDeck({ href = '#' }: CardDeckProps) {
  const [isHovered, setIsHovered] = useState(false);

  return (
    <div
      style={{
        position: 'relative',
        width: '200px',
        height: '200px',
        cursor: 'pointer',
      }}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      onClick={() => {
        if (href !== '#') window.location.href = href;
      }}
    >
      {Array.from({ length: CARD_COUNT }).map((_, i) => {
        const stack = stackOffsets[i];
        const scatter = scatterPositions[i];

        return (
          <motion.div
            key={i}
            initial={false}
            animate={{
              x: isHovered ? scatter.x : stack.x,
              y: isHovered ? scatter.y : stack.y,
              rotate: isHovered ? scatter.rotate : stack.rotate,
              scale: isHovered ? 1.05 : 1,
            }}
            transition={{
              type: 'spring',
              stiffness: 300,
              damping: 20,
              mass: 0.8,
              delay: isHovered ? i * 0.03 : (CARD_COUNT - 1 - i) * 0.02,
            }}
            style={{
              position: 'absolute',
              bottom: '50%',
              left: '50%',
              marginLeft: '-60px',
              marginBottom: '-40px',
              width: '120px',
              height: '80px',
              backgroundColor: cardColors[i],
              borderRadius: '6px',
              border: '1px solid rgba(255, 255, 255, 0.1)',
              boxShadow: isHovered
                ? '0 8px 24px rgba(0, 0, 0, 0.4)'
                : '0 2px 8px rgba(0, 0, 0, 0.3)',
              zIndex: i,
            }}
          />
        );
      })}
    </div>
  );
}
