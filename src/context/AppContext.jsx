/**
 * Main application context provider
 * Combines all application state and provides it to child components
 */

import React, { createContext, useContext, useEffect } from 'react';
import { usePostHog } from 'posthog-js/react';
import { useFirebase, useCards, useDailyDeck, useTemplates, useDragAndDrop } from '../hooks';
import { CATEGORY_KEYS } from '../constants';

const AppContext = createContext(null);

const INITIAL_CARDS_STATE = {
  [CATEGORY_KEYS.STRUCTURE]: [],
  [CATEGORY_KEYS.UPKEEP]: [],
  [CATEGORY_KEYS.PLAY]: [],
  [CATEGORY_KEYS.DEFAULT]: [],
};

export function AppProvider({ children }) {
  const posthog = usePostHog();

  // Initialize Firebase and get save functions
  const firebase = useFirebase(posthog);

  // Initialize state management hooks
  const cardsHook = useCards(INITIAL_CARDS_STATE);
  const dailyDeckHook = useDailyDeck([]);
  const templatesHook = useTemplates([]);

  // Initialize drag and drop
  const dragAndDropHook = useDragAndDrop(
    cardsHook.cards,
    cardsHook.setCards,
    dailyDeckHook.dailyDeck,
    dailyDeckHook.setDailyDeck,
    posthog
  );

  // Load data when Firebase is initialized
  useEffect(() => {
    if (firebase.initialized) {
      const loadInitialData = async () => {
        const { cards, dailyDeck, templates, hasData } = await firebase.loadData();

        if (cards) cardsHook.setCards(cards);
        if (dailyDeck) dailyDeckHook.setDailyDeck(dailyDeck);
        if (templates) templatesHook.setTemplates(templates);

        // Track app loaded event
        posthog.capture('app_loaded', {
          storage_type: 'firebase',
          user_id: firebase.getUserId(),
          has_saved_data: hasData,
          total_cards: cardsHook.getTotalCardCount(),
          daily_deck_size: dailyDeck?.length || 0,
          templates_count: templates?.length || 0,
          offline_persistence_enabled: firebase.offlinePersistenceEnabled,
        });
      };

      loadInitialData();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [firebase.initialized]);

  // Auto-save cards when they change
  useEffect(() => {
    if (firebase.initialized) {
      firebase.debouncedSaveCards(cardsHook.cards);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [cardsHook.cards, firebase.initialized]);

  // Auto-save daily deck when it changes
  useEffect(() => {
    if (firebase.initialized) {
      firebase.debouncedSaveDailyDeck(dailyDeckHook.dailyDeck);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [dailyDeckHook.dailyDeck, firebase.initialized]);

  // Auto-save templates when they change
  useEffect(() => {
    if (firebase.initialized) {
      firebase.debouncedSaveTemplates(templatesHook.templates);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [templatesHook.templates, firebase.initialized]);

  const value = {
    // Firebase
    firebase,
    // PostHog
    posthog,
    // Cards
    ...cardsHook,
    // Daily Deck
    ...dailyDeckHook,
    // Templates
    ...templatesHook,
    // Drag and Drop
    ...dragAndDropHook,
  };

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
}

export function useApp() {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useApp must be used within an AppProvider');
  }
  return context;
}
