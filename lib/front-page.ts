import type { Post } from './markdown';

export interface FrontPageSlices {
  hero: Post;
  secondary: Post[];
  recent: Post[];
  archive: Post[];
}

// posts는 getAllPosts()에서 날짜 내림차순으로 정렬되어 들어온다.
// 첫 featured 글이 곧 가장 최근의 featured 글.
export function sliceFrontPage(posts: Post[]): FrontPageSlices | null {
  if (posts.length === 0) return null;

  const hero = posts.find((post) => post.featured) ?? posts[0];
  const rest = posts.filter((post) => post.slug !== hero.slug);

  return {
    hero,
    secondary: rest.slice(0, 4),
    recent: rest.slice(4, 10),
    archive: rest.slice(10),
  };
}
