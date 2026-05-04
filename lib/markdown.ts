import fs from 'fs';
import path from 'path';
import matter from 'gray-matter';
import { remark } from 'remark';
import html from 'remark-html';
import breaks from 'remark-breaks';
import { calculateReadingTime } from './utils';

const postsDirectory = path.join(process.cwd(), 'content/posts');

function normalizeDate(value: unknown): string {
  if (value instanceof Date) return value.toISOString().split('T')[0];
  if (typeof value === 'string' && value.length > 0) return value;
  return new Date().toISOString().split('T')[0];
}

export interface Post {
  slug: string;
  title: string;
  date: string;
  preview: string;
  htmlContent: string;
  readingTime: string;
  thumbnail?: string;
}

export async function getAllPosts(): Promise<Post[]> {
  if (!fs.existsSync(postsDirectory)) return [];

  const fileNames = fs
    .readdirSync(postsDirectory)
    .filter((fileName) => fileName.endsWith('.md'));

  const posts = await Promise.all(
    fileNames.map(async (fileName) => {
      const slug = fileName.replace(/\.md$/, '');
      const fullPath = path.join(postsDirectory, fileName);
      const fileContents = fs.readFileSync(fullPath, 'utf8');
      const { data, content } = matter(fileContents);

      const processed = await remark()
        .use(breaks)
        .use(html, { sanitize: false })
        .process(content);

      const htmlContent = processed.toString();
      const plainText = content.replace(/[#*`\[\]!]/g, '').replace(/\n+/g, ' ');
      const preview = plainText.substring(0, 150) + (plainText.length > 150 ? '...' : '');

      return {
        slug,
        title: data.title || slug.replace(/-/g, ' '),
        date: normalizeDate(data.date),
        preview,
        htmlContent,
        readingTime: calculateReadingTime(content),
        thumbnail: data.thumbnail,
      } satisfies Post;
    })
  );

  return posts.sort(
    (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()
  );
}

export async function getPostBySlug(slug: string): Promise<Post | null> {
  const fullPath = path.join(postsDirectory, `${slug}.md`);
  if (!fs.existsSync(fullPath)) return null;

  const fileContents = fs.readFileSync(fullPath, 'utf8');
  const { data, content } = matter(fileContents);

  const processed = await remark()
    .use(breaks)
    .use(html, { sanitize: false })
    .process(content);

  const htmlContent = processed.toString();
  const plainText = content.replace(/[#*`\[\]!]/g, '').replace(/\n+/g, ' ');
  const preview = plainText.substring(0, 150) + (plainText.length > 150 ? '...' : '');

  return {
    slug,
    title: data.title || slug.replace(/-/g, ' '),
    date: normalizeDate(data.date),
    preview,
    htmlContent,
    readingTime: calculateReadingTime(content),
    thumbnail: data.thumbnail,
  };
}
