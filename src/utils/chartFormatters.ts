import { format } from 'date-fns';
import type { TimeRange, ChartDimensions, ChartType } from '../types/analytics';
import type { CategoryKey } from '../types/category';
import { CATEGORY_CHART_COLORS } from '../constants/chartColors';

/**
 * Format X-axis date labels based on time range
 */
export function formatChartDate(dateStr: string, timeRange: TimeRange): string {
  const date = new Date(dateStr);

  if (timeRange === '7d') {
    return format(date, 'EEE'); // Mon, Tue, Wed
  } else if (timeRange === '30d') {
    return format(date, 'MMM d'); // Jan 1, Jan 2
  } else {
    return format(date, 'MMM d'); // Jan 1, Jan 2
  }
}

/**
 * Format week label for weekly aggregation
 */
export function formatWeekLabel(weekStart: string): string {
  return `Week of ${format(new Date(weekStart), 'MMM d')}`;
}

/**
 * Format Y-axis duration labels (shorter format for charts)
 */
export function formatChartDuration(seconds: number): string {
  if (seconds === 0) return '0m';

  const hours = Math.floor(seconds / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);

  if (hours > 0) {
    return minutes > 0 ? `${hours}h ${minutes}m` : `${hours}h`;
  }

  return `${minutes}m`;
}

/**
 * Format duration for tooltips (more detailed)
 */
export function formatTooltipDuration(seconds: number): string {
  if (seconds === 0) return '0 minutes';

  const hours = Math.floor(seconds / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);
  const secs = seconds % 60;

  const parts: string[] = [];
  if (hours > 0) parts.push(`${hours}h`);
  if (minutes > 0) parts.push(`${minutes}m`);
  if (secs > 0 && hours === 0) parts.push(`${secs}s`);

  return parts.join(' ');
}

/**
 * Generate responsive chart dimensions
 */
export function getChartDimensions(
  isMobile: boolean,
  chartType: ChartType
): ChartDimensions {
  const baseHeight = isMobile ? 250 : 350;
  const pieHeight = isMobile ? 200 : 300;

  return {
    width: '100%',
    height: chartType === 'pie' ? pieHeight : baseHeight,
    margin: isMobile
      ? { top: 10, right: 10, bottom: 20, left: 0 }
      : { top: 20, right: 30, bottom: 30, left: 20 },
  };
}

/**
 * Get category color for charts
 */
export function getCategoryChartColor(category: CategoryKey): string {
  const color = CATEGORY_CHART_COLORS[category];
  return color || CATEGORY_CHART_COLORS.default;
}

/**
 * Truncate long text for chart labels
 */
export function truncateLabel(text: string, maxLength: number): string {
  if (text.length <= maxLength) return text;
  return text.slice(0, maxLength - 3) + '...';
}

/**
 * Format hour for display (12-hour format)
 */
export function formatHour(hour: number): string {
  if (hour === 0) return '12 AM';
  if (hour === 12) return '12 PM';
  if (hour < 12) return `${hour} AM`;
  return `${hour - 12} PM`;
}

/**
 * Format percentage for display
 */
export function formatPercentage(value: number, decimals: number = 0): string {
  return `${value.toFixed(decimals)}%`;
}

/**
 * Get font size based on device
 */
export function getChartFontSize(isMobile: boolean): number {
  return isMobile ? 11 : 12;
}
