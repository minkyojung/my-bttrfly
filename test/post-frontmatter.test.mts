import { test } from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import matter from "gray-matter";
import { isValidPostDate } from "../lib/post-frontmatter.ts";

test("파싱 불가한 날짜는 거절된다", () => {
  // 이 값은 프론트매터 → sitemap의 new Date()로 흘러가고, Invalid Date도
  // instanceof Date이므로 Next의 sitemap 직렬화가 RangeError로 죽는다. 즉 하나가
  // 커밋되면 그 뒤의 모든 배포가 실패한다 — 어느 파일 때문인지도 모르는 채로.
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
    assert.equal(isValidPostDate(bad), false, `통과해버린 입력: ${bad}`);
  }
});

test("윤년의 2월 29일은 통과한다", () => {
  assert.equal(isValidPostDate("2024-02-29"), true);
  assert.equal(isValidPostDate("2000-02-29"), true); // 400으로 나눠지는 해
  assert.equal(isValidPostDate("1900-02-29"), false); // 100으로만 나눠지는 해
});

test("발행된 글은 전부 유효한 날짜를 갖는다", () => {
  // 회귀 방지: lib/markdown.ts의 normalizeDate가 빌드 시점에 던지는 것과 같은
  // 규칙이다. 여기서 먼저 깨져야 어느 파일인지 알고 고칠 수 있다.
  const dir = path.join(process.cwd(), "content/posts");
  const files = fs.readdirSync(dir).filter((f) => f.endsWith(".md"));
  assert.ok(files.length > 0, "content/posts가 비어 있음 — 테스트가 무의미해짐");

  for (const file of files) {
    const { data } = matter(fs.readFileSync(path.join(dir, file), "utf8"));
    // gray-matter는 따옴표 없는 날짜를 Date로 파싱한다. 공개 사이트의
    // normalizeDate도 두 형태를 모두 받으므로 여기서도 맞춘다.
    const date =
      data.date instanceof Date
        ? data.date.toISOString().slice(0, 10)
        : data.date;
    assert.equal(
      typeof date === "string" && isValidPostDate(date),
      true,
      `${file} 의 date가 유효하지 않음: ${String(data.date)}`
    );
  }
});
