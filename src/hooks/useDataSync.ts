import { useEffect, useState, useRef } from 'react';
import type { PostHog } from 'posthog-js';
import type { CardsByCategory } from '../types/card';
import type { Card } from '../types/card';
import type { Template } from '../types/template';

interface FirebaseReturnType {
  initialized: boolean;
  debouncedSaveCards: (data: CardsByCategory) => void;
  debouncedSaveDailyDeck: (data: Card[]) => void;
  debouncedSaveTemplates: (data: Template[]) => void;
  loadData: () => Promise<{
    cards: CardsByCategory | null;
    dailyDeck: Card[] | null;
    templates: Template[] | null;
    hasData?: boolean;
  }>;
  flushPendingSaves: () => void;
  getUserId: () => string | null;
  offlinePersistenceEnabled?: boolean;
}

interface DataSyncOptions {
  firebase: FirebaseReturnType;
  cards: CardsByCategory;
  dailyDeck: Card[];
  templates: Template[];
  setCards: (cards: CardsByCategory) => void;
  setDailyDeck: (deck: Card[]) => void;
  setTemplates: (templates: Template[]) => void;
  posthog: PostHog | null;
}

export function useDataSync({
  firebase,
  cards,
  dailyDeck,
  templates,
  setCards,
  setDailyDeck,
  setTemplates,
  posthog,
}: DataSyncOptions): { hasLoadedOnce: boolean } {
  const [hasLoadedOnce, setHasLoadedOnce] = useState(false);
  const lastSavedCardsRef = useRef<CardsByCategory | null>(null);
  const lastSavedDailyDeckRef = useRef<Card[] | null>(null);
  const lastSavedTemplatesRef = useRef<Template[] | null>(null);

  useEffect(() => {
    if (firebase.initialized && !hasLoadedOnce) {
      const loadInitialData = async () => {
        console.log('🔄 Loading data from Firebase...');
        const { cards: loadedCards, dailyDeck: loadedDailyDeck, templates: loadedTemplates, hasData } = await firebase.loadData();

        console.log('📦 Loaded data:', {
          cardsCount: loadedCards ? Object.values(loadedCards).flat().length : 0,
          dailyDeckCount: loadedDailyDeck?.length || 0,
          templatesCount: loadedTemplates?.length || 0,
          hasData
        });

        if (loadedCards) {
          setCards(loadedCards);
          lastSavedCardsRef.current = loadedCards;
        }

        if (loadedDailyDeck) {
          setDailyDeck(loadedDailyDeck);
          lastSavedDailyDeckRef.current = loadedDailyDeck;
        }

        if (loadedTemplates) {
          setTemplates(loadedTemplates);
          lastSavedTemplatesRef.current = loadedTemplates;
        }

        setHasLoadedOnce(true);

        posthog?.capture('app_loaded', {
          storage_type: 'firebase',
          user_id: firebase.getUserId(),
          has_saved_data: hasData,
          total_cards: loadedCards ? Object.values(loadedCards).flat().length : 0,
          daily_deck_size: loadedDailyDeck?.length || 0,
          templates_count: loadedTemplates?.length || 0,
          offline_persistence_enabled: firebase.offlinePersistenceEnabled,
        });
      };

      loadInitialData();
    }
  }, [firebase.initialized, hasLoadedOnce, firebase, setCards, setDailyDeck, setTemplates, posthog]);

  // Combined effect for all data syncing to reduce useEffect overhead
  useEffect(() => {
    if (!firebase.initialized || !hasLoadedOnce) return;

    // Check and save cards
    if (cards !== lastSavedCardsRef.current) {
      console.log('📝 Cards changed, triggering debounced save...', {
        cardsCount: Object.values(cards).flat().length
      });
      lastSavedCardsRef.current = cards;
      firebase.debouncedSaveCards(cards);
    }

    // Check and save daily deck
    if (dailyDeck !== lastSavedDailyDeckRef.current) {
      lastSavedDailyDeckRef.current = dailyDeck;
      firebase.debouncedSaveDailyDeck(dailyDeck);
    }

    // Check and save templates
    if (templates !== lastSavedTemplatesRef.current) {
      lastSavedTemplatesRef.current = templates;
      firebase.debouncedSaveTemplates(templates);
    }
  }, [cards, dailyDeck, templates, firebase, hasLoadedOnce]);

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

  return { hasLoadedOnce };
}
