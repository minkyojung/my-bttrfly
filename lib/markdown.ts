import 'server-only';
import { cache } from 'react';
import fs from 'fs';
import path from 'path';
import matter from 'gray-matter';
import { imageSize } from 'image-size';
import { isValidPostDate } from './post-frontmatter';

const postsDirectory = path.join(process.cwd(), 'content/posts');
const publicDirectory = path.join(process.cwd(), 'public');

export interface ImageMeta {
  width: number;
  height: number;
}

export interface Post {
  slug: string;
  title: string;
  date: string;
  preview: string;
  summary?: string;
  content: string;
  imageMeta: Record<string, ImageMeta>;
  // 목록 카드 썸네일. 본문이 로컬에 없는 외부 링크 글(external)에 쓴다 —
  // scripts/backfill-covers.mjs가 원문의 og:image를 긁어서 한 번 채워넣는다.
  // 본문이 로컬에 있는 글은 이 필드 없이 본문 첫 이미지(imageMeta)를 쓴다.
  cover?: string;
  external?: string;
  // 원문 URL. external과 달리 리다이렉트하지 않고 본문을 그대로 보여주되,
  // <link rel="canonical">만 원문으로 가리켜 중복 콘텐츠를 피한다(타 매체에서 옮겨온 글).
  canonical?: string;
  category?: string;
  featured: boolean;
  draft: boolean;
  source?: 'disquiet' | 'substack';
}

// 날짜가 없거나 형식이 깨진 글이 조용히 "오늘 날짜"로 1면 최상단에 올라가는
// 사고를 막기 위해, 파싱 불가 시 빌드를 명시적으로 실패시킨다.
//
// 예전에는 비어있지 않은 문자열이면 무엇이든 통과시켜서 이 약속을 지키지 못했다.
// 그렇게 통과한 값은 sitemap의 new Date()로 흘러가고, Invalid Date도 instanceof
// Date이므로 Next의 sitemap 직렬화가 toISOString()에서 RangeError로 죽었다 —
// 어느 파일이 문제인지 알려주지 않는 형태로. 여기서 파일명을 붙여 먼저 실패시킨다.
function normalizeDate(value: unknown, slug: string): string {
  if (value instanceof Date && !Number.isNaN(value.getTime())) {
    return value.toISOString().split('T')[0];
  }
  if (typeof value === 'string' && isValidPostDate(value)) return value;
  throw new Error(`Missing or invalid date in content/posts/${slug}.md`);
}

// 빈 문자열로 남은 optional 필드를 undefined로 정규화한다.
function optionalString(value: unknown): string | undefined {
  return typeof value === 'string' && value.trim() ? value : undefined;
}

function readLocalImageMeta(src: string): ImageMeta | undefined {
  if (!src.startsWith('/')) return undefined;
  const absolute = path.join(publicDirectory, src);
  if (!fs.existsSync(absolute)) return undefined;
  try {
    const buffer = fs.readFileSync(absolute);
    const { width, height } = imageSize(buffer);
    if (!width || !height) return undefined;
    return { width, height };
  } catch {
    return undefined;
  }
}

// 글 말고 일반 페이지(content/pages)도 본문에 이미지를 쓰므로 내보낸다.
export function collectImageMeta(markdown: string): Record<string, ImageMeta> {
  const meta: Record<string, ImageMeta> = {};
  const regex = /!\[[^\]]*\]\(([^)\s]+)(?:\s+"[^"]*")?\)/g;
  let match: RegExpExecArray | null;
  while ((match = regex.exec(markdown)) !== null) {
    const src = match[1];
    if (meta[src]) continue;
    const dim = readLocalImageMeta(src);
    if (dim) meta[src] = dim;
  }
  return meta;
}

function buildPreview(content: string): string {
  const plain = content.replace(/[#*`\[\]!]/g, '').replace(/\n+/g, ' ');
  return plain.substring(0, 150) + (plain.length > 150 ? '...' : '');
}

function parseFile(slug: string, fileContents: string): Post {
  const { data, content } = matter(fileContents);
  return {
    slug,
    title: data.title || slug.replace(/-/g, ' '),
    date: normalizeDate(data.date, slug),
    preview: buildPreview(content),
    summary: optionalString(data.summary)?.trim(),
    content,
    imageMeta: collectImageMeta(content),
    cover: optionalString(data.cover),
    external: optionalString(data.external),
    canonical: optionalString(data.canonical),
    category: optionalString(data.category),
    featured: data.featured === true,
    draft: data.draft === true,
    source:
      data.source === 'disquiet' || data.source === 'substack'
        ? data.source
        : undefined,
  };
}

// 파싱 실패 시 어느 파일이 문제인지 알 수 있게 파일명을 붙여 던진다
// (frontmatter를 손으로 고치므로 방어 필수).
function parseFileOrThrow(slug: string, fileContents: string): Post {
  try {
    return parseFile(slug, fileContents);
  } catch (cause) {
    throw new Error(`Failed to parse content/posts/${slug}.md`, { cause });
  }
}

function readAllPosts(): Post[] {
  if (!fs.existsSync(postsDirectory)) return [];

  const fileNames = fs
    .readdirSync(postsDirectory)
    .filter((fileName) => fileName.endsWith('.md'));

  return fileNames
    .map((fileName) => {
      const slug = fileName.replace(/\.md$/, '');
      const fullPath = path.join(postsDirectory, fileName);
      const fileContents = fs.readFileSync(fullPath, 'utf8');
      return parseFileOrThrow(slug, fileContents);
    })
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
}

async function getAllPostsUncached(): Promise<Post[]> {
  return readAllPosts().filter((post) => !post.draft);
}

export const getAllPosts = cache(getAllPostsUncached);

function readPostFile(slug: string): Post | null {
  // URL 인코딩된 경로 탈출(%2F 등) 차단
  if (!/^[\w-]+$/.test(slug)) return null;
  const fullPath = path.join(postsDirectory, `${slug}.md`);
  if (!fs.existsSync(fullPath)) return null;
  const fileContents = fs.readFileSync(fullPath, 'utf8');
  return parseFileOrThrow(slug, fileContents);
}

async function getPostBySlugUncached(slug: string): Promise<Post | null> {
  const post = readPostFile(slug);
  return post && !post.draft ? post : null;
}

export const getPostBySlug = cache(getPostBySlugUncached);
