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
import type { Card } from '../../types/card';
import {
  getTopCompletedCards,
  getTopTimeConsumingCards,
  aggregateByRecurrenceType,
} from '../../utils/analytics';
import {
  formatTooltipDuration,
  truncateLabel,
  getCategoryChartColor,
  getChartDimensions,
  getChartFontSize,
} from '../../utils/chartFormatters';
import { useResponsive } from '../../hooks/useResponsive';
import { EmptyState } from './EmptyState';
import { RECURRENCE_COLORS } from '../../constants/chartColors';

interface CardAnalyticsSectionProps {
  completions: DayCompletion[];
  allCards: Card[];
}

export function CardAnalyticsSection({ completions, allCards }: CardAnalyticsSectionProps) {
  const { isMobile } = useResponsive();

  const topCompletedCards = useMemo(() => {
    return getTopCompletedCards(completions, 10);
  }, [completions]);

  const topTimeConsumingCards = useMemo(() => {
    return getTopTimeConsumingCards(completions, 10);
  }, [completions]);

  const recurrenceDistribution = useMemo(() => {
    return aggregateByRecurrenceType(completions, allCards);
  }, [completions, allCards]);

  const pieDimensions = getChartDimensions(isMobile, 'pie');
  const fontSize = getChartFontSize(isMobile);

  if (completions.length === 0) {
    return (
      <div className="bg-white border border-gray-200 rounded-lg p-6">
        <h2 className="text-xl font-semibold mb-4">Card-Level Analytics</h2>
        <EmptyState
          title="No data available"
          description="Complete some cards to see detailed card-level analytics."
        />
      </div>
    );
  }

  const getRecurrenceLabel = (type: string) => {
    const labels: Record<string, string> = {
      always: 'Always Available',
      once: 'One-Time',
      limited: 'Limited Uses',
      scheduled: 'Scheduled',
    };
    return labels[type] || type;
  };

  return (
    <div className="bg-white border border-gray-200 rounded-lg p-6">
      <h2 className="text-xl font-semibold mb-6">Card-Level Analytics</h2>

      <div className="space-y-8">
        {/* Top Completed Cards */}
        {topCompletedCards.length > 0 && (
          <div>
            <h3 className="text-sm font-medium text-gray-700 mb-3">Most Completed Cards</h3>
            <ResponsiveContainer width="100%" height={Math.max(200, topCompletedCards.length * 40)}>
              <BarChart
                data={topCompletedCards}
                layout="vertical"
                margin={isMobile
                  ? { top: 10, right: 30, bottom: 10, left: 10 }
                  : { top: 20, right: 50, bottom: 20, left: 20 }
                }
              >
                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                <XAxis type="number" tick={{ fontSize }} stroke="#9ca3af" />
                <YAxis
                  type="category"
                  dataKey="title"
                  tick={{ fontSize: fontSize - 1 }}
                  stroke="#9ca3af"
                  width={isMobile ? 100 : 150}
                  tickFormatter={(value) => truncateLabel(value, isMobile ? 15 : 25)}
                />
                <Tooltip
                  contentStyle={{
                    backgroundColor: 'white',
                    border: '1px solid #e5e7eb',
                    borderRadius: '0.375rem',
                    fontSize: '12px',
                  }}
                  formatter={(value: number, name: string) => {
                    if (name === 'Completions') {
                      return [value, name];
                    }
                    return [value, name];
                  }}
                  labelFormatter={(label) => label}
                />
                <Bar
                  dataKey="count"
                  name="Completions"
                  radius={[0, 4, 4, 0]}
                >
                  {topCompletedCards.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={getCategoryChartColor(entry.category)} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        )}

        {/* Top Time-Consuming Cards */}
        {topTimeConsumingCards.length > 0 && (
          <div>
            <h3 className="text-sm font-medium text-gray-700 mb-3">Most Time-Consuming Cards</h3>
            <ResponsiveContainer width="100%" height={Math.max(200, topTimeConsumingCards.length * 40)}>
              <BarChart
                data={topTimeConsumingCards}
                layout="vertical"
                margin={isMobile
                  ? { top: 10, right: 30, bottom: 10, left: 10 }
                  : { top: 20, right: 50, bottom: 20, left: 20 }
                }
              >
                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                <XAxis
                  type="number"
                  tick={{ fontSize }}
                  stroke="#9ca3af"
                  tickFormatter={(value) => `${Math.floor(value / 60)}m`}
                />
                <YAxis
                  type="category"
                  dataKey="title"
                  tick={{ fontSize: fontSize - 1 }}
                  stroke="#9ca3af"
                  width={isMobile ? 100 : 150}
                  tickFormatter={(value) => truncateLabel(value, isMobile ? 15 : 25)}
                />
                <Tooltip
                  contentStyle={{
                    backgroundColor: 'white',
                    border: '1px solid #e5e7eb',
                    borderRadius: '0.375rem',
                    fontSize: '12px',
                  }}
                  formatter={(value: number, name: string) => {
                    if (name === 'Total Time' || name === 'Avg Time') {
                      return [formatTooltipDuration(value), name];
                    }
                    return [value, name];
                  }}
                  labelFormatter={(label) => label}
                  content={({ active, payload }) => {
                    if (active && payload && payload.length > 0) {
                      const data = payload[0].payload;
                      return (
                        <div className="bg-white border border-gray-200 rounded-md p-3 shadow-lg">
                          <p className="font-medium text-gray-900 mb-2">{data.title}</p>
                          <div className="space-y-1 text-xs">
                            <p className="text-gray-600">
                              <span className="font-medium">Total Time:</span> {formatTooltipDuration(data.totalTime)}
                            </p>
                            <p className="text-gray-600">
                              <span className="font-medium">Avg Time:</span> {formatTooltipDuration(data.avgTime)}
                            </p>
                            <p className="text-gray-600">
                              <span className="font-medium">Completions:</span> {data.count}
                            </p>
                          </div>
                        </div>
                      );
                    }
                    return null;
                  }}
                />
                <Bar
                  dataKey="totalTime"
                  name="Total Time"
                  radius={[0, 4, 4, 0]}
                >
                  {topTimeConsumingCards.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={getCategoryChartColor(entry.category)} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        )}

        {/* Recurrence Type Distribution */}
        {recurrenceDistribution.length > 0 && (
          <div>
            <h3 className="text-sm font-medium text-gray-700 mb-3">Cards by Recurrence Type</h3>
            <div className="flex flex-col lg:flex-row items-center justify-center gap-8">
              <ResponsiveContainer width="100%" height={pieDimensions.height}>
                <PieChart>
                  <Pie
                    data={recurrenceDistribution}
                    dataKey="count"
                    nameKey="type"
                    cx="50%"
                    cy="50%"
                    innerRadius={isMobile ? 50 : 70}
                    outerRadius={isMobile ? 80 : 100}
                    paddingAngle={2}
                    label={({ percent }: { percent?: number }) => `${(percent || 0).toFixed(0)}%`}
                    labelLine={false}
                  >
                    {recurrenceDistribution.map((entry, index) => (
                      <Cell
                        key={`cell-${index}`}
                        fill={RECURRENCE_COLORS[entry.type] || RECURRENCE_COLORS.always}
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
                    formatter={(value: number, _name: string, props: { payload?: { type: string } }) => {
                      const type = props.payload?.type ?? '';
                      return [value, getRecurrenceLabel(type)];
                    }}
                  />
                  <Legend
                    formatter={(value) => getRecurrenceLabel(value)}
                    wrapperStyle={{ fontSize }}
                  />
                </PieChart>
              </ResponsiveContainer>
              <div className="text-center lg:text-left">
                <div className="text-sm text-gray-500 mb-2">Total Cards Completed</div>
                <div className="text-4xl font-bold text-gray-900">
                  {recurrenceDistribution.reduce((sum, r) => sum + r.count, 0)}
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
