import type { Post } from './markdown';

// 글 섹션(칼럼)의 단일 출처.
// 이 배열을 수정하면 /columns/<slug> 섹션 페이지가 순서까지 함께 바뀐다 —
// 컴포넌트나 그룹핑 로직은 건드릴 필요 없다.
// 카테고리를 추가/이름변경/재정렬하려면 여기 배열만 고치면 된다.
export const COLUMNS = [
  { value: "Essays", label: "Essays" },
  { value: "Interviews", label: "Interviews" },
  { value: "Newsletter", label: "Newsletter" },
  { value: "Retrospectives", label: "Retrospectives" },
] as const;

// 섹션 페이지 주소(/columns/<slug>)와 카테고리 값 사이의 변환. 프론트매터의
// 카테고리는 "Essays"처럼 대문자로 시작하지만 URL은 소문자를 쓴다.
export function columnSlug(value: string): string {
  return value.toLowerCase();
}

export const columnUrl = (value: string) => `/columns/${columnSlug(value)}`;

export function columnFromSlug(slug: string) {
  return COLUMNS.find((c) => columnSlug(c.value) === slug);
}

export interface ColumnGroup {
  value: string;
  label: string;
  posts: Post[];
  // 자르기 전의 전체 편수. 목록은 칼럼마다 몇 편만 보여주므로, 섹션 페이지로 가는
  // 링크가 "여기 말고 더 있다"를 말해줄 수 있어야 한다.
  total: number;
}

// 카테고리(칼럼)별로 글을 묶는다. 섹션 순서 = COLUMNS 배열 순서.
// posts는 getAllPosts()에서 날짜 내림차순으로 들어오므로 각 그룹도 최신순.
//
// COLUMNS 밖의 카테고리는 여기서 버려진다 — 예전에는 뒤에 따로 붙여 살렸지만,
// 그 글은 어차피 /columns/<slug>가 없어 링크될 곳이 없었다. 지금은
// test/published-posts.test.mts가 발행 전에 막으므로 런타임 방어가 필요 없다.
export function groupByColumn(posts: Post[], perColumn = 4): ColumnGroup[] {
  return COLUMNS.map((c) => ({
    value: c.value as string,
    label: c.label as string,
    posts: posts.filter((p) => p.category === c.value),
  }))
    .filter((group) => group.posts.length > 0)
    .map((group) => ({
      ...group,
      total: group.posts.length,
      posts: group.posts.slice(0, perColumn),
    }));
}
