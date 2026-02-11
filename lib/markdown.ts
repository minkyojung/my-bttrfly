import fs from 'fs';
import path from 'path';
import matter from 'gray-matter';
import { remark } from 'remark';
import html from 'remark-html';
import breaks from 'remark-breaks';
import {
  getAllPostsFromGhost,
  getPostBySlugFromGhost,
  getPinnedPostsFromGhost,
  getAllTagsFromGhost,
  searchPostsFromGhost,
} from './ghost';

const postsDirectory = path.join(process.cwd(), 'content/posts');
const pagesDirectory = path.join(process.cwd(), 'content/pages');

const useGhost = !!(process.env.GHOST_URL && process.env.GHOST_CONTENT_API_KEY);

export interface HeadingAscii {
  heading: string;
  ascii: string;
  position?: 'left' | 'right';
}

export interface SectionAscii {
  afterHeading: string;
  type: 'fire' | 'static' | 'custom' | 'pipeline' | 'blackhole' | 'poty';
  ascii?: string;
  width?: number;
  height?: number;
}

export interface Post {
  slug: string;
  title: string;
  date: string;
  tags: string[];
  preview: string;
  content: string;
  htmlContent?: string;
  readingTime: string;
  pinned?: boolean;
  pinnedOrder?: number;
  audio?: string;
  audioTitle?: string;
  audioArtist?: string;
  thumbnail?: string;
  ascii?: string;
  customAscii?: string;
  headingAscii?: HeadingAscii[];
  sectionAscii?: SectionAscii[];
}

// 읽는 시간 계산 (한글 기준 분당 400자)
function calculateReadingTime(content: string): string {
  const plainText = content.replace(/[#*`\[\]!]/g, '').replace(/\n+/g, ' ');
  const chars = plainText.length;
  const minutes = Math.max(1, Math.ceil(chars / 400));
  return `${minutes} min read`;
}

// heading에 ASCII 아트 삽입
function insertHeadingAscii(htmlContent: string, headingAsciiList?: HeadingAscii[]): string {
  if (!headingAsciiList || headingAsciiList.length === 0) {
    return htmlContent;
  }

  let result = htmlContent;

  for (const item of headingAsciiList) {
    const { heading, ascii, position = 'right' } = item;

    // h1~h6 태그에서 해당 heading 텍스트 찾기
    const headingRegex = new RegExp(
      `(<h([1-6])[^>]*>)(${escapeRegex(heading)})(</h\\2>)`,
      'gi'
    );

    result = result.replace(headingRegex, (match, openTag, level, text, closeTag) => {
      const escapedAscii = ascii
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;');

      const asciiHtml = `<pre class="heading-ascii heading-ascii-${position}" data-heading-level="${level}">${escapedAscii}</pre>`;

      if (position === 'left') {
        return `<div class="heading-with-ascii">${asciiHtml}${openTag}${text}${closeTag}</div>`;
      } else {
        return `<div class="heading-with-ascii">${openTag}${text}${closeTag}${asciiHtml}</div>`;
      }
    });
  }

  return result;
}

// 정규식 특수문자 이스케이프
function escapeRegex(str: string): string {
  return str.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

// heading 뒤에 sectionAscii placeholder 삽입
function insertSectionAscii(htmlContent: string, sectionAsciiList?: SectionAscii[]): string {
  if (!sectionAsciiList || sectionAsciiList.length === 0) {
    return htmlContent;
  }

  let result = htmlContent;

  for (const item of sectionAsciiList) {
    const { afterHeading, type, width = 600, height = 200 } = item;

    // h1~h6 태그에서 해당 heading 텍스트 찾기
    const headingRegex = new RegExp(
      `(<h([1-6])[^>]*>${escapeRegex(afterHeading)}</h\\2>)`,
      'gi'
    );

    result = result.replace(headingRegex, (match, fullTag) => {
      const placeholderHtml = `<div class="section-ascii-placeholder" data-type="${type}" data-width="${width}" data-height="${height}"></div>`;
      return `${fullTag}${placeholderHtml}`;
    });
  }

  return result;
}

// 옵시디언 문법을 표준 마크다운으로 변환
function convertObsidianSyntax(content: string): string {
  // [[내부링크]] → 일반 링크로
  content = content.replace(/\[\[([^\]|]+)(?:\|([^\]]+))?\]\]/g, (match, link, alias) => {
    const displayText = alias || link;
    const urlSlug = link.toLowerCase().replace(/\s+/g, '-');
    return `[${displayText}](/posts/${urlSlug})`;
  });
  
  // ![[이미지.png]] → 마크다운 이미지로
  content = content.replace(/!\[\[([^\]]+)\]\]/g, '![image](/attachments/$1)');
  
  // 하이라이트 ==텍스트== → <mark>텍스트</mark>
  content = content.replace(/==(.*?)==/g, '<mark>$1</mark>');
  
  return content;
}

