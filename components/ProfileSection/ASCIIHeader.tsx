'use client';

import { useEffect, useRef, useState } from 'react';
import styles from './ASCIIHeader.module.css';

export function ASCIIHeader() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const [dimensions, setDimensions] = useState({ width: 600, height: 200 });

  useEffect(() => {
    const updateDimensions = () => {
      if (containerRef.current) {
        const width = Math.min(containerRef.current.offsetWidth, 600);
        setDimensions({ width, height: 200 });
      }
    };

    updateDimensions();
    window.addEventListener('resize', updateDimensions);
    return () => window.removeEventListener('resize', updateDimensions);
  }, []);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const { width, height } = dimensions;

    // ASCII characters - grayscale and accent
    const grayChars = ['+', '-', '=', 'X', '*', ':', '.', ' '];
    const accentChar = '^';

    let animationFrame: number;
    let time = 0;

    const charWidth = 8;
    const charHeight = 14;
    const cols = Math.floor(width / charWidth);
    const rows = Math.floor(height / charHeight);

    // Create particle system for orange accents
    const particles: Array<{
      x: number;
      y: number;
      speed: number;
      char: string;
    }> = [];

    // Initialize particles
    for (let i = 0; i < 20; i++) {
      particles.push({
        x: Math.random() * cols,
        y: Math.random() * rows,
        speed: 0.02 + Math.random() * 0.05,
        char: accentChar
      });
    }

    const animate = () => {
      ctx.fillStyle = 'transparent';
      ctx.clearRect(0, 0, width, height);

      ctx.font = '12px monospace';

      // Draw background grayscale ASCII pattern
      for (let y = 0; y < rows; y++) {
        for (let x = 0; x < cols; x++) {
          const wave = Math.sin((x * 0.1) + (time * 0.02)) * Math.cos((y * 0.1) + (time * 0.03));
          const charIndex = Math.floor(((wave + 1) / 2) * (grayChars.length - 1));
          const char = grayChars[charIndex];

          const opacity = 0.1 + (wave + 1) / 2 * 0.15;
          ctx.fillStyle = `rgba(200, 200, 200, ${opacity})`;

          ctx.fillText(char, x * charWidth, y * charHeight);
        }
      }

      // Update and draw orange accent particles
      particles.forEach(particle => {
        particle.x += particle.speed;

        if (particle.x > cols) {
          particle.x = 0;
          particle.y = Math.random() * rows;
        }

        ctx.fillStyle = '#ff6b35';
        ctx.fillText(particle.char, particle.x * charWidth, particle.y * charHeight);

        for (let i = 1; i < 5; i++) {
          const trailX = particle.x - (i * 0.5);
          if (trailX >= 0) {
            ctx.fillStyle = `rgba(255, 107, 53, ${0.6 - i * 0.15})`;
            ctx.fillText(particle.char, trailX * charWidth, particle.y * charHeight);
          }
        }
      });

      time += 1;
      animationFrame = requestAnimationFrame(animate);
    };

    animate();

    return () => {
      if (animationFrame) {
        cancelAnimationFrame(animationFrame);
      }
    };
  }, [dimensions]);

  return (
    <div ref={containerRef} className={styles.container}>
      <canvas
        ref={canvasRef}
        width={dimensions.width}
        height={dimensions.height}
        className={styles.canvas}
      />
    </div>
  );
}
