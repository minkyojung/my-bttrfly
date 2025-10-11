-- Create voice_metrics table for tracking voice chat performance and quality
-- Migration: 20250111_create_voice_metrics

-- Create table
CREATE TABLE IF NOT EXISTS voice_metrics (
  -- Primary key
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

  -- Basic information
  session_id TEXT NOT NULL,
  timestamp TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  user_id TEXT,

  -- Performance metrics (milliseconds)
  stt_duration INTEGER,
  rag_search_duration INTEGER,
  rag_rerank_duration INTEGER,
  llm_duration INTEGER,
  normalization_duration INTEGER,
  tts_duration INTEGER,
  total_duration INTEGER,

  -- Quality metrics
  transcription_length INTEGER,
  transcription_text TEXT,
  response_length INTEGER,
  response_text TEXT,
  normalized_text TEXT,
  response_sentences INTEGER,

  -- Normalization metrics
  citations_removed INTEGER DEFAULT 0,
  markdown_removed INTEGER DEFAULT 0,
  fillers_added INTEGER DEFAULT 0,

  -- RAG metrics
  documents_found INTEGER,
  documents_used INTEGER,
  avg_similarity FLOAT,

  -- Cost tracking (USD)
  cost_stt FLOAT,
  cost_tts FLOAT,
  cost_llm FLOAT,
  cost_total FLOAT,

  -- Error tracking
  has_error BOOLEAN DEFAULT FALSE,
  error_stage TEXT,
  error_message TEXT,

  -- Timestamps
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create indexes for common queries
CREATE INDEX IF NOT EXISTS idx_voice_metrics_timestamp
  ON voice_metrics(timestamp DESC);

CREATE INDEX IF NOT EXISTS idx_voice_metrics_session
  ON voice_metrics(session_id);

CREATE INDEX IF NOT EXISTS idx_voice_metrics_user
  ON voice_metrics(user_id)
  WHERE user_id IS NOT NULL;

CREATE INDEX IF NOT EXISTS idx_voice_metrics_error
  ON voice_metrics(has_error)
  WHERE has_error = TRUE;

CREATE INDEX IF NOT EXISTS idx_voice_metrics_total_duration
  ON voice_metrics(total_duration);

-- Create composite index for time-range queries
CREATE INDEX IF NOT EXISTS idx_voice_metrics_timestamp_error
  ON voice_metrics(timestamp DESC, has_error);

-- Enable Row Level Security (RLS)
ALTER TABLE voice_metrics ENABLE ROW LEVEL SECURITY;

-- Create policies
-- Allow anyone to read metrics (can be restricted later)
CREATE POLICY "Enable read access for all users"
  ON voice_metrics
  FOR SELECT
  USING (true);

-- Allow inserts (for metrics collection)
CREATE POLICY "Enable insert for all users"
  ON voice_metrics
  FOR INSERT
  WITH CHECK (true);

-- Comments for documentation
COMMENT ON TABLE voice_metrics IS 'Tracks performance, quality, and cost metrics for voice chat sessions';
COMMENT ON COLUMN voice_metrics.session_id IS 'Unique identifier for each voice chat session';
COMMENT ON COLUMN voice_metrics.stt_duration IS 'Speech-to-Text processing time in milliseconds';
COMMENT ON COLUMN voice_metrics.rag_search_duration IS 'RAG document search time in milliseconds';
COMMENT ON COLUMN voice_metrics.llm_duration IS 'LLM response generation time in milliseconds';
COMMENT ON COLUMN voice_metrics.normalization_duration IS 'Text normalization processing time in milliseconds';
COMMENT ON COLUMN voice_metrics.tts_duration IS 'Text-to-Speech synthesis time in milliseconds';
COMMENT ON COLUMN voice_metrics.total_duration IS 'Total end-to-end processing time in milliseconds';
COMMENT ON COLUMN voice_metrics.cost_total IS 'Total estimated cost in USD';
