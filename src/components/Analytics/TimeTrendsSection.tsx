import { useMemo, useState } from 'react';
import {
  Line,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  ReferenceLine,
  Area,
  ComposedChart,
} from 'recharts';
import type { DayCompletion } from '../../types/dayCompletion';
import type { TimeRange } from '../../types/analytics';
import { aggregateDailyTrends, aggregateWeeklyTrends } from '../../utils/analytics';
import {
  formatChartDate,
  formatChartDuration,
  formatTooltipDuration,
  getChartDimensions,
  getChartFontSize,
} from '../../utils/chartFormatters';
import { useResponsive } from '../../hooks/useResponsive';
import { EmptyState } from './EmptyState';
import { CHART_COLORS } from '../../constants/chartColors';

interface TimeTrendsSectionProps {
  completions: DayCompletion[];
  timeRange: TimeRange;
}

type ViewMode = 'daily' | 'weekly';

export function TimeTrendsSection({ completions, timeRange }: TimeTrendsSectionProps) {
  const [viewMode, setViewMode] = useState<ViewMode>('daily');
  const { isMobile } = useResponsive();

  const trendData = useMemo(() => {
    if (viewMode === 'daily') {
      return aggregateDailyTrends(completions);
    } else {
      return aggregateWeeklyTrends(completions);
    }
  }, [completions, viewMode]);

  const avgTimeSpent = useMemo(() => {
    if (trendData.length === 0) return 0;
    const total = trendData.reduce((sum, d) => sum + d.timeSpent, 0);
    return total / trendData.length;
  }, [trendData]);

  const chartDimensions = getChartDimensions(isMobile, 'line');
  const fontSize = getChartFontSize(isMobile);

  if (completions.length < 2) {
    return (
      <div className="bg-white border border-gray-200 rounded-lg p-6">
        <h2 className="text-xl font-semibold mb-4">Time Trends</h2>
        <EmptyState
          title="Not enough data yet"
          description="Complete at least 2 days to see time trends and patterns."
        />
      </div>
    );
  }

  return (
    <div className="bg-white border border-gray-200 rounded-lg p-6">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-xl font-semibold">Time Trends</h2>
        <div className="flex gap-1 bg-gray-100 rounded-md p-1">
          <button
            onClick={() => setViewMode('daily')}
            className={`px-3 py-1.5 rounded text-sm font-medium transition-colors ${
              viewMode === 'daily'
                ? 'bg-white text-gray-900 shadow-sm'
                : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            Daily
          </button>
          <button
            onClick={() => setViewMode('weekly')}
            className={`px-3 py-1.5 rounded text-sm font-medium transition-colors ${
              viewMode === 'weekly'
                ? 'bg-white text-gray-900 shadow-sm'
                : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            Weekly
          </button>
        </div>
      </div>

      <div className="space-y-8">
        {/* Completions Trend Chart */}
        <div>
          <h3 className="text-sm font-medium text-gray-700 mb-3">Cards Completed</h3>
          <ResponsiveContainer width="100%" height={chartDimensions.height}>
            <ComposedChart data={trendData} margin={chartDimensions.margin}>
              <defs>
                <linearGradient id="completedGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor={CHART_COLORS.primary} stopOpacity={0.3} />
                  <stop offset="95%" stopColor={CHART_COLORS.primary} stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
              <XAxis
                dataKey={viewMode === 'daily' ? 'date' : 'weekLabel'}
                tickFormatter={(value) =>
                  viewMode === 'daily' ? formatChartDate(value, timeRange) : value
                }
                tick={{ fontSize }}
                stroke="#9ca3af"
              />
              <YAxis
                yAxisId="left"
                tick={{ fontSize }}
                stroke="#9ca3af"
                label={{
                  value: 'Cards',
                  angle: -90,
                  position: 'insideLeft',
                  style: { fontSize, fill: '#6b7280' },
                }}
              />
              <YAxis
                yAxisId="right"
                orientation="right"
                tick={{ fontSize }}
                stroke="#9ca3af"
                label={{
                  value: 'Completion %',
                  angle: 90,
                  position: 'insideRight',
                  style: { fontSize, fill: '#6b7280' },
                }}
              />
              <Tooltip
                contentStyle={{
                  backgroundColor: 'white',
                  border: '1px solid #e5e7eb',
                  borderRadius: '0.375rem',
                  fontSize: '12px',
                }}
                formatter={(value: number, name: string) => {
                  if (name === 'Completion Rate') {
                    return [`${value.toFixed(1)}%`, name];
                  }
                  return [value, name];
                }}
              />
              <Legend wrapperStyle={{ fontSize }} />
              <Area
                yAxisId="left"
                type="monotone"
                dataKey="completed"
                fill="url(#completedGradient)"
                stroke={CHART_COLORS.primary}
                strokeWidth={2}
                name="Completed"
              />
              <Line
                yAxisId="right"
                type="monotone"
                dataKey="completionRate"
                stroke={CHART_COLORS.success}
                strokeWidth={2}
                dot={false}
                name="Completion Rate"
              />
              <ReferenceLine
                yAxisId="right"
                y={100}
                stroke="#10b981"
                strokeDasharray="3 3"
                label={{ value: '100%', fontSize: 10, fill: '#10b981' }}
              />
            </ComposedChart>
          </ResponsiveContainer>
        </div>

        {/* Time Spent Chart */}
        <div>
          <h3 className="text-sm font-medium text-gray-700 mb-3">Time Spent</h3>
          <ResponsiveContainer width="100%" height={chartDimensions.height}>
            <BarChart data={trendData} margin={chartDimensions.margin}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
              <XAxis
                dataKey={viewMode === 'daily' ? 'date' : 'weekLabel'}
                tickFormatter={(value) =>
                  viewMode === 'daily' ? formatChartDate(value, timeRange) : value
                }
                tick={{ fontSize }}
                stroke="#9ca3af"
              />
              <YAxis
                tickFormatter={(value) => formatChartDuration(value)}
                tick={{ fontSize }}
                stroke="#9ca3af"
                label={{
                  value: 'Time',
                  angle: -90,
                  position: 'insideLeft',
                  style: { fontSize, fill: '#6b7280' },
                }}
              />
              <Tooltip
                contentStyle={{
                  backgroundColor: 'white',
                  border: '1px solid #e5e7eb',
                  borderRadius: '0.375rem',
                  fontSize: '12px',
                }}
                formatter={(value: number) => formatTooltipDuration(value)}
                labelFormatter={(label) =>
                  viewMode === 'daily' ? `Date: ${label}` : label
                }
              />
              <Legend wrapperStyle={{ fontSize }} />
              <Bar
                dataKey="timeSpent"
                fill={CHART_COLORS.success}
                radius={[4, 4, 0, 0]}
                name="Time Spent"
              />
              <ReferenceLine
                y={avgTimeSpent}
                stroke="#f59e0b"
                strokeDasharray="3 3"
                label={{
                  value: `Avg: ${formatChartDuration(avgTimeSpent)}`,
                  position: 'top',
                  fontSize: 10,
                  fill: '#f59e0b',
                }}
              />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
}
