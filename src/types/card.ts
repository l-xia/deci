export type RecurrenceType = 'always' | 'once' | 'limited';

export interface Card {
  id: string;
  title: string;
  description?: string;
  duration?: number;
  recurrenceType?: RecurrenceType;
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
