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

  const loadFromTemplate = useCallback(
    (
      templateCards: Array<{ id: string; sourceCategory: string }>,
      cards: CardsByCategory
    ) => {
      const loadedCards = templateCards
        .map((templateCard) => {
          // Validate sourceCategory before using it
          if (!isCategoryKey(templateCard.sourceCategory)) {
            console.warn(
              `Invalid sourceCategory: ${templateCard.sourceCategory} for card ${templateCard.id}`
            );
            return null;
          }

          const category = templateCard.sourceCategory;
          const card = cards[category]?.find(
            (c: Card) => c.id === templateCard.id
          );
          return card ? { ...card, sourceCategory: category } : null;
        })
        .filter(Boolean) as Card[];

      setDailyDeck(loadedCards);
      // Update deck date when loading template
      setDeckDate(new Date().toISOString());

      return loadedCards;
    },
    []
  );

  return {
    dailyDeck,
    setDailyDeck,
    removeCardById,
    loadFromTemplate,
    deckDate,
    setDeckDate,
    deckLastEditedDate,
    setDeckLastEditedDate,
  };
}
