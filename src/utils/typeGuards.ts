import type { CategoryKey, Card, CardsByCategory, Template, DayCompletion, UserStreak } from '../types';

const VALID_CATEGORIES: readonly CategoryKey[] = ['structure', 'upkeep', 'play', 'default'] as const;

export function isCategoryKey(value: unknown): value is CategoryKey {
  return typeof value === 'string' && (VALID_CATEGORIES as readonly string[]).includes(value);
}

export function assertCategoryKey(value: unknown): CategoryKey {
  if (!isCategoryKey(value)) {
    throw new Error(`Invalid category: ${value}. Must be one of: ${VALID_CATEGORIES.join(', ')}`);
  }
  return value;
}

export function isCard(value: unknown): value is Card {
  if (!value || typeof value !== 'object') return false;
  const card = value as Record<string, unknown>;

  return (
    typeof card.id === 'string' &&
    typeof card.title === 'string' &&
    typeof card.createdAt === 'string' &&
    (card.description === undefined || typeof card.description === 'string') &&
    (card.duration === undefined || typeof card.duration === 'number') &&
    (card.recurrenceType === undefined || ['always', 'limited', 'once', 'scheduled'].includes(card.recurrenceType as string)) &&
    (card.completed === undefined || typeof card.completed === 'boolean') &&
    (card.timeSpent === undefined || typeof card.timeSpent === 'number') &&
    (card.completedAt === undefined || typeof card.completedAt === 'string')
  );
}

export function isCardArray(value: unknown): value is Card[] {
  return Array.isArray(value) && value.every(isCard);
}

export function isCardsByCategory(value: unknown): value is CardsByCategory {
  if (!value || typeof value !== 'object') return false;
  const obj = value as Record<string, unknown>;

  return (
    'structure' in obj && Array.isArray(obj.structure) && obj.structure.every(isCard) &&
    'upkeep' in obj && Array.isArray(obj.upkeep) && obj.upkeep.every(isCard) &&
    'play' in obj && Array.isArray(obj.play) && obj.play.every(isCard) &&
    'default' in obj && Array.isArray(obj.default) && obj.default.every(isCard)
  );
}

export function isTemplate(value: unknown): value is Template {
  if (!value || typeof value !== 'object') return false;
  const template = value as Record<string, unknown>;

  return (
    typeof template.id === 'string' &&
    typeof template.name === 'string' &&
    Array.isArray(template.cards) &&
    typeof template.createdAt === 'string' &&
    typeof template.cardCount === 'number'
  );
}

export function isTemplateArray(value: unknown): value is Template[] {
  return Array.isArray(value) && value.every(isTemplate);
}

export function isDayCompletion(value: unknown): value is DayCompletion {
  if (!value || typeof value !== 'object') return false;
  const completion = value as Record<string, unknown>;

  return (
    typeof completion.id === 'string' &&
    typeof completion.completedAt === 'string' &&
    completion.summary !== undefined &&
    typeof completion.summary === 'object'
  );
}

export function isDayCompletionArray(value: unknown): value is DayCompletion[] {
  return Array.isArray(value) && value.every(isDayCompletion);
}

export function isUserStreak(value: unknown): value is UserStreak {
  if (!value || typeof value !== 'object') return false;
  const streak = value as Record<string, unknown>;

  return (
    typeof streak.currentStreak === 'number' &&
    typeof streak.longestStreak === 'number' &&
    typeof streak.lastCompletionDate === 'string'
  );
}
