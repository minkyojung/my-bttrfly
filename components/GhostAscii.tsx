'use client';

import { useEffect, useRef, useState } from 'react';

type CharStyle = 'block' | 'circle' | 'braille' | 'mixed';

interface GhostAsciiProps {
  style?: CharStyle;
  color?: string;
  backgroundColor?: string;
  className?: string;
}

// Character sets for different styles
const CHAR_SETS: Record<CharStyle, string> = {
  block: ' ░▒▓█',
  circle: ' ·•●',
  braille: ' ⠁⠃⠇⡇⡏⣏⣿',
  mixed: ' .,:;!?#@$%&*0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz',
};

// SDF helper functions
function smoothMin(a: number, b: number, k: number): number {
  const h = Math.max(k - Math.abs(a - b), 0) / k;
  return Math.min(a, b) - h * h * k * 0.25;
}

function sdCircle(x: number, y: number, cx: number, cy: number, r: number): number {
  return Math.sqrt((x - cx) ** 2 + (y - cy) ** 2) - r;
}

function sdBox(x: number, y: number, cx: number, cy: number, w: number, h: number): number {
  const dx = Math.abs(x - cx) - w;
  const dy = Math.abs(y - cy) - h;
  return Math.max(dx, dy);
}

// Ghost SDF with 4 legs of different sizes
function ghostSDF(x: number, y: number, time: number): { dist: number; isEye: boolean } {
  // Floating animation
  const floatOffset = Math.sin(time * 2) * 0.012;
  const adjustedY = y - floatOffset;

  // Dimensions - shifted down to prevent top clipping
  const centerX = 0.5;
  const headRadius = 0.22;
  const headCenterY = 0.28;
  const bodyWidth = 0.22;
  const bodyBottom = 0.55;

  // Head (circle at top)
  const head = sdCircle(x, adjustedY, centerX, headCenterY, headRadius);

  // Body (rectangle from head to legs)
  const bodyTop = headCenterY;
  const body = sdBox(x, adjustedY, centerX, (bodyTop + bodyBottom) / 2, bodyWidth, (bodyBottom - bodyTop) / 2);

  // Combine head and body
  let shape = smoothMin(head, body, 0.08);

  // 4 Legs with different sizes - clearly separated
  const legY = bodyBottom;

  // Leg configurations: absolute X position, width, height
  // Adjusted to fit within 16:9 container
  const legs = [
    { x: 0.32, width: 0.08, height: 0.20 },   // Leg 1 (left)
    { x: 0.43, width: 0.09, height: 0.28 },   // Leg 2 (left-center, tallest)
    { x: 0.55, width: 0.07, height: 0.16 },   // Leg 3 (right-center, shortest)
    { x: 0.66, width: 0.08, height: 0.24 },   // Leg 4 (right)
  ];

  // Check if point is in any leg
  let inLeg = false;
  for (const leg of legs) {
    const legCenterX = leg.x;
    const legHalfWidth = leg.width / 2;
    const legLeft = legCenterX - legHalfWidth;
    const legRight = legCenterX + legHalfWidth;
    const legBottom = legY + leg.height;
    const roundRadius = legHalfWidth;

    if (x >= legLeft && x <= legRight) {
      // Rectangle part (above the rounded bottom)
      if (adjustedY >= legY && adjustedY <= legBottom - roundRadius) {
        inLeg = true;
        break;
      }
      // Rounded bottom (semicircle)
      if (adjustedY > legBottom - roundRadius && adjustedY <= legBottom) {
        const circleCenterY = legBottom - roundRadius;
        const dist = Math.sqrt(
          Math.pow(x - legCenterX, 2) + Math.pow(adjustedY - circleCenterY, 2)
        );
        if (dist <= roundRadius) {
          inLeg = true;
          break;
        }
      }
    }
  }

  // If below body but not in a leg, it's outside
  if (adjustedY > legY && !inLeg) {
    shape = 1;
  }

  // Also cut out the gaps between legs at body bottom
  const bodyLeft = centerX - bodyWidth;
  const bodyRight = centerX + bodyWidth;
  if (adjustedY >= legY - 0.01 && adjustedY <= legY + 0.02) {
    // Check if in gap between legs
    let inGap = true;
    if (x < bodyLeft || x > bodyRight) {
      inGap = false;
    } else {
      for (const leg of legs) {
        if (x >= leg.x - leg.width / 2 && x <= leg.x + leg.width / 2) {
          inGap = false;
          break;
        }
      }
    }
    if (inGap) {
      shape = 1;
    }
  }

  // Eyes (rectangular shape) - slightly smaller
  const eyeY = 0.32;
  const eyeSpacing = 0.07;
  const eyeWidth = 0.03;
  const eyeHeight = 0.05;

  const leftEye = sdBox(x, adjustedY, centerX - eyeSpacing, eyeY, eyeWidth, eyeHeight);
  const rightEye = sdBox(x, adjustedY, centerX + eyeSpacing, eyeY, eyeWidth, eyeHeight);

  const isEye = leftEye < 0 || rightEye < 0;

  return { dist: shape, isEye };
}

