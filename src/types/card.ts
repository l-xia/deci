import type { CategoryKey } from './category';

/**
 * Defines how often a card can be added to the daily deck
 * - always: Can be added unlimited times (e.g., "Read")
 * - once: Can only be added once per day (e.g., "Take out trash")
 * - limited: Can be added a specific number of times (e.g., "Walk dog 3x")
 * - scheduled: Only available on specific days based on RRule (e.g., "Team meeting every Monday")
 */
export type RecurrenceType = 'always' | 'once' | 'limited' | 'scheduled';

/**
 * Configuration for scheduled recurrence using RRule standard
 * @see https://github.com/jakubroztocil/rrule for RRule format details
 */
export interface ScheduleConfig {
  /** RRule string defining when the card is available (e.g., "FREQ=WEEKLY;BYDAY=MO,WE,FR" or "FREQ=DAILY") */
  rrule: string;
  /** Optional timezone (defaults to local timezone if not specified) */
  timezone?: string;
}

/**
 * Tracks the state of an active timer for a card
 * Synced across devices via Firebase for seamless timer continuity
 */
export interface TimerState {
  /** ISO timestamp when timer was started (undefined if never started) */
  startedAt?: string | undefined;
  /** ISO timestamp when timer was paused/stopped (undefined if currently running) */
  pausedAt?: string | undefined;
  /** Total elapsed time in seconds (accumulated across start/stop cycles) */
  accumulatedSeconds: number;
  /** Whether the timer is currently paused */
  isPaused: boolean;
}

/**
 * Represents a task or activity card
 * Cards can be template cards (in category stacks) or daily deck cards (active for today)
 */
export interface Card {
  /** Unique identifier (UUID) */
  id: string;
  /** Card title (1-100 characters) */
  title: string;
  /** Optional description providing additional context (max 1000 characters) */
  description?: string;
  /** Suggested duration in minutes for completing this task (1-480 minutes) */
  duration?: number;
  /** How often this card can recur in the daily deck */
  recurrenceType?: RecurrenceType;
  /** Schedule configuration (required when recurrenceType is 'scheduled') */
  scheduleConfig?: ScheduleConfig;
  /** Maximum number of times this card can be added per day (required when recurrenceType is 'limited') */
  maxUses?: number;
  /** Number of times this card has been used today (for limited recurrence tracking) */
  timesUsed?: number;
  /** ISO timestamp when the card template was created */
  createdAt?: string;
  /** Whether this card instance is marked as complete (daily deck only) */
  completed?: boolean;
  /** Actual time spent on this card in minutes (daily deck only) */
  timeSpent?: number;
  /** ISO timestamp when the card was completed (daily deck only) */
  completedAt?: string;
  /** Original category this card came from (daily deck only) */
  sourceCategory?: CategoryKey;
  /** User's notes for this specific daily deck instance (max 500 characters) */
  dailyNote?: string;
  /** Active timer state synced across devices (daily deck only) */
  timerState?: TimerState;
}

export interface CardsByCategory {
  structure: Card[];
  upkeep: Card[];
  play: Card[];
  default: Card[];
}
