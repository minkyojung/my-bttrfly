'use client';

import { useCallback, useEffect, useRef } from 'react';

const SPEED = 60; // pixels per second
const HOVER_SPEED_FACTOR = 0.15;
const SNAP_LERP_SPEED = 8;

interface UseCarouselScrollOptions {
  slotCount: number;
  slotHeight: number;
  onCenterChange: (slotIndex: number) => void;
}

interface DragHandlers {
  onPointerDown: (e: React.PointerEvent) => void;
  didDrag: () => boolean;
}

export function useCarouselScroll({
  slotCount,
  slotHeight,
  onCenterChange,
}: UseCarouselScrollOptions) {
  const scrollOffsetRef = useRef(0);
  const hoveredRef = useRef(false);
  const draggingRef = useRef(false);
  const didDragRef = useRef(false);
  const dragStartYRef = useRef(0);
  const dragOffsetStartRef = useRef(0);
  const dragVelocityRef = useRef(0);
  const dragLastYRef = useRef(0);
  const dragLastTimeRef = useRef(0);
  const rafRef = useRef<number>(0);
  const lastTimeRef = useRef<number>(0);
  const snapTargetRef = useRef<number | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const cardRefs = useRef<Map<number, HTMLDivElement>>(new Map());

  const totalLoopHeight = slotCount * slotHeight;

  const wrapOffset = useCallback((offset: number) => {
    return ((offset % totalLoopHeight) + totalLoopHeight) % totalLoopHeight;
  }, [totalLoopHeight]);

  // RAF animation loop
  useEffect(() => {
    if (slotCount === 0) return;

    const loop = (time: number) => {
      if (lastTimeRef.current === 0) lastTimeRef.current = time;
      const dt = (time - lastTimeRef.current) / 1000;
      lastTimeRef.current = time;
      const clampedDt = Math.min(dt, 0.1);

      if (draggingRef.current) {
        // 드래그 중 — offset은 pointerMove에서 직접 업데이트
      } else if (Math.abs(dragVelocityRef.current) > 5) {
        // 관성 스크롤
        scrollOffsetRef.current += dragVelocityRef.current * clampedDt;
        dragVelocityRef.current *= 0.95;
        if (Math.abs(dragVelocityRef.current) <= 5) {
          dragVelocityRef.current = 0;
        }
      } else if (snapTargetRef.current !== null) {
        const target = snapTargetRef.current;
        const diff = target - scrollOffsetRef.current;
        if (Math.abs(diff) < 0.5) {
          scrollOffsetRef.current = target;
          snapTargetRef.current = null;
        } else {
          scrollOffsetRef.current += diff * Math.min(1, clampedDt * SNAP_LERP_SPEED);
        }
      } else {
        const speedFactor = hoveredRef.current ? HOVER_SPEED_FACTOR : 1;
        scrollOffsetRef.current -= SPEED * speedFactor * clampedDt;
      }

      const containerHeight = containerRef.current?.clientHeight ?? 800;
      const viewCenterY = containerHeight / 2;
      const currentOffset = wrapOffset(scrollOffsetRef.current);

      let closestSlot = 0;
      let closestDist = Infinity;

      for (let slot = 0; slot < slotCount; slot++) {
        const el = cardRefs.current.get(slot);
        if (!el) continue;

        const homeY = slot * slotHeight;
        let visibleY = homeY - currentOffset;

        while (visibleY < -totalLoopHeight / 2) visibleY += totalLoopHeight;
        while (visibleY >= totalLoopHeight / 2) visibleY -= totalLoopHeight;

        const finalY = visibleY + viewCenterY - slotHeight / 2;
        el.style.transform = `translateY(${finalY}px)`;

        const cardCenterY = finalY + slotHeight / 2;
        const distFromCenter = Math.abs(cardCenterY - viewCenterY);
        if (distFromCenter < closestDist) {
          closestDist = distFromCenter;
          closestSlot = slot;
        }
      }

      onCenterChange(closestSlot);
      rafRef.current = requestAnimationFrame(loop);
    };

    rafRef.current = requestAnimationFrame(loop);
    return () => cancelAnimationFrame(rafRef.current);
  }, [slotCount, slotHeight, totalLoopHeight, wrapOffset, onCenterChange]);

  // Keyboard navigation
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'ArrowDown' || e.key === 'ArrowRight') {
        const next = Math.round(scrollOffsetRef.current / slotHeight) - 1;
        snapTargetRef.current = next * slotHeight;
      }
      if (e.key === 'ArrowUp' || e.key === 'ArrowLeft') {
        const prev = Math.round(scrollOffsetRef.current / slotHeight) + 1;
        snapTargetRef.current = prev * slotHeight;
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [slotHeight]);

  const slowDown = useCallback(() => {
    hoveredRef.current = true;
  }, []);

  const speedUp = useCallback(() => {
    hoveredRef.current = false;
    snapTargetRef.current = null;
  }, []);

  const setCardRef = useCallback((slot: number, el: HTMLDivElement | null) => {
    if (el) cardRefs.current.set(slot, el);
    else cardRefs.current.delete(slot);
  }, []);

  // Drag handlers
  const drag: DragHandlers = {
    onPointerDown: (e: React.PointerEvent) => {
      draggingRef.current = true;
      didDragRef.current = false;
      dragVelocityRef.current = 0;
      dragStartYRef.current = e.clientY;
      dragOffsetStartRef.current = scrollOffsetRef.current;
      dragLastYRef.current = e.clientY;
      dragLastTimeRef.current = performance.now();
      const container = e.currentTarget as HTMLElement;
      container.style.cursor = 'grabbing';

      const onMove = (me: PointerEvent) => {
        if (!draggingRef.current) return;
        const dy = me.clientY - dragStartYRef.current;
        if (Math.abs(dy) > 5) {
          didDragRef.current = true;
        }
        scrollOffsetRef.current = dragOffsetStartRef.current + dy;

        const now = performance.now();
        const timeDelta = (now - dragLastTimeRef.current) / 1000;
        if (timeDelta > 0) {
          dragVelocityRef.current = (me.clientY - dragLastYRef.current) / timeDelta;
        }
        dragLastYRef.current = me.clientY;
        dragLastTimeRef.current = now;
      };

      const onUp = () => {
        draggingRef.current = false;
        container.style.cursor = 'grab';
        window.removeEventListener('pointermove', onMove);
        window.removeEventListener('pointerup', onUp);
      };

      window.addEventListener('pointermove', onMove);
      window.addEventListener('pointerup', onUp);
    },
    didDrag: () => didDragRef.current,
  };

  return {
    containerRef,
    setCardRef,
    slowDown,
    speedUp,
    drag,
  };
}