// Render ASCII art
function renderGhost(
  width: number,
  height: number,
  charSet: string,
  time: number
): string {
  let ascii = '';

  // Aspect ratio correction (characters are taller than wide)
  const aspectRatio = 0.5;

  for (let row = 0; row < height; row++) {
    for (let col = 0; col < width; col++) {
      // Normalize coordinates to 0-1
      const x = col / width;
      const y = (row / height) * aspectRatio + (1 - aspectRatio) / 2;

      const { dist, isEye } = ghostSDF(x, y, time);

      if (isEye) {
        // Eyes are empty (background)
        ascii += ' ';
      } else if (dist < 0) {
        // Inside ghost - pick character based on distance from edge
        const edgeDist = Math.min(1, -dist * 15);

        // Add some noise/variation
        const noise = Math.sin(col * 0.5 + row * 0.7 + time) * 0.3 + 0.5;
        const brightness = edgeDist * 0.7 + noise * 0.3;

        const charIndex = Math.floor(Math.max(0, Math.min(1, brightness)) * (charSet.length - 1));
        ascii += charSet[Math.min(charIndex, charSet.length - 1)];
      } else {
        // Outside ghost
        ascii += ' ';
      }
    }
    ascii += '\n';
  }

  return ascii;
}

export default function GhostAscii({
  style = 'mixed',
  color = '#d85a8c',
  backgroundColor = '#1a1a1a',
  className,
}: GhostAsciiProps) {
  const preRef = useRef<HTMLPreElement>(null);
  const animationRef = useRef<number | null>(null);
  const [currentStyle, setCurrentStyle] = useState<CharStyle>(style);

  useEffect(() => {
    const charSet = CHAR_SETS[currentStyle];
    const width = 140;
    const height = 50;

    const animate = () => {
      const time = Date.now() * 0.001;
      const ascii = renderGhost(width, height, charSet, time);

      if (preRef.current) {
        preRef.current.textContent = ascii;
      }

      animationRef.current = requestAnimationFrame(animate);
    };

    animate();

    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
    };
  }, [currentStyle]);

  const styles: CharStyle[] = ['mixed', 'block', 'circle', 'braille'];

  return (
    <div
      className={className}
      style={{
        width: '100%',
        height: '100%',
        backgroundColor,
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '20px',
      }}
    >
      {/* Style selector */}
      <div style={{ marginBottom: '20px', display: 'flex', gap: '10px' }}>
        {styles.map((s) => (
          <button
            key={s}
            onClick={() => setCurrentStyle(s)}
            style={{
              padding: '8px 16px',
              backgroundColor: currentStyle === s ? color : 'transparent',
              color: currentStyle === s ? backgroundColor : color,
              border: `2px solid ${color}`,
              borderRadius: '4px',
              cursor: 'pointer',
              fontFamily: 'monospace',
              fontSize: '14px',
              textTransform: 'uppercase',
            }}
          >
            {s}
          </button>
        ))}
      </div>

      {/* 16:9 Container */}
      <div
        style={{
          width: '100%',
          maxWidth: '900px',
          aspectRatio: '16 / 9',
          backgroundColor: '#0d0d0d',
          borderRadius: '12px',
          border: `2px solid ${color}33`,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          overflow: 'hidden',
        }}
      >
        {/* ASCII output */}
        <pre
          ref={preRef}
          style={{
            margin: 0,
            padding: 0,
            fontFamily: 'monospace',
            fontSize: '10px',
            lineHeight: '10px',
            letterSpacing: '1px',
            color,
            whiteSpace: 'pre',
          }}
        />
      </div>
    </div>
  );
}
