import fs from 'fs';
import path from 'path';
import matter from 'gray-matter';
import { remark } from 'remark';
import html from 'remark-html';

const postsDirectory = path.join(process.cwd(), 'content/posts');
const pagesDirectory = path.join(process.cwd(), 'content/pages');

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
}

// 읽는 시간 계산 (한글 기준 분당 400자)
function calculateReadingTime(content: string): string {
  const plainText = content.replace(/[#*`\[\]!]/g, '').replace(/\n+/g, ' ');
  const chars = plainText.length;
  const minutes = Math.max(1, Math.ceil(chars / 400));
  return `${minutes}분 읽기`;
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
        audioArtist: data.audioArtist
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
    
    const htmlContent = processedHTML.toString();
    
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
      audioArtist: data.audioArtist
    };
  } catch {
    // Production: error logging removed
    return null;
  }
}

// Pinned 포스트 가져오기
export async function getPinnedPosts(): Promise<Post[]> {
  const allPosts = await getAllPosts();
  return allPosts
    .filter(post => post.pinned)
    .sort((a, b) => (a.pinnedOrder || 999) - (b.pinnedOrder || 999))
    .slice(0, 5); // 최대 5개까지만
}

// 모든 태그 가져오기
export async function getAllTags(): Promise<string[]> {
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