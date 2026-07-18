// 홈페이지 섹션(칼럼)의 단일 출처.
// 이 배열을 수정하면 (1) Keystatic 카테고리 선택지와 (2) 홈페이지 섹션이
// 순서까지 함께 바뀐다 — 컴포넌트나 그룹핑 로직은 건드릴 필요 없다.
// 카테고리를 추가/이름변경/재정렬하려면 여기 배열만 고치면 된다.
export const COLUMNS = [
  { value: "Essays", label: "Essays" },
  { value: "Interviews", label: "Interviews" },
  { value: "Newsletter", label: "Newsletter" },
  { value: "Retrospectives", label: "Retrospectives" },
] as const;

export type ColumnValue = (typeof COLUMNS)[number]["value"];
