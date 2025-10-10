'use client';

import { useEffect, useRef } from 'react';

interface Column {
  x: number;
  y: number;
  speed: number;
  text: string;
  opacity: number;
}

export function MatrixRain() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const columnsRef = useRef<Column[]>([]);

  // Blog-related characters to rain down
  const BLOG_CHARS = [
    // Keywords
    'Lerp', 'DISQUIET', 'journalism', 'editor', 'startup', 'community',
    // Tech terms
    'TypeScript', 'React', 'Next.js', 'AI', 'RAG', 'terminal', 'code',
    // Concepts
    'design', 'product', 'UX', 'build', 'create', 'write', 'think',
    // Korean
    '정민교', '스타트업', '에디터', '저널리즘', '커뮤니티',
    // Symbols & numbers
    '0', '1', '{', '}', '(', ')', '<', '>', '/', '*', '+', '-', '=',
    '@', '#', '$', '%', '&', '|', '\\', '_', '~',
  ];

  const getRandomChar = () => {
    return BLOG_CHARS[Math.floor(Math.random() * BLOG_CHARS.length)];
  };

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Set canvas size
    const updateSize = () => {
      canvas.width = canvas.offsetWidth;
      canvas.height = canvas.offsetHeight;
    };
    updateSize();
    window.addEventListener('resize', updateSize);

    // Initialize columns
    const columnWidth = 20;
    const numColumns = Math.floor(canvas.width / columnWidth);

    columnsRef.current = Array.from({ length: numColumns }, (_, i) => ({
      x: i * columnWidth,
      y: Math.random() * canvas.height - canvas.height,
      speed: 1 + Math.random() * 3,
      text: getRandomChar(),
      opacity: 0.2 + Math.random() * 0.3,
    }));

    // Animation loop
    let animationId: number;
    const animate = () => {
      // Clear with transparency
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      // Very subtle fade trail
      ctx.fillStyle = 'rgba(0, 0, 0, 0.02)';
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      // Draw columns
      columnsRef.current.forEach((col) => {
        ctx.fillStyle = `rgba(0, 255, 70, ${col.opacity})`;
        ctx.font = '12px monospace';
        ctx.fillText(col.text, col.x, col.y);

        // Move column down
        col.y += col.speed;

        // Reset when off screen
        if (col.y > canvas.height) {
          col.y = -20;
          col.text = getRandomChar();
          col.opacity = 0.2 + Math.random() * 0.3;
        }
      });

      animationId = requestAnimationFrame(animate);
    };

    animate();

    return () => {
      cancelAnimationFrame(animationId);
      window.removeEventListener('resize', updateSize);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      className="absolute inset-0 w-full h-full pointer-events-none"
      style={{ zIndex: 0, opacity: 0.6 }}
    />
  );
}
