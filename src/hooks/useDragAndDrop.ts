import { useCallback } from 'react';
import type { PostHog } from 'posthog-js';
import type { DropResult } from '@hello-pangea/dnd';
import type { Card, CardsByCategory, CategoryKey } from '../types';

export function useDragAndDrop(
  cards: CardsByCategory,
  setCards: (cards: CardsByCategory) => void,
  dailyDeck: Card[],
  setDailyDeck: (deck: Card[]) => void,
  posthog: PostHog | null
) {
  const onDragEnd = useCallback(
    (result: DropResult) => {
      const { source, destination, draggableId } = result;

      if (!destination) return;
      if (source.droppableId === destination.droppableId && source.index === destination.index) {
        return;
      }

      const sourceId = source.droppableId;
      const destId = destination.droppableId;

      if (sourceId === 'daily-deck' && destId === 'daily-deck') {
        const newDailyDeck = Array.from(dailyDeck);
        const [removed] = newDailyDeck.splice(source.index, 1);

        if (!removed) return;

        newDailyDeck.splice(destination.index, 0, removed);
        setDailyDeck(newDailyDeck);

        posthog?.capture('card_reordered_in_daily_deck', {
          from_index: source.index,
          to_index: destination.index,
        });
        return;
      }

      if (sourceId !== 'daily-deck' && destId === 'daily-deck') {
        const actualCardId = draggableId.startsWith('daily-')
          ? draggableId.split('-').slice(1, -1).join('-')
          : draggableId;

        const sourceCategory = sourceId as CategoryKey;
        const card = cards[sourceCategory].find(c => c.id === actualCardId);

        if (!card) return;

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
        newDailyDeck.splice(destination.index, 0, cardWithSource);
        setDailyDeck(newDailyDeck);

        posthog?.capture('card_added_to_daily_deck_via_drag', {
          card_id: card.id,
          source_category: sourceCategory,
          deck_size: newDailyDeck.length,
        });
        return;
      }

      if (sourceId === 'daily-deck' && destId !== 'daily-deck') {
        const newDailyDeck = Array.from(dailyDeck);
        const [removed] = newDailyDeck.splice(source.index, 1);
        setDailyDeck(newDailyDeck);

        if (removed) {
          posthog?.capture('card_removed_from_daily_deck_via_drag', {
            card_id: removed.id,
            deck_size: newDailyDeck.length,
          });
        }
        return;
      }

      if (sourceId !== 'daily-deck' && destId !== 'daily-deck' && sourceId !== destId) {
        const actualCardId = draggableId.startsWith('daily-')
          ? draggableId.split('-').slice(1, -1).join('-')
          : draggableId;

        const sourceCategory = sourceId as CategoryKey;
        const destCategory = destId as CategoryKey;
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

        const updatedDailyDeck = dailyDeck.map(deckCard =>
          deckCard.id === actualCardId
            ? { ...deckCard, sourceCategory: destCategory }
            : deckCard
        );
        setDailyDeck(updatedDailyDeck);

        posthog?.capture('card_moved_between_categories', {
          card_id: actualCardId,
          from_category: sourceCategory,
          to_category: destCategory,
        });
      }
    },
    [cards, dailyDeck, setCards, setDailyDeck, posthog]
  );

  return { onDragEnd };
}
