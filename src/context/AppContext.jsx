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
  const [hasLoadedOnce, setHasLoadedOnce] = React.useState(false);

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

  // Load data when Firebase is initialized (only once)
  useEffect(() => {
    if (firebase.initialized && !hasLoadedOnce) {
      const loadInitialData = async () => {
        const { cards, dailyDeck, templates, hasData } = await firebase.loadData();

        if (cards) {
          cardsHook.setCards(cards);
        }

        if (dailyDeck) {
          dailyDeckHook.setDailyDeck(dailyDeck);
        }

        if (templates) {
          templatesHook.setTemplates(templates);
        }

        // Mark as loaded to enable auto-save
        setHasLoadedOnce(true);

        // Track app loaded event
        posthog.capture('app_loaded', {
          storage_type: 'firebase',
          user_id: firebase.getUserId(),
          has_saved_data: hasData,
          total_cards: cards ? Object.values(cards).flat().length : 0,
          daily_deck_size: dailyDeck?.length || 0,
          templates_count: templates?.length || 0,
          offline_persistence_enabled: firebase.offlinePersistenceEnabled,
        });
      };

      loadInitialData();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [firebase.initialized]);

  // Auto-save cards when they change (only after initial load completes)
  useEffect(() => {
    if (firebase.initialized && hasLoadedOnce) {
      firebase.debouncedSaveCards(cardsHook.cards);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [cardsHook.cards, firebase.initialized, hasLoadedOnce]);

  // Auto-save daily deck when it changes (only after initial load completes)
  useEffect(() => {
    if (firebase.initialized && hasLoadedOnce) {
      firebase.debouncedSaveDailyDeck(dailyDeckHook.dailyDeck);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [dailyDeckHook.dailyDeck, firebase.initialized, hasLoadedOnce]);

  // Auto-save templates when they change (only after initial load completes)
  useEffect(() => {
    if (firebase.initialized && hasLoadedOnce) {
      firebase.debouncedSaveTemplates(templatesHook.templates);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [templatesHook.templates, firebase.initialized, hasLoadedOnce]);

  // Flush pending saves before page unload to prevent data loss on hard refresh
  useEffect(() => {
    if (!firebase.initialized || !hasLoadedOnce) return;

    const handleBeforeUnload = () => {
      firebase.flushPendingSaves();
    };

    window.addEventListener('beforeunload', handleBeforeUnload);

    return () => {
      window.removeEventListener('beforeunload', handleBeforeUnload);
    };
  }, [firebase, hasLoadedOnce]);

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
