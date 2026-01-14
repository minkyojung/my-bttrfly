import fs from 'fs';
import path from 'path';

export interface Photo {
  src: string;
  alt: string;
  filename: string;
}

const galleryDirectory = path.join(process.cwd(), 'public/images/gallery');

/**
 * 갤러리 사진 목록을 가져옵니다.
 * public/images/gallery/ 폴더가 없거나 비어있으면 빈 배열을 반환합니다.
 */
export async function getGalleryPhotos(): Promise<Photo[]> {
  // 폴더가 없으면 빈 배열 반환 (기존 동작 유지)
  if (!fs.existsSync(galleryDirectory)) {
    return [];
  }

  const files = fs.readdirSync(galleryDirectory)
    .filter(file => /\.(jpg|jpeg|png|webp|gif|svg)$/i.test(file))
    .sort(); // 파일명 순 정렬

  return files.map(filename => ({
    src: `/images/gallery/${filename}`,
    alt: filename.replace(/\.[^.]+$/, '').replace(/[-_]/g, ' '),
    filename
  }));
}
