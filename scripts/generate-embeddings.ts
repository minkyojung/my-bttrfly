/**
 * 문서 임베딩 생성 스크립트
 *
 * content/posts/*.md 파일을 읽어서:
 * 1. 청크로 분할
 * 2. OpenAI로 임베딩 생성
 * 3. Supabase에 저장
 */

import 'dotenv/config';
import fs from 'fs';
import path from 'path';
import { createClient } from '@supabase/supabase-js';
import OpenAI from 'openai';
import matter from 'gray-matter';

// 환경변수 로드
const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const SUPABASE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY!;
const OPENAI_API_KEY = process.env.OPENAI_API_KEY!;

if (!SUPABASE_URL || !SUPABASE_KEY || !OPENAI_API_KEY) {
  console.error('❌ 환경변수가 설정되지 않았습니다.');
  process.exit(1);
}

const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);
const openai = new OpenAI({ apiKey: OPENAI_API_KEY });

// 청크 크기 설정 (토큰 단위)
const CHUNK_SIZE = 500; // 대략 500 토큰 (약 300-400 단어)
const CHUNK_OVERLAP = 50; // 청크 간 겹치는 부분

/**
 * 텍스트를 청크로 분할
 */
function splitIntoChunks(text: string, chunkSize: number = CHUNK_SIZE): string[] {
  const words = text.split(/\s+/);
  const chunks: string[] = [];

  for (let i = 0; i < words.length; i += chunkSize - CHUNK_OVERLAP) {
    const chunk = words.slice(i, i + chunkSize).join(' ');
    if (chunk.trim()) {
      chunks.push(chunk.trim());
    }
  }

  return chunks;
}

/**
 * 임베딩 생성
 */
async function generateEmbedding(text: string): Promise<number[]> {
  const response = await openai.embeddings.create({
    model: 'text-embedding-3-small',
    input: text,
  });

  return response.data[0].embedding;
}

/**
 * 단일 문서 처리
 */
async function processDocument(filePath: string) {
  console.log(`\n📄 처리 중: ${filePath}`);

  // 파일 읽기
  const fileContent = fs.readFileSync(filePath, 'utf-8');
  const { data: frontmatter, content } = matter(fileContent);

  // 메타데이터 추출
  const title = frontmatter.title || path.basename(filePath, '.md');
  const type = filePath.includes('/posts/') ? 'article' : 'note';
  const tags = frontmatter.tags || [];
  const publishedDate = frontmatter.date || null;

  // 청크 분할
  const chunks = splitIntoChunks(content);
  console.log(`  → ${chunks.length}개의 청크로 분할`);

  // 각 청크 처리
  for (let i = 0; i < chunks.length; i++) {
    const chunk = chunks[i];

    try {
      // 임베딩 생성
      const embedding = await generateEmbedding(chunk);

      // Supabase에 저장 (배열을 직접 넘기면 자동으로 vector 타입으로 변환됨)
      const { error } = await supabase.from('documents').insert({
        content: chunk,
        embedding,
        title: chunks.length > 1 ? `${title} (part ${i + 1}/${chunks.length})` : title,
        type,
        url: `/posts/${path.basename(filePath, '.md')}`,
        tags,
        published_date: publishedDate,
        metadata: {
          source_file: filePath,
          chunk_index: i,
          total_chunks: chunks.length,
          frontmatter,
        },
      });

      if (error) {
        console.error(`  ❌ 청크 ${i + 1} 저장 실패:`, error.message);
      } else {
        console.log(`  ✅ 청크 ${i + 1}/${chunks.length} 저장 완료`);
      }

      // Rate limiting 방지 (OpenAI API)
      await new Promise(resolve => setTimeout(resolve, 100));

    } catch (error) {
      console.error(`  ❌ 청크 ${i + 1} 처리 실패:`, error);
    }
  }
}

/**
 * 메인 함수
 */
async function main() {
  console.log('🚀 문서 임베딩 생성 시작\n');

  // content/posts 디렉토리의 모든 .md 파일 찾기
  const postsDir = path.join(process.cwd(), 'content', 'posts');
  const files = fs.readdirSync(postsDir)
    .filter(file => file.endsWith('.md'))
    .map(file => path.join(postsDir, file));

  // intro.md도 추가
  const introFile = path.join(process.cwd(), 'content', 'intro.md');
  if (fs.existsSync(introFile)) {
    files.unshift(introFile);
  }

  console.log(`📚 총 ${files.length}개의 파일을 처리합니다.\n`);

  // 각 파일 처리
  for (const file of files) {
    await processDocument(file);
  }

  console.log('\n✨ 모든 문서 처리 완료!');
}

main().catch(console.error);
