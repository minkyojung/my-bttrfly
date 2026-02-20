import fs from 'fs';
import path from 'path';
import type { Post, HeadingAscii, SectionAscii } from './markdown';
import { extractImagesFromHtml, calculateReadingTime } from './utils';

const GHOST_URL = process.env.GHOST_URL || 'http://localhost:2368';
const GHOST_CONTENT_API_KEY = process.env.GHOST_CONTENT_API_KEY || '';

interface GhostTag {
  name: string;
  slug: string;
}

interface GhostPost {
  slug: string;
  title: string;
  html: string | null;
  excerpt: string | null;
  feature_image: string | null;
  featured: boolean;
  published_at: string;
  reading_time: number;
  tags: GhostTag[];
  codeinjection_head: string | null;
}

interface GhostPostsResponse {
  posts: GhostPost[];
  meta: {
    pagination: {
      page: number;
      limit: number;
      pages: number;
      total: number;
    };
  };
}

// Ghost에 없는 커스텀 메타데이터 (ASCII, audio 등)
// 나중에 data/post-meta.json으로 분리 가능
interface PostMeta {
  ascii?: string;
  customAscii?: string;
  headingAscii?: HeadingAscii[];
  sectionAscii?: SectionAscii[];
  audio?: string;
  audioTitle?: string;
  audioArtist?: string;
  pinnedOrder?: number;
}

// slug → 커스텀 메타데이터 매핑 (data/post-meta.json)
function loadPostMeta(): Record<string, PostMeta> {
  try {
    const filePath = path.join(process.cwd(), 'data/post-meta.json');
    const raw = fs.readFileSync(filePath, 'utf8');
    return JSON.parse(raw);
  } catch {
    return {};
  }
}

let postMetaMap: Record<string, PostMeta> = loadPostMeta();

async function ghostFetch<T>(endpoint: string, params: Record<string, string> = {}): Promise<T> {
  const url = new URL(`/ghost/api/content/${endpoint}`, GHOST_URL);
  url.searchParams.set('key', GHOST_CONTENT_API_KEY);
  for (const [key, value] of Object.entries(params)) {
    url.searchParams.set(key, value);
  }

  const res = await fetch(url.toString(), { next: { revalidate: 60 } });

  if (!res.ok) {
    throw new Error(`Ghost API error: ${res.status} ${res.statusText}`);
  }

  return res.json();
}

function ghostPostToPost(gp: GhostPost): Post {
  const meta = postMetaMap[gp.slug] || {};
  const htmlContent = gp.html || '';
  const plainText = htmlContent.replace(/<[^>]*>/g, '').replace(/\s+/g, ' ').trim();

  return {
    slug: gp.slug,
    title: gp.title,
    date: gp.published_at ? gp.published_at.split('T')[0] : new Date().toISOString().split('T')[0],
    tags: gp.tags.map((t) => t.name),
    preview: gp.excerpt || plainText.substring(0, 150) + (plainText.length > 150 ? '...' : ''),
    content: plainText,
    htmlContent,
    readingTime: gp.reading_time ? `${gp.reading_time} min read` : calculateReadingTime(htmlContent),
    pinned: gp.featured,
    pinnedOrder: meta.pinnedOrder ?? (gp.featured ? 0 : 999),
    thumbnail: gp.feature_image || undefined,
    ascii: meta.ascii,
    customAscii: meta.customAscii,
    headingAscii: meta.headingAscii,
    sectionAscii: meta.sectionAscii,
    audio: meta.audio,
    audioTitle: meta.audioTitle,
    audioArtist: meta.audioArtist,
    images: extractImagesFromHtml(htmlContent),
  };
}

export async function getAllPostsFromGhost(): Promise<Post[]> {
  const data = await ghostFetch<GhostPostsResponse>('posts/', {
    include: 'tags',
    formats: 'html',
    limit: 'all',
    order: 'published_at desc',
    filter: 'status:published',
  });

  return data.posts.map(ghostPostToPost);
}

export async function getPostBySlugFromGhost(slug: string): Promise<Post | null> {
  try {
    const data = await ghostFetch<GhostPostsResponse>(`posts/slug/${slug}/`, {
      include: 'tags',
      formats: 'html',
    });

    if (!data.posts || data.posts.length === 0) {
      return null;
    }

    return ghostPostToPost(data.posts[0]);
  } catch {
    return null;
  }
}

export async function getPinnedPostsFromGhost(): Promise<Post[]> {
  const data = await ghostFetch<GhostPostsResponse>('posts/', {
    include: 'tags',
    formats: 'html',
    filter: 'featured:true',
    limit: '5',
    order: 'published_at desc',
  });

  return data.posts
    .map(ghostPostToPost)
    .sort((a, b) => (a.pinnedOrder || 999) - (b.pinnedOrder || 999));
}

export async function getAllTagsFromGhost(): Promise<string[]> {
  const posts = await getAllPostsFromGhost();
  const allTags = posts.flatMap((post) => post.tags);
  return [...new Set(allTags)].sort();
}

export async function searchPostsFromGhost(query: string): Promise<Post[]> {
  const posts = await getAllPostsFromGhost();
  const lowerQuery = query.toLowerCase();

  return posts.filter(
    (post) =>
      post.title.toLowerCase().includes(lowerQuery) ||
      post.content.toLowerCase().includes(lowerQuery) ||
      post.tags.some((tag) => tag.toLowerCase().includes(lowerQuery))
  );
}
