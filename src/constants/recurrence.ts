/**
 * Recurrence type constants
 */
export const RECURRENCE_TYPES = {
  ALWAYS: 'always',
  LIMITED: 'limited',
  ONCE: 'once',
  SCHEDULED: 'scheduled',
} as const;

export const SCHEDULE_TYPES = {
  DAILY: 'daily',
  WEEKLY: 'weekly',
  MONTHLY: 'monthly',
} as const;

export type RecurrenceType = typeof RECURRENCE_TYPES[keyof typeof RECURRENCE_TYPES];
export type ScheduleType = typeof SCHEDULE_TYPES[keyof typeof SCHEDULE_TYPES];
