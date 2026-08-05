'use client';

import { useEffect } from 'react';

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <main className="bg-[#0a0a0a] min-h-screen flex items-center justify-center text-white">
      <div className="text-center">
        <h1 className="text-[72px] font-bold mb-4 tracking-[-0.05em]">
          Error
        </h1>
        <p className="text-[18px] text-[#7B7B7B] mb-8">
          문제가 발생했습니다
        </p>
        <button
          onClick={() => reset()}
          className="text-accent-warm bg-transparent border border-accent-warm px-6 py-3 text-base font-semibold rounded-md cursor-pointer"
        >
          다시 시도
        </button>
      </div>
    </main>
  );
}
