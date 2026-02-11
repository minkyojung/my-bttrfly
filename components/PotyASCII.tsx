'use client';

import { useEffect, useRef } from 'react';

interface PotyASCIIProps {
  width?: number;
  height?: number;
}

const CHAR_WIDTH = 7;
const CHAR_HEIGHT = 12;

// Ember 색상 팔레트
const COLORS = [
  { r: 100, g: 35, b: 15 },   // 어두운 주황
  { r: 180, g: 60, b: 20 },   // 중간 주황
  { r: 255, g: 100, b: 40 },  // 밝은 주황
  { r: 255, g: 140, b: 60 },  // 더 밝은 주황
  { r: 255, g: 180, b: 90 },  // 가장 밝은 주황
];

// POTY 글자 정의 (5x7 그리드)
const LETTER_P = [
  '████ ',
  '█   █',
  '█   █',
  '████ ',
  '█    ',
  '█    ',
  '█    ',
];

const LETTER_O = [
  ' ███ ',
  '█   █',
  '█   █',
  '█   █',
  '█   █',
  '█   █',
  ' ███ ',
];

const LETTER_T = [
  '█████',
  '  █  ',
  '  █  ',
  '  █  ',
  '  █  ',
  '  █  ',
  '  █  ',
];

const LETTER_Y = [
  '█   █',
  '█   █',
  ' █ █ ',
  '  █  ',
  '  █  ',
  '  █  ',
  '  █  ',
];

const LETTERS = [LETTER_P, LETTER_O, LETTER_T, LETTER_Y];
const LETTER_WIDTH = 5;
const LETTER_HEIGHT = 7;
const LETTER_SPACING = 2;

interface Spark {
  x: number;
  y: number;
  vx: number;
  vy: number;
  life: number;
  maxLife: number;
  char: string;
}

