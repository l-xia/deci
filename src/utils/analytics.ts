import {
  parseISO,
  format,
  startOfWeek,
  endOfWeek,
  eachDayOfInterval,
  getDay,
  getHours,
  differenceInDays,
} from 'date-fns';
import type { DayCompletion } from '../types/dayCompletion';
import type { Card, RecurrenceType } from '../types/card';
import type { CategoryKey } from '../types/category';
import type {
  DailyTrendData,
  WeeklyTrendData,
  CompletionRateData,
  DayOfWeekData,
  CardRankingData,
  RecurrenceDistribution,
  HourDistribution,
  TimePeriodData,
  TrendData,
  TimeRange,
} from '../types/analytics';
import { formatWeekLabel } from './chartFormatters';

/**
 * Aggregate completions by day with trends
 */
export function aggregateDailyTrends(
  completions: DayCompletion[]
): DailyTrendData[] {
  if (completions.length === 0) return [];

  return completions
    .map((completion) => {
      const { totalCards, completedCards, totalTimeSpent } = completion.summary;
      return {
        date: completion.id, // Already in YYYY-MM-DD format
        completed: completedCards,
        total: totalCards,
        completionRate:
          totalCards > 0 ? (completedCards / totalCards) * 100 : 0,
        timeSpent: totalTimeSpent,
      };
    })
    .sort((a, b) => a.date.localeCompare(b.date));
}

/**
 * Aggregate completions by week
 */
export function aggregateWeeklyTrends(
  completions: DayCompletion[]
): WeeklyTrendData[] {
  if (completions.length === 0) return [];

  // Group completions by week
  const weekMap = new Map<string, DayCompletion[]>();

  completions.forEach((completion) => {
    const date = parseISO(completion.id);
    const weekStart = startOfWeek(date, { weekStartsOn: 0 }); // Sunday
    const weekKey = format(weekStart, 'yyyy-MM-dd');

    if (!weekMap.has(weekKey)) {
      weekMap.set(weekKey, []);
    }
    weekMap.get(weekKey)!.push(completion);
  });

  // Aggregate each week
  const weeklyData: WeeklyTrendData[] = [];

  weekMap.forEach((weekCompletions, weekStartStr) => {
    const weekStart = parseISO(weekStartStr);
    const weekEnd = endOfWeek(weekStart, { weekStartsOn: 0 });

    const totalCards = weekCompletions.reduce(
      (sum, c) => sum + c.summary.totalCards,
      0
    );
    const completedCards = weekCompletions.reduce(
      (sum, c) => sum + c.summary.completedCards,
      0
    );
    const totalTimeSpent = weekCompletions.reduce(
      (sum, c) => sum + c.summary.totalTimeSpent,
      0
    );

    weeklyData.push({
      weekStart: format(weekStart, 'yyyy-MM-dd'),
      weekEnd: format(weekEnd, 'yyyy-MM-dd'),
      weekLabel: formatWeekLabel(format(weekStart, 'yyyy-MM-dd')),
      completed: completedCards,
      total: totalCards,
      completionRate: totalCards > 0 ? (completedCards / totalCards) * 100 : 0,
      timeSpent: totalTimeSpent,
    });
  });

  return weeklyData.sort((a, b) => a.weekStart.localeCompare(b.weekStart));
}

/**
 * Calculate completion rate for a time period
 */
export function calculateCompletionRate(
  completions: DayCompletion[]
): CompletionRateData {
  if (completions.length === 0) {
    return {
      averageRate: 0,
      trend: 0,
      trendDirection: 'neutral',
      sparklineData: [],
    };
  }

  // Calculate average completion rate
  const rates = completions.map((c) => {
    const { totalCards, completedCards } = c.summary;
    return totalCards > 0 ? (completedCards / totalCards) * 100 : 0;
  });

  const averageRate = rates.reduce((sum, rate) => sum + rate, 0) / rates.length;

  // Calculate trend (compare first half vs second half)
  const midpoint = Math.floor(completions.length / 2);
  if (midpoint === 0) {
    return {
      averageRate,
      trend: 0,
      trendDirection: 'neutral',
      sparklineData: completions.map((c) => ({
        date: c.id,
        rate:
          c.summary.totalCards > 0
            ? (c.summary.completedCards / c.summary.totalCards) * 100
            : 0,
      })),
    };
  }

  const firstHalf = rates.slice(0, midpoint);
  const secondHalf = rates.slice(midpoint);

  const firstAvg = firstHalf.reduce((sum, r) => sum + r, 0) / firstHalf.length;
  const secondAvg =
    secondHalf.reduce((sum, r) => sum + r, 0) / secondHalf.length;

  const trend = secondAvg - firstAvg;
  const trendDirection = trend > 0.5 ? 'up' : trend < -0.5 ? 'down' : 'neutral';

  return {
    averageRate,
    trend,
    trendDirection,
    sparklineData: completions.map((c) => ({
      date: c.id,
      rate:
        c.summary.totalCards > 0
          ? (c.summary.completedCards / c.summary.totalCards) * 100
          : 0,
    })),
  };
}

