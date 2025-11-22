import type { CategoryKey } from '../types';

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
