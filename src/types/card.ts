import type { CategoryKey } from './category';

export type RecurrenceType = 'always' | 'once' | 'limited' | 'scheduled';

export interface ScheduleConfig {
  rrule: string; // RRule string (e.g., "FREQ=WEEKLY;BYDAY=MO,WE,FR" or "FREQ=DAILY")
  timezone?: string; // Optional timezone (defaults to local)
}

export interface TimerState {
  startedAt?: string;           // ISO timestamp when timer started
  pausedAt?: string;            // ISO timestamp when timer paused/stopped
  accumulatedSeconds: number;   // Total elapsed time
  isPaused: boolean;            // Current pause state
}

export interface Card {
  id: string;
  title: string;
  description?: string;
  duration?: number;
  recurrenceType?: RecurrenceType;
  scheduleConfig?: ScheduleConfig; // For 'scheduled' recurrence type
  maxUses?: number;
  timesUsed?: number;
  createdAt?: string;
  completed?: boolean;
  timeSpent?: number;
  completedAt?: string;
  sourceCategory?: CategoryKey;
  dailyNote?: string;              // Daily deck specific notes, max 500 chars
  timerState?: TimerState;         // Synced timer state across devices
}

export interface CardsByCategory {
  structure: Card[];
  upkeep: Card[];
  play: Card[];
  default: Card[];
}
