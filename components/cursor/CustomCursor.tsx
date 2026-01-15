'use client';

import { useEffect } from 'react';
import { motion, useMotionValue, useSpring, useTransform } from 'framer-motion';
import { useCursor } from './CursorContext';

// L자 모서리 컴포넌트
function CornerBracket({
  position,
  color = 'white'
}: {
  position: 'topLeft' | 'topRight' | 'bottomLeft' | 'bottomRight';
  color?: string;
}) {
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
        transition: 'stroke 0.2s ease',
        ...styles[position]
      }}
    >
      <path
        d="M1 11V1H11"
        stroke={color}
        strokeWidth="2"
        strokeLinecap="square"
        fill="none"
      />
    </svg>
  );
}

// 카메라 포커스 초록색
const FOCUS_GREEN = '#00FF00';

const SPRING_CONFIG = {
  stiffness: 300,
  damping: 25,
  mass: 0.5
};

const DEFAULT_SIZE = 40; // 기본 상태에서 모서리 사각형 크기
const FRAME_PADDING = 8; // 호버 시 타겟보다 얼마나 더 크게 (바깥쪽으로)

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

  // 호버 시 미세 흔들림 offset
  const hoverOffsetX = useMotionValue(0);
  const hoverOffsetY = useMotionValue(0);
  const springHoverOffsetX = useSpring(hoverOffsetX, { stiffness: 150, damping: 15 });
  const springHoverOffsetY = useSpring(hoverOffsetY, { stiffness: 150, damping: 15 });

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
      // 호버: 타겟 요소보다 약간 크게 (프레임 느낌)
      boxX.set(targetRect.left - FRAME_PADDING);
      boxY.set(targetRect.top - FRAME_PADDING);
      boxWidth.set(targetRect.width + FRAME_PADDING * 2);
      boxHeight.set(targetRect.height + FRAME_PADDING * 2);
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

      // 기본 상태에서는 offset 초기화
      hoverOffsetX.set(0);
      hoverOffsetY.set(0);

      return () => {
        unsubX();
        unsubY();
      };
    }
  }, [isHovering, mouseX, mouseY, boxX, boxY, hoverOffsetX, hoverOffsetY]);

  // 호버 상태에서 마우스 움직임에 따른 미세 흔들림
  useEffect(() => {
    if (isHovering && targetRect) {
      const centerX = targetRect.left + targetRect.width / 2;
      const centerY = targetRect.top + targetRect.height / 2;
      const HOVER_SENSITIVITY = 0.03; // 흔들림 민감도 (3%)

      const unsubX = mouseX.on('change', (mx) => {
        const offsetX = (mx - centerX) * HOVER_SENSITIVITY;
        hoverOffsetX.set(offsetX);
      });
      const unsubY = mouseY.on('change', (my) => {
        const offsetY = (my - centerY) * HOVER_SENSITIVITY;
        hoverOffsetY.set(offsetY);
      });

      return () => {
        unsubX();
        unsubY();
      };
    }
  }, [isHovering, targetRect, mouseX, mouseY, hoverOffsetX, hoverOffsetY]);

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

      {/* 모서리 그룹 - 위치/크기 동적 변환 + 호버 시 미세 흔들림 */}
      <motion.div
        style={{
          position: 'absolute',
          x: springBoxX,
          y: springBoxY,
          width: springBoxWidth,
          height: springBoxHeight,
          rotate: springRotation,
          translateX: springHoverOffsetX,
          translateY: springHoverOffsetY
        }}
      >
        <CornerBracket position="topLeft" color={isHovering ? FOCUS_GREEN : 'white'} />
        <CornerBracket position="topRight" color={isHovering ? FOCUS_GREEN : 'white'} />
        <CornerBracket position="bottomLeft" color={isHovering ? FOCUS_GREEN : 'white'} />
        <CornerBracket position="bottomRight" color={isHovering ? FOCUS_GREEN : 'white'} />
      </motion.div>
    </div>
  );
}
