-- pgvector extension 활성화 (벡터 검색용)
CREATE EXTENSION IF NOT EXISTS vector;

-- Documents 테이블: RAG를 위한 문서 저장소
CREATE TABLE IF NOT EXISTS documents (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

  -- 콘텐츠
  content TEXT NOT NULL,
  content_with_context TEXT,
  embedding VECTOR(1536),

  -- 메타데이터
  title TEXT,
  type TEXT,
  url TEXT,
  published_date DATE,
  tags TEXT[],
  metadata JSONB,

  -- 타임스탬프
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 벡터 검색 인덱스 (HNSW)
CREATE INDEX IF NOT EXISTS idx_documents_embedding
ON documents
USING hnsw (embedding vector_cosine_ops);

-- 전문 검색 인덱스
CREATE INDEX IF NOT EXISTS idx_documents_content_fts
ON documents
USING gin(to_tsvector('english', content));

-- 메타데이터 검색용 인덱스
CREATE INDEX IF NOT EXISTS idx_documents_type ON documents(type);
CREATE INDEX IF NOT EXISTS idx_documents_tags ON documents USING gin(tags);
CREATE INDEX IF NOT EXISTS idx_documents_created_at ON documents(created_at DESC);

-- Updated_at 자동 업데이트 함수 (이미 존재하면 재사용)
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger for updated_at
DROP TRIGGER IF EXISTS update_documents_updated_at ON documents;
CREATE TRIGGER update_documents_updated_at
  BEFORE UPDATE ON documents
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- 하이브리드 검색 함수
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
