import type { CategoryKey } from '../types/category';

// Chart color palette
export const CHART_COLORS = {
  primary: '#3b82f6',      // Blue - completion trends
  success: '#10b981',      // Green - time spent
  warning: '#f59e0b',      // Amber - warnings
  danger: '#ef4444',       // Red - negative trends
  purple: '#8b5cf6',       // Purple - time-of-day patterns
  pink: '#ec4899',         // Pink - play category
  orange: '#f97316',       // Orange - upkeep category
  indigo: '#6366f1',       // Indigo - night time
} as const;

// Category color mappings (Tailwind to hex for Recharts)
export const CATEGORY_CHART_COLORS: Record<CategoryKey, string> = {
  structure: '#10b981',    // Green
  upkeep: '#f97316',       // Orange
  play: '#ec4899',         // Pink
  default: '#8b5cf6',      // Purple
};

// Recurrence type colors
export const RECURRENCE_COLORS: Record<string, string> = {
  always: '#3b82f6',       // Blue
  once: '#10b981',         // Green
  limited: '#f59e0b',      // Amber
  scheduled: '#8b5cf6',    // Purple
};

// Time period colors
export const TIME_PERIOD_COLORS = {
  Morning: '#fbbf24',      // Yellow
  Afternoon: '#f97316',    // Orange
  Evening: '#ec4899',      // Pink
  Night: '#6366f1',        // Indigo
} as const;

// Gradient definitions for charts
export const CHART_GRADIENTS = {
  blue: {
    start: '#3b82f6',
    end: '#60a5fa',
  },
  green: {
    start: '#10b981',
    end: '#34d399',
  },
  purple: {
    start: '#8b5cf6',
    end: '#a78bfa',
  },
} as const;
