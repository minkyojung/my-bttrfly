'use client';

import { useEffect, useRef } from 'react';
import { createRoot } from 'react-dom/client';
import { PostASCII } from './PostASCII';
import { PipelineASCII } from './PipelineASCII';
import { BlackholeASCII } from './BlackholeASCII';
import { PotyASCII } from './PotyASCII';

interface SectionASCIIRendererProps {
  containerRef: React.RefObject<HTMLDivElement | null>;
}

export function SectionASCIIRenderer({ containerRef }: SectionASCIIRendererProps) {
  const mountedRootsRef = useRef<Map<Element, ReturnType<typeof createRoot>>>(new Map());

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const placeholders = container.querySelectorAll('.section-ascii-placeholder');

    placeholders.forEach((placeholder) => {
      // 이미 마운트된 경우 스킵
      if (mountedRootsRef.current.has(placeholder)) return;

      const type = placeholder.getAttribute('data-type');
      const width = parseInt(placeholder.getAttribute('data-width') || '600', 10);
      const height = parseInt(placeholder.getAttribute('data-height') || '150', 10);

      const root = createRoot(placeholder);
      let component: React.ReactNode = null;

      if (type === 'fire') {
        component = <PostASCII width={width} height={height} />;
      } else if (type === 'pipeline') {
        component = <PipelineASCII width={width} height={height} />;
      } else if (type === 'blackhole') {
        component = <BlackholeASCII width={width} height={height} />;
      } else if (type === 'poty') {
        component = <PotyASCII width={width} height={height} />;
      }

      if (component) {
        root.render(
          <div style={{
            width: `${width}px`,
            height: `${height}px`,
            margin: '24px auto',
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center'
          }}>
            {component}
          </div>
        );
        mountedRootsRef.current.set(placeholder, root);
      }
    });

    // Cleanup
    return () => {
      mountedRootsRef.current.forEach((root) => {
        root.unmount();
      });
      mountedRootsRef.current.clear();
    };
  }, [containerRef]);

  return null;
}
