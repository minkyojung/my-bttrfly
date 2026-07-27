// 로컬 disquiet 글의 제목을, 크롤링한 disquiet 글 목록(제목↔URL)과 대조해
// 실제 원문 URL을 찾아낸다. dis.qa 단축링크가 DNS 소멸해 자동 추적이 불가능하므로
// 필요한 일회성 보조 도구다.
//
// 사용: node scripts/match-disquiet-urls.mjs /tmp/titles.tsv
// 출력: "<slug> <url>" 목록 (import-posts.mjs에 그대로 넘기면 됨)

import fs from "node:fs";
import path from "node:path";
import matter from "gray-matter";

const POSTS_DIR = path.join(process.cwd(), "content/posts");

// 제목 비교용 정규화: 공백/따옴표/문장부호 차이를 무시한다.
function norm(s) {
  return s
    .toLowerCase()
    .replace(/[\s​]+/g, "")
    .replace(/[""''`"']/g, "")
    .replace(/[:,.!?~\-–—()[\]]/g, "");
}

const tsvPath = process.argv[2];
if (!tsvPath) {
  console.error("usage: node scripts/match-disquiet-urls.mjs <titles.tsv>");
  process.exit(1);
}

const remote = [];
for (const line of fs.readFileSync(tsvPath, "utf8").split("\n")) {
  const [id, ...rest] = line.split("\t");
  const title = rest.join("\t").trim();
  if (id && title) remote.push({ id, title, key: norm(title) });
}

const local = fs
  .readdirSync(POSTS_DIR)
  .filter((f) => f.startsWith("disquiet-") && f.endsWith(".md"))
  .map((f) => {
    const slug = f.replace(/\.md$/, "");
    const { data } = matter(fs.readFileSync(path.join(POSTS_DIR, f), "utf8"));
    return { slug, title: data.title ?? "", canonical: data.canonical, key: norm(data.title ?? "") };
  });

let found = 0;
const misses = [];
for (const post of local) {
  if (post.canonical) continue; // 이미 임포트 완료
  // 완전일치 우선, 없으면 접두 일치(제목 뒷부분이 잘린 경우 대비)
  const hit =
    remote.find((r) => r.key === post.key) ||
    remote.find((r) => r.key.startsWith(post.key) || post.key.startsWith(r.key));
  if (hit) {
    console.log(`${post.slug}\thttps://disquiet.io/articles/${hit.id}`);
    found++;
  } else {
    misses.push(post);
  }
}

console.error(`\n# matched ${found} / ${local.filter((p) => !p.canonical).length}`);
for (const m of misses) console.error(`# MISS: ${m.slug} — ${m.title}`);
