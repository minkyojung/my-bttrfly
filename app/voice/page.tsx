'use client';

import { useEffect, useState } from 'react';
import VoiceChatInterface from '@/components/VoiceChatInterface';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import type { MetricsStats } from '@/types/metrics';

interface MetricsData {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  data: any[];
  stats: MetricsStats;
  timeRange: string;
  count: number;
}

export default function VoicePage() {
  const [metrics, setMetrics] = useState<MetricsData | null>(null);
  const [autoRefresh, setAutoRefresh] = useState(true);

  useEffect(() => {
    fetchMetrics();

    // Auto-refresh every 10 seconds
    if (autoRefresh) {
      const interval = setInterval(fetchMetrics, 10000);
      return () => clearInterval(interval);
    }
  }, [autoRefresh]);

  const fetchMetrics = async () => {
    try {
      const res = await fetch('/api/metrics?range=1h');
      if (!res.ok) return;
      const data = await res.json();
      setMetrics(data);
    } catch (err) {
      console.error('Failed to fetch metrics:', err);
    }
  };

  const stats = metrics?.stats;
  const hasData = stats && stats.total > 0;

  // Performance data for chart
  const performanceData = hasData ? [
    { name: 'STT', time: stats.avgPerformance.stt, target: 1000 },
    { name: 'RAG', time: stats.avgPerformance.rag, target: 1500 },
    { name: 'LLM', time: stats.avgPerformance.llm, target: 1500 },
    { name: 'TTS', time: stats.avgPerformance.tts, target: 2000 },
  ] : [];

  return (
    <div className="h-screen flex bg-gray-50 overflow-hidden">
      {/* Left: Metrics Dashboard (70%) */}
      <div className="w-[70%] overflow-y-auto p-6">
        <div className="mb-6">
          <div className="flex items-center justify-between mb-2">
            <h1 className="text-2xl font-bold text-gray-900">Live Metrics</h1>
            <div className="flex items-center gap-3">
              <button
                onClick={() => setAutoRefresh(!autoRefresh)}
                className={`px-3 py-1 rounded text-sm font-medium transition-colors ${
                  autoRefresh
                    ? 'bg-green-100 text-green-700'
                    : 'bg-gray-100 text-gray-700'
                }`}
              >
                {autoRefresh ? '🟢 Auto' : '⭕ Manual'}
              </button>
              <button
                onClick={fetchMetrics}
                className="px-3 py-1 bg-white border border-gray-300 rounded text-sm hover:bg-gray-50"
              >
                🔄 Refresh
              </button>
            </div>
          </div>
          <p className="text-sm text-gray-600">Real-time performance monitoring (Last 1 hour)</p>
        </div>

        {!hasData ? (
          <div className="bg-white rounded-lg shadow p-12 text-center">
            <div className="text-5xl mb-3">📊</div>
            <h3 className="text-lg font-semibold text-gray-800 mb-2">No Data Yet</h3>
            <p className="text-gray-600 text-sm">
              Start a voice chat conversation to see metrics appear here.
            </p>
          </div>
        ) : (
          <>
            {/* KPI Cards */}
            <div className="grid grid-cols-3 gap-4 mb-6">
              <MetricCard
                title="Total Sessions"
                value={stats.total.toString()}
                subtitle={`${((1 - stats.errorRate) * 100).toFixed(0)}% success`}
                icon="💬"
                color="blue"
              />
              <MetricCard
                title="Avg Response"
                value={`${(stats.avgPerformance.total / 1000).toFixed(2)}s`}
                subtitle={stats.avgPerformance.total > 5000 ? '⚠️ Above target' : '✅ On target'}
                icon="⚡"
                color={stats.avgPerformance.total > 5000 ? 'yellow' : 'green'}
              />
              <MetricCard
                title="Total Cost"
                value={`$${stats.totalCost.toFixed(4)}`}
                subtitle={`$${stats.avgCostPerSession.toFixed(6)}/session`}
                icon="💰"
                color="purple"
              />
            </div>

            {/* Performance Bar Chart */}
            <div className="bg-white rounded-lg shadow p-5 mb-6">
              <h2 className="text-base font-semibold text-gray-800 mb-3">
                Performance Breakdown
              </h2>
              <ResponsiveContainer width="100%" height={200}>
                <BarChart data={performanceData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="name" />
                  <YAxis label={{ value: 'Time (ms)', angle: -90, position: 'insideLeft' }} />
                  <Tooltip />
                  <Legend />
                  <Bar dataKey="time" fill="#3B82F6" name="Actual" />
                  <Bar dataKey="target" fill="#10B981" name="Target" />
                </BarChart>
              </ResponsiveContainer>
            </div>

            {/* Quality Stats Grid */}
            <div className="grid grid-cols-2 gap-4 mb-6">
              <div className="bg-white rounded-lg shadow p-4">
                <h3 className="text-sm font-semibold text-gray-700 mb-3">Performance</h3>
                <div className="space-y-2 text-sm">
                  <StatRow label="STT" value={`${stats.avgPerformance.stt}ms`} />
                  <StatRow label="RAG" value={`${stats.avgPerformance.rag}ms`} />
                  <StatRow label="LLM" value={`${stats.avgPerformance.llm}ms`} />
                  <StatRow label="TTS" value={`${stats.avgPerformance.tts}ms`} />
                </div>
              </div>

              <div className="bg-white rounded-lg shadow p-4">
                <h3 className="text-sm font-semibold text-gray-700 mb-3">Quality</h3>
                <div className="space-y-2 text-sm">
                  <StatRow label="Response" value={`${Math.round(stats.avgQuality.responseLength)}ch`} />
                  <StatRow label="Sentences" value={stats.avgQuality.responseSentences.toFixed(1)} />
                  <StatRow label="Citations -" value={stats.avgQuality.citationsRemoved.toFixed(1)} />
                  <StatRow label="Fillers +" value={stats.avgQuality.fillersAdded.toFixed(1)} />
                </div>
              </div>
            </div>

            {/* Recent Sessions */}
            <div className="bg-white rounded-lg shadow overflow-hidden">
              <div className="px-4 py-3 border-b border-gray-200">
                <h2 className="text-base font-semibold text-gray-800">
                  Recent Sessions (Last 5)
                </h2>
              </div>
              <div className="divide-y divide-gray-200">
                {/* eslint-disable-next-line @typescript-eslint/no-explicit-any */}
                {metrics.data.slice(0, 5).map((session: any) => (
                  <div key={session.id} className="px-4 py-3 hover:bg-gray-50 transition-colors">
                    <div className="flex items-center justify-between text-sm">
                      <div className="flex-1">
                        <div className="font-medium text-gray-900">
                          {new Date(session.timestamp).toLocaleTimeString()}
                        </div>
                        <div className="text-gray-500 text-xs mt-1">
                          {session.response_length}ch · {session.response_sentences} sent
                        </div>
                      </div>
                      <div className="flex items-center gap-3">
                        <span className="text-gray-700 font-medium">
                          {(session.total_duration / 1000).toFixed(2)}s
                        </span>
                        {session.has_error ? (
                          <span className="px-2 py-1 text-xs font-semibold rounded-full bg-red-100 text-red-800">
                            Error
                          </span>
                        ) : (
                          <span className="px-2 py-1 text-xs font-semibold rounded-full bg-green-100 text-green-800">
                            ✓
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </>
        )}
      </div>

      {/* Right: Voice Chat Interface (30%) */}
      <div className="w-[30%] border-l border-gray-300 bg-white overflow-hidden">
        <VoiceChatInterface />
      </div>
    </div>
  );
}

// Metric Card Component (simplified)
function MetricCard({
  title,
  value,
  subtitle,
  icon,
  color = 'blue',
}: {
  title: string;
  value: string;
  subtitle?: string;
  icon?: string;
  color?: 'blue' | 'green' | 'yellow' | 'red' | 'purple' | 'indigo';
}) {
  const colorClasses = {
    blue: 'bg-blue-50 border-blue-200',
    green: 'bg-green-50 border-green-200',
    yellow: 'bg-yellow-50 border-yellow-200',
    red: 'bg-red-50 border-red-200',
    purple: 'bg-purple-50 border-purple-200',
    indigo: 'bg-indigo-50 border-indigo-200',
  };

  return (
    <div className={`rounded-lg border-2 p-4 ${colorClasses[color]}`}>
      <div className="flex items-start justify-between">
        <div className="flex-1">
          <p className="text-xs font-medium text-gray-600 mb-1">{title}</p>
          <p className="text-2xl font-bold text-gray-900">{value}</p>
          {subtitle && <p className="text-xs text-gray-500 mt-1">{subtitle}</p>}
        </div>
        {icon && <div className="text-2xl">{icon}</div>}
      </div>
    </div>
  );
}

// Stat Row Component (compact)
function StatRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex justify-between items-center">
      <span className="text-gray-600">{label}</span>
      <span className="font-medium text-gray-900">{value}</span>
    </div>
  );
}