// 모든 포스트 가져오기
export async function getAllPosts(): Promise<Post[]> {
  if (useGhost) {
    try {
      return await getAllPostsFromGhost();
    } catch {
      // Ghost 실패 시 파일시스템 폴백
    }
  }

  // 폴더가 없으면 빈 배열 반환
  if (!fs.existsSync(postsDirectory)) {
    return [];
  }

  const fileNames = fs.readdirSync(postsDirectory)
    .filter(fileName => fileName.endsWith('.md'));
  
  const posts = await Promise.all(
    fileNames.map(async (fileName) => {
      const slug = fileName.replace(/\.md$/, '');
      const fullPath = path.join(postsDirectory, fileName);
      const fileContents = fs.readFileSync(fullPath, 'utf8');
      
      // frontmatter 파싱
      const { data, content } = matter(fileContents);
      
      // 옵시디언 문법 변환
      const processedContent = convertObsidianSyntax(content);
      
      // 마크다운을 HTML로 변환
      const processedHTML = await remark()
        .use(breaks)
        .use(html, { sanitize: true })
        .process(processedContent);
      
      const htmlContent = processedHTML.toString();
      
      // 미리보기 텍스트 생성 (첫 150자)
      const plainText = processedContent.replace(/[#*`\[\]!]/g, '').replace(/\n+/g, ' ');
      const preview = plainText.substring(0, 150) + (plainText.length > 150 ? '...' : '');
      
      // 읽는 시간 계산
      const readingTime = calculateReadingTime(processedContent);
      
      return {
        slug,
        title: data.title || slug.replace(/-/g, ' '),
        date: data.date || new Date().toISOString().split('T')[0],
        tags: data.tags || [],
        preview,
        content: processedContent,
        htmlContent,
        readingTime,
        pinned: data.pinned || false,
        pinnedOrder: data.pinnedOrder || 999,
        audio: data.audio,
        audioTitle: data.audioTitle,
        audioArtist: data.audioArtist,
        thumbnail: data.thumbnail,
        ascii: data.ascii
      };
    })
  );

  // 날짜 기준 내림차순 정렬
  return posts.sort((a, b) => 
    new Date(b.date).getTime() - new Date(a.date).getTime()
  );
}

// 특정 포스트 가져오기
export async function getPostBySlug(slug: string): Promise<Post | null> {
  if (useGhost) {
    try {
      return await getPostBySlugFromGhost(slug);
    } catch {
      // Ghost 실패 시 파일시스템 폴백
    }
  }

  try {
    const fullPath = path.join(postsDirectory, `${slug}.md`);
    
    if (!fs.existsSync(fullPath)) {
      return null;
    }
    
    const fileContents = fs.readFileSync(fullPath, 'utf8');
    const { data, content } = matter(fileContents);
    
    // 옵시디언 문법 변환
    const processedContent = convertObsidianSyntax(content);
    
    // 마크다운을 HTML로 변환
    const processedHTML = await remark()
      .use(html, { sanitize: true })
      .process(processedContent);

    // headingAscii 파싱
    const headingAscii: HeadingAscii[] | undefined = data.headingAscii;
    const sectionAscii: SectionAscii[] | undefined = data.sectionAscii;

    // heading에 ASCII 삽입
    const htmlContent = insertHeadingAscii(processedHTML.toString(), headingAscii);

    // 미리보기 텍스트
    const plainText = processedContent.replace(/[#*`\[\]!]/g, '').replace(/\n+/g, ' ');
    const preview = plainText.substring(0, 150) + (plainText.length > 150 ? '...' : '');

    // 읽는 시간 계산
    const readingTime = calculateReadingTime(processedContent);

    return {
      slug,
      title: data.title || slug.replace(/-/g, ' '),
      date: data.date || new Date().toISOString().split('T')[0],
      tags: data.tags || [],
      preview,
      content: processedContent,
      htmlContent,
      readingTime,
      pinned: data.pinned || false,
      pinnedOrder: data.pinnedOrder || 999,
      audio: data.audio,
      audioTitle: data.audioTitle,
      audioArtist: data.audioArtist,
      thumbnail: data.thumbnail,
      ascii: data.ascii,
      customAscii: data.customAscii,
      headingAscii,
      sectionAscii
    };
  } catch {
    // Production: error logging removed
    return null;
  }
}

// Pinned 포스트 가져오기
export async function getPinnedPosts(): Promise<Post[]> {
  if (useGhost) {
    try {
      return await getPinnedPostsFromGhost();
    } catch {
      // Ghost 실패 시 파일시스템 폴백
    }
  }

  const allPosts = await getAllPosts();
  return allPosts
    .filter(post => post.pinned)
    .sort((a, b) => (a.pinnedOrder || 999) - (b.pinnedOrder || 999))
    .slice(0, 5); // 최대 5개까지만
}

// 모든 태그 가져오기
export async function getAllTags(): Promise<string[]> {
  if (useGhost) {
    try {
      return await getAllTagsFromGhost();
    } catch {
      // Ghost 실패 시 파일시스템 폴백
    }
  }

  const allPosts = await getAllPosts();
  const allTags = allPosts.flatMap(post => post.tags);
  const uniqueTags = [...new Set(allTags)];
  return uniqueTags.sort();
}

// 태그로 포스트 필터링
export async function getPostsByTag(tag: string): Promise<Post[]> {
  const allPosts = await getAllPosts();
  return allPosts.filter(post => 
    post.tags.map(t => t.toLowerCase()).includes(tag.toLowerCase())
  );
}

// 포스트 검색
export async function searchPosts(query: string): Promise<Post[]> {
  if (useGhost) {
    try {
      return await searchPostsFromGhost(query);
    } catch {
      // Ghost 실패 시 파일시스템 폴백
    }
  }

  const allPosts = await getAllPosts();
  const lowerQuery = query.toLowerCase();
  
  return allPosts.filter(post => 
    post.title.toLowerCase().includes(lowerQuery) ||
    post.content.toLowerCase().includes(lowerQuery) ||
    post.tags.some(tag => tag.toLowerCase().includes(lowerQuery))
  );
}

// 인트로 가져오기
export async function getIntro(): Promise<{ content: string, htmlContent: string } | null> {
  try {
    const fullPath = path.join(process.cwd(), 'content/intro.md');
    
    if (!fs.existsSync(fullPath)) {
      return null;
    }
    
    const fileContents = fs.readFileSync(fullPath, 'utf8');
    const content = fileContents;
    
    const processedContent = convertObsidianSyntax(content);
    
    const processedHTML = await remark()
      .use(breaks)
      .use(html, { sanitize: true })
      .process(processedContent);

    return {
      content: processedContent,
      htmlContent: processedHTML.toString()
    };
  } catch {
    return null;
  }
}

// 페이지 가져오기 (About 등)
export async function getPage(pageName: string): Promise<{ content: string, htmlContent: string } | null> {
  try {
    const fullPath = path.join(pagesDirectory, `${pageName}.md`);
    
    if (!fs.existsSync(fullPath)) {
      return null;
    }
    
    const fileContents = fs.readFileSync(fullPath, 'utf8');
    const { content } = matter(fileContents);
    
    const processedContent = convertObsidianSyntax(content);
    
    const processedHTML = await remark()
      .use(breaks)
      .use(html, { sanitize: true })
      .process(processedContent);

    return {
      content: processedContent,
      htmlContent: processedHTML.toString()
    };
  } catch {
    // Production: error logging removed
    return null;
  }
}