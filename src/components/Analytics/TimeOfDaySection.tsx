import { useMemo } from 'react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Legend,
} from 'recharts';
import type { DayCompletion } from '../../types/dayCompletion';
import { aggregateByHourOfDay, aggregateByTimePeriod } from '../../utils/analytics';
import { getChartDimensions, getChartFontSize } from '../../utils/chartFormatters';
import { useResponsive } from '../../hooks/useResponsive';
import { EmptyState } from './EmptyState';
import { CHART_COLORS, TIME_PERIOD_COLORS } from '../../constants/chartColors';

interface TimeOfDaySectionProps {
  completions: DayCompletion[];
}

export function TimeOfDaySection({ completions }: TimeOfDaySectionProps) {
  const { isMobile } = useResponsive();

  const hourDistribution = useMemo(() => {
    return aggregateByHourOfDay(completions);
  }, [completions]);

  const timePeriodData = useMemo(() => {
    return aggregateByTimePeriod(completions);
  }, [completions]);

  const chartDimensions = getChartDimensions(isMobile, 'bar');
  const pieDimensions = getChartDimensions(isMobile, 'pie');
  const fontSize = getChartFontSize(isMobile);

  const hasData = hourDistribution.some((h) => h.count > 0);

  if (!hasData) {
    return (
      <div className="bg-white border border-gray-200 rounded-lg p-6">
        <h2 className="text-xl font-semibold mb-4">Time-of-Day Patterns</h2>
        <EmptyState
          title="No time data available"
          description="Complete some cards with timestamps to see when you're most productive."
        />
      </div>
    );
  }

  const peakHour = hourDistribution.length > 0
    ? hourDistribution.reduce((max, current) =>
        current.count > max.count ? current : max
      )
    : null;

  return (
    <div className="bg-white border border-gray-200 rounded-lg p-6">
      <h2 className="text-xl font-semibold mb-6">Time-of-Day Patterns</h2>

      <div className="space-y-8">
        {/* Hour of Day Distribution */}
        <div>
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-sm font-medium text-gray-700">Completions by Hour</h3>
            {peakHour && peakHour.count > 0 && (
              <div className="text-sm text-gray-600">
                Peak: <span className="font-semibold text-purple-600">{peakHour.formattedHour}</span>
              </div>
            )}
          </div>
          <ResponsiveContainer width="100%" height={chartDimensions.height}>
            <BarChart
              data={hourDistribution}
              margin={chartDimensions.margin}
            >
              <defs>
                <linearGradient id="hourGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor={CHART_COLORS.purple} stopOpacity={0.8} />
                  <stop offset="95%" stopColor={CHART_COLORS.purple} stopOpacity={0.3} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
              <XAxis
                dataKey="hour"
                tick={{ fontSize: fontSize - 1 }}
                stroke="#9ca3af"
                interval={isMobile ? 2 : 1}
                tickFormatter={(hour) => {
                  if (hour === 0) return '12a';
                  if (hour === 12) return '12p';
                  if (hour < 12) return `${hour}a`;
                  return `${hour - 12}p`;
                }}
              />
              <YAxis
                tick={{ fontSize }}
                stroke="#9ca3af"
                label={{
                  value: 'Completions',
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
                formatter={(value: number) => [value, 'Completions']}
                labelFormatter={(label: number) => {
                  const data = hourDistribution.find((h) => h.hour === label);
                  return data ? data.formattedHour : label;
                }}
              />
              <Bar
                dataKey="count"
                fill="url(#hourGradient)"
                radius={[4, 4, 0, 0]}
                name="Completions"
              >
                {hourDistribution.map((entry, index) => (
                  <Cell
                    key={`cell-${index}`}
                    fill={peakHour && entry.hour === peakHour.hour ? CHART_COLORS.purple : 'url(#hourGradient)'}
                    opacity={peakHour && entry.hour === peakHour.hour ? 1 : 0.7}
                  />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Time Period Breakdown */}
        {timePeriodData.some((p) => p.count > 0) && (
          <div>
            <h3 className="text-sm font-medium text-gray-700 mb-3">Completions by Time of Day</h3>
            <div className="flex flex-col lg:flex-row items-center justify-center gap-8">
              <ResponsiveContainer width="100%" height={pieDimensions.height}>
                <PieChart>
                  <Pie
                    data={timePeriodData.filter((p) => p.count > 0)}
                    dataKey="count"
                    nameKey="period"
                    cx="50%"
                    cy="50%"
                    outerRadius={isMobile ? 80 : 100}
                    paddingAngle={3}
                    label={({ period, percent }: { period?: string; percent?: number }) => {
                      if ((percent || 0) < 5) return ''; // Hide small labels
                      return `${(period || '').slice(0, 3)} ${(percent || 0).toFixed(0)}%`;
                    }}
                    labelLine={false}
                  >
                    {timePeriodData.map((entry, index) => (
                      <Cell
                        key={`cell-${index}`}
                        fill={TIME_PERIOD_COLORS[entry.period]}
                      />
                    ))}
                  </Pie>
                  <Tooltip
                    contentStyle={{
                      backgroundColor: 'white',
                      border: '1px solid #e5e7eb',
                      borderRadius: '0.375rem',
                      fontSize: '12px',
                    }}
                    formatter={(value: number, _name: string, props: { payload?: { percentage: number; period: string; hourRange: string } }) => {
                      const period = props.payload;
                      if (!period) return [value, ''];
                      return [
                        `${value} completions (${period.percentage.toFixed(1)}%)`,
                        `${period.period} (${period.hourRange})`,
                      ];
                    }}
                  />
                  <Legend
                    wrapperStyle={{ fontSize }}
                    formatter={(_value, entry) => {
                      const period = entry.payload as { period: string; hourRange: string } | undefined;
                      if (!period) return '';
                      return `${period.period} (${period.hourRange})`;
                    }}
                  />
                </PieChart>
              </ResponsiveContainer>

              {/* Summary Stats */}
              <div className="grid grid-cols-2 gap-4 lg:block lg:space-y-4">
                {timePeriodData
                  .filter((p) => p.count > 0)
                  .sort((a, b) => b.count - a.count)
                  .map((period) => (
                    <div
                      key={period.period}
                      className="flex items-center gap-3 p-3 bg-gray-50 rounded-md"
                    >
                      <div
                        className="w-3 h-3 rounded-full flex-shrink-0"
                        style={{ backgroundColor: TIME_PERIOD_COLORS[period.period] }}
                      />
                      <div>
                        <div className="text-sm font-semibold text-gray-900">
                          {period.count}
                        </div>
                        <div className="text-xs text-gray-600">{period.period}</div>
                      </div>
                    </div>
                  ))}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
