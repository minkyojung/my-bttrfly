import type { Post } from './markdown';

export type CarouselPost = Pick<Post, 'slug' | 'title' | 'images' | 'thumbnail' | 'date' | 'readingTime' | 'preview'>;

// images는 Post에서 optional이지만 carousel에서는 항상 필요
// page.tsx에서 이미 images: p.images || [] 로 변환 중
export interface CarouselPostRequired extends Omit<CarouselPost, 'images'> {
  images: string[];
}
