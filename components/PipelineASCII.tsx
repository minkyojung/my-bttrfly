'use client';

import { useEffect, useRef } from 'react';

interface PipelineASCIIProps {
  width?: number;
  height?: number;
}

const CHAR_WIDTH = 7;
const CHAR_HEIGHT = 12;

// Ember ASCII 색상 팔레트 (PostASCII에서 가져옴, 주황색 강조)
const EMBER_COLORS = [
  { r: 180, g: 50, b: 20 },    // 어두운 빨강
  { r: 255, g: 80, b: 30 },    // 빨강
  { r: 255, g: 120, b: 40 },   // 진한 주황
  { r: 255, g: 160, b: 60 },   // 주황
  { r: 255, g: 180, b: 80 },   // 밝은 주황 (완성 색상)
];

// 다양한 문자셋
const CHAOS_CHARS = ['#', '@', '%', '&', '*', '∞', '◈', '◆', '▣', '▩'];
const ORDER_CHARS = ['░', '▒', '▓', '█'];
const SPARK_CHARS = ['✦', '✧', '*', '+', '·', '°'];

interface Particle {
  x: number;
  y: number;
  vx: number;
  vy: number;
  life: number;
  maxLife: number;
  char: string;
  colorIdx: number;
}

// 색상 보간
function lerpColor(c1: typeof EMBER_COLORS[0], c2: typeof EMBER_COLORS[0], t: number) {
  return {
    r: Math.round(c1.r + (c2.r - c1.r) * t),
    g: Math.round(c1.g + (c2.g - c1.g) * t),
    b: Math.round(c1.b + (c2.b - c1.b) * t),
  };
}

function getEmberColor(intensity: number) {
  // intensity: 0 (어두움) ~ 1 (밝음)
  const idx = intensity * (EMBER_COLORS.length - 1);
  const lower = Math.floor(idx);
  const upper = Math.min(lower + 1, EMBER_COLORS.length - 1);
  const t = idx - lower;
  return lerpColor(EMBER_COLORS[lower], EMBER_COLORS[upper], t);
}

