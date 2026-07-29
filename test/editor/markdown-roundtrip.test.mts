import { test } from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import matter from "gray-matter";
import { Editor } from "@tiptap/core";
import { editorExtensions } from "../../lib/editor-extensions.ts";

// 에디터는 글자 하나만 고쳐도 본문 전체를 다시 써서 저장한다. 그래서 왕복
// (마크다운 → 문서 → 마크다운)이 무손실이 아니면, 오타 하나 고친 커밋에 수백 줄의
// 재작성이 딸려오고 그 안에 진짜 손상이 숨는다 — 실제로 5113ed3에서 그렇게
// 놓쳤다. 이 테스트가 그 부류를 빌드 실패로 바꾼다.
//
// 실제 에디터와 같은 확장 목록(lib/editor-extensions.ts)을 쓴다. 여기서 통과한
// 것만 에디터에서도 통과한다.

function roundtrip(markdown: string): string {
  const editor = new Editor({
    extensions: editorExtensions,
    content: markdown,
    // 실제 에디터와 같아야 한다. 빼면 마크다운이 HTML로 파싱되는 경로로 조용히
    // 빠져서 테스트가 엉뚱한 것을 검사하게 된다.
    contentType: "markdown",
  });
  try {
    return editor.getMarkdown();
  } finally {
    editor.destroy();
  }
}

const postsDir = path.join(process.cwd(), "content/posts");

function readBodies(): { file: string; body: string }[] {
  return fs
    .readdirSync(postsDir)
    .filter((f) => f.endsWith(".md"))
    .map((file) => ({
      file,
      body: matter(fs.readFileSync(path.join(postsDir, file), "utf8")).content,
    }))
    .filter(({ body }) => body.trim()); // 본문 없는 외부 링크 글은 왕복할 것이 없다
}

test("모든 글은 왕복해도 그대로다", () => {
  const posts = readBodies();
  assert.ok(posts.length > 0, "content/posts에 본문 있는 글이 없음 — 테스트가 무의미해짐");

  for (const { file, body } of posts) {
    // 파일 끝 개행은 파일을 쓰는 쪽(gray-matter)이 붙이는 것이지 에디터 출력이
    // 아니므로 비교에서 제외한다.
    assert.equal(
      roundtrip(body).trim(),
      body.trim(),
      `${file}: 편집하지 않고 저장해도 본문이 바뀐다. ` +
        `scripts/markdown-roundtrip.mjs --verbose 로 차이를 확인하고, ` +
        `표기 차이일 뿐이면 --write 로 정규화할 것.`
    );
  }
});

test("한 번 더 왕복해도 더 바뀌지 않는다", () => {
  // 고정점이 없으면 정규화 자체가 성립하지 않는다 — 아무리 정리해도 다음
  // 저장에서 또 diff가 난다. 구 직렬화기가 정확히 그 상태였다(7편 불안정).
  for (const { file, body } of readBodies()) {
    const once = roundtrip(body);
    assert.equal(roundtrip(once), once, `${file}: 왕복이 수렴하지 않는다`);
  }
});
