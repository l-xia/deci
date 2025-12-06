import { useMemo } from 'react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  LineChart,
  Line,
} from 'recharts';
import { ArrowTrendingUpIcon, ArrowTrendingDownIcon, MinusIcon } from '@heroicons/react/24/outline';
import type { DayCompletion } from '../../types/dayCompletion';
import type { TimeRange } from '../../types/analytics';
import {
  calculateCompletionRate,
  aggregateByDayOfWeek,
  calculateConsistencyScore,
} from '../../utils/analytics';
import {
  formatPercentage,
  getChartFontSize,
} from '../../utils/chartFormatters';
import { useResponsive } from '../../hooks/useResponsive';
import { EmptyState } from './EmptyState';
import { CHART_COLORS } from '../../constants/chartColors';

interface CompletionInsightsSectionProps {
  completions: DayCompletion[];
  timeRange: TimeRange;
}

export function CompletionInsightsSection({
  completions,
  timeRange,
}: CompletionInsightsSectionProps) {
  const { isMobile } = useResponsive();

  const completionRateData = useMemo(() => {
    return calculateCompletionRate(completions);
  }, [completions]);

  const dayOfWeekData = useMemo(() => {
    return aggregateByDayOfWeek(completions);
  }, [completions]);

  const consistencyScore = useMemo(() => {
    return calculateConsistencyScore(completions, timeRange);
  }, [completions, timeRange]);

  const fontSize = getChartFontSize(isMobile);

  if (completions.length === 0) {
    return (
      <div className="bg-white border border-gray-200 rounded-lg p-6">
        <h2 className="text-xl font-semibold mb-4">Completion Insights</h2>
        <EmptyState
          title="No data available"
          description="Complete some days to see completion insights and patterns."
        />
      </div>
    );
  }

  const getTrendIcon = (direction: 'up' | 'down' | 'neutral') => {
    if (direction === 'up') {
      return <ArrowTrendingUpIcon className="w-5 h-5 text-green-600" />;
    } else if (direction === 'down') {
      return <ArrowTrendingDownIcon className="w-5 h-5 text-red-600" />;
    }
    return <MinusIcon className="w-5 h-5 text-gray-400" />;
  };

  const getTrendColor = (direction: 'up' | 'down' | 'neutral') => {
    if (direction === 'up') return 'text-green-600';
    if (direction === 'down') return 'text-red-600';
    return 'text-gray-500';
  };

  const getConsistencyColor = (score: number) => {
    if (score >= 80) return 'bg-green-500';
    if (score >= 50) return 'bg-yellow-500';
    return 'bg-gray-400';
  };

  const getConsistencyLabel = (score: number) => {
    if (score >= 80) return 'Excellent';
    if (score >= 50) return 'Good';
    return 'Room to improve';
  };

  const bestDay = dayOfWeekData.length > 0 ? dayOfWeekData[0] : null;

  return (
    <div className="bg-white border border-gray-200 rounded-lg p-6">
      <h2 className="text-xl font-semibold mb-6">Completion Insights</h2>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
        {/* Completion Rate Card */}
        <div className="border border-gray-200 rounded-lg p-6">
          <div className="text-sm text-gray-500 font-medium mb-2">Average Completion Rate</div>
          <div className="flex items-end gap-3 mb-3">
            <div className="text-4xl font-bold text-gray-900">
              {formatPercentage(completionRateData.averageRate, 1)}
            </div>
            <div className={`flex items-center gap-1 mb-2 ${getTrendColor(completionRateData.trendDirection)}`}>
              {getTrendIcon(completionRateData.trendDirection)}
              {completionRateData.trendDirection !== 'neutral' && (
                <span className="text-sm font-medium">
                  {formatPercentage(Math.abs(completionRateData.trend), 1)}
                </span>
              )}
            </div>
          </div>
          {completionRateData.sparklineData.length > 1 && (
            <ResponsiveContainer width="100%" height={60}>
              <LineChart data={completionRateData.sparklineData}>
                <Line
                  type="monotone"
                  dataKey="rate"
                  stroke={CHART_COLORS.primary}
                  strokeWidth={2}
                  dot={false}
                />
              </LineChart>
            </ResponsiveContainer>
          )}
        </div>

        {/* Consistency Score Card */}
        <div className="border border-gray-200 rounded-lg p-6">
          <div className="text-sm text-gray-500 font-medium mb-2">Consistency Score</div>
          <div className="text-4xl font-bold text-gray-900 mb-3">
            {formatPercentage(consistencyScore, 0)}
          </div>
          <div className="w-full bg-gray-200 rounded-full h-3 mb-2">
            <div
              className={`${getConsistencyColor(consistencyScore)} h-3 rounded-full transition-all duration-500`}
              style={{ width: `${consistencyScore}%` }}
            />
          </div>
          <div className="text-sm text-gray-600">{getConsistencyLabel(consistencyScore)}</div>
        </div>

        {/* Best Day Summary */}
        {bestDay && (
          <div className="border border-gray-200 rounded-lg p-6">
            <div className="text-sm text-gray-500 font-medium mb-2">Best Day of Week</div>
            <div className="text-4xl font-bold text-gray-900 mb-1">{bestDay.day}</div>
            <div className="text-sm text-gray-600">
              Avg {bestDay.avgCompleted.toFixed(1)} cards completed
            </div>
            <div className="text-xs text-gray-500 mt-1">
              Based on {bestDay.totalCompletions} {bestDay.totalCompletions === 1 ? 'day' : 'days'}
            </div>
          </div>
        )}
      </div>

      {/* Day of Week Chart */}
      {dayOfWeekData.length > 0 && (
        <div>
          <h3 className="text-sm font-medium text-gray-700 mb-3">Performance by Day of Week</h3>
          <ResponsiveContainer width="100%" height={isMobile ? 250 : 300}>
            <BarChart
              data={dayOfWeekData}
              layout="horizontal"
              margin={isMobile
                ? { top: 10, right: 10, bottom: 10, left: 60 }
                : { top: 20, right: 30, bottom: 20, left: 80 }
              }
            >
              <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
              <XAxis type="number" tick={{ fontSize }} stroke="#9ca3af" />
              <YAxis
                type="category"
                dataKey="dayFull"
                tick={{ fontSize }}
                stroke="#9ca3af"
                width={isMobile ? 60 : 80}
              />
              <Tooltip
                contentStyle={{
                  backgroundColor: 'white',
                  border: '1px solid #e5e7eb',
                  borderRadius: '0.375rem',
                  fontSize: '12px',
                }}
                formatter={(value: number) => value.toFixed(1)}
              />
              <Bar
                dataKey="avgCompleted"
                fill={CHART_COLORS.primary}
                radius={[0, 4, 4, 0]}
                name="Avg Cards Completed"
              />
            </BarChart>
          </ResponsiveContainer>
        </div>
      )}
    </div>
  );
}
