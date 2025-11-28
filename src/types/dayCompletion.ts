import type { CategoryKey } from './category';

export interface DayCompletion {
  id: string; // Format: 'YYYY-MM-DD'
  completedAt: string; // ISO timestamp
  summary: DayCompletionSummary;
}

export interface DayCompletionSummary {
  totalCards: number;
  completedCards: number;
  totalTimeSpent: number; // seconds
  categoryBreakdown: CategoryBreakdown[];
  cardsList: CompletedCardInfo[];
}

export interface CategoryBreakdown {
  category: CategoryKey;
  count: number;
  timeSpent: number;
}

export interface CompletedCardInfo {
  id: string;
  title: string;
  category: CategoryKey;
  timeSpent: number;
  completedAt: string;
}

export interface UserStreak {
  currentStreak: number;
  longestStreak: number;
  lastCompletionDate: string; // YYYY-MM-DD
}
