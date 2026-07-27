// 임포트 후 본문에 남은 죽은 이미지(media.disquiet.io, DNS 소멸)를
// Wayback Machine 스냅샷에서 복구한다. 복구 실패 시 깨진 이미지를 남기는 대신
// 마크다운에서 제거한다(본문 텍스트는 보존).
//
// 사용: node scripts/rescue-dead-images.mjs [slug ...]   (인자 없으면 전체 스캔)

import fs from "node:fs";
import path from "node:path";

const POSTS_DIR = path.join(process.cwd(), "content/posts");
const UPLOADS_DIR = path.join(process.cwd(), "public/images/uploads");
const UA =
  "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 " +
  "(KHTML, like Gecko) Chrome/120.0 Safari/537.36";

const EXT_BY_MIME = {
  "image/png": "png",
  "image/jpeg": "jpg",
  "image/gif": "gif",
  "image/webp": "webp",
  "image/svg+xml": "svg",
};

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

async function waybackUrl(deadUrl) {
  const api = `https://archive.org/wayback/available?url=${encodeURIComponent(
    deadUrl.replace(/^https?:\/\//, "")
  )}`;
  const res = await fetch(api, { headers: { "User-Agent": UA } });
  if (!res.ok) return null;
  const json = await res.json();
  const snap = json?.archived_snapshots?.closest;
  if (!snap?.available || !snap.url) return null;
  // id_ 를 붙이면 아카이브 배너 없이 원본 바이트를 그대로 받는다.
  return snap.url.replace(/\/web\/(\d+)\//, "/web/$1id_/");
}

async function download(url, slug, index) {
  const res = await fetch(url, { headers: { "User-Agent": UA }, redirect: "follow" });
  if (!res.ok) throw new Error(`HTTP ${res.status}`);
  const mime = (res.headers.get("content-type") || "").split(";")[0].trim();
  const ext = EXT_BY_MIME[mime] || "gif";
  const buffer = Buffer.from(await res.arrayBuffer());
  if (buffer.length < 100) throw new Error("suspiciously small");
  fs.mkdirSync(UPLOADS_DIR, { recursive: true });
  const filename = `${slug}-rescued-${index}.${ext}`;
  fs.writeFileSync(path.join(UPLOADS_DIR, filename), buffer);
  return `/images/uploads/${filename}`;
}

const DEAD_RE = /https:\/\/media\.disquiet\.io\/images\/makerlog\/[a-f0-9]+(?:\?[^\s)"']*)?/g;

async function rescuePost(slug) {
  const file = path.join(POSTS_DIR, `${slug}.md`);
  let text = fs.readFileSync(file, "utf8");
  const dead = [...new Set(text.match(DEAD_RE) ?? [])];
  if (dead.length === 0) return;

  console.log(`\n${slug} — ${dead.length} dead image(s)`);
  let i = 0;
  for (const url of dead) {
    i++;
    try {
      const archived = await waybackUrl(url);
      if (!archived) throw new Error("no snapshot");
      const local = await download(archived, slug, i);
      text = text.split(url).join(local);
      console.log(`  ✓ rescued → ${local}`);
    } catch (err) {
      // 복구 불가 → 깨진 <img> 대신 이미지 마크다운 자체를 제거한다.
      const escaped = url.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
      const imgMd = new RegExp(`!\\[[^\\]]*\\]\\(${escaped}(?:\\s+"[^"]*")?\\)`, "g");
      text = text.replace(imgMd, "");
      console.log(`  ✗ dropped (${err.message})`);
    }
    await sleep(400); // 아카이브 서버 배려
  }
  fs.writeFileSync(file, text);
}

const args = process.argv.slice(2);
const slugs = args.length
  ? args
  : fs
      .readdirSync(POSTS_DIR)
      .filter((f) => f.endsWith(".md"))
      .filter((f) => fs.readFileSync(path.join(POSTS_DIR, f), "utf8").includes("media.disquiet.io"))
      .map((f) => f.replace(/\.md$/, ""));

for (const slug of slugs) await rescuePost(slug);
console.log("\ndone.");
