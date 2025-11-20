import { useState, useEffect, useMemo, useCallback } from 'react';
import type { PostHog } from 'posthog-js';
import { firebaseStorage } from '../services/firebase/storage';
import { FirebaseStorageError, type StorageKey } from '../services/firebase/types';
import { debounce } from '../utils/debounce';
import { DEBOUNCE_DELAY, STORAGE_KEYS } from '../constants';
import { auth } from '../services/firebase';

type SaveStatus = 'saving' | 'saved' | 'error';

export function useFirebase(posthog: PostHog | null) {
  const [initialized, setInitialized] = useState(false);
  const [saveStatus, setSaveStatus] = useState<SaveStatus>('saved');
  const [saveError, setSaveError] = useState<FirebaseStorageError | null>(null);

  useEffect(() => {
    const initFirebase = async () => {
      try {
        const success = await firebaseStorage.initialize();

        if (success) {
          setInitialized(true);
          posthog?.capture('firebase_initialized', {
            user_id: firebaseStorage.getUserId(),
          });
        } else {
          console.error('Failed to initialize Firebase');
          posthog?.capture('firebase_init_error');
        }
      } catch (error: unknown) {
        console.error('Unexpected error during Firebase initialization:', error);
        const errorMessage = error instanceof Error ? error.message : 'Unknown error';
        posthog?.capture('firebase_init_error_unexpected', { error: errorMessage });
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
  }, [posthog]);

  const createSaveFunction = useCallback((key: StorageKey) => {
    return debounce(async (data: unknown) => {
      setSaveStatus('saving');
      const result = await firebaseStorage.save(key, data);
      if (result.success) {
        setSaveStatus('saved');
        setSaveError(null);
      } else {
        setSaveStatus('error');
        setSaveError(result.error);
        console.error(`Failed to save ${key}:`, result.error);
        posthog?.capture('save_error', {
          key,
          error: result.error?.message,
          code: result.error?.code,
        });
      }
    }, DEBOUNCE_DELAY.SAVE);
  }, [posthog]);

  const debouncedSaveCards = useMemo(
    () => createSaveFunction(STORAGE_KEYS.CARDS as StorageKey),
    [createSaveFunction]
  );

  const debouncedSaveDailyDeck = useMemo(
    () => createSaveFunction(STORAGE_KEYS.DAILY_DECK as StorageKey),
    [createSaveFunction]
  );

  const debouncedSaveTemplates = useMemo(
    () => createSaveFunction(STORAGE_KEYS.TEMPLATES as StorageKey),
    [createSaveFunction]
  );

  const loadData = useCallback(async () => {
    if (!initialized) {
      return { cards: null, dailyDeck: null, templates: null };
    }

    try {
      const [cardsResult, dailyDeckResult, templatesResult] = await Promise.all([
        firebaseStorage.load(STORAGE_KEYS.CARDS as StorageKey),
        firebaseStorage.load(STORAGE_KEYS.DAILY_DECK as StorageKey),
        firebaseStorage.load(STORAGE_KEYS.TEMPLATES as StorageKey),
      ]);

      if (!cardsResult.success) {
        console.error('Failed to load cards:', cardsResult.error);
        posthog?.capture('data_load_error', { key: 'cards', error: cardsResult.error?.message });
      }
      if (!dailyDeckResult.success) {
        console.error('Failed to load daily deck:', dailyDeckResult.error);
        posthog?.capture('data_load_error', { key: 'dailyDeck', error: dailyDeckResult.error?.message });
      }
      if (!templatesResult.success) {
        console.error('Failed to load templates:', templatesResult.error);
        posthog?.capture('data_load_error', { key: 'templates', error: templatesResult.error?.message });
      }

      return {
        cards: cardsResult.data,
        dailyDeck: dailyDeckResult.data,
        templates: templatesResult.data,
        hasData: !!(cardsResult.data || dailyDeckResult.data || templatesResult.data),
      };
    } catch (error: unknown) {
      console.error('Error loading data from Firebase:', error);
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      posthog?.capture('data_load_error_unexpected', { error: errorMessage });
      return { cards: null, dailyDeck: null, templates: null };
    }
  }, [initialized, posthog]);

  const retrySave = useCallback((cards: unknown, dailyDeck: unknown, templates: unknown) => {
    if (cards) debouncedSaveCards(cards);
    if (dailyDeck) debouncedSaveDailyDeck(dailyDeck);
    if (templates) debouncedSaveTemplates(templates);
  }, [debouncedSaveCards, debouncedSaveDailyDeck, debouncedSaveTemplates]);

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
  }, [debouncedSaveCards, debouncedSaveDailyDeck, debouncedSaveTemplates]);

  useEffect(() => {
    return () => {
      debouncedSaveCards?.cancel?.();
      debouncedSaveDailyDeck?.cancel?.();
      debouncedSaveTemplates?.cancel?.();
    };
  }, [debouncedSaveCards, debouncedSaveDailyDeck, debouncedSaveTemplates]);

  return {
    initialized,
    saveStatus,
    saveError,
    debouncedSaveCards,
    debouncedSaveDailyDeck,
    debouncedSaveTemplates,
    loadData,
    retrySave,
    flushPendingSaves,
    isUsingFirebase: firebaseStorage.isUsingFirebase(),
    getUserId: () => firebaseStorage.getUserId(),
  };
}
