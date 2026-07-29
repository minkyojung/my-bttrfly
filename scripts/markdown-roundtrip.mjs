// 에디터의 마크다운 왕복(파싱 → 문서 → 직렬화)이 무손실인지 측정하고, 필요하면
// 기존 글을 에디터 출력 형태로 한 번 정규화한다.
//
// 왜 필요한가: /write 에디터는 글자 하나만 고쳐도 본문 전체를 재직렬화해 저장한다.
// 그래서 왕복이 무손실이 아니면 "오타 하나 고쳤을 뿐인데 본문 전체가 바뀐 커밋"이
// 나오고, 그 안에 진짜 손상이 섞여 들어간다.
//
// 사용:
//   node scripts/markdown-roundtrip.mjs            파일별 차이 요약 (읽기 전용)
//   node scripts/markdown-roundtrip.mjs --verbose  차이 나는 줄까지 출력
//   node scripts/markdown-roundtrip.mjs --write    고정점에 도달할 때까지 정규화해 저장
//
// 에디터와 같은 확장 목록(lib/editor-extensions.ts)을 쓴다 — 그래야 여기서 통과한
// 것이 실제 에디터에서도 통과한다.

import fs from "node:fs";
import path from "node:path";
import { JSDOM } from "jsdom";
import matter from "gray-matter";

const POSTS_DIR = path.join(process.cwd(), "content/posts");
const MAX_PASSES = 5; // 고정점에 이 횟수 안에 못 닿으면 직렬화기가 수렴하지 않는 것

// TipTap은 브라우저 DOM을 전제한다. import보다 먼저 세워야 한다.
const dom = new JSDOM("<!doctype html><html><body></body></html>");
globalThis.window = dom.window;
globalThis.document = dom.window.document;
Object.defineProperty(globalThis, "navigator", {
  value: dom.window.navigator,
  configurable: true,
});
for (const k of ["HTMLElement", "Element", "Node", "DOMParser", "getComputedStyle"]) {
  globalThis[k] = dom.window[k];
}

const { Editor } = await import("@tiptap/core");
const { editorExtensions } = await import("../lib/editor-extensions.ts");

// 마크다운 한 덩어리를 에디터에 넣었다가 그대로 뽑아낸다.
function roundtrip(markdown) {
  const editor = new Editor({ extensions: editorExtensions, content: markdown });
  try {
    const storage = editor.storage;
    // 공식 확장은 editor.getMarkdown(), 구 tiptap-markdown은 storage 경유.
    return typeof editor.getMarkdown === "function"
      ? editor.getMarkdown()
      : storage.markdown.getMarkdown();
  } finally {
    editor.destroy();
  }
}

const nonWs = (s) => s.replace(/\s/g, "").length;

function firstDiffs(before, after, limit) {
  const a = before.split("\n");
  const b = after.split("\n");
  const out = [];
  for (let i = 0; i < Math.max(a.length, b.length) && out.length < limit; i++) {
    if (a[i] !== b[i]) {
      out.push(`      - ${JSON.stringify((a[i] ?? "").slice(0, 100))}`);
      out.push(`      + ${JSON.stringify((b[i] ?? "").slice(0, 100))}`);
    }
  }
  return out;
}

const write = process.argv.includes("--write");
const verbose = process.argv.includes("--verbose");

const files = fs.readdirSync(POSTS_DIR).filter((f) => f.endsWith(".md")).sort();
let changed = 0;
let lossy = 0;
let notFixpoint = 0;

for (const file of files) {
  const full = path.join(POSTS_DIR, file);
  const raw = fs.readFileSync(full, "utf8");
  const { data, content } = matter(raw);
  if (!content.trim()) continue; // 본문 없는 외부 링크 글

  const once = roundtrip(content);
  const twice = roundtrip(once);

  // 글자(공백 제외)가 늘거나 줄었다면 표기 변경이 아니라 내용이 바뀐 것이다.
  const delta = nonWs(once) - nonWs(content);
  const stable = once === twice;

  if (once !== content) changed++;
  if (delta !== 0) lossy++;
  if (!stable) notFixpoint++;

  if (once !== content || !stable) {
    const flags = [
      delta !== 0 ? `내용변화 ${delta > 0 ? "+" : ""}${delta}자` : "표기만",
      stable ? "" : "2패스 불안정",
    ].filter(Boolean).join(", ");
    console.log(`  ${file}  (${flags})`);
    if (verbose) console.log(firstDiffs(content, once, 6).join("\n"));
  }

  if (write) {
    // 고정점까지 반복한다. 한 번만 돌리면 다음 저장에서 또 diff가 난다.
    let body = content;
    let passes = 0;
    for (; passes < MAX_PASSES; passes++) {
      const next = roundtrip(body);
      if (next === body) break;
      body = next;
    }
    if (passes === MAX_PASSES) {
      console.error(`  ✗ ${file}: ${MAX_PASSES}패스 안에 고정점에 닿지 못함`);
      process.exitCode = 1;
      continue;
    }
    if (body !== content) fs.writeFileSync(full, matter.stringify(body, data));
  }
}

console.log();
console.log(`대상 ${files.length}편`);
console.log(`  왕복 후 달라짐 : ${changed}편`);
console.log(`  내용이 변함    : ${lossy}편   ← 0이어야 한다`);
console.log(`  2패스 불안정   : ${notFixpoint}편   ← 0이어야 한다`);
if (write) console.log(`\n--write: 고정점까지 정규화해 저장했다.`);
