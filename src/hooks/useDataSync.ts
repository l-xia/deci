import { useEffect, useState, useRef } from 'react';
import type { CardsByCategory } from '../types/card';
import type { Card } from '../types/card';
import type { Template } from '../types/template';
import type { DayCompletion, UserStreak } from '../types/dayCompletion';

/**
 * Shallow comparison for objects/arrays
 * Returns true if values have changed at top level
 */
function hasShallowChanged<T>(prev: T | null, next: T): boolean {
  if (prev === next) return false;
  if (prev === null || next === null) return true;
  if (typeof prev !== 'object' || typeof next !== 'object')
    return prev !== next;

  if (Array.isArray(prev) && Array.isArray(next)) {
    if (prev.length !== next.length) return true;
    return prev.some((val, i) => val !== next[i]);
  }

  const prevKeys = Object.keys(prev);
  const nextKeys = Object.keys(next);
  if (prevKeys.length !== nextKeys.length) return true;

  return prevKeys.some(
    (key) =>
      (prev as Record<string, unknown>)[key] !==
      (next as Record<string, unknown>)[key]
  );
}

interface FirebaseReturnType {
  initialized: boolean;
  debouncedSaveCards: (data: CardsByCategory) => void;
  debouncedSaveDailyDeck: (data: Card[]) => void;
  debouncedSaveTemplates: (data: Template[]) => void;
  debouncedSaveDayCompletions: (data: DayCompletion[]) => void;
  debouncedSaveUserStreak: (data: UserStreak) => void;
  loadData: () => Promise<{
    cards: CardsByCategory | null;
    dailyDeck: Card[] | null;
    templates: Template[] | null;
    dayCompletions: DayCompletion[] | null;
    userStreak: UserStreak | null;
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
  dayCompletions: DayCompletion[];
  userStreak: UserStreak;
  setCards: (cards: CardsByCategory) => void;
  setDailyDeck: (deck: Card[]) => void;
  setTemplates: (templates: Template[]) => void;
  setDayCompletions: (completions: DayCompletion[]) => void;
  setUserStreak: (streak: UserStreak) => void;
}

export function useDataSync({
  firebase,
  cards,
  dailyDeck,
  templates,
  dayCompletions,
  userStreak,
  setCards,
  setDailyDeck,
  setTemplates,
  setDayCompletions,
  setUserStreak,
}: DataSyncOptions): { hasLoadedOnce: boolean } {
  const [hasLoadedOnce, setHasLoadedOnce] = useState(false);
  const lastSavedCardsRef = useRef<CardsByCategory | null>(null);
  const lastSavedDailyDeckRef = useRef<Card[] | null>(null);
  const lastSavedTemplatesRef = useRef<Template[] | null>(null);
  const lastSavedDayCompletionsRef = useRef<DayCompletion[] | null>(null);
  const lastSavedUserStreakRef = useRef<UserStreak | null>(null);

  useEffect(() => {
    if (firebase.initialized && !hasLoadedOnce) {
      const loadInitialData = async () => {
        console.log('🔄 Loading data from Firebase...');
        const {
          cards: loadedCards,
          dailyDeck: loadedDailyDeck,
          templates: loadedTemplates,
          dayCompletions: loadedDayCompletions,
          userStreak: loadedUserStreak,
          hasData,
        } = await firebase.loadData();

        console.log('📦 Loaded data:', {
          cardsCount: loadedCards
            ? Object.values(loadedCards).flat().length
            : 0,
          dailyDeckCount: loadedDailyDeck?.length || 0,
          templatesCount: loadedTemplates?.length || 0,
          dayCompletionsCount: loadedDayCompletions?.length || 0,
          currentStreak: loadedUserStreak?.currentStreak || 0,
          hasData,
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

        if (loadedDayCompletions) {
          setDayCompletions(loadedDayCompletions);
          lastSavedDayCompletionsRef.current = loadedDayCompletions;
        }

        if (loadedUserStreak) {
          setUserStreak(loadedUserStreak);
          lastSavedUserStreakRef.current = loadedUserStreak;
        }

        setHasLoadedOnce(true);
      };

      loadInitialData();
    }
  }, [
    firebase.initialized,
    hasLoadedOnce,
    firebase,
    setCards,
    setDailyDeck,
    setTemplates,
    setDayCompletions,
    setUserStreak,
  ]);

  // Combined effect for all data syncing to reduce useEffect overhead
  useEffect(() => {
    if (!firebase.initialized || !hasLoadedOnce) return;

    // Check and save cards
    if (hasShallowChanged(lastSavedCardsRef.current, cards)) {
      console.log('📝 Cards changed, triggering debounced save...', {
        cardsCount: Object.values(cards).flat().length,
      });
      lastSavedCardsRef.current = cards;
      firebase.debouncedSaveCards(cards);
    }

    // Check and save daily deck
    if (hasShallowChanged(lastSavedDailyDeckRef.current, dailyDeck)) {
      lastSavedDailyDeckRef.current = dailyDeck;
      firebase.debouncedSaveDailyDeck(dailyDeck);
    }

    // Check and save templates
    if (hasShallowChanged(lastSavedTemplatesRef.current, templates)) {
      lastSavedTemplatesRef.current = templates;
      firebase.debouncedSaveTemplates(templates);
    }

    // Check and save day completions
    if (hasShallowChanged(lastSavedDayCompletionsRef.current, dayCompletions)) {
      lastSavedDayCompletionsRef.current = dayCompletions;
      firebase.debouncedSaveDayCompletions(dayCompletions);
    }

    // Check and save user streak
    if (hasShallowChanged(lastSavedUserStreakRef.current, userStreak)) {
      lastSavedUserStreakRef.current = userStreak;
      firebase.debouncedSaveUserStreak(userStreak);
    }
  }, [
    cards,
    dailyDeck,
    templates,
    dayCompletions,
    userStreak,
    firebase,
    hasLoadedOnce,
  ]);

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
