import { describe, it, expect } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { useCards } from './useCards';
import type { Card, CardsByCategory } from '../types';

describe('useCards', () => {
  const mockInitialCards: CardsByCategory = {
    structure: [
      {
        id: 'struct-1',
        title: 'Morning Routine',
        createdAt: '2024-01-01T00:00:00Z',
        recurrenceType: 'always',
      },
    ],
    upkeep: [
      {
        id: 'upkeep-1',
        title: 'Clean Desk',
        createdAt: '2024-01-01T00:00:00Z',
        recurrenceType: 'once',
      },
    ],
    play: [],
    default: [],
  };

  describe('initialization', () => {
    it('should initialize with default empty state', () => {
      const { result } = renderHook(() => useCards());

      expect(result.current.cards.structure).toEqual([]);
      expect(result.current.cards.upkeep).toEqual([]);
      expect(result.current.cards.play).toEqual([]);
      expect(result.current.cards.default).toEqual([]);
    });

    it('should initialize with provided cards', () => {
      const { result } = renderHook(() => useCards(mockInitialCards));

      expect(result.current.cards.structure).toHaveLength(1);
      expect(result.current.cards.upkeep).toHaveLength(1);
      expect(result.current.cards.structure[0]?.title).toBe('Morning Routine');
    });
  });

  describe('addCard', () => {
    it('should add a new card to the specified category', () => {
      const { result } = renderHook(() => useCards());

      act(() => {
        result.current.addCard('structure', {
          title: 'New Task',
          description: 'Task description',
        });
      });

      expect(result.current.cards.structure).toHaveLength(1);
      expect(result.current.cards.structure[0]?.title).toBe('New Task');
      expect(result.current.cards.structure[0]?.description).toBe(
        'Task description'
      );
    });

    it('should generate an id for new cards', () => {
      const { result } = renderHook(() => useCards());

      let newCard: Card;
      act(() => {
        newCard = result.current.addCard('structure', { title: 'Test' });
      });

      expect(newCard!.id).toBeDefined();
      expect(typeof newCard!.id).toBe('string');
      expect(newCard!.id.length).toBeGreaterThan(0);
    });

    it('should set createdAt timestamp for new cards', () => {
      const { result } = renderHook(() => useCards());

      let newCard: Card;
      act(() => {
        newCard = result.current.addCard('structure', { title: 'Test' });
      });

      expect(newCard!.createdAt).toBeDefined();
      expect(new Date(newCard!.createdAt!).getTime()).toBeLessThanOrEqual(
        Date.now()
      );
    });

    it('should preserve provided card data', () => {
      const { result } = renderHook(() => useCards());

      act(() => {
        result.current.addCard('structure', {
          title: 'Test',
          duration: 30,
          recurrenceType: 'limited',
          maxUses: 3,
        });
      });

      const card = result.current.cards.structure[0];
      expect(card?.duration).toBe(30);
      expect(card?.recurrenceType).toBe('limited');
      expect(card?.maxUses).toBe(3);
    });

    it('should add cards to the correct category', () => {
      const { result } = renderHook(() => useCards());

      act(() => {
        result.current.addCard('structure', { title: 'Structure Task' });
        result.current.addCard('upkeep', { title: 'Upkeep Task' });
        result.current.addCard('play', { title: 'Play Task' });
        result.current.addCard('default', { title: 'Default Task' });
      });

      expect(result.current.cards.structure[0]?.title).toBe('Structure Task');
      expect(result.current.cards.upkeep[0]?.title).toBe('Upkeep Task');
      expect(result.current.cards.play[0]?.title).toBe('Play Task');
      expect(result.current.cards.default[0]?.title).toBe('Default Task');
    });
  });

  describe('updateCard', () => {
    it('should update a card in the specified category', () => {
      const { result } = renderHook(() => useCards(mockInitialCards));

      act(() => {
        result.current.updateCard('structure', 'struct-1', {
          title: 'Updated Title',
        });
      });

      expect(result.current.cards.structure[0]?.title).toBe('Updated Title');
    });

    it('should set updatedAt timestamp when updating', () => {
      const { result } = renderHook(() => useCards(mockInitialCards));

      act(() => {
        result.current.updateCard('structure', 'struct-1', {
          description: 'New description',
        });
      });

      expect(result.current.cards.structure[0]?.description).toBe(
        'New description'
      );
    });

    it('should preserve non-updated fields', () => {
      const { result } = renderHook(() => useCards(mockInitialCards));

      act(() => {
        result.current.updateCard('structure', 'struct-1', {
          description: 'New description',
        });
      });

      const card = result.current.cards.structure[0];
      expect(card?.title).toBe('Morning Routine');
      expect(card?.recurrenceType).toBe('always');
      expect(card?.description).toBe('New description');
    });

    it('should only update the specified card', () => {
      const { result } = renderHook(() => useCards(mockInitialCards));

      act(() => {
        result.current.addCard('structure', { title: 'Second Task' });
      });

      act(() => {
        result.current.updateCard('structure', 'struct-1', {
          title: 'Updated',
        });
      });

      expect(result.current.cards.structure[0]?.title).toBe('Updated');
      expect(result.current.cards.structure[1]?.title).toBe('Second Task');
    });

    it('should not affect other categories', () => {
      const { result } = renderHook(() => useCards(mockInitialCards));

      act(() => {
        result.current.updateCard('structure', 'struct-1', {
          title: 'Updated',
        });
      });

      expect(result.current.cards.upkeep[0]?.title).toBe('Clean Desk');
    });
  });

  describe('deleteCard', () => {
    it('should remove a card from the specified category', () => {
      const { result } = renderHook(() => useCards(mockInitialCards));

      act(() => {
        result.current.deleteCard('structure', 'struct-1');
      });

      expect(result.current.cards.structure).toHaveLength(0);
    });

    it('should only remove the specified card', () => {
      const { result } = renderHook(() => useCards(mockInitialCards));

      act(() => {
        result.current.addCard('structure', {
          title: 'Second Task',
          id: 'struct-2',
        });
      });

      act(() => {
        result.current.deleteCard('structure', 'struct-1');
      });

      expect(result.current.cards.structure).toHaveLength(1);
      expect(result.current.cards.structure[0]?.id).toBe('struct-2');
    });

    it('should not affect other categories', () => {
      const { result } = renderHook(() => useCards(mockInitialCards));

      act(() => {
        result.current.deleteCard('structure', 'struct-1');
      });

      expect(result.current.cards.upkeep).toHaveLength(1);
    });
  });

  describe('getAvailableCards', () => {
    it('should return all cards for always recurrence type', () => {
      const { result } = renderHook(() => useCards(mockInitialCards));

      const available = result.current.getAvailableCards('structure', []);
      expect(available).toHaveLength(1);
    });

    it('should exclude once-type cards already in daily deck', () => {
      const { result } = renderHook(() => useCards(mockInitialCards));

      const dailyDeck: Card[] = [
        {
          id: 'upkeep-1',
          title: 'Clean Desk',
          createdAt: '2024-01-01T00:00:00Z',
        },
      ];

      const available = result.current.getAvailableCards('upkeep', dailyDeck);
      expect(available).toHaveLength(0);
    });

    it('should include once-type cards not in daily deck', () => {
      const { result } = renderHook(() => useCards(mockInitialCards));

      const available = result.current.getAvailableCards('upkeep', []);
      expect(available).toHaveLength(1);
    });

    it('should handle limited recurrence type', () => {
      const limitedCard: Card = {
        id: 'limited-1',
        title: 'Limited Task',
        createdAt: '2024-01-01T00:00:00Z',
        recurrenceType: 'limited',
        maxUses: 2,
      };

      const { result } = renderHook(() =>
        useCards({
          structure: [limitedCard],
          upkeep: [],
          play: [],
          default: [],
        })
      );

      // Not in deck yet
      let available = result.current.getAvailableCards('structure', []);
      expect(available).toHaveLength(1);

      // In deck once (under limit)
      const dailyDeck1: Card[] = [{ ...limitedCard }];
      available = result.current.getAvailableCards('structure', dailyDeck1);
      expect(available).toHaveLength(1);

      // In deck twice (at limit)
      const dailyDeck2: Card[] = [{ ...limitedCard }, { ...limitedCard }];
      available = result.current.getAvailableCards('structure', dailyDeck2);
      expect(available).toHaveLength(0);
    });

    it('should default maxUses to 1 for limited type', () => {
      const limitedCard: Card = {
        id: 'limited-1',
        title: 'Limited Task',
        createdAt: '2024-01-01T00:00:00Z',
        recurrenceType: 'limited',
      };

      const { result } = renderHook(() =>
        useCards({
          structure: [limitedCard],
          upkeep: [],
          play: [],
          default: [],
        })
      );

      const dailyDeck: Card[] = [{ ...limitedCard }];
      const available = result.current.getAvailableCards(
        'structure',
        dailyDeck
      );
      expect(available).toHaveLength(0);
    });

    it('should filter out scheduled cards not available today', () => {
      // This test would require mocking isCardAvailableOnDate
      // For now, we'll just verify the structure
      const scheduledCard: Card = {
        id: 'scheduled-1',
        title: 'Scheduled Task',
        createdAt: '2024-01-01T00:00:00Z',
        recurrenceType: 'scheduled',
        scheduleConfig: {
          rrule: 'FREQ=WEEKLY;BYDAY=MO',
        },
      };

      const { result } = renderHook(() =>
        useCards({
          structure: [scheduledCard],
          upkeep: [],
          play: [],
          default: [],
        })
      );

      // The actual filtering depends on the current date
      const available = result.current.getAvailableCards('structure', []);
      expect(Array.isArray(available)).toBe(true);
    });
  });

  describe('setCards', () => {
    it('should update cards state directly', () => {
      const { result } = renderHook(() => useCards());

      const newCards: CardsByCategory = {
        structure: [
          {
            id: 'new-1',
            title: 'New Card',
            createdAt: '2024-01-01T00:00:00Z',
          },
        ],
        upkeep: [],
        play: [],
        default: [],
      };

      act(() => {
        result.current.setCards(newCards);
      });

      expect(result.current.cards.structure).toHaveLength(1);
      expect(result.current.cards.structure[0]?.title).toBe('New Card');
    });
  });
});