export function PotyASCII({ width = 600, height = 150 }: PotyASCIIProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const animationRef = useRef<number | null>(null);
  const timeRef = useRef(0);
  const sparksRef = useRef<Spark[]>([]);
  const isMountedRef = useRef(true);

  useEffect(() => {
    isMountedRef.current = true;
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const cols = Math.floor(width / CHAR_WIDTH);
    const rows = Math.floor(height / CHAR_HEIGHT);

    // 전체 POTY 크기 계산
    const totalLetterWidth = LETTER_WIDTH * 4 + LETTER_SPACING * 3;
    const startX = Math.floor((cols - totalLetterWidth) / 2);
    const startY = Math.floor((rows - LETTER_HEIGHT) / 2);

    // 애니메이션 타이밍
    const framesPerChar = 35;      // 한 글자당 프레임 (획 그리기)
    const totalTypingFrames = framesPerChar * 4;  // 전체 타이핑
    const holdFrames = 120;         // 완성 후 유지
    const fadeFrames = 30;          // 페이드아웃
    const cycleLength = totalTypingFrames + holdFrames + fadeFrames;

    const animate = () => {
      if (!isMountedRef.current) return;

      ctx.clearRect(0, 0, width, height);
      ctx.font = '11px monospace';

      const time = timeRef.current;
      const sparks = sparksRef.current;
      const cycleTime = time % cycleLength;

      // 현재 단계 결정
      const isTyping = cycleTime < totalTypingFrames;
      const isHolding = cycleTime >= totalTypingFrames && cycleTime < totalTypingFrames + holdFrames;
      const isFading = cycleTime >= totalTypingFrames + holdFrames;

      // 페이드 알파
      let globalAlpha = 1;
      if (isFading) {
        globalAlpha = 1 - (cycleTime - totalTypingFrames - holdFrames) / fadeFrames;
      }

      // 각 글자 그리기
      for (let letterIdx = 0; letterIdx < 4; letterIdx++) {
        const letter = LETTERS[letterIdx];
        const letterStartFrame = letterIdx * framesPerChar;
        const letterProgress = isTyping
          ? Math.max(0, Math.min(1, (cycleTime - letterStartFrame) / framesPerChar))
          : 1;

        // 글자 위치
        const letterX = startX + letterIdx * (LETTER_WIDTH + LETTER_SPACING);

        // 글자가 아직 시작 안 했으면 스킵
        if (letterProgress <= 0) continue;

        // 총 픽셀 수 계산
        let totalPixels = 0;
        for (let row = 0; row < LETTER_HEIGHT; row++) {
          for (let col = 0; col < LETTER_WIDTH; col++) {
            if (letter[row][col] === '█') totalPixels++;
          }
        }

        // 현재까지 표시할 픽셀 수
        const pixelsToShow = Math.floor(totalPixels * letterProgress);
        let pixelCount = 0;

        // 글자 픽셀 순회 (위에서 아래, 왼쪽에서 오른쪽)
        for (let row = 0; row < LETTER_HEIGHT; row++) {
          for (let col = 0; col < LETTER_WIDTH; col++) {
            if (letter[row][col] === '█') {
              pixelCount++;
              if (pixelCount <= pixelsToShow) {
                const x = letterX + col;
                const y = startY + row;

                // 색상 결정 (최근 타이핑된 글자는 밝게)
                const isRecent = pixelCount > pixelsToShow - 3;
                const colorIdx = isRecent && isTyping ? 4 : 2 + Math.floor(Math.random() * 2);
                const color = COLORS[colorIdx];

                // 글리치/노이즈 효과 (타이핑 중일 때만)
                const glitch = isTyping && isRecent ? (Math.random() - 0.5) * 0.3 : 0;
                const alpha = globalAlpha * (0.8 + glitch);

                ctx.fillStyle = `rgba(${color.r}, ${color.g}, ${color.b}, ${alpha})`;
                ctx.fillText('█', x * CHAR_WIDTH, y * CHAR_HEIGHT + 10);

                // 타이핑 중 스파크 생성
                if (isTyping && isRecent && Math.random() < 0.3) {
                  sparks.push({
                    x,
                    y,
                    vx: (Math.random() - 0.5) * 1.5,
                    vy: (Math.random() - 0.5) * 1.5,
                    life: 0,
                    maxLife: 15 + Math.random() * 20,
                    char: ['·', '∘', '°', '*'][Math.floor(Math.random() * 4)],
                  });
                }
              }
            }
          }
        }
      }

      // 커서 그리기 (타이핑/홀드 중일 때)
      if ((isTyping || isHolding) && globalAlpha > 0.5) {
        const cursorBlink = Math.sin(time * 0.15) > 0;
        if (cursorBlink) {
          // 현재 타이핑 위치 계산
          let cursorLetterIdx = isHolding ? 4 : Math.floor(cycleTime / framesPerChar);
          cursorLetterIdx = Math.min(cursorLetterIdx, 4);

          const cursorX = startX + cursorLetterIdx * (LETTER_WIDTH + LETTER_SPACING);
          const cursorY = startY + Math.floor(LETTER_HEIGHT / 2);

          const cursorColor = COLORS[4];
          ctx.fillStyle = `rgba(${cursorColor.r}, ${cursorColor.g}, ${cursorColor.b}, ${globalAlpha * 0.9})`;
          ctx.fillText('▌', cursorX * CHAR_WIDTH, cursorY * CHAR_HEIGHT + 10);
        }
      }

      // 스파크 업데이트 및 그리기
      for (let i = sparks.length - 1; i >= 0; i--) {
        const s = sparks[i];
        s.x += s.vx;
        s.y += s.vy;
        s.vy += 0.05; // 약간의 중력
        s.life++;

        if (s.life > s.maxLife) {
          sparks.splice(i, 1);
          continue;
        }

        const lifeRatio = s.life / s.maxLife;
        const alpha = globalAlpha * (1 - lifeRatio) * 0.8;

        if (alpha > 0.05) {
          const color = COLORS[3];
          ctx.fillStyle = `rgba(${color.r}, ${color.g}, ${color.b}, ${alpha})`;
          ctx.fillText(s.char, s.x * CHAR_WIDTH, s.y * CHAR_HEIGHT + 10);
        }
      }

      // 배경 장식 (희미한 점들)
      if (Math.random() < 0.1) {
        const bgX = Math.random() * cols;
        const bgY = Math.random() * rows;
        const bgColor = COLORS[0];
        ctx.fillStyle = `rgba(${bgColor.r}, ${bgColor.g}, ${bgColor.b}, ${globalAlpha * 0.2})`;
        ctx.fillText('·', bgX * CHAR_WIDTH, bgY * CHAR_HEIGHT + 10);
      }

      timeRef.current += 1;

      // 사이클 끝나면 스파크 클리어
      if (cycleTime === 0) {
        sparksRef.current = [];
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
