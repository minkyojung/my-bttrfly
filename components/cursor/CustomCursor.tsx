'use client';

import { useEffect } from 'react';
import { motion, useMotionValue, useSpring, useTransform } from 'framer-motion';
import { useCursor } from './CursorContext';

// L자 모서리 컴포넌트
function CornerBracket({ position }: { position: 'topLeft' | 'topRight' | 'bottomLeft' | 'bottomRight' }) {
  const styles: Record<string, React.CSSProperties> = {
    topLeft: { top: 0, left: 0 },
    topRight: { top: 0, right: 0, transform: 'rotate(90deg)' },
    bottomRight: { bottom: 0, right: 0, transform: 'rotate(180deg)' },
    bottomLeft: { bottom: 0, left: 0, transform: 'rotate(270deg)' }
  };

  return (
    <svg
      width="12"
      height="12"
      viewBox="0 0 12 12"
      fill="none"
      style={{
        position: 'absolute',
        ...styles[position]
      }}
    >
      <path
        d="M1 11V1H11"
        stroke="white"
        strokeWidth="2"
        strokeLinecap="square"
        fill="none"
      />
    </svg>
  );
}

const SPRING_CONFIG = {
  stiffness: 300,
  damping: 25,
  mass: 0.5
};

const DEFAULT_SIZE = 40; // 기본 상태에서 모서리 사각형 크기

export function CustomCursor() {
  const { targetRect, isHovering } = useCursor();

  // 마우스 위치
  const mouseX = useMotionValue(0);
  const mouseY = useMotionValue(0);

  // 컨테이너 위치 (중앙 점 & 모서리 그룹)
  const containerX = useSpring(mouseX, SPRING_CONFIG);
  const containerY = useSpring(mouseY, SPRING_CONFIG);

  // 모서리 그룹의 크기와 위치
  const boxX = useMotionValue(0);
  const boxY = useMotionValue(0);
  const boxWidth = useMotionValue(DEFAULT_SIZE);
  const boxHeight = useMotionValue(DEFAULT_SIZE);

  // 스프링 적용
  const springBoxX = useSpring(boxX, SPRING_CONFIG);
  const springBoxY = useSpring(boxY, SPRING_CONFIG);
  const springBoxWidth = useSpring(boxWidth, SPRING_CONFIG);
  const springBoxHeight = useSpring(boxHeight, SPRING_CONFIG);

  // 회전 각도
  const rotation = useMotionValue(0);
  const springRotation = useSpring(rotation, { stiffness: 100, damping: 20 });

  // 마우스 이동 추적
  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      mouseX.set(e.clientX);
      mouseY.set(e.clientY);
    };

    window.addEventListener('mousemove', handleMouseMove);
    return () => window.removeEventListener('mousemove', handleMouseMove);
  }, [mouseX, mouseY]);

  // 회전 애니메이션 (기본 상태에서만)
  useEffect(() => {
    if (isHovering) return;

    let animationId: number;
    let angle = rotation.get();

    const animate = () => {
      angle += 0.5; // 회전 속도
      if (angle >= 360) angle = 0;
      rotation.set(angle);
      animationId = requestAnimationFrame(animate);
    };

    animationId = requestAnimationFrame(animate);
    return () => cancelAnimationFrame(animationId);
  }, [isHovering, rotation]);

  // 호버 상태에 따른 박스 위치/크기 업데이트
  useEffect(() => {
    if (isHovering && targetRect) {
      // 호버: 타겟 요소의 위치와 크기로
      boxX.set(targetRect.left);
      boxY.set(targetRect.top);
      boxWidth.set(targetRect.width);
      boxHeight.set(targetRect.height);
      rotation.set(0); // 회전 멈춤
    } else {
      // 기본: 마우스 중심으로 작은 사각형
      const currentX = mouseX.get();
      const currentY = mouseY.get();
      boxX.set(currentX - DEFAULT_SIZE / 2);
      boxY.set(currentY - DEFAULT_SIZE / 2);
      boxWidth.set(DEFAULT_SIZE);
      boxHeight.set(DEFAULT_SIZE);
    }
  }, [isHovering, targetRect, boxX, boxY, boxWidth, boxHeight, mouseX, mouseY, rotation]);

  // 기본 상태에서 마우스 따라다니기
  useEffect(() => {
    if (!isHovering) {
      const unsubX = mouseX.on('change', (x) => {
        boxX.set(x - DEFAULT_SIZE / 2);
      });
      const unsubY = mouseY.on('change', (y) => {
        boxY.set(y - DEFAULT_SIZE / 2);
      });

      return () => {
        unsubX();
        unsubY();
      };
    }
  }, [isHovering, mouseX, mouseY, boxX, boxY]);

  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        pointerEvents: 'none',
        zIndex: 9999
      }}
    >
      {/* 중앙 점 - 항상 마우스 위치 */}
      <motion.div
        style={{
          position: 'absolute',
          width: 6,
          height: 6,
          backgroundColor: 'white',
          borderRadius: '50%',
          x: containerX,
          y: containerY,
          translateX: '-50%',
          translateY: '-50%'
        }}
      />

      {/* 모서리 그룹 - 위치/크기 동적 변환 */}
      <motion.div
        style={{
          position: 'absolute',
          x: springBoxX,
          y: springBoxY,
          width: springBoxWidth,
          height: springBoxHeight,
          rotate: springRotation
        }}
      >
        <CornerBracket position="topLeft" />
        <CornerBracket position="topRight" />
        <CornerBracket position="bottomLeft" />
        <CornerBracket position="bottomRight" />
      </motion.div>
    </div>
  );
}
