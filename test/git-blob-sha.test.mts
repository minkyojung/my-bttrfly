import { test } from "node:test";
import assert from "node:assert/strict";
import { execFileSync } from "node:child_process";
import fs from "node:fs";
import path from "node:path";
import { gitBlobSha } from "../lib/git-blob-sha.ts";

const repoRoot = path.resolve(import.meta.dirname, "..");

function gitHashObject(file: string): string {
  return execFileSync("git", ["hash-object", file], { cwd: repoRoot })
    .toString()
    .trim();
}

// 이 값이 git/GitHub과 어긋나면 동시 수정 감지가 통째로 무력해진다
// (항상 불일치로 보여 저장이 막히거나, 반대로 충돌을 놓친다).
test("실제 글 파일에서 git hash-object와 일치한다", () => {
  const dir = path.join(repoRoot, "content/posts");
  const files = fs
    .readdirSync(dir)
    .filter((f) => f.endsWith(".md"))
    .slice(0, 5);

  assert.ok(files.length > 0, "검증할 글 파일이 없음");

  for (const file of files) {
    const full = path.join(dir, file);
    const content = fs.readFileSync(full, "utf8");
    assert.equal(gitBlobSha(content), gitHashObject(full), file);
  }
});

test("한글 등 멀티바이트에서 바이트 길이를 쓴다", () => {
  // 글자 수로 계산하면 한글이 든 글의 지문이 전부 틀어진다.
  const tmp = path.join(repoRoot, "test", ".tmp-utf8.md");
  const content = "한글 본문입니다\n이모지 😀 포함\n";
  fs.writeFileSync(tmp, content, "utf8");
  try {
    assert.equal(gitBlobSha(content), gitHashObject(tmp));
  } finally {
    fs.unlinkSync(tmp);
  }
});

test("내용이 다르면 지문이 달라진다", () => {
  // 발행 토글처럼 한 글자만 바뀌어도 감지되어야 한다.
  const before = "---\ndraft: true\n---\nbody";
  const after = "---\ndraft: false\n---\nbody";
  assert.notEqual(gitBlobSha(before), gitBlobSha(after));
});

test("같은 내용이면 지문이 같다", () => {
  const text = "---\ntitle: A\n---\nbody";
  assert.equal(gitBlobSha(text), gitBlobSha(text));
});

test("빈 파일도 git과 일치한다", () => {
  // git의 알려진 빈 blob 해시
  assert.equal(gitBlobSha(""), "e69de29bb2d1d6434b8b29ae775ad8c2e48c5391");
});
