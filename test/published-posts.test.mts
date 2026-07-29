import { test } from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import matter from "gray-matter";

// 사이트가 무엇을 발행하는지에 대한 불변식.
//
// 이 파일이 생긴 이유: 1면 레이아웃을 만들려고 생성한 샘플 글 14편을 발행하고
// 실제 글 31편을 전부 draft로 내린 커밋(96ee632)이 main까지 올라가, 12일 동안
// minkyojung.com이 가짜 글만 보여줬다. sitemap도 그 상태로 나갔다. 사람이
// 알아채기 전까지 아무것도 막지 않았다 — 그 자리를 이 테스트가 대신한다.

const postsDir = path.join(process.cwd(), "content/posts");

interface PostFile {
  file: string;
  draft: boolean;
  isSample: boolean;
}

function readPosts(): PostFile[] {
  return fs
    .readdirSync(postsDir)
    .filter((f) => f.endsWith(".md"))
    .map((file) => {
      const { data } = matter(fs.readFileSync(path.join(postsDir, file), "utf8"));
      return {
        file,
        // lib/markdown.ts의 parseFile과 같은 판정 — 필드가 없으면 발행이다.
        draft: data.draft === true,
        isSample: file.startsWith("sample-"),
      };
    });
}

test("샘플 글은 발행되지 않는다", () => {
  const published = readPosts().filter((p) => p.isSample && !p.draft);
  assert.deepEqual(
    published.map((p) => p.file),
    [],
    "sample-* 는 레이아웃 작업용 더미다. 발행되면 사이트에 가짜 글이 뜬다"
  );
});

test("실제 글이 발행돼 있다", () => {
  const posts = readPosts();
  const realPublished = posts.filter((p) => !p.isSample && !p.draft);

  // 정확한 편수를 박으면 글을 쓸 때마다 테스트를 고쳐야 한다. 지키려는 것은
  // "실제 글이 통째로 사라지지 않았다"이므로 하한선만 둔다.
  assert.ok(
    realPublished.length >= 20,
    `발행된 실제 글이 ${realPublished.length}편뿐이다. ` +
      `전체를 draft로 내린 변경이 섞이지 않았는지 확인할 것`
  );
});

test("샘플 글이 실제 글보다 많이 보이지 않는다", () => {
  // 위 두 단언을 모두 통과하면서도 샘플이 사이트를 지배하는 상태는 만들 수 없어야
  // 한다. 샘플이 전부 사라지면(파일 삭제) 이 테스트는 자연히 통과한다.
  const posts = readPosts();
  const samplesShown = posts.filter((p) => p.isSample && !p.draft).length;
  const realShown = posts.filter((p) => !p.isSample && !p.draft).length;
  assert.ok(
    samplesShown <= realShown,
    `발행된 글 중 샘플이 ${samplesShown}편, 실제 글이 ${realShown}편이다`
  );
});
