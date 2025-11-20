import { useState, useCallback } from 'react';
import type { PostHog } from 'posthog-js';
import { CATEGORY_KEYS } from '../constants';
import type { Card, CardsByCategory, CategoryKey } from '../types';
import { generateId } from '../utils/generateId';

const INITIAL_CARDS_STATE: CardsByCategory = {
  [CATEGORY_KEYS.STRUCTURE]: [],
  [CATEGORY_KEYS.UPKEEP]: [],
  [CATEGORY_KEYS.PLAY]: [],
  [CATEGORY_KEYS.DEFAULT]: [],
};

export function useCards(initialCards: CardsByCategory = INITIAL_CARDS_STATE) {
  const [cards, setCards] = useState<CardsByCategory>(initialCards);

  const addCard = useCallback((category: CategoryKey, cardData: Partial<Card>, posthog: PostHog | null) => {
    const newCard: Card = {
      id: generateId(category),
      title: cardData.title || '',
      createdAt: new Date().toISOString(),
      ...cardData,
    };

    setCards((prev) => ({
      ...prev,
      [category]: [...prev[category], newCard],
    }));

    posthog?.capture('card_created', {
      card_id: newCard.id,
      category,
      has_description: !!cardData.description,
      has_duration: !!cardData.duration,
      recurrence_type: cardData.recurrenceType,
      max_uses: cardData.maxUses,
    });

    return newCard;
  }, []); // posthog is passed as parameter, not captured in closure

  const updateCard = useCallback((category: CategoryKey, cardId: string, updates: Partial<Card>, posthog: PostHog | null) => {
    setCards((prev) => ({
      ...prev,
      [category]: prev[category].map((card) =>
        card.id === cardId
          ? { ...card, ...updates, updatedAt: new Date().toISOString() }
          : card
      ),
    }));

    posthog?.capture('card_updated', {
      card_id: cardId,
      category,
      updated_fields: Object.keys(updates),
    });
  }, []); // posthog is passed as parameter, not captured in closure

  const deleteCard = useCallback((category: CategoryKey, cardId: string, posthog: PostHog | null) => {
    setCards((prev) => ({
      ...prev,
      [category]: prev[category].filter((card) => card.id !== cardId),
    }));

    posthog?.capture('card_deleted', {
      card_id: cardId,
      category,
    });
  }, []); // posthog is passed as parameter, not captured in closure

  const getAvailableCards = useCallback((category: CategoryKey, dailyDeck: Card[]) => {
    return cards[category].filter((card) => {
      if (card.recurrenceType === 'once') {
        const isInDailyDeck = dailyDeck.some((deckCard) => deckCard.id === card.id);
        return !isInDailyDeck;
      }
      if (card.recurrenceType === 'limited') {
        const timesInDeck = dailyDeck.filter((deckCard) => deckCard.id === card.id).length;
        const maxUses = card.maxUses || 1;
        return timesInDeck < maxUses;
      }
      return true;
    });
  }, [cards]);

  return {
    cards,
    setCards,
    addCard,
    updateCard,
    deleteCard,
    getAvailableCards,
  };
}
