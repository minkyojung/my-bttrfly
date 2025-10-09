-- Articles 테이블: 수집된 뉴스 기사 저장
CREATE TABLE IF NOT EXISTS articles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  url TEXT UNIQUE NOT NULL,
  content TEXT,
  excerpt TEXT,
  thumbnail_url TEXT,
  summary TEXT,

  -- AI 분류 결과
  category TEXT,
  subcategory TEXT,
  keywords TEXT[],
  sentiment TEXT CHECK (sentiment IN ('positive', 'neutral', 'negative')),
  relevance_score INTEGER,

  -- 상태 관리
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'classified', 'generated', 'posted', 'failed')),

  -- 메타데이터
  source TEXT,
  author TEXT,
  published_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Instagram Posts 테이블: 생성된 인스타그램 콘텐츠 저장
CREATE TABLE IF NOT EXISTS instagram_posts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  article_id UUID REFERENCES articles(id) ON DELETE CASCADE,

  -- 생성된 콘텐츠
  generated_title TEXT NOT NULL,
  short_caption TEXT,
  full_caption TEXT NOT NULL,
  hashtags TEXT[],
  alt_text TEXT,

  -- 스케줄링 및 게시 정보
  scheduled_at TIMESTAMPTZ,
  posted_at TIMESTAMPTZ,

  -- 인스타그램 메타데이터
  instagram_media_id TEXT,
  instagram_permalink TEXT,

  -- 참여 지표 (선택사항)
  likes_count INTEGER DEFAULT 0,
  comments_count INTEGER DEFAULT 0,

  -- 상태 관리
  status TEXT DEFAULT 'draft' CHECK (status IN ('draft', 'scheduled', 'posted', 'failed')),

  -- 메타데이터
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 인덱스 생성 (성능 향상)
CREATE INDEX IF NOT EXISTS idx_articles_status ON articles(status);
CREATE INDEX IF NOT EXISTS idx_articles_created_at ON articles(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_articles_category ON articles(category);
CREATE INDEX IF NOT EXISTS idx_instagram_posts_status ON instagram_posts(status);
CREATE INDEX IF NOT EXISTS idx_instagram_posts_scheduled_at ON instagram_posts(scheduled_at);

-- Updated_at 자동 업데이트 함수
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Triggers for updated_at
CREATE TRIGGER update_articles_updated_at
  BEFORE UPDATE ON articles
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_instagram_posts_updated_at
  BEFORE UPDATE ON instagram_posts
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- User Prompts 테이블: 사용자 커스텀 프롬프트 저장
CREATE TABLE IF NOT EXISTS user_prompts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id TEXT DEFAULT 'default',
  category TEXT NOT NULL,
  system_prompt TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id, category)
);

-- 인덱스 생성
CREATE INDEX IF NOT EXISTS idx_user_prompts_user_category ON user_prompts(user_id, category);

-- Trigger for updated_at
CREATE TRIGGER update_user_prompts_updated_at
  BEFORE UPDATE ON user_prompts
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- ===== RAG System Tables =====

-- pgvector extension 활성화 (벡터 검색용)
CREATE EXTENSION IF NOT EXISTS vector;

-- Documents 테이블: RAG를 위한 문서 저장소
CREATE TABLE IF NOT EXISTS documents (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

  -- 콘텐츠
  content TEXT NOT NULL,
  content_with_context TEXT,  -- Anthropic Contextual Retrieval용
  embedding VECTOR(1536),  -- OpenAI text-embedding-3-small (1536 차원)

  -- 메타데이터
  title TEXT,
  type TEXT,  -- 'article', 'project', 'bio', 'note' 등
  url TEXT,
  published_date DATE,
  tags TEXT[],
  metadata JSONB,  -- 유연한 추가 메타데이터

  -- 타임스탬프
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 벡터 검색 인덱스 (HNSW - Hierarchical Navigable Small World)
-- 코사인 유사도 기반 검색
CREATE INDEX IF NOT EXISTS idx_documents_embedding
ON documents
USING hnsw (embedding vector_cosine_ops);

-- 전문 검색 인덱스 (하이브리드 검색용)
CREATE INDEX IF NOT EXISTS idx_documents_content_fts
ON documents
USING gin(to_tsvector('english', content));

-- 메타데이터 검색용 인덱스
CREATE INDEX IF NOT EXISTS idx_documents_type ON documents(type);
CREATE INDEX IF NOT EXISTS idx_documents_tags ON documents USING gin(tags);
CREATE INDEX IF NOT EXISTS idx_documents_created_at ON documents(created_at DESC);

-- Trigger for updated_at
CREATE TRIGGER update_documents_updated_at
  BEFORE UPDATE ON documents
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- 하이브리드 검색 함수 (벡터 검색 + 전문 검색)
CREATE OR REPLACE FUNCTION hybrid_search(
  query_embedding VECTOR(1536),
  query_text TEXT,
  match_threshold FLOAT DEFAULT 0.7,
  match_count INT DEFAULT 5
)
RETURNS TABLE (
  id UUID,
  content TEXT,
  content_with_context TEXT,
  title TEXT,
  type TEXT,
  url TEXT,
  tags TEXT[],
  metadata JSONB,
  similarity FLOAT
)
LANGUAGE plpgsql
AS $$
BEGIN
  RETURN QUERY
  SELECT
    d.id,
    d.content,
    d.content_with_context,
    d.title,
    d.type,
    d.url,
    d.tags,
    d.metadata,
    -- 벡터 유사도 (70%) + 텍스트 매칭 (30%) 가중치
    (
      (1 - (d.embedding <=> query_embedding)) * 0.7 +
      ts_rank(to_tsvector('english', d.content), plainto_tsquery('english', query_text)) * 0.3
    )::FLOAT as similarity
  FROM documents d
  WHERE
    d.embedding IS NOT NULL
    AND (
      1 - (d.embedding <=> query_embedding) > match_threshold
      OR to_tsvector('english', d.content) @@ plainto_tsquery('english', query_text)
    )
  ORDER BY similarity DESC
  LIMIT match_count;
END;
$$;
