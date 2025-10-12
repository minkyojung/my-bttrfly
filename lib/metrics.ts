/**
 * Voice Chat Metrics Collection System
 *
 * Tracks performance, quality, and cost metrics for voice chat sessions.
 * Stores data in Supabase for analytics and optimization.
 */

import { createClient } from '@supabase/supabase-js';
import type {
  VoiceMetrics,
  PerformanceMetrics,
  QualityMetrics,
  ErrorMetrics,
  VoiceMetricsRecord,
} from '@/types/metrics';

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL;
const SUPABASE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;

// Cost constants (per minute or per token)
const COST_STT_PER_MINUTE = 0.003;    // OpenAI Whisper: $0.006 per minute (we'll use half for calculation)
const COST_TTS_PER_CHAR = 0.00003;    // ElevenLabs: ~$0.03 per 1000 chars
const COST_LLM_INPUT_PER_1K = 0.00015;  // GPT-4o-mini: $0.15 per 1M input tokens
const COST_LLM_OUTPUT_PER_1K = 0.0006;  // GPT-4o-mini: $0.60 per 1M output tokens

// Rough token estimation (1 token ≈ 4 chars for English, 2 chars for Korean)
const CHARS_PER_TOKEN_KOREAN = 2;

/**
 * Voice Metrics Collector
 *
 * Collects metrics throughout the voice chat pipeline and saves to database.
 */
export class VoiceMetricsCollector {
  private startTime: number;
  private checkpoints: Map<string, number>;
  private metrics: Partial<VoiceMetrics>;

  constructor(sessionId: string, userId?: string) {
    this.startTime = Date.now();
    this.checkpoints = new Map();
    this.metrics = {
      sessionId,
      timestamp: new Date(),
      userId,
      performance: {} as PerformanceMetrics,
      quality: {
        normalizationChanges: {
          citationsRemoved: 0,
          markdownRemoved: 0,
          fillersAdded: 0,
          sentencesSplit: 0,
        },
      } as QualityMetrics,
      cost: {
        stt: 0,
        tts: 0,
        llm: 0,
        total: 0,
      },
    };
  }

  /**
   * Record a checkpoint for duration calculation
   */
  checkpoint(stage: string): void {
    this.checkpoints.set(stage, Date.now());
  }

  /**
   * Get duration between two checkpoints
   */
  getDuration(startStage: string, endStage: string): number {
    const startTime = this.checkpoints.get(startStage);
    const endTime = this.checkpoints.get(endStage);

    if (!startTime || !endTime) {
      return 0;
    }

    return endTime - startTime;
  }

  /**
   * Set a metric value
   */
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  setMetric(key: string, value: any): void {
    const keys = key.split('.');
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    let current: any = this.metrics;

    for (let i = 0; i < keys.length - 1; i++) {
      if (!current[keys[i]]) {
        current[keys[i]] = {};
      }
      current = current[keys[i]];
    }

    current[keys[keys.length - 1]] = value;
  }

  /**
   * Record an error
   */
  recordError(stage: ErrorMetrics['errorStage'], message: string, code?: string): void {
    this.metrics.error = {
      hasError: true,
      errorStage: stage,
      errorMessage: message,
      errorCode: code,
    };
  }

  /**
   * Finalize metrics and save to database
   */
  async finalize(): Promise<VoiceMetrics> {
    // Calculate all durations
    this.metrics.performance = {
      sttDuration: this.getDuration('stt_start', 'stt_end'),
      ragSearchDuration: this.getDuration('rag_start', 'rag_end'),
      ragRerankDuration: this.getDuration('rerank_start', 'rerank_end'),
      llmDuration: this.getDuration('llm_start', 'llm_end'),
      normalizationDuration: this.getDuration('norm_start', 'norm_end'),
      ttsDuration: this.getDuration('tts_start', 'tts_end'),
      totalDuration: Date.now() - this.startTime,
    };

    // Calculate costs
    this.metrics.cost = this.estimateCost();

    // Save to database (fire and forget - don't block response)
    this.saveToDatabase().catch(() => {
      // Don't throw - metrics failure shouldn't break the voice chat
    });

    return this.metrics as VoiceMetrics;
  }

