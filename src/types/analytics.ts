import type { RecurrenceType } from './card';
import type { CategoryKey } from './category';

export interface DailyTrendData {
  date: string;
  completed: number;
  total: number;
  completionRate: number;
  timeSpent: number;
}

export interface WeeklyTrendData {
  weekStart: string;
  weekEnd: string;
  weekLabel: string;
  completed: number;
  total: number;
  completionRate: number;
  timeSpent: number;
}

export interface CompletionRateData {
  averageRate: number;
  trend: number;
  trendDirection: 'up' | 'down' | 'neutral';
  sparklineData: { date: string; rate: number }[];
}

export interface DayOfWeekData {
  day: string;
  dayFull: string;
  avgCompleted: number;
  avgTime: number;
  totalCompletions: number;
}

export interface CardRankingData {
  id: string;
  title: string;
  category: CategoryKey;
  count: number;
  totalTime: number;
  avgTime: number;
}

export interface RecurrenceDistribution {
  type: RecurrenceType | 'always';
  count: number;
  percentage: number;
}

export interface HourDistribution {
  hour: number;
  formattedHour: string;
  count: number;
}

export interface TimePeriodData {
  period: 'Morning' | 'Afternoon' | 'Evening' | 'Night';
  count: number;
  percentage: number;
  hourRange: string;
}

export interface ChartDimensions {
  width: string | number;
  height: number;
  margin: { top: number; right: number; bottom: number; left: number };
}

export interface TrendData {
  change: number;
  direction: 'up' | 'down' | 'neutral';
}

export type ChartType = 'line' | 'bar' | 'pie' | 'area';
export type TimeRange = '7d' | '30d' | 'all';
