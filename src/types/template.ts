import type { CategoryKey } from './category';

export interface TemplateCard {
  id: string;
  sourceCategory: CategoryKey;
}

export interface Template {
  id: string;
  name: string;
  cards: TemplateCard[];
  createdAt: string;
  updatedAt?: string;
  cardCount: number;
}
