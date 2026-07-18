// 글 생성 시 title로부터 slug를 1회 생성한다. 생성 후에는 불변으로 취급된다
// (postUrl/canonical/sitemap이 slug에 의존하므로 링크 깨짐을 막기 위함).
export function slugify(title: string): string {
  return title
    .trim()
    .toLowerCase()
    .replace(/[^\p{L}\p{N}]+/gu, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 80);
}
