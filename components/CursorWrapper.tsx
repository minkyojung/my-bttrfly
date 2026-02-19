'use client';

import { CursorProvider, CustomCursor } from '@/components/cursor';

export function CursorWrapper({ children }: { children: React.ReactNode }) {
  return (
    <CursorProvider>
      <div style={{ cursor: 'none' }}>
        {children}
        <CustomCursor />
      </div>
    </CursorProvider>
  );
}