/**
 * Aggregate completions by day of week
 */
export function aggregateByDayOfWeek(
  completions: DayCompletion[]
): DayOfWeekData[] {
  if (completions.length === 0) return [];

  const dayNames = [
    'Sunday',
    'Monday',
    'Tuesday',
    'Wednesday',
    'Thursday',
    'Friday',
    'Saturday',
  ];
  const dayShortNames = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

  // Initialize counters for each day
  const dayData = Array.from({ length: 7 }, (_, i) => ({
    dayIndex: i,
    day: dayShortNames[i]!,
    dayFull: dayNames[i]!,
    totalCompleted: 0,
    totalTime: 0,
    count: 0,
  }));

  // Aggregate data
  completions.forEach((completion) => {
    const date = parseISO(completion.id);
    const dayIndex = getDay(date);
    const dayEntry = dayData[dayIndex];

    if (dayEntry) {
      dayEntry.totalCompleted += completion.summary.completedCards;
      dayEntry.totalTime += completion.summary.totalTimeSpent;
      dayEntry.count += 1;
    }
  });

  // Calculate averages and format
  return dayData
    .map((d) => ({
      day: d.day,
      dayFull: d.dayFull,
      avgCompleted: d.count > 0 ? d.totalCompleted / d.count : 0,
      avgTime: d.count > 0 ? d.totalTime / d.count : 0,
      totalCompletions: d.count,
    }))
    .filter((d) => d.totalCompletions > 0) // Only show days with data
    .sort((a, b) => b.avgCompleted - a.avgCompleted); // Sort by avg completed
}

/**
 * Calculate consistency score
 */
export function calculateConsistencyScore(
  completions: DayCompletion[],
  timeRange: TimeRange
): number {
  if (completions.length === 0) return 0;

  // Determine total days in range
  let totalDays: number;
  if (timeRange === '7d') {
    totalDays = 7;
  } else if (timeRange === '30d') {
    totalDays = 30;
  } else {
    // For 'all', calculate from first to last completion
    const dates = completions
      .map((c) => parseISO(c.id))
      .sort((a, b) => a.getTime() - b.getTime());
    if (dates.length < 2) return 100;
    const firstDate = dates[0];
    const lastDate = dates[dates.length - 1];
    if (!firstDate || !lastDate) return 100;
    totalDays = differenceInDays(lastDate, firstDate) + 1;
  }

  const completedDays = completions.length;
  return Math.min(100, (completedDays / totalDays) * 100);
}

/**
 * Shared helper to aggregate card data from completions
 */
function aggregateCards(completions: DayCompletion[]): CardRankingData[] {
  const cardMap = new Map<
    string,
    {
      title: string;
      category: string;
      count: number;
      totalTime: number;
    }
  >();

  completions.forEach((completion) => {
    completion.summary.cardsList.forEach((card) => {
      const existing = cardMap.get(card.id);
      if (existing) {
        existing.count += 1;
        existing.totalTime += card.timeSpent || 0;
      } else {
        cardMap.set(card.id, {
          title: card.title,
          category: card.category,
          count: 1,
          totalTime: card.timeSpent || 0,
        });
      }
    });
  });

  return Array.from(cardMap.entries()).map(([id, data]) => ({
    id,
    title: data.title,
    category: data.category as CategoryKey,
    count: data.count,
    totalTime: data.totalTime,
    avgTime: data.count > 0 ? data.totalTime / data.count : 0,
  }));
}

/**
 * Get top N most completed cards
 */
export function getTopCompletedCards(
  completions: DayCompletion[],
  limit: number = 10
): CardRankingData[] {
  return aggregateCards(completions)
    .sort((a, b) => b.count - a.count)
    .slice(0, limit);
}

/**
 * Get top N most time-consuming cards
 */
export function getTopTimeConsumingCards(
  completions: DayCompletion[],
  limit: number = 10
): CardRankingData[] {
  return aggregateCards(completions)
    .sort((a, b) => b.totalTime - a.totalTime)
    .slice(0, limit);
}

