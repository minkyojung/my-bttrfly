import { type ClassValue, clsx } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

// YYYY-MM-DD → 명시적으로 파싱 (UTC 타임존 이슈 방지)
export function formatDate(dateStr: string): string {
  if (!dateStr) return '';
  const parts = dateStr.split('-');
  if (parts.length === 3) {
    const d = new Date(Number(parts[0]), Number(parts[1]) - 1, Number(parts[2]));
    return d.toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' });
  }
  const d = new Date(dateStr);
  if (isNaN(d.getTime())) return '';
  return d.toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' });
}

// HTML에서 이미지 URL 추출
export function extractImagesFromHtml(htmlStr: string): string[] {
  const regex = /<img[^>]+src="([^"]+)"/g;
  const images: string[] = [];
  let match;
  while ((match = regex.exec(htmlStr)) !== null) {
    images.push(match[1]);
  }
  return images;
}

// 읽는 시간 계산 (분당 400자 기준)
// HTML 또는 마크다운 모두 처리 가능
export function calculateReadingTime(content: string): string {
  const plainText = content
    .replace(/<[^>]*>/g, '')        // HTML 태그 제거
    .replace(/[#*`\[\]!]/g, '')     // 마크다운 기호 제거
    .replace(/\s+/g, ' ');
  const chars = plainText.length;
  const minutes = Math.max(1, Math.ceil(chars / 400));
  return `${minutes} min read`;
}
