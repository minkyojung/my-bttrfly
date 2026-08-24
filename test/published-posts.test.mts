import { test } from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import matter from "gray-matter";
import { COLUMNS } from "../lib/columns.ts";

// 사이트가 무엇을 발행하는지에 대한 불변식.
//
// 이 파일이 생긴 이유: 1면 레이아웃을 만들려고 생성한 샘플 글 14편을 발행하고
// 실제 글 31편을 전부 draft로 내린 커밋(96ee632)이 main까지 올라가, 12일 동안
// minkyojung.com이 가짜 글만 보여줬다. sitemap도 그 상태로 나갔다. 사람이
// 알아채기 전까지 아무것도 막지 않았다 — 그 자리를 이 테스트가 대신한다.
// 샘플은 이후 전부 삭제했고, 아래 첫 테스트가 그 상태를 지킨다.

const postsDir = path.join(process.cwd(), "content/posts");

function readPosts() {
  return fs
    .readdirSync(postsDir)
    .filter((f) => f.endsWith(".md"))
    .map((file) => {
      const { data } = matter(
        fs.readFileSync(path.join(postsDir, file), "utf8")
      );
      // lib/markdown.ts의 parseFile과 같은 판정 — 필드가 없으면 발행이다.
      return { file, data, draft: data.draft === true };
    });
}

test("레이아웃용 더미 글이 저장소에 없다", () => {
  const dummies = readPosts()
    .map((p) => p.file)
    .filter((f) => f.startsWith("sample-") || f === "style-specimen.md");
  assert.deepEqual(
    dummies,
    [],
    "레이아웃 시안은 content/posts에 두지 않는다. 발행 상태가 뒤바뀌면 사이트에 가짜 글이 뜬다"
  );
});

test("실제 글이 발행돼 있다", () => {
  // 정확한 편수를 박으면 글을 쓸 때마다 테스트를 고쳐야 한다. 지키려는 것은
  // "실제 글이 통째로 사라지지 않았다"이므로 하한선만 둔다.
  const published = readPosts().filter((p) => !p.draft);
  assert.ok(
    published.length >= 15,
    `발행된 글이 ${published.length}편뿐이다. ` +
      `전체를 draft로 내린 변경이 섞이지 않았는지 확인할 것`
  );
});

test("발행된 글은 전부 제목과 알려진 카테고리를 갖는다", () => {
  // 카테고리가 COLUMNS 밖이면 그 글은 홈에도 /columns에도 걸리지 않아
  // sitemap에만 남고 어디서도 링크되지 않는 고아가 된다.
  const known = new Set<string>(COLUMNS.map((c) => c.value));
  for (const { file, data, draft } of readPosts()) {
    if (draft) continue;
    assert.ok(
      typeof data.title === "string" && data.title.trim(),
      `${file} 에 title이 없다`
    );
    assert.ok(
      known.has(String(data.category)),
      `${file} 의 category가 COLUMNS에 없다: ${String(data.category)}`
    );
  }
});
