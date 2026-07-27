// slug 규칙의 단일 출처. 생성기(slugify) · 저자 입력 검증 · API 검증이 모두
// 이 규칙을 공유해야 "만들 수는 있는데 못 읽는 slug"가 생기지 않는다.
// 소문자 영숫자와 하이픈만 허용한다(비ASCII 불가).
export const SLUG_PATTERN = /^[a-z0-9-]+$/;

// title로부터 slug 초안을 만든다. slug는 저자가 직접 편집 가능한 필드이며
// 이 함수는 제안값만 만든다 — 비ASCII 문자(한글 등)는 버려지므로 순수 한글
// 제목이면 빈 문자열이 되고, 그 경우 저자가 직접 입력해야 한다.
// 생성 후 slug는 불변으로 취급된다(postUrl/canonical/sitemap이 의존).
export function slugify(title: string): string {
  return title
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 80)
    .replace(/-+$/g, "");
}
