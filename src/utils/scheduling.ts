import { rrulestr } from 'rrule';
import type { ScheduleConfig } from '../types/card';

/**
 * Check if a card with schedule config is available on a given date
 */
export function isCardAvailableOnDate(
  scheduleConfig: ScheduleConfig,
  date: Date = new Date()
): boolean {
  try {
    const rule = rrulestr(scheduleConfig.rrule);

    /**
     * UTC/Local Timezone Conversion Strategy:
     *
     * RRule internally works in UTC, but we want to check if a card is available
     * on a specific calendar date in the user's local timezone.
     *
     * Process:
     * 1. Extract the calendar date components (year, month, day) from the input date
     *    using local timezone methods (.getFullYear(), .getMonth(), .getDate())
     * 2. Create UTC dates representing the start and end of that calendar day
     *    using Date.UTC() to avoid timezone offset complications
     * 3. Query RRule for any occurrences between those UTC timestamps
     *
     * Example: If it's Jan 15, 2024 at 11pm PST:
     * - Calendar date is Jan 15, 2024
     * - dayStart is Jan 15, 2024 00:00:00 UTC
     * - dayEnd is Jan 15, 2024 23:59:59 UTC
     * - We check if the schedule has any occurrence in that UTC range
     *
     * This ensures consistent behavior across timezones while respecting
     * the user's local calendar date.
     */
    const year = date.getFullYear();
    const month = date.getMonth();
    const day = date.getDate();

    // Create start and end of day in UTC for that calendar date
    const dayStart = new Date(Date.UTC(year, month, day, 0, 0, 0));
    const dayEnd = new Date(Date.UTC(year, month, day, 23, 59, 59, 999));

    // Check if any occurrences fall within this day
    const occurrences = rule.between(dayStart, dayEnd, true);
    return occurrences.length > 0;
  } catch (error) {
    console.error('Invalid RRule string:', scheduleConfig.rrule, error);
    return false;
  }
}

/**
 * Format schedule config into human-readable description
 */
export function formatScheduleDescription(
  scheduleConfig: ScheduleConfig
): string {
  try {
    const rule = rrulestr(scheduleConfig.rrule);
    return rule.toText();
  } catch (error) {
    console.error('Invalid RRule string:', scheduleConfig.rrule, error);
    return 'Scheduled';
  }
}

/**
 * Common RRule presets for easy scheduling
 */
export const SCHEDULE_PRESETS = {
  daily: 'FREQ=DAILY',
  weekdays: 'FREQ=WEEKLY;BYDAY=MO,TU,WE,TH,FR',
  weekends: 'FREQ=WEEKLY;BYDAY=SA,SU',
  weekly: (days: number[]) => {
    const dayMap = ['SU', 'MO', 'TU', 'WE', 'TH', 'FR', 'SA'];
    const byDay = days.map((d) => dayMap[d]).join(',');
    return `FREQ=WEEKLY;BYDAY=${byDay}`;
  },
  monthly: (dates: number[]) => {
    return `FREQ=MONTHLY;BYMONTHDAY=${dates.join(',')}`;
  },
  firstOfMonth: 'FREQ=MONTHLY;BYMONTHDAY=1',
  lastOfMonth: 'FREQ=MONTHLY;BYMONTHDAY=-1',
};

/**
 * Day of week constants for UI
 */
export const DAYS_OF_WEEK = [
  { value: 0, label: 'Sun', full: 'Sunday' },
  { value: 1, label: 'Mon', full: 'Monday' },
  { value: 2, label: 'Tue', full: 'Tuesday' },
  { value: 3, label: 'Wed', full: 'Wednesday' },
  { value: 4, label: 'Thu', full: 'Thursday' },
  { value: 5, label: 'Fri', full: 'Friday' },
  { value: 6, label: 'Sat', full: 'Saturday' },
];

/**
 * Get next occurrence of a scheduled card
 */
export function getNextOccurrence(
  scheduleConfig: ScheduleConfig,
  after: Date = new Date()
): Date | null {
  try {
    const rule = rrulestr(scheduleConfig.rrule);
    return rule.after(after, true);
  } catch (error) {
    console.error('Invalid RRule string:', scheduleConfig.rrule, error);
    return null;
  }
}
