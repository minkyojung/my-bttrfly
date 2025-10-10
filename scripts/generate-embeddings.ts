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
// Anthropic 권장: 800 토큰 (성능 최적화)
const CHUNK_SIZE = 800; // 대략 800 토큰 (약 600-700 단어)
const CHUNK_OVERLAP = 80; // 청크 간 겹치는 부분 (10% overlap)

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
 * Contextual Retrieval: 청크에 대한 맥락 생성
 *
 * OpenAI GPT-4o-mini를 사용하여 각 청크에 대한 맥락을 생성합니다.
 * Anthropic Contextual Retrieval 방식 적용
 * (비용 최적화: Claude 대비 82% 절감)
 */
async function generateContext(
  fullDocument: string,
  chunk: string,
  metadata: {
    title: string;
    type: string;
    tags?: string[];
    category?: string;
  }
): Promise<string> {
  const typeLabel = metadata.type === 'article' ? '공개 블로그 글' :
                    metadata.type === 'training' ? '학습 자료' : '노트';

  const prompt = `<document>
Title: "${metadata.title}"
Type: ${typeLabel}
Category: ${metadata.category || 'general'}
Tags: ${metadata.tags?.join(', ') || 'none'}

Full Content:
${fullDocument}
</document>

Situate the following chunk within the overall document context.
Provide 100-150 characters of concise contextual description in Korean that explains:
- What this chunk is about
- How it relates to the document's main theme
- Key concepts or decisions discussed

<chunk>
${chunk}
</chunk>

Context (Korean, 100-150 chars):`;

  try {
    const response = await openai.chat.completions.create({
      model: 'gpt-4o-mini',
      messages: [{
        role: 'user',
        content: prompt
      }],
      max_tokens: 150, // 100 → 150 (더 상세한 맥락)
      temperature: 0,
    });

    const context = response.choices[0]?.message?.content?.trim() || '';
    return context;
  } catch (error) {
    console.error('  ⚠️  맥락 생성 실패, 원본 청크만 사용:', error);
    return '';
  }
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

  // Type 감지: training > article > note
  let type: string;
  if (filePath.includes('/training/')) {
    type = 'training';
  } else if (filePath.includes('/posts/')) {
    type = 'article';
  } else {
    type = frontmatter.type || 'note';
  }

  const tags = frontmatter.tags || [];
  const category = frontmatter.category || 'general';
  const priority = frontmatter.priority || 'medium';
  const visibility = frontmatter.visibility || (type === 'training' ? 'private' : 'public');
  const publishedDate = frontmatter.date || null;

  // 청크 분할
  const chunks = splitIntoChunks(content);
  console.log(`  → ${chunks.length}개의 청크로 분할`);

  // 각 청크 처리
  for (let i = 0; i < chunks.length; i++) {
    const chunk = chunks[i];

    try {
      // 1. Contextual Retrieval: 맥락 생성
      const context = await generateContext(content, chunk, { title, type, tags, category });

      // 2. 맥락 + 청크 결합
      const contentWithContext = context
        ? `${context}\n\n${chunk}`
        : chunk;

      // 3. 맥락이 포함된 텍스트로 임베딩 생성
      const embedding = await generateEmbedding(contentWithContext);

      // 4. Supabase에 저장 (원본 content와 content_with_context 모두 저장)
      // URL 생성: training은 null, posts는 링크
      const url = type === 'training' ? null :
                  type === 'article' ? `/posts/${path.basename(filePath, '.md')}` :
                  null;

      const { error } = await supabase.from('documents').insert({
        content: chunk, // 원본 청크 (사용자에게 표시용)
        content_with_context: contentWithContext, // 맥락 포함 (검색/임베딩용)
        embedding,
        title: chunks.length > 1 ? `${title} (part ${i + 1}/${chunks.length})` : title,
        type,
        url,
        tags,
        published_date: publishedDate,
        metadata: {
          source_file: filePath,
          chunk_index: i,
          total_chunks: chunks.length,
          context_length: context.length,
          category,
          priority,
          visibility,
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
 * 배열을 배치로 나누는 헬퍼 함수
 */
function chunkArray<T>(array: T[], size: number): T[][] {
  const chunks: T[][] = [];
  for (let i = 0; i < array.length; i += size) {
    chunks.push(array.slice(i, i + size));
  }
  return chunks;
}

/**
 * 메인 함수
 */
async function main() {
  console.log('🚀 문서 임베딩 생성 시작\n');

  const files: string[] = [];

  // 1. intro.md 추가 (최우선)
  const introFile = path.join(process.cwd(), 'content', 'intro.md');
  if (fs.existsSync(introFile)) {
    files.push(introFile);
    console.log('✓ intro.md 추가');
  }

  // 2. opinions.md 추가 (의사결정 원칙)
  const opinionsFile = path.join(process.cwd(), 'content', 'opinions.md');
  if (fs.existsSync(opinionsFile)) {
    files.push(opinionsFile);
    console.log('✓ opinions.md 추가');
  }

  // 3. content/posts (공개 블로그 글)
  const postsDir = path.join(process.cwd(), 'content', 'posts');
  if (fs.existsSync(postsDir)) {
    const postFiles = fs.readdirSync(postsDir)
      .filter(file => file.endsWith('.md') && file !== 'README.md')
      .map(file => path.join(postsDir, file));
    files.push(...postFiles);
    console.log(`✓ posts: ${postFiles.length}개 파일 추가`);
  }

  // 4. content/training (AI 학습 전용)
  const trainingDir = path.join(process.cwd(), 'content', 'training');
  if (fs.existsSync(trainingDir)) {
    const trainingFiles = fs.readdirSync(trainingDir)
      .filter(file => file.endsWith('.md') && file !== 'README.md')
      .map(file => path.join(trainingDir, file));
    files.push(...trainingFiles);
    console.log(`✓ training: ${trainingFiles.length}개 파일 추가`);
  }

  console.log(`\n📚 총 ${files.length}개의 파일을 처리합니다.\n`);

  if (files.length === 0) {
    console.log('⚠️  처리할 파일이 없습니다.');
    return;
  }

  // 배치 처리 (5개씩 병렬)
  const batches = chunkArray(files, 5);
  let processed = 0;

  for (let i = 0; i < batches.length; i++) {
    const batch = batches[i];
    console.log(`\n📦 배치 ${i + 1}/${batches.length} 처리 중... (${batch.length}개 파일)`);

    await Promise.all(batch.map(async (file) => {
      await processDocument(file);
      processed++;
    }));

    console.log(`   → 진행률: ${processed}/${files.length} (${Math.round(processed/files.length*100)}%)`);

    // 배치 간 약간의 딜레이 (rate limiting)
    if (i < batches.length - 1) {
      await new Promise(resolve => setTimeout(resolve, 500));
    }
  }

  console.log('\n✨ 모든 문서 처리 완료!');
  console.log(`📊 총 ${processed}개 파일 임베딩 생성 완료`);
}

main().catch(console.error);
