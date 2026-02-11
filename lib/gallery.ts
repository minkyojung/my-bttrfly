import fs from 'fs';
import path from 'path';

export interface PhotoMetadata {
  date?: string;      // 촬영일 (예: "2024.12.25")
  location?: string;  // 위치 (예: "Seoul, Korea")
  camera?: string;    // 카메라 (예: "iPhone 15 Pro")
  description?: string; // 설명
}

export interface Photo {
  src: string;
  alt: string;
  filename: string;
  metadata?: PhotoMetadata;
}

const galleryDirectory = path.join(process.cwd(), 'public/images/gallery');
const metadataFile = path.join(galleryDirectory, 'metadata.json');

/**
 * 메타데이터 JSON 파일을 읽어옵니다.
 */
function loadMetadata(): Record<string, PhotoMetadata> {
  if (!fs.existsSync(metadataFile)) {
    return {};
  }
  try {
    const content = fs.readFileSync(metadataFile, 'utf-8');
    return JSON.parse(content);
  } catch {
    return {};
  }
}

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

  const metadata = loadMetadata();

  return files.map(filename => ({
    src: `/images/gallery/${filename}`,
    alt: filename.replace(/\.[^.]+$/, '').replace(/[-_]/g, ' '),
    filename,
    metadata: metadata[filename]
  }));
}

/**
 * 메타데이터를 저장합니다.
 */
export function saveMetadata(data: Record<string, PhotoMetadata>): void {
  if (!fs.existsSync(galleryDirectory)) {
    fs.mkdirSync(galleryDirectory, { recursive: true });
  }
  fs.writeFileSync(metadataFile, JSON.stringify(data, null, 2));
}
