import { useState, useCallback } from 'react';
import type { PostHog } from 'posthog-js';
import type { Card, CardsByCategory } from '../types';

export function useDailyDeck(initialDeck: Card[] = []) {
  const [dailyDeck, setDailyDeck] = useState<Card[]>(initialDeck);

  const removeCardById = useCallback((cardId: string, posthog: PostHog | null) => {
    setDailyDeck((prev) => {
      const newDeck = prev.filter((c) => c.id !== cardId);
      const removedCount = prev.length - newDeck.length;

      posthog?.capture('card_removed_from_daily_deck_all', {
        card_id: cardId,
        removed_count: removedCount,
        deck_size: newDeck.length,
      });

      return newDeck;
    });
  }, []);

  const loadFromTemplate = useCallback((templateCards: Array<{ id: string; sourceCategory: string }>, cards: CardsByCategory, posthog: PostHog | null) => {
    const loadedCards = templateCards
      .map((templateCard) => {
        const category = templateCard.sourceCategory as keyof CardsByCategory;
        const card = cards[category]?.find((c: Card) => c.id === templateCard.id);
        return card ? { ...card, sourceCategory: category } : null;
      })
      .filter(Boolean) as Card[];

    setDailyDeck(loadedCards);

    posthog?.capture('template_loaded', {
      cards_loaded: loadedCards.length,
      cards_missing: templateCards.length - loadedCards.length,
    });

    return loadedCards;
  }, []);

  return {
    dailyDeck,
    setDailyDeck,
    removeCardById,
    loadFromTemplate,
  };
}
