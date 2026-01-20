import { useState, useCallback } from 'react';
import { CATEGORY_KEYS } from '../constants';
import type { Card, CardsByCategory, CategoryKey } from '../types';
import { generateId } from '../utils/generateId';
import { isCardAvailableOnDate } from '../utils/scheduling';

const INITIAL_CARDS_STATE: CardsByCategory = {
  [CATEGORY_KEYS.STRUCTURE]: [],
  [CATEGORY_KEYS.UPKEEP]: [],
  [CATEGORY_KEYS.PLAY]: [],
  [CATEGORY_KEYS.DEFAULT]: [],
};

export function useCards(initialCards: CardsByCategory = INITIAL_CARDS_STATE) {
  const [cards, setCards] = useState<CardsByCategory>(initialCards);

  const addCard = useCallback(
    (category: CategoryKey, cardData: Partial<Card>) => {
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

      return newCard;
    },
    []
  );

  const updateCard = useCallback(
    (category: CategoryKey, cardId: string, updates: Partial<Card>) => {
      setCards((prev) => ({
        ...prev,
        [category]: prev[category].map((card) =>
          card.id === cardId
            ? { ...card, ...updates, updatedAt: new Date().toISOString() }
            : card
        ),
      }));
    },
    []
  );

  const deleteCard = useCallback((category: CategoryKey, cardId: string) => {
    setCards((prev) => ({
      ...prev,
      [category]: prev[category].filter((card) => card.id !== cardId),
    }));
  }, []);

  const archiveCard = useCallback((category: CategoryKey, cardId: string) => {
    setCards((prev) => ({
      ...prev,
      [category]: prev[category].map((card) =>
        card.id === cardId
          ? { ...card, archived: true, updatedAt: new Date().toISOString() }
          : card
      ),
    }));
  }, []);

  const unarchiveCard = useCallback((category: CategoryKey, cardId: string) => {
    setCards((prev) => ({
      ...prev,
      [category]: prev[category].map((card) =>
        card.id === cardId
          ? { ...card, archived: false, updatedAt: new Date().toISOString() }
          : card
      ),
    }));
  }, []);

  const getArchivedCards = useCallback((): Array<
    Card & { sourceCategory: CategoryKey }
  > => {
    const archived: Array<Card & { sourceCategory: CategoryKey }> = [];
    for (const category of Object.keys(cards) as CategoryKey[]) {
      for (const card of cards[category]) {
        if (card.archived) {
          archived.push({ ...card, sourceCategory: category });
        }
      }
    }
    return archived;
  }, [cards]);

  const getAvailableCards = useCallback(
    (category: CategoryKey, dailyDeck: Card[]) => {
      return cards[category].filter((card) => {
        // Exclude archived cards
        if (card.archived) {
          return false;
        }
        // Check scheduling first - if card is scheduled, check if it's available today
        if (card.recurrenceType === 'scheduled' && card.scheduleConfig) {
          if (!isCardAvailableOnDate(card.scheduleConfig)) {
            return false;
          }
        }

        // Then apply existing recurrence logic
        if (card.recurrenceType === 'once') {
          const isInDailyDeck = dailyDeck.some(
            (deckCard) => deckCard.id === card.id
          );
          return !isInDailyDeck;
        }
        if (card.recurrenceType === 'limited') {
          const timesInDeck = dailyDeck.filter(
            (deckCard) => deckCard.id === card.id
          ).length;
          const maxUses = card.maxUses || 1;
          return timesInDeck < maxUses;
        }
        return true;
      });
    },
    [cards]
  );

  return {
    cards,
    setCards,
    addCard,
    updateCard,
    deleteCard,
    archiveCard,
    unarchiveCard,
    getArchivedCards,
    getAvailableCards,
  };
}
