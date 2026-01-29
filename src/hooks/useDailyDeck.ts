import { useState, useCallback } from 'react';
import type { Card, CardsByCategory } from '../types';
import { isCategoryKey } from '../utils/typeGuards';

export function useDailyDeck(initialDeck: Card[] = []) {
  const [dailyDeck, setDailyDeck] = useState<Card[]>(initialDeck);
  const [deckDate, setDeckDate] = useState<string | null>(
    new Date().toISOString()
  );
  const [deckLastEditedDate, setDeckLastEditedDate] = useState<string | null>(
    null
  );

  const removeCardById = useCallback((cardId: string) => {
    setDailyDeck((prev) => prev.filter((c) => c.id !== cardId));
  }, []);

  const removeCardByIndex = useCallback((index: number) => {
    setDailyDeck((prev) => prev.filter((_, i) => i !== index));
  }, []);

  const loadFromTemplate = useCallback(
    (
      templateCards: Array<{ id: string; sourceCategory: string }>,
      cards: CardsByCategory
    ) => {
      const cardMap = new Map<string, Card>();
      for (const category of Object.keys(cards) as Array<
        keyof CardsByCategory
      >) {
        for (const card of cards[category] || []) {
          cardMap.set(card.id, card);
        }
      }

      const loadedCards = templateCards
        .map((templateCard) => {
          if (!isCategoryKey(templateCard.sourceCategory)) {
            console.warn(
              `Invalid sourceCategory: ${templateCard.sourceCategory} for card ${templateCard.id}`
            );
            return null;
          }

          const card = cardMap.get(templateCard.id);
          return card
            ? { ...card, sourceCategory: templateCard.sourceCategory }
            : null;
        })
        .filter(Boolean) as Card[];

      setDailyDeck(loadedCards);

      return loadedCards;
    },
    []
  );

  return {
    dailyDeck,
    setDailyDeck,
    removeCardById,
    removeCardByIndex,
    loadFromTemplate,
    deckDate,
    setDeckDate,
    deckLastEditedDate,
    setDeckLastEditedDate,
  };
}
