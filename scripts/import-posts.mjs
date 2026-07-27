// 타 매체(disquiet/substack 등)에 올렸던 글을 네이티브 글로 임포트한다.
//
// 사용: node scripts/import-posts.mjs <slug>
//   - content/posts/<slug>.md 의 `external` URL을 따라가 본문을 긁어온다.
//   - 본문 이미지는 public/images/uploads/ 로 내려받아 로컬 경로로 치환한다(링크썩음 방지).
//   - HTML → Markdown 변환 후, 프론트매터에서 `external`을 `canonical`로 옮기고
//     본문을 채운다. `draft: true`는 유지 — 사람이 검수한 뒤 발행하도록.
//
// 일회성 마이그레이션 도구다. 결과 마크다운은 완벽하지 않으니(각주/임베드 등)
// 반드시 git diff로 검수 후 커밋할 것.

import fs from "node:fs";
import path from "node:path";
import matter from "gray-matter";
import { JSDOM } from "jsdom";
import { Readability } from "@mozilla/readability";
import TurndownService from "turndown";
import { gfm } from "turndown-plugin-gfm";

const UA =
  "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 " +
  "(KHTML, like Gecko) Chrome/120.0 Safari/537.36";

const POSTS_DIR = path.join(process.cwd(), "content/posts");
const UPLOADS_DIR = path.join(process.cwd(), "public/images/uploads");

const EXT_BY_MIME = {
  "image/png": "png",
  "image/jpeg": "jpg",
  "image/gif": "gif",
  "image/webp": "webp",
  "image/svg+xml": "svg",
};

async function fetchDoc(url) {
  const res = await fetch(url, { headers: { "User-Agent": UA }, redirect: "follow" });
  if (!res.ok) throw new Error(`fetch ${url} → ${res.status}`);
  return { html: await res.text(), finalUrl: res.url };
}

async function downloadImage(src, slug, index) {
  const res = await fetch(src, { headers: { "User-Agent": UA }, redirect: "follow" });
  if (!res.ok) throw new Error(`image ${src} → ${res.status}`);
  const mime = (res.headers.get("content-type") || "").split(";")[0].trim();
  const urlExt = path.extname(new URL(src).pathname).slice(1).toLowerCase();
  const ext = EXT_BY_MIME[mime] || (urlExt.length >= 3 ? urlExt : "png");
  const filename = `${slug}-${index}.${ext}`;
  const buffer = Buffer.from(await res.arrayBuffer());
  fs.mkdirSync(UPLOADS_DIR, { recursive: true });
  fs.writeFileSync(path.join(UPLOADS_DIR, filename), buffer);
  return `/images/uploads/${filename}`;
}

async function importOne(slug, urlOverride) {
  const filePath = path.join(POSTS_DIR, `${slug}.md`);
  if (!fs.existsSync(filePath)) throw new Error(`no such post: ${slug}`);

  const { data } = matter(fs.readFileSync(filePath, "utf8"));
  // dis.qa 단축링크는 DNS가 죽어 못 따라가므로, 실제 URL을 인자로 넘길 수 있게 한다.
  const source = urlOverride || data.external;
  if (!source) throw new Error(`${slug} has no URL to import from`);

  console.log(`↓ fetching ${source}`);
  const { html, finalUrl } = await fetchDoc(source);

  const dom = new JSDOM(html, { url: finalUrl });
  const article = new Readability(dom.window.document).parse();
  if (!article || !article.content) throw new Error(`could not extract article body from ${finalUrl}`);

  // disquiet 전용: 구형 media.disquiet.io CDN은 DNS가 죽었다. 같은 페이지에
  // 살아있는 disquiet.io/rails/active_storage URL이 병기돼 있으므로, 이미지
  // 해시(마지막 경로 조각)로 매핑해 두었다가 다운로드 시 살아있는 쪽으로 바꾼다.
  const railsMap = {};
  for (const m of html.matchAll(/https:\/\/disquiet\.io\/rails\/active_storage\/[^\s"'\\]+/g)) {
    const hash = m[0].split("/").pop();
    if (hash) railsMap[hash] = m[0];
  }
  const liveSrc = (abs) => {
    const m = abs.match(/\/images\/makerlog\/([a-f0-9]+)/);
    return m && railsMap[m[1]] ? railsMap[m[1]] : abs;
  };

  // 본문 DOM에서 이미지를 내려받아 로컬 경로로 치환한다.
  const contentDom = new JSDOM(article.content, { url: finalUrl });
  const imgs = [...contentDom.window.document.querySelectorAll("img")];
  let i = 0;
  for (const img of imgs) {
    const raw = img.getAttribute("src");
    if (!raw) continue;
    const abs = liveSrc(new URL(raw, finalUrl).href);
    try {
      const local = await downloadImage(abs, slug, ++i);
      img.setAttribute("src", local);
      img.removeAttribute("srcset");
      console.log(`  ↳ image ${i}: ${local}`);
    } catch (err) {
      console.warn(`  ! image skipped (${abs}): ${err.message}`);
    }
  }

  const td = new TurndownService({ headingStyle: "atx", codeBlockStyle: "fenced" });
  td.use(gfm);
  const markdown = td.turndown(contentDom.window.document.body.innerHTML).trim();

  // external → canonical 로 이동(리다이렉트 대신 원문 정본 표기), 본문 채움, draft 유지.
  const nextData = { ...data };
  delete nextData.external;
  nextData.canonical = source;
  const fileText = matter.stringify(`\n${markdown}\n`, nextData);
  fs.writeFileSync(filePath, fileText);

  console.log(`✓ imported ${slug} (${markdown.length} chars, ${i} images)`);
}

const slug = process.argv[2];
const urlOverride = process.argv[3];
if (!slug) {
  console.error("usage: node scripts/import-posts.mjs <slug> [url]");
  process.exit(1);
}
importOne(slug, urlOverride).catch((err) => {
  console.error(`✗ ${err.message}`);
  process.exit(1);
});