  /**
   * Estimate cost based on usage
   */
  private estimateCost(): VoiceMetrics['cost'] {
    const quality = this.metrics.quality!;
    const performance = this.metrics.performance!;

    // STT cost: based on audio duration (estimate from processing time)
    const sttMinutes = (performance.sttDuration || 0) / 1000 / 60;
    const sttCost = sttMinutes * COST_STT_PER_MINUTE;

    // TTS cost: based on character count
    const ttsChars = quality.responseLength || 0;
    const ttsCost = ttsChars * COST_TTS_PER_CHAR;

    // LLM cost: based on token count (estimated from character count)
    const inputTokens = (quality.transcriptionLength || 0) / CHARS_PER_TOKEN_KOREAN;
    const outputTokens = (quality.responseLength || 0) / CHARS_PER_TOKEN_KOREAN;
    const llmCost =
      (inputTokens / 1000) * COST_LLM_INPUT_PER_1K +
      (outputTokens / 1000) * COST_LLM_OUTPUT_PER_1K;

    const totalCost = sttCost + ttsCost + llmCost;

    return {
      stt: parseFloat(sttCost.toFixed(6)),
      tts: parseFloat(ttsCost.toFixed(6)),
      llm: parseFloat(llmCost.toFixed(6)),
      total: parseFloat(totalCost.toFixed(6)),
    };
  }

  /**
   * Save metrics to Supabase
   */
  private async saveToDatabase(): Promise<void> {
    if (!SUPABASE_URL || !SUPABASE_KEY) {
      return;
    }

    const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);

    // Convert to database record format
    const record: Omit<VoiceMetricsRecord, 'id' | 'created_at'> = {
      session_id: this.metrics.sessionId!,
      timestamp: this.metrics.timestamp!.toISOString(),
      user_id: this.metrics.userId,

      // Performance
      stt_duration: this.metrics.performance!.sttDuration,
      rag_search_duration: this.metrics.performance!.ragSearchDuration,
      rag_rerank_duration: this.metrics.performance!.ragRerankDuration,
      llm_duration: this.metrics.performance!.llmDuration,
      normalization_duration: this.metrics.performance!.normalizationDuration,
      tts_duration: this.metrics.performance!.ttsDuration,
      total_duration: this.metrics.performance!.totalDuration,

      // Quality
      transcription_length: this.metrics.quality!.transcriptionLength || 0,
      transcription_text: this.metrics.transcriptionText,
      response_length: this.metrics.quality!.responseLength || 0,
      response_text: this.metrics.responseText,
      normalized_text: this.metrics.normalizedText,
      response_sentences: this.metrics.quality!.responseSentences || 0,

      // Normalization
      citations_removed: this.metrics.quality!.normalizationChanges.citationsRemoved,
      markdown_removed: this.metrics.quality!.normalizationChanges.markdownRemoved,
      fillers_added: this.metrics.quality!.normalizationChanges.fillersAdded,

      // RAG
      documents_found: this.metrics.quality!.documentsFound || 0,
      documents_used: this.metrics.quality!.documentsUsed || 0,
      avg_similarity: this.metrics.quality!.avgSimilarity || 0,

      // Cost
      cost_stt: this.metrics.cost!.stt,
      cost_tts: this.metrics.cost!.tts,
      cost_llm: this.metrics.cost!.llm,
      cost_total: this.metrics.cost!.total,

      // Error
      has_error: this.metrics.error?.hasError || false,
      error_stage: this.metrics.error?.errorStage,
      error_message: this.metrics.error?.errorMessage,
    };

    const { error } = await supabase.from('voice_metrics').insert([record]);

    if (error) {
      throw new Error(`Failed to insert metrics: ${error.message}`);
    }
  }

  /**
   * Get current metrics (for debugging)
   */
  getMetrics(): Partial<VoiceMetrics> {
    return this.metrics;
  }
}

/**
 * Helper function to generate a unique session ID
 */
export function generateSessionId(): string {
  return `session_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;
}

/**
 * Helper function to count sentences in text
 */
export function countSentences(text: string): number {
  // Split by sentence-ending punctuation
  const sentences = text.split(/[.!?。!?]+/).filter(s => s.trim().length > 0);
  return sentences.length;
}

/**
 * Helper function to calculate average similarity
 */
export function calculateAvgSimilarity(documents: Array<{ similarity: number }>): number {
  if (documents.length === 0) return 0;

  const sum = documents.reduce((acc, doc) => acc + doc.similarity, 0);
  return sum / documents.length;
}
