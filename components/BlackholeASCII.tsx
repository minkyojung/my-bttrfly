'use client';

import { useEffect, useRef } from 'react';

interface BlackholeASCIIProps {
  width?: number;
  height?: number;
}

const CHAR_WIDTH = 7;
const CHAR_HEIGHT = 12;

// Ember 색상 팔레트
const COLORS = [
  { r: 80, g: 25, b: 10 },
  { r: 140, g: 45, b: 15 },
  { r: 200, g: 70, b: 25 },
  { r: 255, g: 100, b: 40 },
  { r: 255, g: 140, b: 60 },
  { r: 255, g: 180, b: 90 },
  { r: 255, g: 210, b: 130 },
  { r: 255, g: 240, b: 180 },
];

function lerpColor(c1: typeof COLORS[0], c2: typeof COLORS[0], t: number) {
  return {
    r: Math.round(c1.r + (c2.r - c1.r) * t),
    g: Math.round(c1.g + (c2.g - c1.g) * t),
    b: Math.round(c1.b + (c2.b - c1.b) * t),
  };
}

function getColor(t: number) {
  t = Math.max(0, Math.min(1, t));
  const idx = t * (COLORS.length - 1);
  const lower = Math.floor(idx);
  const upper = Math.min(lower + 1, COLORS.length - 1);
  return lerpColor(COLORS[lower], COLORS[upper], idx - lower);
}

interface Particle {
  angle: number;
  radius: number;
  speed: number;
  char: string;
  colorIdx: number;
  size: number;
}

