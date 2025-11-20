import type { CategoryData, CategoryColors, CategoryKey } from '../types';
import { CATEGORIES, CATEGORY_COLORS, CATEGORY_KEYS } from '../constants/categories';

export function getCategoryColors(categoryKey: string): CategoryColors {
  return CATEGORY_COLORS[categoryKey as CategoryKey] || CATEGORY_COLORS[CATEGORY_KEYS.DEFAULT];
}

export function getCategory(categoryKey: string): CategoryData {
  return CATEGORIES[categoryKey as CategoryKey] || CATEGORIES[CATEGORY_KEYS.DEFAULT];
}

export function isValidCategory(categoryKey: string): categoryKey is CategoryKey {
  return Object.values(CATEGORY_KEYS).includes(categoryKey as CategoryKey);
}
