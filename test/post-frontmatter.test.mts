import { test } from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import matter from "gray-matter";
import { buildFrontmatter, validatePost } from "../lib/post-frontmatter.ts";

// 옮겨온 글의 전형적인 프론트매터 + 폼이 모르는 필드 하나.
const existing = {
  title: "옛 제목",
  date: "2024-03-25",
  category: "Interviews",
  source: "disquiet",
  canonical: "https://disquiet.io/articles/7bszyN",
  draft: true,
  translationOf: "some-other-post", // 폼에 없는 필드(수기 추가 가정)
};

const fullBody = {
  title: "새 제목",
  date: "2024-03-25",
  category: "Interviews",
  canonical: "https://disquiet.io/articles/7bszyN",
  source: "disquiet",
  draft: true,
  featured: false,
};

test("수정 시 폼이 모르는 필드가 보존된다", () => {
  // 이 동작이 없으면 저장할 때마다 폼 밖 필드가 사라진다(canonical 사고의 원인).
  const result = buildFrontmatter(fullBody, existing);
  assert.equal(result.translationOf, "some-other-post");
});

test("수정 시 canonical이 유지된다", () => {
  const result = buildFrontmatter(fullBody, existing);
  assert.equal(result.canonical, existing.canonical);
});

test("폼에서 비운 필드는 실제로 삭제된다", () => {
  // 단순 병합만 하면 지운 값이 기존 값으로 되살아난다.
  const result = buildFrontmatter(
    { ...fullBody, canonical: "", category: "", summary: "" },
    existing
  );
  assert.ok(!("canonical" in result), "canonical이 남아있음");
  assert.ok(!("category" in result), "category가 남아있음");
  // 그래도 폼 밖 필드는 건드리지 않는다.
  assert.equal(result.translationOf, "some-other-post");
});

test("source를 None으로 바꾸면 삭제된다", () => {
  const result = buildFrontmatter({ ...fullBody, source: "" }, existing);
  assert.ok(!("source" in result));
});

test("잘못된 source 값은 저장되지 않는다", () => {
  const result = buildFrontmatter({ ...fullBody, source: "medium" }, existing);
  assert.ok(!("source" in result));
});

test("title과 date는 항상 폼 값으로 갱신된다", () => {
  const result = buildFrontmatter(fullBody, existing);
  assert.equal(result.title, "새 제목");
  assert.equal(result.date, "2024-03-25");
});

test("draft와 featured는 항상 boolean으로 기록된다", () => {
  const result = buildFrontmatter({ title: "T", date: "2026-01-01" }, existing);
  assert.equal(result.draft, false);
  assert.equal(result.featured, false);

  const published = buildFrontmatter(
    { title: "T", date: "2026-01-01", draft: true, featured: true },
    existing
  );
  assert.equal(published.draft, true);
  assert.equal(published.featured, true);
});

test("생성 시에는 불필요한 키가 생기지 않는다", () => {
  const result = buildFrontmatter({
    title: "T",
    date: "2026-01-01",
    draft: false,
    featured: false,
  });
  assert.deepEqual(Object.keys(result).sort(), [
    "date",
    "draft",
    "featured",
    "title",
  ]);
});

test("원본 객체를 변형하지 않는다", () => {
  // 라우트가 넘긴 기존 프론트매터를 망가뜨리면 추적하기 어려운 버그가 된다.
  const snapshot = JSON.stringify(existing);
  buildFrontmatter({ ...fullBody, canonical: "" }, existing);
  assert.equal(JSON.stringify(existing), snapshot);
});

// --- validatePost ---

test("본문이 있으면 통과한다", () => {
  assert.equal(validatePost({ title: "T", date: "2026-01-01", content: "본문" }), null);
});

test("external이 있으면 본문 없이도 통과한다", () => {
  // 외부 발행 글은 공개 페이지가 원문으로 리다이렉트해서 보여줄 본문이 없다.
  // 이걸 막으면 그 글들은 카테고리 하나 고치는 것도 불가능해진다.
  assert.equal(
    validatePost({ title: "T", date: "2026-01-01", external: "https://example.com" }),
    null
  );
});

test("external도 본문도 없으면 거절한다", () => {
  const result = validatePost({ title: "T", date: "2026-01-01" });
  assert.match(result ?? "", /Body is required/);
});

