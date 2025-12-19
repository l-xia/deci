import { describe, it, expect } from 'vitest';
import {
  isCategoryKey,
  assertCategoryKey,
  isCard,
  isCardArray,
  isCardsByCategory,
  isTemplate,
  isTemplateArray,
  isDayCompletion,
  isDayCompletionArray,
  isUserStreak,
} from './typeGuards';
import type {
  Card,
  CardsByCategory,
  Template,
  DayCompletion,
  UserStreak,
} from '../types';

describe('typeGuards', () => {
  describe('isCategoryKey', () => {
    it('should return true for valid category keys', () => {
      expect(isCategoryKey('structure')).toBe(true);
      expect(isCategoryKey('upkeep')).toBe(true);
      expect(isCategoryKey('play')).toBe(true);
      expect(isCategoryKey('default')).toBe(true);
    });

    it('should return false for invalid category keys', () => {
      expect(isCategoryKey('invalid')).toBe(false);
      expect(isCategoryKey('')).toBe(false);
      expect(isCategoryKey(null)).toBe(false);
      expect(isCategoryKey(undefined)).toBe(false);
      expect(isCategoryKey(123)).toBe(false);
    });
  });

  describe('assertCategoryKey', () => {
    it('should return the value if it is a valid category key', () => {
      expect(assertCategoryKey('structure')).toBe('structure');
    });

    it('should throw an error if the value is not a valid category key', () => {
      expect(() => assertCategoryKey('invalid')).toThrow('Invalid category');
    });
  });

  describe('isCard', () => {
    it('should return true for a valid card object', () => {
      const validCard: Card = {
        id: '1',
        title: 'Test Card',
        createdAt: '2024-01-01T00:00:00Z',
      };
      expect(isCard(validCard)).toBe(true);
    });

    it('should return true for a card with all optional fields', () => {
      const fullCard: Card = {
        id: '1',
        title: 'Test Card',
        createdAt: '2024-01-01T00:00:00Z',
        description: 'Description',
        duration: 30,
        recurrenceType: 'always',
        completed: false,
        timeSpent: 15,
        completedAt: '2024-01-02T00:00:00Z',
      };
      expect(isCard(fullCard)).toBe(true);
    });

    it('should return false for invalid card objects', () => {
      expect(isCard(null)).toBe(false);
      expect(isCard(undefined)).toBe(false);
      expect(isCard({})).toBe(false);
      expect(isCard({ id: 1, title: 'Test' })).toBe(false);
      expect(isCard({ id: '1' })).toBe(false);
    });
  });

  describe('isCardArray', () => {
    it('should return true for an array of valid cards', () => {
      const cards: Card[] = [
        { id: '1', title: 'Card 1', createdAt: '2024-01-01T00:00:00Z' },
        { id: '2', title: 'Card 2', createdAt: '2024-01-01T00:00:00Z' },
      ];
      expect(isCardArray(cards)).toBe(true);
    });

    it('should return true for an empty array', () => {
      expect(isCardArray([])).toBe(true);
    });

    it('should return false for invalid arrays', () => {
      expect(isCardArray([{ id: 1 }])).toBe(false);
      expect(isCardArray(null)).toBe(false);
      expect(isCardArray('not an array')).toBe(false);
    });
  });

  describe('isCardsByCategory', () => {
    it('should return true for a valid CardsByCategory object', () => {
      const cardsByCategory: CardsByCategory = {
        structure: [
          { id: '1', title: 'Card 1', createdAt: '2024-01-01T00:00:00Z' },
        ],
        upkeep: [],
        play: [],
        default: [],
      };
      expect(isCardsByCategory(cardsByCategory)).toBe(true);
    });

    it('should return false for invalid CardsByCategory objects', () => {
      expect(isCardsByCategory(null)).toBe(false);
      expect(isCardsByCategory({})).toBe(false);
      expect(isCardsByCategory({ structure: [] })).toBe(false);
      expect(
        isCardsByCategory({
          structure: [{ invalid: true }],
          upkeep: [],
          play: [],
          default: [],
        })
      ).toBe(false);
    });
  });

  describe('isTemplate', () => {
    it('should return true for a valid template object', () => {
      const template: Template = {
        id: '1',
        name: 'Template 1',
        cards: [],
        createdAt: '2024-01-01T00:00:00Z',
        cardCount: 0,
      };
      expect(isTemplate(template)).toBe(true);
    });

    it('should return false for invalid template objects', () => {
      expect(isTemplate(null)).toBe(false);
      expect(isTemplate({})).toBe(false);
      expect(isTemplate({ id: '1', name: 'Template' })).toBe(false);
    });
  });

  describe('isTemplateArray', () => {
    it('should return true for an array of valid templates', () => {
      const templates: Template[] = [
        {
          id: '1',
          name: 'Template 1',
          cards: [],
          createdAt: '2024-01-01T00:00:00Z',
          cardCount: 0,
        },
      ];
      expect(isTemplateArray(templates)).toBe(true);
    });

    it('should return false for invalid arrays', () => {
      expect(isTemplateArray([{ invalid: true }])).toBe(false);
    });
  });

  describe('isDayCompletion', () => {
    it('should return true for a valid DayCompletion object', () => {
      const completion: DayCompletion = {
        id: '1',
        completedAt: '2024-01-01T00:00:00Z',
        summary: {
          totalCards: 0,
          completedCards: 0,
          totalTimeSpent: 0,
          categoryBreakdown: [],
          cardsList: [],
        },
      };
      expect(isDayCompletion(completion)).toBe(true);
    });

    it('should return false for invalid DayCompletion objects', () => {
      expect(isDayCompletion(null)).toBe(false);
      expect(isDayCompletion({})).toBe(false);
    });
  });

  describe('isDayCompletionArray', () => {
    it('should return true for an array of valid DayCompletion objects', () => {
      const completions: DayCompletion[] = [
        {
          id: '1',
          completedAt: '2024-01-01T00:00:00Z',
          summary: {
            totalCards: 0,
            completedCards: 0,
            totalTimeSpent: 0,
            categoryBreakdown: [],
            cardsList: [],
          },
        },
      ];
      expect(isDayCompletionArray(completions)).toBe(true);
    });
  });

  describe('isUserStreak', () => {
    it('should return true for a valid UserStreak object', () => {
      const streak: UserStreak = {
        currentStreak: 5,
        longestStreak: 10,
        lastCompletionDate: '2024-01-01',
      };
      expect(isUserStreak(streak)).toBe(true);
    });

    it('should return false for invalid UserStreak objects', () => {
      expect(isUserStreak(null)).toBe(false);
      expect(isUserStreak({})).toBe(false);
      expect(isUserStreak({ currentStreak: 5 })).toBe(false);
    });
  });
});
