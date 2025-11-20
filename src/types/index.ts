/**
 * Core application types
 */

export interface Card {
  id: string;
  title: string;
  description?: string;
  duration?: number;
  recurrenceType?: 'always' | 'once' | 'limited';
  maxUses?: number;
  timesUsed?: number;
  createdAt?: string;
  completed?: boolean;
  timeSpent?: number;
  completedAt?: string;
  sourceCategory?: string;
}

export interface CardsByCategory {
  structure: Card[];
  upkeep: Card[];
  play: Card[];
  default: Card[];
}

export interface Template {
  id: string;
  name: string;
  cards: Array<{
    id: string;
    sourceCategory: string;
  }>;
  createdAt: string;
}

export interface CategoryData {
  name: string;
  color: string;
  description: string;
}

export interface CategoryColors {
  border: string;
  borderHover: string;
  bg: string;
  bgHover: string;
  highlight: string;
  text: string;
  ring: string;
}

export type SaveStatus = 'saving' | 'saved' | 'error';

export type RecurrenceType = 'always' | 'once' | 'limited';
