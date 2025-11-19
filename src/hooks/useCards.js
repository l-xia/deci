/**
 * Custom hook for card management
 */

import { useState, useCallback } from 'react';
import { CATEGORY_KEYS } from '../constants';

const INITIAL_CARDS_STATE = {
  [CATEGORY_KEYS.STRUCTURE]: [],
  [CATEGORY_KEYS.UPKEEP]: [],
  [CATEGORY_KEYS.PLAY]: [],
  [CATEGORY_KEYS.DEFAULT]: [],
};

export function useCards(initialCards = INITIAL_CARDS_STATE) {
  const [cards, setCards] = useState(initialCards);

  // Add a new card to a category
  const addCard = useCallback((category, cardData, posthog) => {
    const newCard = {
      id: `${category}-${Date.now()}-${Math.random().toString(36).substring(2, 11)}`,
      ...cardData,
      createdAt: new Date().toISOString(),
    };

    setCards((prev) => ({
      ...prev,
      [category]: [...prev[category], newCard],
    }));

    // Track card creation
    posthog?.capture('card_created', {
      card_id: newCard.id,
      category,
      has_description: !!cardData.description,
      has_duration: !!cardData.duration,
      recurrence_type: cardData.recurrenceType,
      max_uses: cardData.maxUses,
    });

    return newCard;
  }, []);

  // Update an existing card
  const updateCard = useCallback((category, cardId, updates, posthog) => {
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
  }, []);

  // Delete a card from a category
  const deleteCard = useCallback((category, cardId, posthog) => {
    setCards((prev) => ({
      ...prev,
      [category]: prev[category].filter((card) => card.id !== cardId),
    }));

    posthog?.capture('card_deleted', {
      card_id: cardId,
      category,
    });
  }, []);

  // Get a specific card by category and ID
  const getCard = useCallback((category, cardId) => {
    return cards[category]?.find((card) => card.id === cardId);
  }, [cards]);

  // Get all cards from all categories as a flat array
  const getAllCards = useCallback(() => {
    return Object.values(cards).flat();
  }, [cards]);

  // Get cards count by category
  const getCardCount = useCallback((category) => {
    return cards[category]?.length || 0;
  }, [cards]);

  // Get total cards count
  const getTotalCardCount = useCallback(() => {
    return Object.values(cards).reduce((total, categoryCards) => total + categoryCards.length, 0);
  }, [cards]);

  // Filter cards based on daily deck usage
  const getAvailableCards = useCallback((category, dailyDeck) => {
    return cards[category].filter((card) => {
      if (card.recurrenceType === 'once') {
        // Check if this card is in the daily deck
        const isInDailyDeck = dailyDeck.some((deckCard) => deckCard.id === card.id);
        return !isInDailyDeck; // Hide if in daily deck
      }
      if (card.recurrenceType === 'limited') {
        // Count how many times this card is in the daily deck
        const timesInDeck = dailyDeck.filter((deckCard) => deckCard.id === card.id).length;
        const maxUses = card.maxUses || 1;
        return timesInDeck < maxUses; // Hide if limit reached
      }
      return true; // 'always' cards are always available
    });
  }, [cards]);

  return {
    cards,
    setCards,
    addCard,
    updateCard,
    deleteCard,
    getCard,
    getAllCards,
    getCardCount,
    getTotalCardCount,
    getAvailableCards,
  };
}
