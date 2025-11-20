import type { CategoryData, CategoryColors } from '../types';

export const CATEGORY_KEYS = {
  STRUCTURE: 'structure',
  UPKEEP: 'upkeep',
  PLAY: 'play',
  DEFAULT: 'default',
} as const;

export type CategoryKey = typeof CATEGORY_KEYS[keyof typeof CATEGORY_KEYS];

export const CATEGORIES: Record<CategoryKey, CategoryData> = {
  [CATEGORY_KEYS.STRUCTURE]: {
    name: 'Structure',
    color: 'bg-green-100 border-green-300',
    description: 'Cards for structuring your day',
  },
  [CATEGORY_KEYS.UPKEEP]: {
    name: 'Upkeep',
    color: 'bg-orange-100 border-orange-300',
    description: 'Maintenance and routine tasks',
  },
  [CATEGORY_KEYS.PLAY]: {
    name: 'Play',
    color: 'bg-pink-100 border-pink-300',
    description: 'Fun and recreational activities',
  },
  [CATEGORY_KEYS.DEFAULT]: {
    name: 'Default',
    color: 'bg-purple-100 border-purple-300',
    description: 'Fallbacks when you don\'t know what to do',
  },
};

export const CATEGORY_COLORS: Record<CategoryKey, CategoryColors> = {
  [CATEGORY_KEYS.STRUCTURE]: {
    border: 'border-green-300',
    borderHover: 'hover:border-green-400',
    bg: 'bg-green-100',
    bgHover: 'hover:bg-green-50',
    highlight: 'bg-green-300',
    text: 'text-green-700',
    ring: 'ring-green-300',
  },
  [CATEGORY_KEYS.UPKEEP]: {
    border: 'border-orange-300',
    borderHover: 'hover:border-orange-400',
    bg: 'bg-orange-100',
    bgHover: 'hover:bg-orange-50',
    highlight: 'bg-orange-300',
    text: 'text-orange-700',
    ring: 'ring-orange-300',
  },
  [CATEGORY_KEYS.PLAY]: {
    border: 'border-pink-300',
    borderHover: 'hover:border-pink-400',
    bg: 'bg-pink-100',
    bgHover: 'hover:bg-pink-50',
    highlight: 'bg-pink-300',
    text: 'text-pink-700',
    ring: 'ring-pink-300',
  },
  [CATEGORY_KEYS.DEFAULT]: {
    border: 'border-purple-300',
    borderHover: 'hover:border-purple-400',
    bg: 'bg-purple-100',
    bgHover: 'hover:bg-purple-50',
    highlight: 'bg-purple-300',
    text: 'text-purple-700',
    ring: 'ring-purple-300',
  },
};
