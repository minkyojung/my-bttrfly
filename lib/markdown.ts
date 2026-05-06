import fs from 'fs';
import path from 'path';
import matter from 'gray-matter';
import { imageSize } from 'image-size';
import { calculateReadingTime } from './utils';

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
  readingTime: string;
  thumbnail?: string;
  thumbnailMeta?: ImageMeta;
  imageMeta: Record<string, ImageMeta>;
  external?: string;
  label?: string;
  labelColor?: string;
}

function normalizeDate(value: unknown): string {
  if (value instanceof Date) return value.toISOString().split('T')[0];
  if (typeof value === 'string' && value.length > 0) return value;
  return new Date().toISOString().split('T')[0];
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
  const thumbnail = typeof data.thumbnail === 'string' ? data.thumbnail : undefined;
  const external = typeof data.external === 'string' ? data.external : undefined;
  return {
    slug,
    title: data.title || slug.replace(/-/g, ' '),
    date: normalizeDate(data.date),
    preview: buildPreview(content),
    summary: typeof data.summary === 'string' ? data.summary.trim() : undefined,
    content,
    readingTime: calculateReadingTime(content),
    thumbnail,
    thumbnailMeta: thumbnail ? readLocalImageMeta(thumbnail) : undefined,
    imageMeta: collectImageMeta(content),
    external,
    label: typeof data.label === 'string' ? data.label : undefined,
    labelColor: typeof data.labelColor === 'string' ? data.labelColor : undefined,
  };
}

export async function getAllPosts(): Promise<Post[]> {
  if (!fs.existsSync(postsDirectory)) return [];

  const fileNames = fs
    .readdirSync(postsDirectory)
    .filter((fileName) => fileName.endsWith('.md'));

  const posts = fileNames.map((fileName) => {
    const slug = fileName.replace(/\.md$/, '');
    const fullPath = path.join(postsDirectory, fileName);
    const fileContents = fs.readFileSync(fullPath, 'utf8');
    return parseFile(slug, fileContents);
  });

  return posts.sort(
    (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()
  );
}

export async function getPostBySlug(slug: string): Promise<Post | null> {
  const fullPath = path.join(postsDirectory, `${slug}.md`);
  if (!fs.existsSync(fullPath)) return null;
  const fileContents = fs.readFileSync(fullPath, 'utf8');
  return parseFile(slug, fileContents);
}
