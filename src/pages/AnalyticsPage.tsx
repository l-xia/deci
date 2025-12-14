import { useState, useMemo } from 'react';
import { Link } from '@tanstack/react-router';
import { ArrowLeftIcon, FireIcon } from '@heroicons/react/24/outline';
import { useCardsContext, useDayCompletionContext } from '../context';
import type { CategoryKey } from '../types';
import { getCategoryColors } from '../utils/categories';
import { formatDuration, formatDate, getDateRange } from '../utils/date';
import { TimeTrendsSection } from '../components/Analytics/TimeTrendsSection';
import { CompletionInsightsSection } from '../components/Analytics/CompletionInsightsSection';
import { CardAnalyticsSection } from '../components/Analytics/CardAnalyticsSection';
import { TimeOfDaySection } from '../components/Analytics/TimeOfDaySection';

export default function AnalyticsPage() {
  const cards = useCardsContext();
  const dayCompletion = useDayCompletionContext();
  const [timeRange, setTimeRange] = useState<'7d' | '30d' | 'all'>('30d');

  // Flatten all cards from all categories
  const allCards = useMemo(() => {
    return Object.values(cards.cards).flat();
  }, [cards.cards]);

  // Filter completions by time range
  const filteredCompletions = useMemo(() => {
    const range = getDateRange(timeRange);
    if (!range) return dayCompletion.dayCompletions;

    return dayCompletion.dayCompletions.filter((completion) => {
      const completionDate = new Date(completion.completedAt);
      return completionDate >= range.start && completionDate <= range.end;
    });
  }, [dayCompletion.dayCompletions, timeRange]);

  // Calculate aggregate stats
  const stats = useMemo(() => {
    const totalDays = filteredCompletions.length;
    const totalCards = filteredCompletions.reduce(
      (sum, c) => sum + c.summary.completedCards,
      0
    );
    const totalTime = filteredCompletions.reduce(
      (sum, c) => sum + c.summary.totalTimeSpent,
      0
    );
    const avgCardsPerDay =
      totalDays > 0 ? (totalCards / totalDays).toFixed(1) : '0';

    // Category aggregation
    const categoryMap = new Map<CategoryKey, { count: number; time: number }>();
    filteredCompletions.forEach((completion) => {
      completion.summary.categoryBreakdown.forEach((cb) => {
        const existing = categoryMap.get(cb.category) || { count: 0, time: 0 };
        categoryMap.set(cb.category, {
          count: existing.count + cb.count,
          time: existing.time + cb.timeSpent,
        });
      });
    });

    return {
      totalDays,
      totalCards,
      totalTime,
      avgCardsPerDay,
      categoryTotals: categoryMap,
    };
  }, [filteredCompletions]);

  // Sort recent completions by date
  const recentCompletions = useMemo(() => {
    return [...filteredCompletions]
      .sort(
        (a, b) =>
          new Date(b.completedAt).getTime() - new Date(a.completedAt).getTime()
      )
      .slice(0, 10);
  }, [filteredCompletions]);

  return (
    <div className="h-screen overflow-hidden bg-gray-50 flex flex-col">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 flex-shrink-0">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex items-center gap-4 mb-4">
            <Link
              to="/"
              className="p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-md transition-colors"
            >
              <ArrowLeftIcon className="w-5 h-5" />
            </Link>
            <h1 className="text-3xl font-bold text-gray-900">Analytics</h1>
          </div>

          {/* Time Range Filters */}
          <div className="flex gap-2">
            <button
              onClick={() => setTimeRange('7d')}
              className={`px-4 py-2 text-sm font-medium rounded-md transition-colors ${
                timeRange === '7d'
                  ? 'bg-blue-500 text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              Last 7 Days
            </button>
            <button
              onClick={() => setTimeRange('30d')}
              className={`px-4 py-2 text-sm font-medium rounded-md transition-colors ${
                timeRange === '30d'
                  ? 'bg-blue-500 text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              Last 30 Days
            </button>
            <button
              onClick={() => setTimeRange('all')}
              className={`px-4 py-2 text-sm font-medium rounded-md transition-colors ${
                timeRange === 'all'
                  ? 'bg-blue-500 text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              All Time
            </button>
          </div>
        </div>
      </div>

      {/* Content */}
      <div
        className="flex-1 overflow-y-auto overscroll-contain"
        style={{ WebkitOverflowScrolling: 'touch' }}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {filteredCompletions.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-gray-500 text-lg">
                No data for this time period
              </p>
              <p className="text-gray-400 text-sm mt-2">
                Complete your first day to see analytics!
              </p>
            </div>
          ) : (
            <div className="space-y-6">
              {/* Streak Card */}
              <div className="bg-gradient-to-r from-orange-50 to-red-50 border border-orange-200 rounded-lg p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <FireIcon className="w-8 h-8 text-orange-500" />
                      <span className="text-4xl font-bold text-gray-900">
                        {dayCompletion.userStreak.currentStreak}
                      </span>
                      <span className="text-xl text-gray-600">day streak</span>
                    </div>
                    <p className="text-sm text-gray-600">Keep it going!</p>
                  </div>
                  {dayCompletion.userStreak.longestStreak >
                    dayCompletion.userStreak.currentStreak && (
                    <div className="text-right">
                      <div className="text-sm text-gray-500">
                        Longest streak
                      </div>
                      <div className="text-3xl font-semibold text-gray-700">
                        {dayCompletion.userStreak.longestStreak} days
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {/* Summary Stats Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                <div className="bg-white border border-gray-200 rounded-lg p-6">
                  <div className="text-sm text-gray-500 font-medium mb-1">
                    Days Completed
                  </div>
                  <div className="text-3xl font-bold text-gray-900">
                    {stats.totalDays}
                  </div>
                </div>
                <div className="bg-white border border-gray-200 rounded-lg p-6">
                  <div className="text-sm text-gray-500 font-medium mb-1">
                    Total Cards Completed
                  </div>
                  <div className="text-3xl font-bold text-gray-900">
                    {stats.totalCards}
                  </div>
                </div>
                <div className="bg-white border border-gray-200 rounded-lg p-6">
                  <div className="text-sm text-gray-500 font-medium mb-1">
                    Total Time Spent
                  </div>
                  <div className="text-3xl font-bold text-gray-900">
                    {formatDuration(stats.totalTime)}
                  </div>
                </div>
                <div className="bg-white border border-gray-200 rounded-lg p-6">
                  <div className="text-sm text-gray-500 font-medium mb-1">
                    Avg Cards/Day
                  </div>
                  <div className="text-3xl font-bold text-gray-900">
                    {stats.avgCardsPerDay}
                  </div>
                </div>
              </div>

              {/* Time Trends Section */}
              <TimeTrendsSection
                completions={filteredCompletions}
                timeRange={timeRange}
              />

              {/* Completion Insights Section */}
              <CompletionInsightsSection
                completions={filteredCompletions}
                timeRange={timeRange}
              />

              {/* Card-Level Analytics Section */}
              <CardAnalyticsSection
                completions={filteredCompletions}
                allCards={allCards}
              />

              {/* Time-of-Day Patterns Section */}
              <TimeOfDaySection completions={filteredCompletions} />

              {/* Category Breakdown */}
              {stats.categoryTotals.size > 0 && (
                <div className="bg-white border border-gray-200 rounded-lg p-6">
                  <h2 className="text-xl font-semibold text-gray-900 mb-4">
                    Category Breakdown
                  </h2>
                  <div className="space-y-4">
                    {Array.from(stats.categoryTotals.entries())
                      .sort((a, b) => b[1].count - a[1].count)
                      .map(([category, data]) => {
                        const colors = getCategoryColors(category);
                        const maxCount = Math.max(
                          ...Array.from(stats.categoryTotals.values()).map(
                            (v) => v.count
                          )
                        );
                        const percentage = (data.count / maxCount) * 100;

                        return (
                          <div key={category}>
                            <div className="flex items-center justify-between mb-2">
                              <div className="flex items-center gap-3">
                                <div
                                  className={`w-3 h-3 rounded-full ${colors.bg}`}
                                ></div>
                                <span className="font-medium text-gray-700 capitalize">
                                  {category}
                                </span>
                              </div>
                              <div className="flex items-center gap-4 text-sm text-gray-600">
                                <span>{data.count} tasks</span>
                                <span className="text-gray-400">•</span>
                                <span>{formatDuration(data.time)}</span>
                              </div>
                            </div>
                            <div className="w-full bg-gray-200 rounded-full h-2">
                              <div
                                className={`${colors.bg} h-2 rounded-full transition-all`}
                                style={{ width: `${percentage}%` }}
                              />
                            </div>
                          </div>
                        );
                      })}
                  </div>
                </div>
              )}

              {/* Recent Completions */}
              {recentCompletions.length > 0 && (
                <div className="bg-white border border-gray-200 rounded-lg p-6">
                  <h2 className="text-xl font-semibold text-gray-900 mb-4">
                    Recent Completions
                  </h2>
                  <div className="space-y-3">
                    {recentCompletions.map((completion) => (
                      <div
                        key={completion.id}
                        className="flex items-center justify-between p-4 bg-gray-50 rounded-md hover:bg-gray-100 transition-colors"
                      >
                        <div>
                          <div className="font-medium text-gray-900">
                            {formatDate(completion.completedAt)}
                          </div>
                          <div className="text-sm text-gray-600 mt-1">
                            {completion.summary.completedCards} of{' '}
                            {completion.summary.totalCards} cards completed
                          </div>
                        </div>
                        <div className="text-right">
                          <div className="text-sm text-gray-500">
                            Total time
                          </div>
                          <div className="font-semibold text-gray-900">
                            {formatDuration(completion.summary.totalTimeSpent)}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