export function BlackholeASCII({ width = 600, height = 150 }: BlackholeASCIIProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const animationRef = useRef<number | null>(null);
  const timeRef = useRef(0);
  const particlesRef = useRef<Particle[]>([]);
  const isMountedRef = useRef(true);

  useEffect(() => {
    isMountedRef.current = true;
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const cols = Math.floor(width / CHAR_WIDTH);
    const rows = Math.floor(height / CHAR_HEIGHT);
    const centerX = cols / 2;
    const centerY = rows / 2;

    // 블랙홀 크기 (화면에 맞게 조정 - 가로로 더 넓게)
    const bhRadius = Math.min(cols, rows * 3) * 0.08; // 블랙홀 코어
    const innerRing = bhRadius * 1.5;
    const outerRing = cols * 0.48; // 가로로 더 넓게 확장

    // 초기 파티클 생성
    const particles = particlesRef.current;
    if (particles.length === 0) {
      const innerChars = ['◆', '◇', '▣', '▢', '●', '○', '◉', '◎', '⬡', '⬢', '✦', '✧', '★', '☆'];
      const midChars = ['·', '∘', '○', '◦', '°', '*', '✦', '✧', '◈', '◇'];
      const outerChars = ['·', '∘', '◦', '°', '.'];

      // 가장 내부 - 밀집된 다양한 기호
      for (let i = 0; i < 250; i++) {
        particles.push({
          angle: Math.random() * Math.PI * 2,
          radius: innerRing + Math.random() * (outerRing - innerRing) * 0.15,
          speed: 0.0084 + Math.random() * 0.0056,
          char: innerChars[Math.floor(Math.random() * innerChars.length)],
          colorIdx: 5 + Math.floor(Math.random() * 3),
          size: 0.85 + Math.random() * 0.35,
        });
      }

      // 내부 밝은 링 파티클
      for (let i = 0; i < 200; i++) {
        particles.push({
          angle: Math.random() * Math.PI * 2,
          radius: innerRing + Math.random() * (outerRing - innerRing) * 0.3,
          speed: 0.0056 + Math.random() * 0.0042,
          char: midChars[Math.floor(Math.random() * midChars.length)],
          colorIdx: 5 + Math.floor(Math.random() * 3),
          size: 0.8 + Math.random() * 0.4,
        });
      }

      // 중간 링 파티클
      for (let i = 0; i < 400; i++) {
        particles.push({
          angle: Math.random() * Math.PI * 2,
          radius: innerRing + (outerRing - innerRing) * (0.3 + Math.random() * 0.4),
          speed: 0.0028 + Math.random() * 0.0028,
          char: midChars[Math.floor(Math.random() * 6)],
          colorIdx: 3 + Math.floor(Math.random() * 3),
          size: 0.6 + Math.random() * 0.5,
        });
      }

      // 외부 파티클
      for (let i = 0; i < 500; i++) {
        particles.push({
          angle: Math.random() * Math.PI * 2,
          radius: innerRing + (outerRing - innerRing) * (0.6 + Math.random() * 0.4),
          speed: 0.0014 + Math.random() * 0.0021,
          char: outerChars[Math.floor(Math.random() * outerChars.length)],
          colorIdx: 1 + Math.floor(Math.random() * 3),
          size: 0.45 + Math.random() * 0.4,
        });
      }

      // 가장 바깥 희미한 파티클
      for (let i = 0; i < 400; i++) {
        particles.push({
          angle: Math.random() * Math.PI * 2,
          radius: innerRing + (outerRing - innerRing) * (0.8 + Math.random() * 0.2),
          speed: 0.0007 + Math.random() * 0.0014,
          char: outerChars[Math.floor(Math.random() * outerChars.length)],
          colorIdx: 0 + Math.floor(Math.random() * 2),
          size: 0.35 + Math.random() * 0.3,
        });
      }
    }

    const animate = () => {
      if (!isMountedRef.current) return;

      ctx.clearRect(0, 0, width, height);
      ctx.font = '11px monospace';

      const time = timeRef.current;

      // 1. 블랙홀 중심 (검은 원) - 3D 구체 효과
      for (let y = 0; y < rows; y++) {
        for (let x = 0; x < cols; x++) {
          const dx = x - centerX;
          const dy = (y - centerY) * 2.2; // 타원형으로 압축
          const dist = Math.sqrt(dx * dx + dy * dy);

          if (dist < bhRadius) {
            // 구체의 가장자리 - 프레넬 림 라이트
            const normalDist = dist / bhRadius;
            const z = Math.sqrt(Math.max(0, 1 - normalDist * normalDist));
            const rimLight = Math.pow(1 - z, 2.5);

            if (rimLight > 0.3) {
              const color = getColor(0.6 + rimLight * 0.3);
              const alpha = rimLight * 0.5;
              ctx.fillStyle = `rgba(${color.r}, ${color.g}, ${color.b}, ${alpha})`;
              ctx.fillText('○', x * CHAR_WIDTH, y * CHAR_HEIGHT + 10);
            } else {
              // 완전한 어둠
              ctx.fillStyle = 'rgba(8, 8, 8, 0.95)';
              ctx.fillText('●', x * CHAR_WIDTH, y * CHAR_HEIGHT + 10);
            }
          }
        }
      }

      // 2. 광자 구 (Photon Sphere) - 블랙홀 바로 바깥 밝은 테두리
      const photonRingInner = bhRadius * 0.9;
      const photonRingOuter = bhRadius * 1.4;

      for (let i = 0; i < 60; i++) {
        const angle = (i / 60) * Math.PI * 2 + time * 0.003;
        const wobble = Math.sin(angle * 6 + time * 0.02) * 0.15;
        const radius = photonRingInner + (photonRingOuter - photonRingInner) * (0.5 + wobble);

        const px = centerX + Math.cos(angle) * radius;
        const py = centerY + Math.sin(angle) * radius * 0.35; // 타원형 - 가로로 더 넓게

        if (px >= 0 && px < cols && py >= 0 && py < rows) {
          const intensity = 0.7 + Math.sin(angle * 4 + time * 0.015) * 0.2;
          const color = getColor(0.7 + intensity * 0.25);
          ctx.fillStyle = `rgba(${color.r}, ${color.g}, ${color.b}, ${intensity * 0.8})`;
          ctx.fillText('◦', px * CHAR_WIDTH, py * CHAR_HEIGHT + 10);
        }
      }

      // 3. 강착원반 파티클 그리기
      for (const p of particles) {
        // 각도 업데이트 (내부일수록 빠르게 - 케플러 법칙)
        const keplerFactor = Math.pow(innerRing / p.radius, 1.5);
        p.angle += p.speed * (1 + keplerFactor * 0.5);

        // 나선 패턴
        const spiralOffset = Math.sin(p.angle * 2 + time * 0.002) * 0.1;
        const currentRadius = p.radius * (1 + spiralOffset);

        // 위치 계산 (타원형 - 가로로 더 넓게)
        const px = centerX + Math.cos(p.angle) * currentRadius;
        const py = centerY + Math.sin(p.angle) * currentRadius * 0.32;

        if (px >= 0 && px < cols && py >= 0 && py < rows) {
          // 도플러 효과: 왼쪽(다가오는)은 밝고, 오른쪽(멀어지는)은 어둡게
          const dopplerAngle = p.angle + Math.PI * 0.1;
          const doppler = Math.cos(dopplerAngle) * 0.3 + 0.7;

          // 거리에 따른 밝기
          const distFactor = 1 - (p.radius - innerRing) / (outerRing - innerRing);
          const brightness = doppler * (0.4 + distFactor * 0.5);

          const color = COLORS[Math.min(p.colorIdx, COLORS.length - 1)];
          const alpha = brightness * p.size;

          ctx.fillStyle = `rgba(${color.r}, ${color.g}, ${color.b}, ${alpha})`;
          ctx.fillText(p.char, px * CHAR_WIDTH, py * CHAR_HEIGHT + 10);
        }
      }

      // 4. 위아래 휘어진 빛 (중력 렌즈 효과)
      for (let i = 0; i < 40; i++) {
        const baseAngle = (i / 40) * Math.PI * 2 + time * 0.002;

        // 위쪽 호
        const topRadius = bhRadius * (1.6 + Math.sin(baseAngle * 3) * 0.2);
        const topX = centerX + Math.cos(baseAngle) * topRadius * 0.8;
        const topY = centerY - Math.abs(Math.sin(baseAngle)) * bhRadius * 0.8 - bhRadius * 0.3;

        if (topX >= 0 && topX < cols && topY >= 0 && topY < rows) {
          const intensity = 0.3 + Math.sin(baseAngle * 2 + time * 0.01) * 0.15;
          const color = getColor(0.5 + intensity * 0.3);
          ctx.fillStyle = `rgba(${color.r}, ${color.g}, ${color.b}, ${intensity * 0.5})`;
          ctx.fillText('·', topX * CHAR_WIDTH, topY * CHAR_HEIGHT + 10);
        }

        // 아래쪽 호
        const bottomY = centerY + Math.abs(Math.sin(baseAngle)) * bhRadius * 0.8 + bhRadius * 0.3;

        if (topX >= 0 && topX < cols && bottomY >= 0 && bottomY < rows) {
          const intensity = 0.3 + Math.sin(baseAngle * 2 + time * 0.01) * 0.15;
          const color = getColor(0.5 + intensity * 0.3);
          ctx.fillStyle = `rgba(${color.r}, ${color.g}, ${color.b}, ${intensity * 0.5})`;
          ctx.fillText('·', topX * CHAR_WIDTH, bottomY * CHAR_HEIGHT + 10);
        }
      }

      // 5. 가끔 밝은 스파크
      if (Math.random() < 0.15) {
        const sparkAngle = Math.random() * Math.PI * 2;
        const sparkRadius = innerRing + Math.random() * (outerRing - innerRing) * 0.5;
        const sx = centerX + Math.cos(sparkAngle) * sparkRadius;
        const sy = centerY + Math.sin(sparkAngle) * sparkRadius * 0.32;

        if (sx >= 0 && sx < cols && sy >= 0 && sy < rows) {
          const color = COLORS[COLORS.length - 1];
          ctx.fillStyle = `rgba(${color.r}, ${color.g}, ${color.b}, ${0.7 + Math.random() * 0.3})`;
          ctx.fillText('✦', sx * CHAR_WIDTH, sy * CHAR_HEIGHT + 10);
        }
      }

      timeRef.current += 1;
      animationRef.current = requestAnimationFrame(animate);
    };

    animate();

    return () => {
      isMountedRef.current = false;
      if (animationRef.current !== null) {
        cancelAnimationFrame(animationRef.current);
      }
    };
  }, [width, height]);

  return (
    <canvas
      ref={canvasRef}
      width={width}
      height={height}
      style={{
        width: `${width}px`,
        height: `${height}px`,
        display: 'block',
        backgroundColor: 'transparent',
      }}
    />
  );
}
