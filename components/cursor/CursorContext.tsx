'use client';

import { createContext, useContext, useState, useCallback, ReactNode } from 'react';

interface CursorContextType {
  targetRect: DOMRect | null;
  isHovering: boolean;
  setTarget: (rect: DOMRect | null) => void;
}

const CursorContext = createContext<CursorContextType>({
  targetRect: null,
  isHovering: false,
  setTarget: () => {}
});

export function CursorProvider({ children }: { children: ReactNode }) {
  const [targetRect, setTargetRect] = useState<DOMRect | null>(null);

  const setTarget = useCallback((rect: DOMRect | null) => {
    setTargetRect(rect);
  }, []);

  return (
    <CursorContext.Provider
      value={{
        targetRect,
        isHovering: targetRect !== null,
        setTarget
      }}
    >
      {children}
    </CursorContext.Provider>
  );
}

export function useCursor() {
  return useContext(CursorContext);
}
