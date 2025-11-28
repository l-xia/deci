import { useState, useCallback } from 'react';
import type { Card, CategoryKey } from '../types';
import type {
  DayCompletion,
  DayCompletionSummary,
  UserStreak,
  CategoryBreakdown,
  CompletedCardInfo,
} from '../types/dayCompletion';
import { formatDateKey, calculateStreak } from '../utils/date';

export function useDayCompletion() {
  const [dayCompletions, setDayCompletions] = useState<DayCompletion[]>([]);
  const [userStreak, setUserStreak] = useState<UserStreak>({
    currentStreak: 0,
    longestStreak: 0,
    lastCompletionDate: '',
  });

  const calculateSummary = useCallback((dailyDeck: Card[]): DayCompletionSummary => {
    const completedCards = dailyDeck.filter(c => c.completed);

    // Category breakdown
    const categoryMap = new Map<CategoryKey, CategoryBreakdown>();
    completedCards.forEach(c => {
      const cat = c.sourceCategory || 'default';
      if (!categoryMap.has(cat)) {
        categoryMap.set(cat, { category: cat, count: 0, timeSpent: 0 });
      }
      const cb = categoryMap.get(cat)!;
      cb.count++;
      cb.timeSpent += c.timeSpent || 0;
    });

    const cardsList: CompletedCardInfo[] = completedCards.map(c => ({
      id: c.id,
      title: c.title,
      category: c.sourceCategory || 'default',
      timeSpent: c.timeSpent || 0,
      completedAt: c.completedAt || new Date().toISOString(),
    }));

    return {
      totalCards: dailyDeck.length,
      completedCards: completedCards.length,
      totalTimeSpent: completedCards.reduce((sum, c) => sum + (c.timeSpent || 0), 0),
      categoryBreakdown: Array.from(categoryMap.values()),
      cardsList,
    };
  }, []);

  const completeDay = useCallback((dailyDeck: Card[]) => {
    const today = formatDateKey();
    const summary = calculateSummary(dailyDeck);

    const newCompletion: DayCompletion = {
      id: today,
      completedAt: new Date().toISOString(),
      summary,
    };

    // Update or add completion
    const existingIndex = dayCompletions.findIndex(dc => dc.id === today);
    const updatedCompletions = existingIndex >= 0
      ? dayCompletions.map((dc, i) => i === existingIndex ? newCompletion : dc)
      : [...dayCompletions, newCompletion];

    setDayCompletions(updatedCompletions);

    // Calculate streak
    const completionDates = updatedCompletions.map(c => c.id);
    const streakData = calculateStreak(completionDates);

    const newStreak: UserStreak = {
      currentStreak: streakData.current,
      longestStreak: streakData.longest,
      lastCompletionDate: today,
    };

    setUserStreak(newStreak);

    return { completion: newCompletion, streak: newStreak };
  }, [dayCompletions, calculateSummary]);

  return {
    dayCompletions,
    userStreak,
    setDayCompletions,
    setUserStreak,
    completeDay,
    calculateSummary,
  };
}