test("공백뿐인 본문은 본문이 없는 것으로 친다", () => {
  const result = validatePost({ title: "T", date: "2026-01-01", content: "   \n  " });
  assert.match(result ?? "", /Body is required/);
});

test("공백뿐인 external은 본문을 면제해주지 않는다", () => {
  const result = validatePost({ title: "T", date: "2026-01-01", external: "  " });
  assert.match(result ?? "", /Body is required/);
});

test("파싱 불가한 날짜는 거절된다", () => {
  // 이 값은 프론트매터 → sitemap의 new Date()로 흘러가고, Invalid Date도
  // instanceof Date이므로 Next의 sitemap 직렬화가 RangeError로 죽는다. 즉 하나가
  // 커밋되면 그 뒤의 모든 배포가 실패하는데 API는 이미 200을 돌려준 상태다.
  for (const bad of [
    "nope",
    "2024/01/01",
    "24-01-01",
    "2024-1-1",
    // 형태는 맞지만 달력에 없는 날짜. Date.parse만으로는 조용히 굴러가서
    // 각각 3월 2일·3월 1일로 통과하므로 구성요소를 되짚어 잡아야 한다.
    "2024-02-31",
    "2023-02-29",
    "2024-13-01",
    "2024-00-10",
    "2024-01-01T00:00:00Z", // 시각까지 오면 YYYY-MM-DD 계약이 깨진다
  ]) {
    assert.match(
      validatePost({ title: "T", date: bad, content: "본문" }) ?? "",
      /Date/,
      `통과해버린 입력: ${bad}`
    );
  }
  assert.equal(
    validatePost({ title: "T", date: "2024-02-29", content: "본문" }),
    null,
    "윤년은 통과해야 한다"
  );
});

test("title과 date의 앞뒤 공백은 저장되지 않는다", () => {
  // validatePost는 trim한 값으로 검사하므로 공백이 붙은 값도 통과한다.
  // 그대로 저장하면 YAML에 공백이 남아 이후 비교·정렬이 어긋난다.
  const result = buildFrontmatter({ title: "  T  ", date: "  2024-01-01  " });
  assert.equal(result.title, "T");
  assert.equal(result.date, "2024-01-01");
});

test("title과 date는 여전히 필수다", () => {
  assert.match(validatePost({ date: "2026-01-01", content: "본문" }) ?? "", /Title/);
  assert.match(validatePost({ title: "T", content: "본문" }) ?? "", /Date/);
  // 문자열이 아닌 값도 없는 것으로 친다(신뢰할 수 없는 입력).
  assert.match(validatePost({ title: 123, date: "2026-01-01", content: "본문" }) ?? "", /Title/);
});

test("실제 글은 전부 저장 가능해야 한다", () => {
  // 회귀 방지: 본문 없는 글 7편이 /write에서 저장조차 안 되던 것이 이 규칙의 이유다.
  // 어떤 글이든 열어서 그대로 다시 저장하는 건 언제나 성공해야 한다.
  const dir = path.join(process.cwd(), "content/posts");
  const files = fs.readdirSync(dir).filter((f) => f.endsWith(".md"));
  assert.ok(files.length > 0, "content/posts가 비어 있음 — 테스트가 무의미해짐");

  const empty: string[] = [];
  for (const file of files) {
    const { data, content } = matter(fs.readFileSync(path.join(dir, file), "utf8"));
    if (!content.trim()) empty.push(file);
    const result = validatePost({
      title: data.title,
      // 프론트매터의 date는 gray-matter가 Date로 파싱하기도 한다. 폼은 항상
      // 문자열을 보내므로 여기서만 맞춰준다.
      date: data.date instanceof Date ? data.date.toISOString().slice(0, 10) : data.date,
      external: data.external,
      content,
    });
    assert.equal(result, null, `${file} 이 저장 불가로 판정됨: ${result}`);
  }

  // 빈 본문 글이 실제로 존재해야 위 단언이 의미가 있다. 0이 되면 이 테스트는
  // 아무것도 지키지 않으므로, 그때는 테스트를 지우든 고치든 해야 한다.
  assert.ok(empty.length > 0, "본문 없는 글이 하나도 없음 — 이 테스트는 더 이상 아무것도 검증하지 않는다");
});
