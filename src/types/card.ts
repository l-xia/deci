import type { CategoryKey } from './category';

export type RecurrenceType = 'always' | 'once' | 'limited' | 'scheduled';

export interface ScheduleConfig {
  rrule: string; // RRule string (e.g., "FREQ=WEEKLY;BYDAY=MO,WE,FR" or "FREQ=DAILY")
  timezone?: string; // Optional timezone (defaults to local)
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
}

export interface CardsByCategory {
  structure: Card[];
  upkeep: Card[];
  play: Card[];
  default: Card[];
}
