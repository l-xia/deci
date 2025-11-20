/**
 * Custom hook for Firebase initialization and data persistence
 */

import { useState, useEffect, useMemo, useCallback } from 'react';
import { firebaseStorage } from '../services/firebase/storage';
import { debounce } from '../utils/debounce';
import { DEBOUNCE_DELAY, STORAGE_KEYS } from '../constants';
import { auth } from '../services/firebase';

export function useFirebase(posthog) {
  const [initialized, setInitialized] = useState(false);
  const [saveStatus, setSaveStatus] = useState('saved'); // 'saving', 'saved', 'error'
  const [saveError, setSaveError] = useState(null);

  // Initialize Firebase only after user is authenticated
  useEffect(() => {
    const initFirebase = async () => {
      try {
        const success = await firebaseStorage.initialize();

        if (success) {
          setInitialized(true);
          posthog?.capture('firebase_initialized', {
            user_id: firebaseStorage.getUserId(),
            offline_persistence_enabled: firebaseStorage.offlinePersistenceEnabled,
          });
        } else {
          const error = firebaseStorage.getLastError();
          console.error('Failed to initialize Firebase:', error);
          posthog?.capture('firebase_init_error', { error: error?.message });
        }
      } catch (error) {
        console.error('Unexpected error during Firebase initialization:', error);
        posthog?.capture('firebase_init_error_unexpected', { error: error.message });
      }
    };

    // Wait for auth state to be ready before initializing storage
    const unsubscribe = auth.onAuthStateChanged((user) => {
      if (user) {
        // User is authenticated, now initialize Firebase storage
        initFirebase();
      } else {
        // User is not authenticated, reset initialization
        setInitialized(false);
      }
    });

    return unsubscribe;
  }, [posthog]);

  // Create save function with error handling
  const createSaveFunction = useCallback((key) => {
    return debounce(async (data) => {
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

  // Create debounced save functions for each storage key
  const debouncedSaveCards = useMemo(
    () => createSaveFunction(STORAGE_KEYS.CARDS),
    [createSaveFunction]
  );

  const debouncedSaveDailyDeck = useMemo(
    () => createSaveFunction(STORAGE_KEYS.DAILY_DECK),
    [createSaveFunction]
  );

  const debouncedSaveTemplates = useMemo(
    () => createSaveFunction(STORAGE_KEYS.TEMPLATES),
    [createSaveFunction]
  );

  // Load data from Firebase
  const loadData = useCallback(async () => {
    if (!initialized) {
      return { cards: null, dailyDeck: null, templates: null };
    }

    try {
      const [cardsResult, dailyDeckResult, templatesResult] = await Promise.all([
        firebaseStorage.load(STORAGE_KEYS.CARDS),
        firebaseStorage.load(STORAGE_KEYS.DAILY_DECK),
        firebaseStorage.load(STORAGE_KEYS.TEMPLATES),
      ]);

      // Log any load errors
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
    } catch (error) {
      console.error('Error loading data from Firebase:', error);
      posthog?.capture('data_load_error_unexpected', { error: error.message });
      return { cards: null, dailyDeck: null, templates: null };
    }
  }, [initialized, posthog]);

  // Retry save operation
  const retrySave = useCallback((cards, dailyDeck, templates) => {
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

  // Cleanup on unmount
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
    offlinePersistenceEnabled: firebaseStorage.offlinePersistenceEnabled,
    getUserId: () => firebaseStorage.getUserId(),
  };
}
