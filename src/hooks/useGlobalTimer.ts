import { useState, useEffect, useCallback, useRef } from 'react';
import type { GlobalTimerState, TimeEntry } from '../types/timer';
import type { Card } from '../types';
import { v4 as uuidv4 } from 'uuid';

interface UseGlobalTimerOptions {
  dailyDeck: Card[];
  updateCard: (index: number, updates: Partial<Card>) => void;
}

export function useGlobalTimer({
  dailyDeck,
  updateCard,
}: UseGlobalTimerOptions) {
  const [timerState, setTimerState] = useState<GlobalTimerState>({
    isRunning: false,
    currentEntry: null,
    selectedCardId: null,
    currentDescription: '',
    startTime: null,
    accumulatedSeconds: 0,
  });

  const intervalRef = useRef<NodeJS.Timeout | null>(null);

  // Timer tick - updates accumulated seconds every second when running
  useEffect(() => {
    if (timerState.isRunning && timerState.startTime) {
      intervalRef.current = setInterval(() => {
        const elapsed = Math.floor(
          (Date.now() - timerState.startTime!.getTime()) / 1000
        );
        setTimerState((prev) => ({ ...prev, accumulatedSeconds: elapsed }));
      }, 1000);
    } else {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
    }

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, [timerState.isRunning, timerState.startTime]);

  // Save time entry to card
  const saveTimeEntryToCard = useCallback(
    (cardId: string, entry: TimeEntry) => {
      const cardIndex = dailyDeck.findIndex((c) => c.id === cardId);
      if (cardIndex === -1) return;

      const card = dailyDeck[cardIndex];
      const timeEntries = card.timeEntries || [];
      const updatedTimeEntries = [...timeEntries, entry];

      // Also update timerState.accumulatedSeconds to track total time
      const totalSeconds =
        (card.timerState?.accumulatedSeconds || 0) + entry.seconds;

      updateCard(cardIndex, {
        timeEntries: updatedTimeEntries,
        timerState: {
          ...card.timerState,
          accumulatedSeconds: totalSeconds,
          isPaused: true,
        },
      });
    },
    [dailyDeck, updateCard]
  );

  // Pause timer - defined before startTimer to avoid reference-before-declaration
  const pauseTimer = useCallback(() => {
    setTimerState((prev) => {
      if (!prev.isRunning || !prev.currentEntry) return prev;

      const finalEntry: TimeEntry = {
        ...prev.currentEntry,
        endedAt: new Date().toISOString(),
        seconds: prev.accumulatedSeconds,
      };

      // Save to card (using closure over saveTimeEntryToCard)
      if (prev.selectedCardId) {
        saveTimeEntryToCard(prev.selectedCardId, finalEntry);
      }

      return {
        ...prev,
        isRunning: false,
        currentEntry: null,
        startTime: null,
        accumulatedSeconds: 0,
      };
    });
  }, [saveTimeEntryToCard]);

  // Start timer
  const startTimer = useCallback(
    (cardId?: string, description?: string) => {
      // If already running, pause first (outside setTimerState to avoid stale closure)
      if (timerState.isRunning && timerState.currentEntry) {
        pauseTimer();
      }

      setTimerState((prev) => {
        const selectedCard = cardId || prev.selectedCardId;
        const taskDescription = description || prev.currentDescription;

        if (!selectedCard) {
          console.warn('Cannot start timer without selecting a card');
          return prev;
        }

        const newEntry: TimeEntry = {
          id: uuidv4(),
          cardId: selectedCard,
          description: taskDescription,
          startedAt: new Date().toISOString(),
          seconds: 0,
        };

        return {
          isRunning: true,
          currentEntry: newEntry,
          selectedCardId: selectedCard,
          currentDescription: taskDescription,
          startTime: new Date(),
          accumulatedSeconds: 0,
        };
      });
    },
    [timerState.isRunning, timerState.currentEntry, pauseTimer]
  );

  // Stop timer (same as pause, but clears selection)
  const stopTimer = useCallback(() => {
    pauseTimer();
    setTimerState((prev) => ({
      ...prev,
      selectedCardId: null,
      currentDescription: '',
    }));
  }, [pauseTimer]);

  // Switch to a different card
  const switchCard = useCallback(
    (newCardId: string) => {
      // Save current timer if running
      if (timerState.isRunning && timerState.currentEntry) {
        pauseTimer();
      }

      // Select new card
      setTimerState((prev) => ({
        ...prev,
        selectedCardId: newCardId,
        currentDescription: '',
      }));
    },
    [timerState, pauseTimer]
  );

  // Update description
  const updateDescription = useCallback((description: string) => {
    setTimerState((prev) => ({
      ...prev,
      currentDescription: description,
    }));
  }, []);

  // Select card without starting timer
  const selectCard = useCallback((cardId: string | null) => {
    setTimerState((prev) => ({
      ...prev,
      selectedCardId: cardId,
    }));
  }, []);

  return {
    timerState,
    startTimer,
    pauseTimer,
    stopTimer,
    switchCard,
    updateDescription,
    selectCard,
    // Convenience getters
    isRunning: timerState.isRunning,
    selectedCardId: timerState.selectedCardId,
    currentDescription: timerState.currentDescription,
    accumulatedSeconds: timerState.accumulatedSeconds,
  };
}
