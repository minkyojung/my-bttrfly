import { test } from "node:test";
import assert from "node:assert/strict";
import { buildFrontmatter } from "../lib/post-frontmatter.ts";

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
