import Image from 'next/image';
import type { ImageMeta } from '@/lib/markdown';

interface PostImageProps {
  src: string;
  alt: string;
  meta?: ImageMeta;
}

/**
 * 본문 이미지. 생김새(폭 상한·비율·모서리·여백)는 tailwind.config.ts의
 * typography가 정하므로, 여기서는 크기를 아는지 여부만 가른다.
 *
 * 크기는 '제대로 그리기' 위해 필요한 게 아니다 — 브라우저는 이미지를 받으면
 * 알아서 비율대로 그린다. 크기가 있으면 로딩 전에 자리를 미리 잡아 화면이
 * 흔들리지 않게(레이아웃 시프트 방지) 할 수 있을 뿐이다. 예전에는 크기를
 * 모르면 16:9라고 가정하고 잘라냈는데(object-cover), 그래서 가로로 긴 이미지가
 * 프리뷰에서 뭉텅 잘렸다.
 */
export function PostImage({ src, alt, meta }: PostImageProps) {
  if (meta) {
    return (
      <Image
        src={src}
        alt={alt}
        width={meta.width}
        height={meta.height}
        sizes="(max-width: 600px) 100vw, 600px"
      />
    );
  }

  // 크기를 모르는 경우(프리뷰 등). next/image는 크기나 fill을 요구하므로 여기서는
  // 평범한 img를 쓴다. 자리를 미리 잡지 못해 로딩 중 살짝 밀릴 수 있지만,
  // 잘못된 비율로 잘라내는 것보다 낫다.
  // eslint-disable-next-line @next/next/no-img-element
  return <img src={src} alt={alt} loading="lazy" />;
}
