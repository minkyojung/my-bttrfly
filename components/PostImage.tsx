import Image from 'next/image';
import type { ImageMeta } from '@/lib/markdown';

interface PostImageProps {
  src: string;
  alt: string;
  meta?: ImageMeta;
}

export function PostImage({ src, alt, meta }: PostImageProps) {
  if (meta) {
    return (
      <span className="block my-6 rounded-md overflow-hidden">
        <Image
          src={src}
          alt={alt}
          width={meta.width}
          height={meta.height}
          className="block w-full h-auto max-w-full"
          sizes="(max-width: 600px) 100vw, 600px"
        />
      </span>
    );
  }

  return (
    <span className="block my-6 rounded-md overflow-hidden relative aspect-video w-full">
      <Image
        src={src}
        alt={alt}
        fill
        className="block w-full h-auto max-w-full object-cover"
        sizes="(max-width: 600px) 100vw, 600px"
        unoptimized
      />
    </span>
  );
}
