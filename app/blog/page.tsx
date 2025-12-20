'use client';

import { useEffect, useState } from 'react';

export default function BlogPage() {
  const [mounted, setMounted] = useState(false);
  const [AsciiRenderer, setAsciiRenderer] = useState<React.ComponentType<{ className?: string }> | null>(null);
  const [loadError, setLoadError] = useState<string | null>(null);

  console.log('[BlogPage] Render - mounted:', mounted, 'AsciiRenderer:', !!AsciiRenderer);

  useEffect(() => {
    console.log('[BlogPage] useEffect started');
    setMounted(true);

    // Dynamic import after mount
    console.log('[BlogPage] Starting dynamic import...');

    import('@/components/AsciiRenderer')
      .then((mod) => {
        console.log('[BlogPage] Import successful:', mod);
        setAsciiRenderer(() => mod.default);
      })
      .catch((err) => {
        console.error('[BlogPage] Import failed:', err);
        setLoadError(err.message || 'Unknown error');
      });
  }, []);

  if (loadError) {
    return (
      <main className="w-full h-screen bg-[#0a0a0a] flex flex-col items-center justify-center text-red-500 font-mono">
        <div>Load Error:</div>
        <div>{loadError}</div>
      </main>
    );
  }

  if (!mounted || !AsciiRenderer) {
    return (
      <main className="w-full h-screen bg-[#0a0a0a] flex items-center justify-center">
        <span className="text-green-500 font-mono animate-pulse">Loading ASCII...</span>
      </main>
    );
  }

  return (
    <main className="w-full h-screen bg-[#0a0a0a] overflow-hidden">
      <AsciiRenderer className="w-full h-full" />
    </main>
  );
}
