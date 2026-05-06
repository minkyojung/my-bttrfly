import Image from 'next/image';
import type { ImageMeta } from '@/lib/markdown';
import styles from './PostImage.module.css';

interface PostImageProps {
  src: string;
  alt: string;
  meta?: ImageMeta;
}

export function PostImage({ src, alt, meta }: PostImageProps) {
  if (meta) {
    return (
      <span className={styles.figure}>
        <Image
          src={src}
          alt={alt}
          width={meta.width}
          height={meta.height}
          className={styles.image}
          sizes="(max-width: 600px) 100vw, 600px"
        />
      </span>
    );
  }

  return (
    <span className={`${styles.figure} ${styles.fillFigure}`}>
      <Image
        src={src}
        alt={alt}
        fill
        className={styles.image}
        sizes="(max-width: 600px) 100vw, 600px"
        unoptimized
      />
    </span>
  );
}
