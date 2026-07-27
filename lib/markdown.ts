import { cache } from 'react';
import { gitBlobSha } from './git-blob-sha';
import fs from 'fs';
import path from 'path';
import matter from 'gray-matter';
import { imageSize } from 'image-size';

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
  external?: string;
  // 원문 URL. external과 달리 리다이렉트하지 않고 본문을 그대로 보여주되,
  // <link rel="canonical">만 원문으로 가리켜 중복 콘텐츠를 피한다(타 매체에서 옮겨온 글).
  canonical?: string;
  cover?: string;
  coverMeta?: ImageMeta;
  category?: string;
  featured: boolean;
  draft: boolean;
  source?: 'disquiet' | 'substack';
}

// 날짜가 없거나 형식이 깨진 글이 조용히 "오늘 날짜"로 1면 최상단에 올라가는
// 사고를 막기 위해, 파싱 불가 시 빌드를 명시적으로 실패시킨다.
function normalizeDate(value: unknown, slug: string): string {
  if (value instanceof Date) return value.toISOString().split('T')[0];
  if (typeof value === 'string' && value.length > 0) return value;
  throw new Error(`Missing or invalid date in content/posts/${slug}.md`);
}

// CMS가 빈 문자열로 저장한 optional 필드를 undefined로 정규화한다.
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

function collectImageMeta(markdown: string): Record<string, ImageMeta> {
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
  const cover = optionalString(data.cover);
  return {
    slug,
    title: data.title || slug.replace(/-/g, ' '),
    date: normalizeDate(data.date, slug),
    preview: buildPreview(content),
    summary: optionalString(data.summary)?.trim(),
    content,
    imageMeta: collectImageMeta(content),
    external: optionalString(data.external),
    canonical: optionalString(data.canonical),
    cover,
    coverMeta: cover ? readLocalImageMeta(cover) : undefined,
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
// (frontmatter가 CMS와 손편집 양쪽에서 수정되므로 방어 필수).
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

// draft를 포함해 전부 조회한다. 글쓰기 UI(/write) 목록 전용 —
// 공개 목록/사이트맵/OG 등 사용자 대면 경로에는 절대 쓰지 않는다.
async function getAllPostsForEditUncached(): Promise<Post[]> {
  return readAllPosts();
}

export const getAllPostsForEdit = cache(getAllPostsForEditUncached);

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

// draft여도 조회된다. 글쓰기 UI(/write/[slug]) 편집 화면 전용 — 초안을 열람
// 하려는데 getPostBySlug가 null을 반환해 404가 나는 문제를 피하기 위함.
async function getPostBySlugForEditUncached(slug: string): Promise<Post | null> {
  return readPostFile(slug);
}

// 편집 화면이 실제로 보여준 파일의 지문. 저장 시 함께 보내 GitHub의 현재
// 내용과 비교하면, 에디터를 연 뒤 다른 곳에서 바뀐 글을 덮어쓰는 걸 막을 수 있다.
export function getPostFileShaForEdit(slug: string): string | null {
  if (!/^[\w-]+$/.test(slug)) return null;
  const fullPath = path.join(postsDirectory, `${slug}.md`);
  if (!fs.existsSync(fullPath)) return null;
  return gitBlobSha(fs.readFileSync(fullPath, 'utf8'));
}

export const getPostBySlugForEdit = cache(getPostBySlugForEditUncached);
