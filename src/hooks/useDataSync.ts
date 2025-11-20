import { useEffect, useState } from 'react';
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

  useEffect(() => {
    if (firebase.initialized && !hasLoadedOnce) {
      const loadInitialData = async () => {
        const { cards: loadedCards, dailyDeck: loadedDailyDeck, templates: loadedTemplates, hasData } = await firebase.loadData();

        if (loadedCards) {
          setCards(loadedCards);
        }

        if (loadedDailyDeck) {
          setDailyDeck(loadedDailyDeck);
        }

        if (loadedTemplates) {
          setTemplates(loadedTemplates);
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
      firebase.debouncedSaveCards(cards);
    }
  }, [cards, firebase.initialized, firebase, hasLoadedOnce]);

  useEffect(() => {
    if (firebase.initialized && hasLoadedOnce) {
      firebase.debouncedSaveDailyDeck(dailyDeck);
    }
  }, [dailyDeck, firebase.initialized, firebase, hasLoadedOnce]);

  useEffect(() => {
    if (firebase.initialized && hasLoadedOnce) {
      firebase.debouncedSaveTemplates(templates);
    }
  }, [templates, firebase.initialized, firebase, hasLoadedOnce]);

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
