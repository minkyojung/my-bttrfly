'use client';

import { useEffect, useRef, useState, useCallback } from 'react';

interface PostASCIIProps {
  text?: string;
  width?: number;
  height?: number;
}

// Ember particle type - moved outside component for HMR stability
interface Ember {
  x: number;
  y: number;
  vy: number;
  life: number;
  maxLife: number;
  char: string;
}

// Constants - moved outside for stability
const FIRE_CHARS = ['#', '@', '%', '*', '+', ':', '.', ' '];
const CYCLE_LENGTH = 600;
const PEAK_TIME = 180;
const CHAR_WIDTH = 8;
const CHAR_HEIGHT = 12;

export function PostASCII({ width = 600, height = 280 }: PostASCIIProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const animationRef = useRef<number | null>(null);
  const timeRef = useRef(0);
  const embersRef = useRef<Ember[]>([]);
  const isMountedRef = useRef(true);
  const [dimensions, setDimensions] = useState({ width, height });

  useEffect(() => {
    setDimensions({ width, height });
  }, [width, height]);

  const stopAnimation = useCallback(() => {
    if (animationRef.current !== null) {
      cancelAnimationFrame(animationRef.current);
      animationRef.current = null;
    }
  }, []);

  useEffect(() => {
    isMountedRef.current = true;

    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const { width: w, height: h } = dimensions;
    const cols = Math.floor(w / CHAR_WIDTH);
    const rows = Math.floor(h / CHAR_HEIGHT);

    const animate = () => {
      if (!isMountedRef.current) return;

      ctx.clearRect(0, 0, w, h);
      ctx.font = '11px monospace';

      const time = timeRef.current;
      const embers = embersRef.current;
      const cycleTime = time % CYCLE_LENGTH;

      // Constant burning with subtle breathing
      const breathe = Math.sin(time * 0.02) * 0.1;
      const intensity = 0.85 + breathe; // Always burning strong

      // Fire base position (at the very bottom, fill entire canvas)
      const fireBaseY = rows - 1;
      const fireCenterX = cols / 2;
      const fireHeight = rows * 0.95; // Fire fills almost entire height

      // Draw fire field
      for (let y = 0; y < rows; y++) {
        for (let x = 0; x < cols; x++) {
          const dx = (x - fireCenterX) / (cols * 0.35);
          const dy = (fireBaseY - y) / fireHeight;
          const fireWidth = Math.max(0, 1 - dy * 0.6);
          const distFromCenter = Math.abs(dx) / fireWidth;

          if (dy > -0.1 && dy < 1 && distFromCenter < 1) {
            const turb1 = Math.sin(x * 0.3 + time * 0.08) * 0.3;
            const turb2 = Math.cos(y * 0.2 - time * 0.05) * 0.2;
            const turb3 = Math.sin((x + y) * 0.15 + time * 0.1) * 0.25;
            const turbulence = turb1 + turb2 + turb3;

            // Core is hottest at the base center, extending upward
            const coreHeight = Math.max(0, 1 - Math.abs(dy - 0.15) * 2);
            const heightFactor = Math.pow(Math.max(0, 1 - dy), 0.4);
            const widthFactor = 1 - distFromCenter * distFromCenter;
            const localIntensity = intensity * heightFactor * widthFactor * (0.7 + coreHeight * 0.3) + turbulence * intensity * 0.4;

            if (localIntensity > 0.1) {
              const charIndex = Math.floor((1 - Math.min(1, localIntensity)) * (FIRE_CHARS.length - 1));
              const char = FIRE_CHARS[Math.max(0, Math.min(charIndex, FIRE_CHARS.length - 1))];

              let r, g, b, alpha;
              if (localIntensity > 0.8) {
                r = 255; g = 240; b = 200; alpha = 0.9;
              } else if (localIntensity > 0.5) {
                r = 255; g = 140 + (localIntensity - 0.5) * 200; b = 50; alpha = 0.8;
              } else if (localIntensity > 0.25) {
                r = 255; g = 80 + (localIntensity - 0.25) * 240; b = 30; alpha = 0.6;
              } else {
                r = 180 + localIntensity * 300; g = 50; b = 20; alpha = 0.3 + localIntensity;
              }

              ctx.fillStyle = `rgba(${r}, ${g}, ${b}, ${alpha})`;
              ctx.fillText(char, x * CHAR_WIDTH, y * CHAR_HEIGHT + 10);
            }
          }
        }
      }

      // Spawn embers during intense phase
      if (intensity > 0.3 && Math.random() < intensity * 0.18) {
        embers.push({
          x: fireCenterX + (Math.random() - 0.5) * cols * 0.4,
          y: fireBaseY - Math.random() * rows * 0.5,
          vy: -0.05 - Math.random() * 0.1,
          life: 0,
          maxLife: 80 + Math.random() * 60,
          char: ['*', '+', '.'][Math.floor(Math.random() * 3)]
        });
      }

      // Update and draw embers
      for (let i = embers.length - 1; i >= 0; i--) {
        const e = embers[i];
        e.y += e.vy;
        e.x += Math.sin(time * 0.05 + i) * 0.03;
        e.life++;

        if (e.life > e.maxLife || e.y < 0) {
          embers.splice(i, 1);
          continue;
        }

        const lifeRatio = e.life / e.maxLife;
        const alpha = lifeRatio < 0.2 ? lifeRatio * 5 : 1 - (lifeRatio - 0.2) / 0.8;

        ctx.fillStyle = `rgba(255, ${100 + (1 - lifeRatio) * 80}, 50, ${alpha * 0.7})`;
        ctx.fillText(e.char, e.x * CHAR_WIDTH, e.y * CHAR_HEIGHT + 10);
      }

      // Draw ember bed at the base (at very bottom of canvas)
      const emberBedWidth = cols * 0.4;
      for (let i = 0; i < 15; i++) {
        const ex = fireCenterX + (Math.random() - 0.5) * emberBedWidth;
        const ey = rows - 1 - Math.random() * 1.5;
        const emberAlpha = 0.3 + Math.random() * 0.4 * intensity;
        const emberChar = ['.', ':', '*'][Math.floor(Math.random() * 3)];
        ctx.fillStyle = `rgba(${150 + Math.random() * 80}, ${30 + Math.random() * 30}, 10, ${emberAlpha})`;
        ctx.fillText(emberChar, ex * CHAR_WIDTH, ey * CHAR_HEIGHT + 10);
      }

      // Subtle smoke/ash rising in calm phase
      if (intensity < 0.3) {
        const smokeIntensity = (0.3 - intensity) / 0.3;
        for (let i = 0; i < 3; i++) {
          const sx = fireCenterX + (Math.random() - 0.5) * cols * 0.15;
          const sy = fireBaseY - rows * 0.3 - Math.random() * rows * 0.2;
          const smokeAlpha = smokeIntensity * 0.12 * Math.random();
          ctx.fillStyle = `rgba(100, 100, 100, ${smokeAlpha})`;
          ctx.fillText('.', sx * CHAR_WIDTH, sy * CHAR_HEIGHT + 10);
        }
      }

      timeRef.current += 1;
      animationRef.current = requestAnimationFrame(animate);
    };

    animate();

    return () => {
      isMountedRef.current = false;
      stopAnimation();
    };
  }, [dimensions, stopAnimation]);

  return (
    <canvas
      ref={canvasRef}
      width={dimensions.width}
      height={dimensions.height}
      style={{
        width: `${dimensions.width}px`,
        height: `${dimensions.height}px`,
        display: 'block',
        backgroundColor: 'transparent',
      }}
    />
  );
}
