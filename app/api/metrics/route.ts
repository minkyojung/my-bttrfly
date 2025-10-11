/**
 * Metrics API Route
 *
 * Provides read access to voice chat metrics for analytics and dashboard.
 */

import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import type { VoiceMetricsRecord, MetricsStats } from '@/types/metrics';

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL;
const SUPABASE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!SUPABASE_URL || !SUPABASE_KEY) {
  throw new Error('Missing Supabase credentials');
}

const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);

/**
 * GET /api/metrics
 *
 * Query parameters:
 * - range: '1h' | '24h' | '7d' | '30d' | 'all' (default: '24h')
 * - groupBy: 'hour' | 'day' | 'week' (default: 'hour')
 * - limit: number (default: 100)
 */
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);

    // Parse query parameters
    const timeRange = searchParams.get('range') || '24h';
    const groupBy = searchParams.get('groupBy') || 'hour';
    const limit = parseInt(searchParams.get('limit') || '100', 10);

    // Calculate time range start
    const timeRangeStart = getTimeRangeStart(timeRange);

    // Query metrics from database
    let query = supabase
      .from('voice_metrics')
      .select('*')
      .order('timestamp', { ascending: false })
      .limit(limit);

    if (timeRangeStart) {
      query = query.gte('timestamp', timeRangeStart.toISOString());
    }

    const { data, error } = await query;

    if (error) {
      console.error('Failed to fetch metrics:', error);
      return NextResponse.json(
        { error: 'Failed to fetch metrics', details: error.message },
        { status: 500 }
      );
    }

    if (!data || data.length === 0) {
      return NextResponse.json({
        data: [],
        stats: getEmptyStats(),
        timeRange,
        groupBy,
      });
    }

    // Calculate aggregated statistics
    const stats = calculateStats(data as VoiceMetricsRecord[], groupBy);

    return NextResponse.json({
      data,
      stats,
      timeRange,
      groupBy,
      count: data.length,
    });
  } catch (error) {
    console.error('Metrics API error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

/**
 * Get the start date based on time range
 */
function getTimeRangeStart(range: string): Date | null {
  const now = new Date();

  switch (range) {
    case '1h':
      return new Date(now.getTime() - 60 * 60 * 1000);
    case '24h':
      return new Date(now.getTime() - 24 * 60 * 60 * 1000);
    case '7d':
      return new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
    case '30d':
      return new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
    case 'all':
      return null;
    default:
      return new Date(now.getTime() - 24 * 60 * 60 * 1000);
  }
}

/**
 * Calculate aggregated statistics
 */
function calculateStats(
  data: VoiceMetricsRecord[],
  groupBy: string
): MetricsStats {
  if (data.length === 0) {
    return getEmptyStats();
  }

  // Performance averages
  const avgPerformance = {
    stt: avg(data.map(d => d.stt_duration)),
    rag: avg(data.map(d => d.rag_search_duration)),
    llm: avg(data.map(d => d.llm_duration)),
    tts: avg(data.map(d => d.tts_duration)),
    total: avg(data.map(d => d.total_duration)),
  };

  // Performance percentiles
  const totalDurations = data.map(d => d.total_duration).sort((a, b) => a - b);
  const p50Performance = {
    total: percentile(totalDurations, 0.5),
  };
  const p95Performance = {
    total: percentile(totalDurations, 0.95),
  };

  // Quality averages
  const avgQuality = {
    responseLength: avg(data.map(d => d.response_length)),
    responseSentences: avg(data.map(d => d.response_sentences)),
    citationsRemoved: avg(data.map(d => d.citations_removed)),
    fillersAdded: avg(data.map(d => d.fillers_added)),
    documentsUsed: avg(data.map(d => d.documents_used)),
  };

  // Cost totals
  const totalCost = sum(data.map(d => d.cost_total));
  const avgCostPerSession = totalCost / data.length;

  // Error rate
  const errorCount = data.filter(d => d.has_error).length;
  const errorRate = errorCount / data.length;

  // Time-series grouping
  const byTime = groupByTime(data, groupBy);

  return {
    total: data.length,
    avgPerformance,
    p50Performance,
    p95Performance,
    avgQuality,
    totalCost: parseFloat(totalCost.toFixed(4)),
    avgCostPerSession: parseFloat(avgCostPerSession.toFixed(6)),
    errorRate: parseFloat(errorRate.toFixed(4)),
    byTime,
  };
}

/**
 * Get empty stats structure
 */
function getEmptyStats(): MetricsStats {
  return {
    total: 0,
    avgPerformance: { stt: 0, rag: 0, llm: 0, tts: 0, total: 0 },
    p50Performance: { total: 0 },
    p95Performance: { total: 0 },
    avgQuality: {
      responseLength: 0,
      responseSentences: 0,
      citationsRemoved: 0,
      fillersAdded: 0,
      documentsUsed: 0,
    },
    totalCost: 0,
    avgCostPerSession: 0,
    errorRate: 0,
    byTime: [],
  };
}

/**
 * Group metrics by time period
 */
function groupByTime(
  data: VoiceMetricsRecord[],
  groupBy: string
): MetricsStats['byTime'] {
  const groups = new Map<string, VoiceMetricsRecord[]>();

  data.forEach(record => {
    const timestamp = new Date(record.timestamp);
    const key = getTimeKey(timestamp, groupBy);

    if (!groups.has(key)) {
      groups.set(key, []);
    }
    groups.get(key)!.push(record);
  });

  return Array.from(groups.entries())
    .map(([timestamp, records]) => ({
      timestamp,
      count: records.length,
      avgDuration: avg(records.map(r => r.total_duration)),
      errorCount: records.filter(r => r.has_error).length,
    }))
    .sort((a, b) => a.timestamp.localeCompare(b.timestamp));
}

/**
 * Get time key for grouping
 */
function getTimeKey(date: Date, groupBy: string): string {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  const hour = String(date.getHours()).padStart(2, '0');

  switch (groupBy) {
    case 'hour':
      return `${year}-${month}-${day}T${hour}:00:00Z`;
    case 'day':
      return `${year}-${month}-${day}T00:00:00Z`;
    case 'week':
      const weekStart = new Date(date);
      weekStart.setDate(date.getDate() - date.getDay());
      return weekStart.toISOString().split('T')[0] + 'T00:00:00Z';
    default:
      return `${year}-${month}-${day}T${hour}:00:00Z`;
  }
}

/**
 * Calculate average
 */
function avg(numbers: number[]): number {
  if (numbers.length === 0) return 0;
  const sum = numbers.reduce((acc, n) => acc + n, 0);
  return parseFloat((sum / numbers.length).toFixed(2));
}

/**
 * Calculate sum
 */
function sum(numbers: number[]): number {
  return numbers.reduce((acc, n) => acc + n, 0);
}

/**
 * Calculate percentile
 */
function percentile(sortedNumbers: number[], p: number): number {
  if (sortedNumbers.length === 0) return 0;
  const index = Math.ceil(sortedNumbers.length * p) - 1;
  return sortedNumbers[Math.max(0, index)];
}