/**
 * Aggregate completions by recurrence type
 */
export function aggregateByRecurrenceType(
  completions: DayCompletion[],
  allCards: Card[]
): RecurrenceDistribution[] {
  // Create card lookup
  const cardLookup = new Map(allCards.map((c) => [c.id, c]));

  const typeMap = new Map<string, number>();

  // Count cards by recurrence type
  completions.forEach((completion) => {
    completion.summary.cardsList.forEach((completedCard) => {
      const card = cardLookup.get(completedCard.id);
      const type = card?.recurrenceType || 'always';

      typeMap.set(type, (typeMap.get(type) || 0) + 1);
    });
  });

  const totalCount = Array.from(typeMap.values()).reduce(
    (sum, count) => sum + count,
    0
  );

  return Array.from(typeMap.entries()).map(([type, count]) => ({
    type: type as RecurrenceType | 'always',
    count,
    percentage: totalCount > 0 ? (count / totalCount) * 100 : 0,
  }));
}

/**
 * Aggregate completions by hour of day
 */
export function aggregateByHourOfDay(
  completions: DayCompletion[]
): HourDistribution[] {
  const hourMap = new Map<number, number>();

  // Count completions by hour
  completions.forEach((completion) => {
    completion.summary.cardsList.forEach((card) => {
      if (card.completedAt) {
        const hour = getHours(parseISO(card.completedAt));
        hourMap.set(hour, (hourMap.get(hour) || 0) + 1);
      }
    });
  });

  // Create array for all hours (0-23)
  return Array.from({ length: 24 }, (_, hour) => {
    const count = hourMap.get(hour) || 0;
    return {
      hour,
      formattedHour: formatHour(hour),
      count,
    };
  });
}

function formatHour(hour: number): string {
  if (hour === 0) return '12 AM';
  if (hour === 12) return '12 PM';
  if (hour < 12) return `${hour} AM`;
  return `${hour - 12} PM`;
}

/**
 * Aggregate completions by time period
 */
export function aggregateByTimePeriod(
  completions: DayCompletion[]
): TimePeriodData[] {
  const periods = {
    Morning: { count: 0, range: '6 AM - 12 PM', start: 6, end: 12 },
    Afternoon: { count: 0, range: '12 PM - 6 PM', start: 12, end: 18 },
    Evening: { count: 0, range: '6 PM - 10 PM', start: 18, end: 22 },
    Night: { count: 0, range: '10 PM - 6 AM', start: 22, end: 6 },
  };

  // Count completions by period
  completions.forEach((completion) => {
    completion.summary.cardsList.forEach((card) => {
      if (card.completedAt) {
        const hour = getHours(parseISO(card.completedAt));

        if (hour >= 6 && hour < 12) {
          periods.Morning.count++;
        } else if (hour >= 12 && hour < 18) {
          periods.Afternoon.count++;
        } else if (hour >= 18 && hour < 22) {
          periods.Evening.count++;
        } else {
          periods.Night.count++;
        }
      }
    });
  });

  const totalCount = Object.values(periods).reduce(
    (sum, p) => sum + p.count,
    0
  );

  return Object.entries(periods).map(([period, data]) => ({
    period: period as TimePeriodData['period'],
    count: data.count,
    percentage: totalCount > 0 ? (data.count / totalCount) * 100 : 0,
    hourRange: data.range,
  }));
}

/**
 * Calculate trend direction and percentage change
 */
export function calculateTrend(current: number, previous: number): TrendData {
  if (previous === 0) {
    return { change: 0, direction: 'neutral' };
  }

  const change = ((current - previous) / previous) * 100;
  const direction = change > 0.5 ? 'up' : change < -0.5 ? 'down' : 'neutral';

  return { change, direction };
}

/**
 * Fill missing dates in a date range with zero values
 */
export function fillMissingDates(
  data: DailyTrendData[],
  startDate: Date,
  endDate: Date
): DailyTrendData[] {
  if (data.length === 0) return [];

  const dateRange = eachDayOfInterval({ start: startDate, end: endDate });
  const dataMap = new Map(data.map((d) => [d.date, d]));

  return dateRange.map((date) => {
    const dateKey = format(date, 'yyyy-MM-dd');
    const existing = dataMap.get(dateKey);
    if (existing) return existing;

    return {
      date: dateKey,
      completed: 0,
      total: 0,
      completionRate: 0,
      timeSpent: 0,
    };
  });
}
