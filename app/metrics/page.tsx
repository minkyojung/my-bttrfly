'use client';

import { useEffect, useState } from 'react';
import { LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import type { MetricsStats } from '@/types/metrics';

interface MetricsData {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  data: any[];
  stats: MetricsStats;
  timeRange: string;
  count: number;
}

export default function MetricsDashboard() {
  const [metrics, setMetrics] = useState<MetricsData | null>(null);
  const [timeRange, setTimeRange] = useState('24h');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchMetrics();
  }, [timeRange]);

  const fetchMetrics = async () => {
    setLoading(true);
    setError(null);

    try {
      const res = await fetch(`/api/metrics?range=${timeRange}`);
      if (!res.ok) throw new Error('Failed to fetch metrics');

      const data = await res.json();
      setMetrics(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading metrics...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="bg-red-50 border border-red-200 rounded-lg p-6 max-w-md">
          <h3 className="text-red-800 font-semibold mb-2">Error</h3>
          <p className="text-red-600">{error}</p>
          <button
            onClick={fetchMetrics}
            className="mt-4 px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  const stats = metrics?.stats;
  const hasData = stats && stats.total > 0;

  // Prepare chart data for performance breakdown
  const performanceData = hasData ? [
    { name: 'STT', time: stats.avgPerformance.stt, target: 1000 },
    { name: 'RAG', time: stats.avgPerformance.rag, target: 1500 },
    { name: 'LLM', time: stats.avgPerformance.llm, target: 1500 },
    { name: 'TTS', time: stats.avgPerformance.tts, target: 2000 },
  ] : [];

  return (
    <div className="min-h-screen bg-gray-50 p-4 md:p-8">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Voice Chat Metrics</h1>
        <p className="text-gray-600">Performance and quality analytics</p>
      </div>

      {/* Time Range Selector */}
      <div className="mb-6 flex gap-2">
        {['1h', '24h', '7d', '30d'].map((range) => (
          <button
            key={range}
            onClick={() => setTimeRange(range)}
            className={`px-4 py-2 rounded-lg font-medium transition-colors ${
              timeRange === range
                ? 'bg-blue-600 text-white'
                : 'bg-white text-gray-700 hover:bg-gray-100 border border-gray-300'
            }`}
          >
            {range}
          </button>
        ))}
        <button
          onClick={fetchMetrics}
          className="ml-auto px-4 py-2 bg-white border border-gray-300 rounded-lg hover:bg-gray-50"
        >
          🔄 Refresh
        </button>
      </div>

      {!hasData ? (
        <div className="bg-white rounded-lg shadow p-12 text-center">
          <div className="text-6xl mb-4">📊</div>
          <h3 className="text-xl font-semibold text-gray-800 mb-2">No Data Yet</h3>
          <p className="text-gray-600">
            Start using the voice chat to see metrics appear here.
          </p>
          <a
            href="/voice"
            className="inline-block mt-4 px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
          >
            Go to Voice Chat
          </a>
        </div>
      ) : (
        <>
          {/* KPI Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            <MetricCard
              title="Total Sessions"
              value={stats.total.toString()}
              subtitle={`Error rate: ${(stats.errorRate * 100).toFixed(1)}%`}
              icon="💬"
              color="blue"
            />
            <MetricCard
              title="Avg Response Time"
              value={`${(stats.avgPerformance.total / 1000).toFixed(2)}s`}
              subtitle={`Target: <5.0s`}
              icon="⚡"
              color={stats.avgPerformance.total > 5000 ? 'yellow' : 'green'}
            />
            <MetricCard
              title="Total Cost"
              value={`$${stats.totalCost.toFixed(4)}`}
              subtitle={`Avg: $${stats.avgCostPerSession.toFixed(6)}/session`}
              icon="💰"
              color="purple"
            />
            <MetricCard
              title="Avg Response Length"
              value={`${Math.round(stats.avgQuality.responseLength)} chars`}
              subtitle={`${stats.avgQuality.responseSentences.toFixed(1)} sentences`}
              icon="📝"
              color="indigo"
            />
          </div>

          {/* Performance Charts */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
            {/* Stage Performance Bar Chart */}
            <div className="bg-white rounded-lg shadow p-6">
              <h2 className="text-lg font-semibold text-gray-800 mb-4">
                Average Performance by Stage
              </h2>
              <ResponsiveContainer width="100%" height={300}>
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

            {/* Time Series Line Chart */}
            <div className="bg-white rounded-lg shadow p-6">
              <h2 className="text-lg font-semibold text-gray-800 mb-4">
                Sessions Over Time
              </h2>
              {stats.byTime && stats.byTime.length > 0 ? (
                <ResponsiveContainer width="100%" height={300}>
                  <LineChart data={stats.byTime}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis
                      dataKey="timestamp"
                      tickFormatter={(value) => {
                        const date = new Date(value);
                        return date.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });
                      }}
                    />
                    <YAxis />
                    <Tooltip
                      labelFormatter={(value) => new Date(value as string).toLocaleString()}
                    />
                    <Legend />
                    <Line type="monotone" dataKey="count" stroke="#3B82F6" name="Sessions" />
                    <Line type="monotone" dataKey="errorCount" stroke="#EF4444" name="Errors" />
                  </LineChart>
                </ResponsiveContainer>
              ) : (
                <div className="h-[300px] flex items-center justify-center text-gray-500">
                  Not enough data for time series
                </div>
              )}
            </div>
          </div>

          {/* Stats Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
            {/* Performance Stats */}
            <div className="bg-white rounded-lg shadow p-6">
              <h2 className="text-lg font-semibold text-gray-800 mb-4">
                Performance Breakdown
              </h2>
              <div className="space-y-3">
                <StatRow label="Speech-to-Text" value={`${stats.avgPerformance.stt}ms`} target="<1000ms" />
                <StatRow label="RAG Search" value={`${stats.avgPerformance.rag}ms`} target="<1500ms" />
                <StatRow label="LLM Generation" value={`${stats.avgPerformance.llm}ms`} target="<1500ms" />
                <StatRow label="Text-to-Speech" value={`${stats.avgPerformance.tts}ms`} target="<2000ms" />
                <StatRow
                  label="Total (P50)"
                  value={`${stats.p50Performance.total}ms`}
                  target="<5000ms"
                  highlight
                />
                <StatRow
                  label="Total (P95)"
                  value={`${stats.p95Performance.total}ms`}
                  target="<8000ms"
                  highlight
                />
              </div>
            </div>

            {/* Quality Stats */}
            <div className="bg-white rounded-lg shadow p-6">
              <h2 className="text-lg font-semibold text-gray-800 mb-4">
                Quality & Normalization
              </h2>
              <div className="space-y-3">
                <StatRow
                  label="Avg Response Length"
                  value={`${Math.round(stats.avgQuality.responseLength)} chars`}
                />
                <StatRow
                  label="Avg Sentences"
                  value={stats.avgQuality.responseSentences.toFixed(1)}
                />
                <StatRow
                  label="Citations Removed"
                  value={stats.avgQuality.citationsRemoved.toFixed(1)}
                  info="Avg per session"
                />
                <StatRow
                  label="Fillers Added"
                  value={stats.avgQuality.fillersAdded.toFixed(1)}
                  info="Avg per session"
                />
                <StatRow
                  label="Documents Used"
                  value={stats.avgQuality.documentsUsed.toFixed(1)}
                  info="RAG retrieval"
                />
              </div>
            </div>
          </div>

          {/* Recent Sessions Table */}
          <div className="bg-white rounded-lg shadow overflow-hidden">
            <div className="p-6 border-b border-gray-200">
              <h2 className="text-lg font-semibold text-gray-800">
                Recent Sessions
              </h2>
            </div>
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Timestamp
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Duration
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Response
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Cost
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Status
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {/* eslint-disable-next-line @typescript-eslint/no-explicit-any */}
                  {metrics.data.slice(0, 10).map((session: any) => (
                    <tr key={session.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {new Date(session.timestamp).toLocaleString()}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {(session.total_duration / 1000).toFixed(2)}s
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-900">
                        {session.response_length} chars / {session.response_sentences} sent
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        ${session.cost_total.toFixed(6)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        {session.has_error ? (
                          <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-red-100 text-red-800">
                            Error
                          </span>
                        ) : (
                          <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-green-100 text-green-800">
                            Success
                          </span>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </>
      )}
    </div>
  );
}

// Metric Card Component
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
    <div className={`rounded-lg border-2 p-6 ${colorClasses[color]}`}>
      <div className="flex items-start justify-between">
        <div className="flex-1">
          <p className="text-sm font-medium text-gray-600 mb-1">{title}</p>
          <p className="text-3xl font-bold text-gray-900">{value}</p>
          {subtitle && <p className="text-sm text-gray-500 mt-1">{subtitle}</p>}
        </div>
        {icon && <div className="text-3xl">{icon}</div>}
      </div>
    </div>
  );
}

// Stat Row Component
function StatRow({
  label,
  value,
  target,
  info,
  highlight,
}: {
  label: string;
  value: string;
  target?: string;
  info?: string;
  highlight?: boolean;
}) {
  return (
    <div className={`flex justify-between items-center py-2 ${highlight ? 'border-t border-gray-200 pt-3' : ''}`}>
      <div>
        <span className={`${highlight ? 'font-semibold' : ''} text-gray-700`}>{label}</span>
        {info && <span className="text-xs text-gray-500 ml-2">({info})</span>}
      </div>
      <div className="text-right">
        <span className={`${highlight ? 'font-bold text-lg' : 'font-medium'} text-gray-900`}>
          {value}
        </span>
        {target && (
          <span className="text-xs text-gray-500 ml-2">
            {target}
          </span>
        )}
      </div>
    </div>
  );
}
