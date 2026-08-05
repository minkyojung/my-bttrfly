// 홈페이지 섹션(칼럼)의 단일 출처.
// 이 배열을 수정하면 (1) /write 에디터의 카테고리 선택지 (2) 홈페이지 섹션
// (3) /columns/<slug> 섹션 페이지가 순서까지 함께 바뀐다 — 컴포넌트나 그룹핑
// 로직은 건드릴 필요 없다.
// 카테고리를 추가/이름변경/재정렬하려면 여기 배열만 고치면 된다.
export const COLUMNS = [
  { value: "Essays", label: "Essays" },
  { value: "Interviews", label: "Interviews" },
  { value: "Newsletter", label: "Newsletter" },
  { value: "Retrospectives", label: "Retrospectives" },
] as const;

export type ColumnValue = (typeof COLUMNS)[number]["value"];

// 섹션 페이지 주소(/columns/<slug>)와 카테고리 값 사이의 변환. 프론트매터의
// 카테고리는 "Essays"처럼 대문자로 시작하지만 URL은 소문자를 쓴다.
export function columnSlug(value: string): string {
  return value.toLowerCase();
}

export const columnUrl = (value: string) => `/columns/${columnSlug(value)}`;

export function columnFromSlug(slug: string) {
  return COLUMNS.find((c) => columnSlug(c.value) === slug);
}
