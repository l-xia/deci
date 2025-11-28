/**
 * Analytics and time range constants
 */
export const TIME_RANGES = {
  WEEK: '7d',
  MONTH: '30d',
  ALL: 'all',
} as const;

export type TimeRange = typeof TIME_RANGES[keyof typeof TIME_RANGES];
