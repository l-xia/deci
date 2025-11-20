/**
 * Custom hook for drag and drop logic
 */

import { useCallback } from 'react';

export function useDragAndDrop(cards, setCards, dailyDeck, setDailyDeck, posthog) {
  const onDragEnd = useCallback(
    (result) => {
      const { source, destination, draggableId } = result;

      if (!destination) return;
      if (source.droppableId === destination.droppableId && source.index === destination.index) {
        return;
      }

      const sourceId = source.droppableId;
      const destId = destination.droppableId;

      // Moving within daily deck
      if (sourceId === 'daily-deck' && destId === 'daily-deck') {
        const newDailyDeck = Array.from(dailyDeck);
        const [removed] = newDailyDeck.splice(source.index, 1);
        newDailyDeck.splice(destination.index, 0, removed);
        setDailyDeck(newDailyDeck);

        posthog?.capture('card_reordered_in_daily_deck', {
          from_index: source.index,
          to_index: destination.index,
        });
        return;
      }

      // Moving from category to daily deck
      if (sourceId !== 'daily-deck' && destId === 'daily-deck') {
        const actualCardId = draggableId.startsWith('daily-')
          ? draggableId.split('-').slice(1, -1).join('-')
          : draggableId;

        const sourceCategory = sourceId;
        const card = cards[sourceCategory].find((c) => c.id === actualCardId);

        if (!card) return;

        // Check if card can be added based on recurrence type
        if (card.recurrenceType === 'once') {
          const isInDailyDeck = dailyDeck.some((c) => c.id === card.id);
          if (isInDailyDeck) return; // Can't add again
        } else if (card.recurrenceType === 'limited') {
          const timesInDeck = dailyDeck.filter((c) => c.id === card.id).length;
          const maxUses = card.maxUses || 1;
          if (timesInDeck >= maxUses) return; // Limit reached
        }

        const newDailyDeck = Array.from(dailyDeck);
        const cardWithSource = { ...card, sourceCategory };
        newDailyDeck.splice(destination.index, 0, cardWithSource);
        setDailyDeck(newDailyDeck);

        posthog?.capture('card_added_to_daily_deck_via_drag', {
          card_id: card.id,
          source_category: sourceCategory,
          deck_size: newDailyDeck.length,
        });
        return;
      }

      // Moving from daily deck back to category (remove from daily deck)
      if (sourceId === 'daily-deck' && destId !== 'daily-deck') {
        const newDailyDeck = Array.from(dailyDeck);
        const [removed] = newDailyDeck.splice(source.index, 1);
        setDailyDeck(newDailyDeck);

        posthog?.capture('card_removed_from_daily_deck_via_drag', {
          card_id: removed.id,
          deck_size: newDailyDeck.length,
        });
        return;
      }

      // Moving between categories
      if (sourceId !== 'daily-deck' && destId !== 'daily-deck' && sourceId !== destId) {
        const actualCardId = draggableId.startsWith('daily-')
          ? draggableId.split('-').slice(1, -1).join('-')
          : draggableId;

        const sourceCards = Array.from(cards[sourceId]);
        const destCards = Array.from(cards[destId]);
        const cardIndex = sourceCards.findIndex((c) => c.id === actualCardId);

        if (cardIndex === -1) return;

        const [movedCard] = sourceCards.splice(cardIndex, 1);
        destCards.splice(destination.index, 0, movedCard);

        setCards({
          ...cards,
          [sourceId]: sourceCards,
          [destId]: destCards,
        });

        // Update card instances in daily deck with new source category
        const updatedDailyDeck = dailyDeck.map((deckCard) =>
          deckCard.id === actualCardId
            ? { ...deckCard, sourceCategory: destId }
            : deckCard
        );
        setDailyDeck(updatedDailyDeck);

        posthog?.capture('card_moved_between_categories', {
          card_id: actualCardId,
          from_category: sourceId,
          to_category: destId,
        });
      }
    },
    [cards, dailyDeck, setCards, setDailyDeck, posthog]
  );

  return { onDragEnd };
}
