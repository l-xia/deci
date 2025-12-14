import { useState, useEffect, useMemo, useCallback } from 'react';
import { firebaseStorage } from '../services/firebase/storage';
import {
  FirebaseStorageError,
  type StorageKey,
} from '../services/firebase/types';
import { debounce } from '../utils/debounce';
import { DEBOUNCE_DELAY, STORAGE_KEYS } from '../constants';
import { auth } from '../services/firebase';
import type { SaveStatus } from '../types/common';
import type {
  CardsByCategory,
  Card,
  Template,
  DayCompletion,
  UserStreak,
} from '../types';

export function useFirebase() {
  const [initialized, setInitialized] = useState(false);
  const [saveStatus, setSaveStatus] = useState<SaveStatus>('saved');
  const [saveError, setSaveError] = useState<FirebaseStorageError | null>(null);

  useEffect(() => {
    const initFirebase = async () => {
      try {
        const success = await firebaseStorage.initialize();

        if (success) {
          setInitialized(true);
        } else {
          console.error('Failed to initialize Firebase');
        }
      } catch (error: unknown) {
        console.error(
          'Unexpected error during Firebase initialization:',
          error
        );
      }
    };

    const unsubscribe = auth.onAuthStateChanged((user) => {
      if (user) {
        initFirebase();
      } else {
        setInitialized(false);
      }
    });

    return unsubscribe;
  }, []);

  // Factory function to create debounced save handlers
  const createDebouncedSave = useCallback(
    (key: StorageKey, keyName: string) => {
      return debounce(async (data: unknown) => {
        console.log(`⏰ Debounce timer expired for ${keyName}, saving now...`);
        setSaveStatus('saving');
        const result = await firebaseStorage.save(key, data);
        if (result.success) {
          setSaveStatus('saved');
          setSaveError(null);
        } else {
          setSaveStatus('error');
          setSaveError(result.error);
          console.error(`Failed to save ${keyName}:`, result.error);
        }
      }, DEBOUNCE_DELAY.SAVE);
    },
    []
  );

  const debouncedSaveCards = useMemo(
    () => createDebouncedSave(STORAGE_KEYS.CARDS as StorageKey, 'cards'),
    [createDebouncedSave]
  );

  const debouncedSaveDailyDeck = useMemo(
    () =>
      createDebouncedSave(STORAGE_KEYS.DAILY_DECK as StorageKey, 'dailyDeck'),
    [createDebouncedSave]
  );

  const debouncedSaveTemplates = useMemo(
    () =>
      createDebouncedSave(STORAGE_KEYS.TEMPLATES as StorageKey, 'templates'),
    [createDebouncedSave]
  );

  const debouncedSaveDayCompletions = useMemo(
    () =>
      createDebouncedSave(
        STORAGE_KEYS.DAY_COMPLETIONS as StorageKey,
        'dayCompletions'
      ),
    [createDebouncedSave]
  );

  const debouncedSaveUserStreak = useMemo(
    () =>
      createDebouncedSave(STORAGE_KEYS.USER_STREAK as StorageKey, 'userStreak'),
    [createDebouncedSave]
  );

  const loadData = useCallback(async (): Promise<{
    cards: CardsByCategory | null;
    dailyDeck: Card[] | null;
    templates: Template[] | null;
    dayCompletions: DayCompletion[] | null;
    userStreak: UserStreak | null;
    hasData?: boolean;
  }> => {
    if (!initialized) {
      return {
        cards: null,
        dailyDeck: null,
        templates: null,
        dayCompletions: null,
        userStreak: null,
      };
    }

    try {
      const [
        cardsResult,
        dailyDeckResult,
        templatesResult,
        dayCompletionsResult,
        userStreakResult,
      ] = await Promise.all([
        firebaseStorage.load(STORAGE_KEYS.CARDS as StorageKey),
        firebaseStorage.load(STORAGE_KEYS.DAILY_DECK as StorageKey),
        firebaseStorage.load(STORAGE_KEYS.TEMPLATES as StorageKey),
        firebaseStorage.load(STORAGE_KEYS.DAY_COMPLETIONS as StorageKey),
        firebaseStorage.load(STORAGE_KEYS.USER_STREAK as StorageKey),
      ]);

      if (!cardsResult.success) {
        console.error('Failed to load cards:', cardsResult.error);
      }
      if (!dailyDeckResult.success) {
        console.error('Failed to load daily deck:', dailyDeckResult.error);
      }
      if (!templatesResult.success) {
        console.error('Failed to load templates:', templatesResult.error);
      }
      if (!dayCompletionsResult.success) {
        console.error(
          'Failed to load day completions:',
          dayCompletionsResult.error
        );
      }
      if (!userStreakResult.success) {
        console.error('Failed to load user streak:', userStreakResult.error);
      }

      return {
        cards: (cardsResult.data as CardsByCategory) || null,
        dailyDeck: (dailyDeckResult.data as Card[]) || null,
        templates: (templatesResult.data as Template[]) || null,
        dayCompletions: (dayCompletionsResult.data as DayCompletion[]) || null,
        userStreak: (userStreakResult.data as UserStreak) || null,
        hasData: !!(
          cardsResult.data ||
          dailyDeckResult.data ||
          templatesResult.data
        ),
      };
    } catch (error: unknown) {
      console.error('Error loading data from Firebase:', error);
      return {
        cards: null,
        dailyDeck: null,
        templates: null,
        dayCompletions: null,
        userStreak: null,
      };
    }
  }, [initialized]);

  const retrySave = useCallback(
    (cards: unknown, dailyDeck: unknown, templates: unknown) => {
      if (cards) debouncedSaveCards(cards);
      if (dailyDeck) debouncedSaveDailyDeck(dailyDeck);
      if (templates) debouncedSaveTemplates(templates);
    },
    [debouncedSaveCards, debouncedSaveDailyDeck, debouncedSaveTemplates]
  );

  const flushPendingSaves = useCallback(() => {
    if (debouncedSaveCards?.flush) {
      debouncedSaveCards.flush();
    }
    if (debouncedSaveDailyDeck?.flush) {
      debouncedSaveDailyDeck.flush();
    }
    if (debouncedSaveTemplates?.flush) {
      debouncedSaveTemplates.flush();
    }
    if (debouncedSaveDayCompletions?.flush) {
      debouncedSaveDayCompletions.flush();
    }
    if (debouncedSaveUserStreak?.flush) {
      debouncedSaveUserStreak.flush();
    }
  }, [
    debouncedSaveCards,
    debouncedSaveDailyDeck,
    debouncedSaveTemplates,
    debouncedSaveDayCompletions,
    debouncedSaveUserStreak,
  ]);

  useEffect(() => {
    return () => {
      debouncedSaveCards?.cancel?.();
      debouncedSaveDailyDeck?.cancel?.();
      debouncedSaveTemplates?.cancel?.();
      debouncedSaveDayCompletions?.cancel?.();
      debouncedSaveUserStreak?.cancel?.();
    };
  }, [
    debouncedSaveCards,
    debouncedSaveDailyDeck,
    debouncedSaveTemplates,
    debouncedSaveDayCompletions,
    debouncedSaveUserStreak,
  ]);

  return {
    initialized,
    saveStatus,
    saveError,
    debouncedSaveCards,
    debouncedSaveDailyDeck,
    debouncedSaveTemplates,
    debouncedSaveDayCompletions,
    debouncedSaveUserStreak,
    loadData,
    retrySave,
    flushPendingSaves,
    isUsingFirebase: firebaseStorage.isUsingFirebase(),
    getUserId: () => firebaseStorage.getUserId(),
  };
}
