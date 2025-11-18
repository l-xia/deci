/**
 * Custom hook for daily deck management
 */

import { useState, useCallback } from 'react';

export function useDailyDeck(initialDeck = []) {
  const [dailyDeck, setDailyDeck] = useState(initialDeck);

  // Add a card to the daily deck
  const addToDailyDeck = useCallback((card, sourceCategory, posthog) => {
    const deckCard = {
      ...card,
      sourceCategory,
      addedAt: new Date().toISOString(),
    };

    setDailyDeck((prev) => [...prev, deckCard]);

    posthog?.capture('card_added_to_daily_deck', {
      card_id: card.id,
      source_category: sourceCategory,
      deck_size: dailyDeck.length + 1,
    });

    return deckCard;
  }, [dailyDeck.length]);

  // Remove a card from the daily deck by index
  const removeFromDailyDeck = useCallback((index, posthog) => {
    setDailyDeck((prev) => {
      const removed = prev[index];
      const newDeck = prev.filter((_, i) => i !== index);

      posthog?.capture('card_removed_from_daily_deck', {
        card_id: removed?.id,
        deck_size: newDeck.length,
      });

      return newDeck;
    });
  }, []);

  // Remove all instances of a card from the daily deck
  const removeCardById = useCallback((cardId, posthog) => {
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

  // Reorder cards in the daily deck
  const reorderDailyDeck = useCallback((sourceIndex, destinationIndex) => {
    setDailyDeck((prev) => {
      const newDeck = Array.from(prev);
      const [removed] = newDeck.splice(sourceIndex, 1);
      newDeck.splice(destinationIndex, 0, removed);
      return newDeck;
    });
  }, []);

  // Mark a card as complete
  const completeCard = useCallback((index, timeSpent, posthog) => {
    setDailyDeck((prev) =>
      prev.map((card, i) =>
        i === index
          ? {
              ...card,
              completed: true,
              timeSpent,
              completedAt: new Date().toISOString(),
            }
          : card
      )
    );

    posthog?.capture('card_completed', {
      card_id: dailyDeck[index]?.id,
      time_spent: timeSpent,
      suggested_duration: dailyDeck[index]?.duration,
    });
  }, [dailyDeck]);

  // Update times used counter for a card
  const incrementTimesUsed = useCallback((cardId, cards, setCards) => {
    // Find the card in the cards object and increment timesUsed
    Object.keys(cards).forEach((category) => {
      const cardIndex = cards[category].findIndex((c) => c.id === cardId);
      if (cardIndex !== -1) {
        setCards((prev) => ({
          ...prev,
          [category]: prev[category].map((card, i) =>
            i === cardIndex
              ? { ...card, timesUsed: (card.timesUsed || 0) + 1 }
              : card
          ),
        }));
      }
    });
  }, []);

  // Clear the entire daily deck
  const clearDailyDeck = useCallback((posthog) => {
    setDailyDeck([]);
    posthog?.capture('daily_deck_cleared');
  }, []);

  // Load daily deck from template
  const loadFromTemplate = useCallback((templateCards, cards, posthog) => {
    const loadedCards = templateCards
      .map((templateCard) => {
        const category = templateCard.sourceCategory;
        const card = cards[category]?.find((c) => c.id === templateCard.id);
        return card ? { ...card, sourceCategory: category } : null;
      })
      .filter(Boolean);

    setDailyDeck(loadedCards);

    posthog?.capture('template_loaded', {
      cards_loaded: loadedCards.length,
      cards_missing: templateCards.length - loadedCards.length,
    });

    return loadedCards;
  }, []);

  // Get deck statistics
  const getDeckStats = useCallback(() => {
    const totalCards = dailyDeck.length;
    const completedCards = dailyDeck.filter((c) => c.completed).length;
    const totalDuration = dailyDeck.reduce((sum, card) => sum + (card.duration || 0), 0);
    const completedDuration = dailyDeck
      .filter((c) => c.completed)
      .reduce((sum, card) => sum + (card.duration || 0), 0);
    const timeSpent = dailyDeck
      .filter((c) => c.completed)
      .reduce((sum, card) => sum + (card.timeSpent || 0), 0);

    return {
      totalCards,
      completedCards,
      remainingCards: totalCards - completedCards,
      completionPercentage: totalCards > 0 ? Math.round((completedCards / totalCards) * 100) : 0,
      totalDuration,
      completedDuration,
      remainingDuration: totalDuration - completedDuration,
      timeSpent,
    };
  }, [dailyDeck]);

  return {
    dailyDeck,
    setDailyDeck,
    addToDailyDeck,
    removeFromDailyDeck,
    removeCardById,
    reorderDailyDeck,
    completeCard,
    incrementTimesUsed,
    clearDailyDeck,
    loadFromTemplate,
    getDeckStats,
  };
}
