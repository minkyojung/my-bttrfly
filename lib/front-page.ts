import type { Post } from './markdown';
import { COLUMNS } from './columns';

export interface ColumnGroup {
  value: string;
  label: string;
  posts: Post[];
  // 자르기 전의 전체 편수. 1면은 칼럼마다 몇 편만 보여주므로, 섹션 페이지로 가는
  // 링크가 "여기 말고 더 있다"를 말해줄 수 있어야 한다.
  total: number;
}

// 카테고리(칼럼)별로 글을 묶는다. 섹션 순서 = COLUMNS 배열 순서.
// COLUMNS에 없는 카테고리(레거시/오타)는 뒤에 자체 이름으로 배치해 누락되지 않게 한다.
// posts는 getAllPosts()에서 날짜 내림차순으로 들어오므로 각 그룹도 최신순.
export function groupByColumn(posts: Post[], perColumn = 4): ColumnGroup[] {
  const known = COLUMNS.map((c) => ({
    value: c.value as string,
    label: c.label as string,
    posts: posts.filter((p) => p.category === c.value),
  }));

  const knownValues = new Set<string>(COLUMNS.map((c) => c.value));
  const extras = new Map<string, Post[]>();
  for (const post of posts) {
    const cat = post.category;
    if (cat && !knownValues.has(cat)) {
      const bucket = extras.get(cat) ?? [];
      bucket.push(post);
      extras.set(cat, bucket);
    }
  }
  const extraGroups = [...extras.entries()].map(([value, groupPosts]) => ({
    value,
    label: value,
    posts: groupPosts,
  }));

  return [...known, ...extraGroups]
    .filter((group) => group.posts.length > 0)
    .map((group) => ({
      ...group,
      total: group.posts.length,
      posts: group.posts.slice(0, perColumn),
    }));
}

export interface FrontPageSlices {
  hero: Post;
  secondary: Post[];
  recent: Post[];
}

// posts는 getAllPosts()에서 날짜 내림차순으로 정렬되어 들어온다.
// 첫 featured 글이 곧 가장 최근의 featured 글.
export function sliceFrontPage(posts: Post[]): FrontPageSlices | null {
  if (posts.length === 0) return null;

  const hero = posts.find((post) => post.featured) ?? posts[0];
  const rest = posts.filter((post) => post.slug !== hero.slug);

  return {
    hero,
    secondary: rest.slice(0, 2),
    recent: rest.slice(2, 4),
  };
}
