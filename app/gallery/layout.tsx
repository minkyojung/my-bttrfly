'use client';

import { CursorProvider, CustomCursor } from '@/components/cursor';

export default function GalleryLayout({
  children
}: {
  children: React.ReactNode;
}) {
  return (
    <CursorProvider>
      <div style={{ cursor: 'none' }}>
        {children}
        <CustomCursor />
      </div>
    </CursorProvider>
  );
}
