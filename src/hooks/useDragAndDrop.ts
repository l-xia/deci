import { useCallback } from 'react';
import type { DropResult } from '@hello-pangea/dnd';
import type { Card, CardsByCategory } from '../types';
import { isCategoryKey } from '../utils/typeGuards';

// Helper to extract the actual card ID from draggableId
function extractCardId(draggableId: string): string {
  return draggableId.startsWith('daily-')
    ? draggableId.split('-').slice(1, -1).join('-')
    : draggableId;
}

export function useDragAndDrop(
  cards: CardsByCategory,
  setCards: (cards: CardsByCategory) => void,
  dailyDeck: Card[],
  setDailyDeck: (deck: Card[]) => void
) {
  // Handler: Reorder cards within daily deck
  const handleDailyDeckReorder = useCallback((source: DropResult['source'], destination: DropResult['destination']) => {
    if (!destination) return;

    const newDailyDeck = Array.from(dailyDeck);
    const [removed] = newDailyDeck.splice(source.index, 1);

    if (!removed) return;

    newDailyDeck.splice(destination.index, 0, removed);
    setDailyDeck(newDailyDeck);
  }, [dailyDeck, setDailyDeck]);

  // Handler: Add card from category to daily deck
  const handleAddToDaily = useCallback((source: DropResult['source'], destination: DropResult['destination'], draggableId: string) => {
    if (!destination) return;

    const actualCardId = extractCardId(draggableId);

    if (!isCategoryKey(source.droppableId)) {
      console.error('Invalid source category:', source.droppableId);
      return;
    }

    const sourceCategory = source.droppableId;
    const card = cards[sourceCategory].find(c => c.id === actualCardId);

    if (!card) return;

    // Check recurrence rules
    if (card.recurrenceType === 'once') {
      const isInDailyDeck = dailyDeck.some(c => c.id === card.id);
      if (isInDailyDeck) return;
    } else if (card.recurrenceType === 'limited') {
      const timesInDeck = dailyDeck.filter(c => c.id === card.id).length;
      const maxUses = card.maxUses || 1;
      if (timesInDeck >= maxUses) return;
    }

    const newDailyDeck = Array.from(dailyDeck);
    const cardWithSource = { ...card, sourceCategory };

    // Find the position after the last completed card
    const lastCompletedIndex = newDailyDeck.findIndex(c => !c.completed);
    const firstIncompleteIndex = lastCompletedIndex === -1 ? newDailyDeck.length : lastCompletedIndex;

    // Use the destination index, but ensure it's at or after the first incomplete position
    const insertIndex = Math.max(destination.index, firstIncompleteIndex);

    newDailyDeck.splice(insertIndex, 0, cardWithSource);
    setDailyDeck(newDailyDeck);

    // Scroll to the newly added card
    setTimeout(() => {
      const newCardElement = document.querySelector(`[data-rbd-draggable-id="${card.id}-${insertIndex}"]`);
      if (newCardElement) {
        newCardElement.scrollIntoView({ behavior: 'smooth', block: 'center' });
      }
    }, 100);
  }, [cards, dailyDeck, setDailyDeck]);

  // Handler: Remove card from daily deck
  const handleRemoveFromDaily = useCallback((source: DropResult['source']) => {
    const newDailyDeck = Array.from(dailyDeck);
    newDailyDeck.splice(source.index, 1);
    setDailyDeck(newDailyDeck);
  }, [dailyDeck, setDailyDeck]);

  // Handler: Move card between categories
  const handleMoveCategory = useCallback((source: DropResult['source'], destination: DropResult['destination'], draggableId: string) => {
    if (!destination) return;

    const actualCardId = extractCardId(draggableId);

    if (!isCategoryKey(source.droppableId) || !isCategoryKey(destination.droppableId)) {
      console.error('Invalid category:', { source: source.droppableId, dest: destination.droppableId });
      return;
    }

    const sourceCategory = source.droppableId;
    const destCategory = destination.droppableId;
    const sourceCards = Array.from(cards[sourceCategory]);
    const destCards = Array.from(cards[destCategory]);
    const cardIndex = sourceCards.findIndex(c => c.id === actualCardId);

    if (cardIndex === -1) return;

    const [movedCard] = sourceCards.splice(cardIndex, 1);

    if (!movedCard) return;

    destCards.splice(destination.index, 0, movedCard);

    setCards({
      ...cards,
      [sourceCategory]: sourceCards,
      [destCategory]: destCards,
    });

    // Update sourceCategory for card in daily deck if present
    const updatedDailyDeck = dailyDeck.map(deckCard =>
      deckCard.id === actualCardId
        ? { ...deckCard, sourceCategory: destCategory }
        : deckCard
    );
    setDailyDeck(updatedDailyDeck);
  }, [cards, dailyDeck, setCards, setDailyDeck]);

  const onDragEnd = useCallback(
    (result: DropResult) => {
      const { source, destination, draggableId } = result;

      if (!destination) return;
      if (source.droppableId === destination.droppableId && source.index === destination.index) {
        return;
      }

      const sourceId = source.droppableId;
      const destId = destination.droppableId;

      // Route to appropriate handler
      if (sourceId === 'daily-deck' && destId === 'daily-deck') {
        handleDailyDeckReorder(source, destination);
      } else if (sourceId !== 'daily-deck' && destId === 'daily-deck') {
        handleAddToDaily(source, destination, draggableId);
      } else if (sourceId === 'daily-deck' && destId !== 'daily-deck') {
        handleRemoveFromDaily(source);
      } else if (sourceId !== 'daily-deck' && destId !== 'daily-deck' && sourceId !== destId) {
        handleMoveCategory(source, destination, draggableId);
      }
    },
    [handleDailyDeckReorder, handleAddToDaily, handleRemoveFromDaily, handleMoveCategory]
  );

  return { onDragEnd };
}
