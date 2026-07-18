import { cache } from 'react';
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

async function getAllPostsUncached(): Promise<Post[]> {
  if (!fs.existsSync(postsDirectory)) return [];

  const fileNames = fs
    .readdirSync(postsDirectory)
    .filter((fileName) => fileName.endsWith('.md'));

  const posts = fileNames.map((fileName) => {
    const slug = fileName.replace(/\.md$/, '');
    const fullPath = path.join(postsDirectory, fileName);
    const fileContents = fs.readFileSync(fullPath, 'utf8');
    return parseFileOrThrow(slug, fileContents);
  });

  return posts
    .filter((post) => !post.draft)
    .sort(
    (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()
  );
}

export const getAllPosts = cache(getAllPostsUncached);

async function getPostBySlugUncached(slug: string): Promise<Post | null> {
  // URL 인코딩된 경로 탈출(%2F 등) 차단
  if (!/^[\w-]+$/.test(slug)) return null;
  const fullPath = path.join(postsDirectory, `${slug}.md`);
  if (!fs.existsSync(fullPath)) return null;
  const fileContents = fs.readFileSync(fullPath, 'utf8');
  const post = parseFileOrThrow(slug, fileContents);
  return post.draft ? null : post;
}

export const getPostBySlug = cache(getPostBySlugUncached);
