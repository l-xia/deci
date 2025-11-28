import { useState, useCallback } from 'react';
import type { Card, CardsByCategory } from '../types';

export function useDailyDeck(initialDeck: Card[] = []) {
  const [dailyDeck, setDailyDeck] = useState<Card[]>(initialDeck);

  const removeCardById = useCallback((cardId: string) => {
    setDailyDeck((prev) => prev.filter((c) => c.id !== cardId));
  }, []);

  const loadFromTemplate = useCallback((templateCards: Array<{ id: string; sourceCategory: string }>, cards: CardsByCategory) => {
    const loadedCards = templateCards
      .map((templateCard) => {
        const category = templateCard.sourceCategory as keyof CardsByCategory;
        const card = cards[category]?.find((c: Card) => c.id === templateCard.id);
        return card ? { ...card, sourceCategory: category } : null;
      })
      .filter(Boolean) as Card[];

    setDailyDeck(loadedCards);

    return loadedCards;
  }, []);

  return {
    dailyDeck,
    setDailyDeck,
    removeCardById,
    loadFromTemplate,
  };
}
