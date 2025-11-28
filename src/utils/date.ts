import {
  format,
  formatDistanceToNow,
  parseISO,
  startOfDay,
  endOfDay,
  subDays,
  differenceInCalendarDays,
} from 'date-fns';

/**
 * Format a date as YYYY-MM-DD for storage
 */
export function formatDateKey(date: Date = new Date()): string {
  return format(date, 'yyyy-MM-dd');
}

/**
 * Format ISO timestamp to readable time (e.g., "3:30 PM")
 */
export function formatTime(isoString: string): string {
  try {
    return format(parseISO(isoString), 'h:mm a');
  } catch {
    return '';
  }
}

/**
 * Format ISO timestamp to readable date (e.g., "Jan 15, 2024")
 */
export function formatDate(isoString: string): string {
  try {
    return format(parseISO(isoString), 'MMM d, yyyy');
  } catch {
    return '';
  }
}

/**
 * Format ISO timestamp to full date and time
 */
export function formatDateTime(isoString: string): string {
  try {
    return format(parseISO(isoString), 'MMM d, yyyy h:mm a');
  } catch {
    return '';
  }
}

/**
 * Format seconds into human-readable duration (e.g., "1h 23m", "45m", "30s")
 */
export function formatDuration(seconds: number): string {
  if (seconds < 60) {
    return `${seconds}s`;
  }

  const hours = Math.floor(seconds / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);

  if (hours > 0) {
    return minutes > 0 ? `${hours}h ${minutes}m` : `${hours}h`;
  }

  return `${minutes}m`;
}

/**
 * Format relative time (e.g., "2 hours ago", "just now")
 */
export function formatRelativeTime(isoString: string): string {
  try {
    return formatDistanceToNow(parseISO(isoString), { addSuffix: true });
  } catch {
    return '';
  }
}

/**
 * Format ISO timestamp to short time (e.g., "3:30 PM")
 * Used for displaying completion times
 */
export function formatCompletedTime(isoString: string): string {
  return new Date(isoString).toLocaleTimeString([], {
    hour: '2-digit',
    minute: '2-digit'
  });
}

/**
 * Get date range for filtering (7d, 30d, all)
 */
export function getDateRange(range: '7d' | '30d' | 'all'): { start: Date; end: Date } | null {
  const now = new Date();

  switch (range) {
    case '7d':
      return { start: subDays(now, 7), end: now };
    case '30d':
      return { start: subDays(now, 30), end: now };
    case 'all':
      return null; // No filtering
    default:
      return null;
  }
}

/**
 * Calculate streak from an array of date strings (YYYY-MM-DD)
 */
export function calculateStreak(dates: string[]): {
  current: number;
  longest: number;
} {
  if (dates.length === 0) {
    return { current: 0, longest: 0 };
  }

  // Sort dates descending (most recent first)
  const sortedDates = [...dates].sort((a, b) => b.localeCompare(a));

  let currentStreak = 0;
  let longestStreak = 0;
  let tempStreak = 1;

  const today = formatDateKey();
  const yesterday = formatDateKey(subDays(new Date(), 1));

  // Check if most recent date is today or yesterday
  if (sortedDates[0] === today || sortedDates[0] === yesterday) {
    currentStreak = 1;

    // Calculate current streak
    for (let i = 1; i < sortedDates.length; i++) {
      const prevDate = parseISO(sortedDates[i - 1]);
      const currDate = parseISO(sortedDates[i]);
      const daysDiff = differenceInCalendarDays(prevDate, currDate);

      if (daysDiff === 1) {
        currentStreak++;
      } else {
        break;
      }
    }
  }

  // Calculate longest streak
  for (let i = 1; i < sortedDates.length; i++) {
    const prevDate = parseISO(sortedDates[i - 1]);
    const currDate = parseISO(sortedDates[i]);
    const daysDiff = differenceInCalendarDays(prevDate, currDate);

    if (daysDiff === 1) {
      tempStreak++;
      longestStreak = Math.max(longestStreak, tempStreak);
    } else {
      tempStreak = 1;
    }
  }

  longestStreak = Math.max(longestStreak, tempStreak, currentStreak);

  return { current: currentStreak, longest: longestStreak };
}

export { startOfDay, endOfDay, parseISO };
