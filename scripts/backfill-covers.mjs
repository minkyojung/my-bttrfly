#!/usr/bin/env node
// 외부 링크 글(본문이 로컬에 없는 substack 글 등)의 카드 썸네일을 채운다.
//
// 한 번 돌려서 frontmatter에 cover: "https://..." 로 박아넣는 스크립트다.
// 매 빌드마다 외부 URL을 fetch하지 않는다 — 그러면 빌드가 substack 응답
// 속도/가용성에 걸리게 된다. 새 글을 쓸 때만 다시 실행하면 된다:
//
//   node scripts/backfill-covers.mjs
//
// external이 없거나(로컬 본문 글은 본문 첫 이미지를 그대로 쓴다, 여기서 건드릴
// 필요 없음) 이미 cover가 있는 글은 건너뛴다.

import fs from "node:fs";
import path from "node:path";
import matter from "gray-matter";

const postsDir = path.join(process.cwd(), "content/posts");

function extractOgImage(html) {
  const match = html.match(
    /<meta[^>]+property=["']og:image["'][^>]+content=["']([^"']+)["']/i
  );
  return match?.[1];
}

async function main() {
  const files = fs.readdirSync(postsDir).filter((f) => f.endsWith(".md"));
  let updated = 0;
  let skipped = 0;
  let failed = 0;

  for (const file of files) {
    const fullPath = path.join(postsDir, file);
    const raw = fs.readFileSync(fullPath, "utf8");
    const { data, content } = matter(raw);

    if (!data.external || data.cover) {
      skipped++;
      continue;
    }

    try {
      const res = await fetch(data.external, {
        headers: { "User-Agent": "Mozilla/5.0 (backfill-covers script)" },
      });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const html = await res.text();
      const ogImage = extractOgImage(html);
      if (!ogImage) throw new Error("og:image not found");

      const next = matter.stringify(content, { ...data, cover: ogImage });
      fs.writeFileSync(fullPath, next);
      console.log(`✓ ${file} → ${ogImage}`);
      updated++;
    } catch (err) {
      console.error(`✗ ${file}: ${err.message}`);
      failed++;
    }
  }

  console.log(`\n${updated} updated, ${skipped} skipped, ${failed} failed`);
}

main();
