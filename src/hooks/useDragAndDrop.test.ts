import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { useDragAndDrop } from './useDragAndDrop';
import type { Card, CardsByCategory } from '../types';
import type { DropResult } from '@hello-pangea/dnd';

describe('useDragAndDrop', () => {
  let cards: CardsByCategory;
  let setCards: ReturnType<typeof vi.fn>;
  let dailyDeck: Card[];
  let setDailyDeck: ReturnType<typeof vi.fn>;

  beforeEach(() => {
    cards = {
      structure: [
        {
          id: 'struct-1',
          title: 'Morning Routine',
          createdAt: '2024-01-01T00:00:00Z',
          recurrenceType: 'always',
        },
        {
          id: 'struct-2',
          title: 'Evening Routine',
          createdAt: '2024-01-01T00:00:00Z',
          recurrenceType: 'once',
        },
      ],
      upkeep: [
        {
          id: 'upkeep-1',
          title: 'Clean Desk',
          createdAt: '2024-01-01T00:00:00Z',
          recurrenceType: 'limited',
          maxUses: 2,
        },
      ],
      play: [],
      default: [],
    };

    dailyDeck = [
      {
        id: 'struct-1',
        title: 'Morning Routine',
        createdAt: '2024-01-01T00:00:00Z',
        sourceCategory: 'structure',
      },
    ];

    setCards = vi.fn();
    setDailyDeck = vi.fn();
  });

  describe('reordering within daily deck', () => {
    it('should reorder cards within daily deck', () => {
      const { result } = renderHook(() =>
        useDragAndDrop(cards, setCards, dailyDeck, setDailyDeck)
      );

      const dropResult: DropResult = {
        draggableId: 'struct-1',
        type: 'DEFAULT',
        source: { droppableId: 'daily-deck', index: 0 },
        destination: { droppableId: 'daily-deck', index: 1 },
        reason: 'DROP',
        mode: 'FLUID',
        combine: null,
      };

      act(() => {
        result.current.onDragEnd(dropResult);
      });

      expect(setDailyDeck).toHaveBeenCalled();
    });

    it('should not reorder if destination is null', () => {
      const { result } = renderHook(() =>
        useDragAndDrop(cards, setCards, dailyDeck, setDailyDeck)
      );

      const dropResult: DropResult = {
        draggableId: 'struct-1',
        type: 'DEFAULT',
        source: { droppableId: 'daily-deck', index: 0 },
        destination: null,
        reason: 'DROP',
        mode: 'FLUID',
        combine: null,
      };

      act(() => {
        result.current.onDragEnd(dropResult);
      });

      expect(setDailyDeck).not.toHaveBeenCalled();
    });

    it('should not reorder if source and destination are the same', () => {
      const { result } = renderHook(() =>
        useDragAndDrop(cards, setCards, dailyDeck, setDailyDeck)
      );

      const dropResult: DropResult = {
        draggableId: 'struct-1',
        type: 'DEFAULT',
        source: { droppableId: 'daily-deck', index: 0 },
        destination: { droppableId: 'daily-deck', index: 0 },
        reason: 'DROP',
        mode: 'FLUID',
        combine: null,
      };

      act(() => {
        result.current.onDragEnd(dropResult);
      });

      expect(setDailyDeck).not.toHaveBeenCalled();
    });
  });

  describe('adding cards to daily deck', () => {
    it('should add card from category to daily deck', () => {
      const { result } = renderHook(() =>
        useDragAndDrop(cards, setCards, [], setDailyDeck)
      );

      const dropResult: DropResult = {
        draggableId: 'struct-1',
        type: 'DEFAULT',
        source: { droppableId: 'structure', index: 0 },
        destination: { droppableId: 'daily-deck', index: 0 },
        reason: 'DROP',
        mode: 'FLUID',
        combine: null,
      };

      act(() => {
        result.current.onDragEnd(dropResult);
      });

      expect(setDailyDeck).toHaveBeenCalled();
      const newDeck = setDailyDeck.mock.calls[0]?.[0];
      expect(newDeck).toHaveLength(1);
      expect(newDeck[0]?.id).toBe('struct-1');
      expect(newDeck[0]?.sourceCategory).toBe('structure');
    });

    it('should not add once-type card if already in daily deck', () => {
      const deckWithOnceCard = [
        {
          id: 'struct-2',
          title: 'Evening Routine',
          createdAt: '2024-01-01T00:00:00Z',
          sourceCategory: 'structure' as const,
        },
      ];

      const { result } = renderHook(() =>
        useDragAndDrop(cards, setCards, deckWithOnceCard, setDailyDeck)
      );

      const dropResult: DropResult = {
        draggableId: 'struct-2',
        type: 'DEFAULT',
        source: { droppableId: 'structure', index: 1 },
        destination: { droppableId: 'daily-deck', index: 0 },
        reason: 'DROP',
        mode: 'FLUID',
        combine: null,
      };

      act(() => {
        result.current.onDragEnd(dropResult);
      });

      expect(setDailyDeck).not.toHaveBeenCalled();
    });

    it('should add limited-type card up to maxUses', () => {
      const emptyDeck: Card[] = [];

      const { result } = renderHook(() =>
        useDragAndDrop(cards, setCards, emptyDeck, setDailyDeck)
      );

      const dropResult: DropResult = {
        draggableId: 'upkeep-1',
        type: 'DEFAULT',
        source: { droppableId: 'upkeep', index: 0 },
        destination: { droppableId: 'daily-deck', index: 0 },
        reason: 'DROP',
        mode: 'FLUID',
        combine: null,
      };

      // First add
      act(() => {
        result.current.onDragEnd(dropResult);
      });

      expect(setDailyDeck).toHaveBeenCalledTimes(1);
    });

    it('should not add limited-type card beyond maxUses', () => {
      const deckAtLimit = [
        {
          id: 'upkeep-1',
          title: 'Clean Desk',
          createdAt: '2024-01-01T00:00:00Z',
          sourceCategory: 'upkeep' as const,
        },
        {
          id: 'upkeep-1',
          title: 'Clean Desk',
          createdAt: '2024-01-01T00:00:00Z',
          sourceCategory: 'upkeep' as const,
        },
      ];

      const { result } = renderHook(() =>
        useDragAndDrop(cards, setCards, deckAtLimit, setDailyDeck)
      );

      const dropResult: DropResult = {
        draggableId: 'upkeep-1',
        type: 'DEFAULT',
        source: { droppableId: 'upkeep', index: 0 },
        destination: { droppableId: 'daily-deck', index: 0 },
        reason: 'DROP',
        mode: 'FLUID',
        combine: null,
      };

      act(() => {
        result.current.onDragEnd(dropResult);
      });

      expect(setDailyDeck).not.toHaveBeenCalled();
    });

    it('should insert after last completed card', () => {
      const deckWithCompleted = [
        {
          id: 'completed-1',
          title: 'Completed Task',
          createdAt: '2024-01-01T00:00:00Z',
          completed: true,
          sourceCategory: 'structure' as const,
        },
        {
          id: 'incomplete-1',
          title: 'Incomplete Task',
          createdAt: '2024-01-01T00:00:00Z',
          completed: false,
          sourceCategory: 'structure' as const,
        },
      ];

      const { result } = renderHook(() =>
        useDragAndDrop(cards, setCards, deckWithCompleted, setDailyDeck)
      );

      const dropResult: DropResult = {
        draggableId: 'struct-1',
        type: 'DEFAULT',
        source: { droppableId: 'structure', index: 0 },
        destination: { droppableId: 'daily-deck', index: 0 },
        reason: 'DROP',
        mode: 'FLUID',
        combine: null,
      };

      act(() => {
        result.current.onDragEnd(dropResult);
      });

      expect(setDailyDeck).toHaveBeenCalled();
      const newDeck = setDailyDeck.mock.calls[0]?.[0];
      // Should insert at index 1 (after completed card)
      expect(newDeck[1]?.id).toBe('struct-1');
    });
  });

  describe('removing cards from daily deck', () => {
    it('should remove card when dragged out of daily deck', () => {
      const { result } = renderHook(() =>
        useDragAndDrop(cards, setCards, dailyDeck, setDailyDeck)
      );

      const dropResult: DropResult = {
        draggableId: 'struct-1',
        type: 'DEFAULT',
        source: { droppableId: 'daily-deck', index: 0 },
        destination: { droppableId: 'structure', index: 0 },
        reason: 'DROP',
        mode: 'FLUID',
        combine: null,
      };

      act(() => {
        result.current.onDragEnd(dropResult);
      });

      expect(setDailyDeck).toHaveBeenCalled();
      const newDeck = setDailyDeck.mock.calls[0]?.[0];
      expect(newDeck).toHaveLength(0);
    });
  });

  describe('moving cards between categories', () => {
    it('should move card from one category to another', () => {
      const { result } = renderHook(() =>
        useDragAndDrop(cards, setCards, [], setDailyDeck)
      );

      const dropResult: DropResult = {
        draggableId: 'struct-1',
        type: 'DEFAULT',
        source: { droppableId: 'structure', index: 0 },
        destination: { droppableId: 'upkeep', index: 0 },
        reason: 'DROP',
        mode: 'FLUID',
        combine: null,
      };

      act(() => {
        result.current.onDragEnd(dropResult);
      });

      expect(setCards).toHaveBeenCalled();
      const newCards = setCards.mock.calls[0]?.[0];
      expect(newCards.structure).toHaveLength(1); // Removed one
      expect(newCards.upkeep).toHaveLength(2); // Added one
      expect(newCards.upkeep[0]?.id).toBe('struct-1');
    });

    it('should update sourceCategory in daily deck when moving categories', () => {
      const { result } = renderHook(() =>
        useDragAndDrop(cards, setCards, dailyDeck, setDailyDeck)
      );

      const dropResult: DropResult = {
        draggableId: 'struct-1',
        type: 'DEFAULT',
        source: { droppableId: 'structure', index: 0 },
        destination: { droppableId: 'upkeep', index: 0 },
        reason: 'DROP',
        mode: 'FLUID',
        combine: null,
      };

      act(() => {
        result.current.onDragEnd(dropResult);
      });

      expect(setDailyDeck).toHaveBeenCalled();
      const newDeck = setDailyDeck.mock.calls[0]?.[0];
      expect(newDeck[0]?.sourceCategory).toBe('upkeep');
    });

    it('should not move if source or destination is invalid', () => {
      const { result } = renderHook(() =>
        useDragAndDrop(cards, setCards, dailyDeck, setDailyDeck)
      );

      const dropResult: DropResult = {
        draggableId: 'struct-1',
        type: 'DEFAULT',
        source: { droppableId: 'invalid-category', index: 0 },
        destination: { droppableId: 'structure', index: 0 },
        reason: 'DROP',
        mode: 'FLUID',
        combine: null,
      };

      act(() => {
        result.current.onDragEnd(dropResult);
      });

      expect(setCards).not.toHaveBeenCalled();
    });
  });

  describe('extractCardId helper', () => {
    it('should extract card ID from daily deck draggable ID', () => {
      // The extractCardId function is internal, but we can test its behavior
      // through the drag and drop operations
      const deckWithCard = [
        {
          id: 'struct-1',
          title: 'Morning Routine',
          createdAt: '2024-01-01T00:00:00Z',
          sourceCategory: 'structure' as const,
        },
      ];

      const { result } = renderHook(() =>
        useDragAndDrop(cards, setCards, deckWithCard, setDailyDeck)
      );

      // Test with daily- prefix (format: daily-{cardId}-{index})
      const dropResult: DropResult = {
        draggableId: 'daily-struct-1-0',
        type: 'DEFAULT',
        source: { droppableId: 'daily-deck', index: 0 },
        destination: { droppableId: 'daily-deck', index: 1 },
        reason: 'DROP',
        mode: 'FLUID',
        combine: null,
      };

      act(() => {
        result.current.onDragEnd(dropResult);
      });

      // Should still work despite the prefix
      expect(setDailyDeck).toHaveBeenCalled();
    });
  });
});