export function PipelineASCII({ width = 600, height = 150 }: PipelineASCIIProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const animationRef = useRef<number | null>(null);
  const timeRef = useRef(0);
  const cycleRef = useRef(0);
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
    const centerY = rows / 2;

    // 노이즈 함수
    const noise = (x: number, y: number, t: number, chaos: number) => {
      return Math.sin(x * 0.6 + t * 0.025) * Math.cos(y * 0.4 + t * 0.018) * chaos +
             Math.sin(x * 0.25 - t * 0.012) * Math.cos(y * 0.35 + t * 0.008) * chaos * 0.7 +
             Math.sin((x + y) * 0.15 + t * 0.02) * chaos * 0.4;
    };

    const animate = () => {
      if (!isMountedRef.current) return;

      ctx.clearRect(0, 0, width, height);
      ctx.font = '11px monospace';

      const time = timeRef.current;
      const cycle = cycleRef.current;
      const particles = particlesRef.current;

      // 더 느린 사이클 (420 frames = ~7초)
      const cycleLength = 420;
      const cycleProgress = (time % cycleLength) / cycleLength;
      const baseOpacity = Math.min((cycle + 1) / 3, 1);

      // 메인 필드 그리기
      for (let x = 0; x < cols; x++) {
        const xRatio = x / cols;

        // 진행에 따라 혼돈 → 질서 (더 부드럽게)
        const localProgress = Math.max(0, Math.min(1, (cycleProgress - xRatio * 0.4) * 1.5));
        const chaos = Math.pow(1 - localProgress, 1.5); // 비선형 감소

        if (xRatio > cycleProgress + 0.15) continue;

        // 더 많은 행으로 밀도 높임 (세로 간격 줄이고 가로로 넓게)
        for (let row = 0; row < 5; row++) {
          const baseY = centerY + (row - 2) * 0.8;
          const noiseVal = noise(x, row, time, chaos);
          const noiseY = noiseVal * 2.5;

          // 혼돈 상태: 랜덤하게 흩어짐
          // 질서 상태: 중앙으로 모임
          const orderedY = centerY + (row - 2) * (1 - localProgress) * 0.15;
          const finalY = baseY + noiseY * chaos + (orderedY - baseY) * localProgress;

          if (finalY >= 0 && finalY < rows) {
            // 강도 계산 (질서에 가까울수록 밝음)
            const intensity = 0.2 + localProgress * 0.6 + Math.abs(noiseVal) * 0.2 * (1 - localProgress);
            const color = getEmberColor(Math.min(1, intensity));
            const alpha = baseOpacity * (0.3 + localProgress * 0.5);

            // 문자 선택
            let char: string;
            if (localProgress < 0.3) {
              // 혼돈: 복잡한 문자들
              char = CHAOS_CHARS[(x + row + Math.floor(time * 0.05)) % CHAOS_CHARS.length];
            } else if (localProgress < 0.7) {
              // 전환 중: 혼합
              const mix = (localProgress - 0.3) / 0.4;
              if (Math.random() > mix) {
                char = CHAOS_CHARS[(x + row) % CHAOS_CHARS.length];
              } else {
                char = ORDER_CHARS[Math.floor(mix * 2)];
              }
            } else {
              // 질서: 밀도 블록
              const densityIdx = Math.floor((localProgress - 0.7) / 0.3 * 3);
              char = ORDER_CHARS[Math.min(densityIdx + 1, ORDER_CHARS.length - 1)];
            }

            ctx.fillStyle = `rgba(${color.r}, ${color.g}, ${color.b}, ${alpha})`;
            ctx.fillText(char, x * CHAR_WIDTH, finalY * CHAR_HEIGHT + 10);
          }
        }
      }

      // 질서가 된 영역에 코어 라인 (가장 밝은 색)
      if (cycleProgress > 0.4) {
        const coreStart = Math.floor(cycleProgress * 0.3 * cols);
        const coreEnd = Math.floor(cycleProgress * cols);
        const coreColor = EMBER_COLORS[EMBER_COLORS.length - 1];

        for (let x = coreStart; x < coreEnd; x++) {
          const xRatio = x / cols;
          const localProgress = Math.max(0, Math.min(1, (cycleProgress - xRatio * 0.4) * 1.5));
          if (localProgress < 0.6) continue;

          const coreIntensity = (localProgress - 0.6) / 0.4;
          const alpha = baseOpacity * coreIntensity * 0.8;
          const wobble = Math.sin(x * 0.1 + time * 0.03) * 0.3 * (1 - coreIntensity);

          ctx.fillStyle = `rgba(${coreColor.r}, ${coreColor.g}, ${coreColor.b}, ${alpha})`;
          ctx.fillText('█', x * CHAR_WIDTH, (centerY + wobble) * CHAR_HEIGHT + 10);
        }
      }

      // 스파크 생성 - 진행선 근처에서 (더 많이, 더 강하게)
      if (cycleProgress > 0.1 && cycleProgress < 0.95 && Math.random() < 0.7) {
        const spawnX = cycleProgress * cols;
        const localProgress = Math.max(0, Math.min(1, (cycleProgress - cycleProgress * 0.4) * 1.5));

        // 3-5개씩 동시 생성
        const sparkCount = 2 + Math.floor(Math.random() * 3);
        for (let s = 0; s < sparkCount; s++) {
          particles.push({
            x: spawnX + (Math.random() - 0.5) * 12,
            y: centerY + (Math.random() - 0.5) * 6 * (1 - localProgress),
            vx: 0.6 + Math.random() * 1.2,
            vy: (Math.random() - 0.5) * 0.8,
            life: 0,
            maxLife: 50 + Math.random() * 60,
            char: SPARK_CHARS[Math.floor(Math.random() * SPARK_CHARS.length)],
            colorIdx: Math.floor(Math.random() * EMBER_COLORS.length)
          });
        }
      }

      // 혼돈 영역에서 추가 스파크 (더 많이, 더 산발적으로)
      if (cycleProgress < 0.7 && Math.random() < 0.5) {
        const chaosX = Math.random() * cycleProgress * cols * 0.9;
        const sparkCount = 2 + Math.floor(Math.random() * 3);
        for (let s = 0; s < sparkCount; s++) {
          particles.push({
            x: chaosX + (Math.random() - 0.5) * 10,
            y: centerY + (Math.random() - 0.5) * 7,
            vx: (Math.random() - 0.3) * 0.8,
            vy: (Math.random() - 0.5) * 0.9,
            life: 0,
            maxLife: 30 + Math.random() * 40,
            char: SPARK_CHARS[Math.floor(Math.random() * SPARK_CHARS.length)],
            colorIdx: Math.floor(Math.random() * 3) // 더 어두운 색상
          });
        }
      }

      // 전환 영역에서 폭발적인 스파크 (더 자주, 더 밝게)
      if (cycleProgress > 0.15 && cycleProgress < 0.85 && Math.random() < 0.4) {
        const transitionX = cycleProgress * cols * 0.75;
        const burstCount = 1 + Math.floor(Math.random() * 2);
        for (let b = 0; b < burstCount; b++) {
          particles.push({
            x: transitionX + (Math.random() - 0.5) * 15,
            y: centerY + (Math.random() - 0.5) * 5,
            vx: 0.7 + Math.random() * 1.5,
            vy: (Math.random() - 0.5) * 1.2,
            life: 0,
            maxLife: 35 + Math.random() * 30,
            char: SPARK_CHARS[Math.floor(Math.random() * 3)], // ✦, ✧, * 만 사용
            colorIdx: 3 + Math.floor(Math.random() * 2) // 밝은 색상만
          });
        }
      }

      // 코어 라인에서 튀는 스파크 (새로 추가)
      if (cycleProgress > 0.5 && Math.random() < 0.3) {
        const coreX = cycleProgress * cols * 0.6 + Math.random() * cycleProgress * cols * 0.3;
        particles.push({
          x: coreX,
          y: centerY + (Math.random() - 0.5) * 2,
          vx: 0.8 + Math.random() * 1.0,
          vy: (Math.random() - 0.5) * 1.5,
          life: 0,
          maxLife: 25 + Math.random() * 20,
          char: '✦',
          colorIdx: 4 // 가장 밝은 색상
        });
      }

      // 파티클 업데이트 및 그리기
      for (let i = particles.length - 1; i >= 0; i--) {
        const p = particles[i];
        p.x += p.vx;
        p.y += p.vy + Math.sin(time * 0.08 + i) * 0.04;
        p.vy *= 0.98; // 감속
        p.life++;

        if (p.life > p.maxLife || p.x > cols + 5 || p.x < -5) {
          particles.splice(i, 1);
          continue;
        }

        const lifeRatio = p.life / p.maxLife;
        const alpha = lifeRatio < 0.15
          ? lifeRatio / 0.15 * baseOpacity
          : (1 - (lifeRatio - 0.15) / 0.85) * baseOpacity;

        if (alpha > 0.05) {
          // 스파크는 밝은 색상
          const sparkColor = EMBER_COLORS[Math.min(p.colorIdx + 2, EMBER_COLORS.length - 1)];
          ctx.fillStyle = `rgba(${sparkColor.r}, ${sparkColor.g}, ${sparkColor.b}, ${alpha * 0.9})`;
          ctx.fillText(p.char, p.x * CHAR_WIDTH, p.y * CHAR_HEIGHT + 10);
        }
      }

      // 출구 글로우
      if (cycleProgress > 0.85) {
        const glowIntensity = (cycleProgress - 0.85) / 0.15;
        const pulse = Math.sin(time * 0.12) * 0.15 + 0.85;
        const glowColor = EMBER_COLORS[EMBER_COLORS.length - 1];

        for (let dy = -2; dy <= 2; dy++) {
          const distFade = 1 - Math.abs(dy) / 3;
          const alpha = baseOpacity * glowIntensity * distFade * pulse * 0.7;

          ctx.fillStyle = `rgba(${glowColor.r}, ${glowColor.g}, ${glowColor.b}, ${alpha})`;
          ctx.fillText('▸', (cols - 2) * CHAR_WIDTH, (centerY + dy) * CHAR_HEIGHT + 10);
          ctx.fillText('▸', (cols - 1) * CHAR_WIDTH, (centerY + dy) * CHAR_HEIGHT + 10);
        }
      }

      timeRef.current += 1;

      // 사이클 완료 체크
      if (time > 0 && time % cycleLength === 0) {
        if (cycle < 2) {
          cycleRef.current += 1;
        } else {
          if (time % (cycleLength * 4) === 0) {
            cycleRef.current = 0;
            timeRef.current = 0;
            particlesRef.current = [];
          }
        }
      }

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
