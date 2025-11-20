import { useEffect, useState, useRef } from 'react';
import type { PostHog } from 'posthog-js';

interface DataSyncOptions {
  firebase: any;
  cards: any;
  dailyDeck: any;
  templates: any;
  setCards: (cards: any) => void;
  setDailyDeck: (deck: any) => void;
  setTemplates: (templates: any) => void;
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
}: DataSyncOptions) {
  const [hasLoadedOnce, setHasLoadedOnce] = useState(false);
  const lastSavedCardsRef = useRef<string>('');
  const lastSavedDailyDeckRef = useRef<string>('');
  const lastSavedTemplatesRef = useRef<string>('');
  const effectRunCountRef = useRef(0);

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
          lastSavedCardsRef.current = JSON.stringify(loadedCards);
        }

        if (loadedDailyDeck) {
          setDailyDeck(loadedDailyDeck);
          lastSavedDailyDeckRef.current = JSON.stringify(loadedDailyDeck);
        }

        if (loadedTemplates) {
          setTemplates(loadedTemplates);
          lastSavedTemplatesRef.current = JSON.stringify(loadedTemplates);
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

  useEffect(() => {
    if (firebase.initialized && hasLoadedOnce) {
      const currentCards = JSON.stringify(cards);
      if (currentCards !== lastSavedCardsRef.current) {
        console.log('📝 Cards changed, triggering debounced save...', {
          cardsCount: Object.values(cards).flat().length
        });
        lastSavedCardsRef.current = currentCards;
        firebase.debouncedSaveCards(cards);
      }
    }
  }, [cards, firebase.initialized, firebase.debouncedSaveCards, hasLoadedOnce]);

  useEffect(() => {
    if (firebase.initialized && hasLoadedOnce) {
      const currentDailyDeck = JSON.stringify(dailyDeck);
      if (currentDailyDeck !== lastSavedDailyDeckRef.current) {
        lastSavedDailyDeckRef.current = currentDailyDeck;
        firebase.debouncedSaveDailyDeck(dailyDeck);
      }
    }
  }, [dailyDeck, firebase.initialized, firebase.debouncedSaveDailyDeck, hasLoadedOnce]);

  useEffect(() => {
    if (firebase.initialized && hasLoadedOnce) {
      const currentTemplates = JSON.stringify(templates);
      if (currentTemplates !== lastSavedTemplatesRef.current) {
        lastSavedTemplatesRef.current = currentTemplates;
        firebase.debouncedSaveTemplates(templates);
      }
    }
  }, [templates, firebase.initialized, firebase.debouncedSaveTemplates, hasLoadedOnce]);

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
