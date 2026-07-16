// 1회성 마이그레이션: 각 포스트 frontmatter에 category를 추가한다.
// 기존 frontmatter 포맷을 보존하기 위해 stringify 라운드트립 대신
// 닫는 --- 앞에 category 한 줄만 삽입한다. 멱등: category가 이미 있으면 skip.
// 실행: node scripts/add-categories.mjs
import fs from 'node:fs';
import path from 'node:path';

const postsDir = path.join(process.cwd(), 'content/posts');

// frontmatter가 복잡해 수동 편집하는 파일
const EXCLUDE = new Set(['2025-wrapped.md']);

const CATEGORIES = {
  Retrospectives: ['2023-retrospective', '2024-retrospective'],
  Newsletter: [
    '10-ways-to-think-clearly',
    'ai-leverage-mindset',
    'be-sincere-not-serious',
    'claude-code-linear-slack-notion',
    'training-camp-good-product',
  ],
  Essays: [
    'germany-travel-journal',
    'gratitude-and-sensitivity',
    'illusion-of-job-titles',
    'perpetual-beginner',
    'taste-of-product',
  ],
};

function categoryFor(slug) {
  if (slug.startsWith('disquiet-')) return 'Interviews';
  for (const [category, slugs] of Object.entries(CATEGORIES)) {
    if (slugs.includes(slug)) return category;
  }
  return null;
}

let updated = 0;
for (const fileName of fs.readdirSync(postsDir).filter((f) => f.endsWith('.md'))) {
  if (EXCLUDE.has(fileName)) {
    console.log(`skip (excluded): ${fileName}`);
    continue;
  }
  const slug = fileName.replace(/\.md$/, '');
  const category = categoryFor(slug);
  if (!category) {
    console.warn(`WARN no category mapping: ${fileName}`);
    continue;
  }

  const fullPath = path.join(postsDir, fileName);
  const source = fs.readFileSync(fullPath, 'utf8');
  const match = source.match(/^---\r?\n([\s\S]*?)\r?\n---/);
  if (!match) {
    console.warn(`WARN no frontmatter: ${fileName}`);
    continue;
  }
  if (/^category:/m.test(match[1])) {
    console.log(`skip (has category): ${fileName}`);
    continue;
  }

  const insertAt = match.index + match[0].length - 3; // 닫는 --- 직전
  const next =
    source.slice(0, insertAt) + `category: "${category}"\n` + source.slice(insertAt);
  fs.writeFileSync(fullPath, next);
  console.log(`updated: ${fileName} → ${category}`);
  updated++;
}
console.log(`done. ${updated} files updated.`);
