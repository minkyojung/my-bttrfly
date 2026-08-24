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

// 내비게이션(글 목록·섹션 페이지·사이트맵)이 실제로 쓰는 상위 분류. 개별 글의
// category(Essays/Interviews/...)는 Kicker 배지와 COLUMNS 유효성 검사에만 남고,
// 사람이 오가는 경로는 이 둘로 접힌다 — Interviews(디스콰이엇에서 쓴 인터뷰)와
// 나머지 전부인 Personal이다. key는 URL(/columns/work)이라 그대로 두고 표시 이름만
// Interviews로 부른다 — 카드마다 붙는 Kicker가 이미 그 이름을 쓰고 있다.
export const SECTIONS = [
  { key: "personal", label: "Personal", categories: ["Essays", "Newsletter", "Retrospectives"] },
  { key: "work", label: "Interviews", categories: ["Interviews"] },
] as const;

export function sectionFromSlug(slug: string) {
  return SECTIONS.find((s) => s.key === slug);
}

// post.category가 속한 섹션을 찾는다. 글 상세 페이지가 "같은 섹션의 다른 글"을
// 고를 때 category 하나가 아니라 섹션 전체(Essays+Newsletter+Retrospectives)에서
// 골라야 하므로 필요하다.
export function sectionOf(category: string | undefined) {
  if (!category) return undefined;
  return SECTIONS.find((s) => (s.categories as readonly string[]).includes(category));
}

export interface SectionGroup {
  value: string;
  label: string;
  posts: Post[];
  total: number;
}

// 섹션별로 글을 묶는다. Personal은 세 카테고리를 날짜순으로 평평하게 섞는다 —
// 하위 구분을 보여주면 결국 예전의 4칼럼으로 돌아가는 셈이다.
export function groupBySection(posts: Post[], perSection = 6): SectionGroup[] {
  return SECTIONS.map((s) => {
    const matched = posts.filter(
      (p) => p.category && (s.categories as readonly string[]).includes(p.category)
    );
    return { value: s.key as string, label: s.label as string, posts: matched, total: matched.length };
  })
    .filter((group) => group.posts.length > 0)
    .map((group) => ({ ...group, posts: group.posts.slice(0, perSection) }));
}
