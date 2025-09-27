'use client';

import Image from 'next/image';
import { useTheme } from './ThemeProvider';

export function ProfilePhoto() {
  const { toggleTheme } = useTheme();

  return (
    <div className="w-16 h-16 lg:w-20 lg:h-20 mx-auto mb-3 lg:mb-4 relative cursor-pointer" onClick={toggleTheme}>
      <Image
        src="/images/profile.png"
        alt="Profile (클릭하여 테마 변경)"
        fill
        className="object-cover border-2 transition-opacity hover:opacity-80"
        style={{ borderColor: 'var(--profile-border-color)' }}
        sizes="(max-width: 1024px) 64px, 80px"
      />
    </div>
  );
}