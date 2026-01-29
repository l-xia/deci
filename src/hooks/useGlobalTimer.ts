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
    selectedCardIndex: null,
    currentDescription: '',
    startTime: null,
    accumulatedSeconds: 0,
    baseSeconds: 0,
  });

  const intervalRef = useRef<NodeJS.Timeout | null>(null);

  // Timer tick - updates accumulated seconds every second when running
  useEffect(() => {
    if (timerState.isRunning && timerState.startTime) {
      intervalRef.current = setInterval(() => {
        const elapsed = Math.floor(
          (Date.now() - timerState.startTime!.getTime()) / 1000
        );
        setTimerState((prev) => ({
          ...prev,
          accumulatedSeconds: prev.baseSeconds + elapsed,
        }));
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

  // Save time entry to card by deck index
  const saveTimeEntryToCard = useCallback(
    (cardIndex: number, entry: TimeEntry) => {
      const card = dailyDeck[cardIndex];
      if (!card) return;

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

  // Pause timer - just pauses without saving to card
  const pauseTimer = useCallback(() => {
    setTimerState((prev) => {
      if (!prev.isRunning) return prev;

      return {
        ...prev,
        isRunning: false,
        startTime: null,
        // Store accumulated time in baseSeconds so resume can continue from here
        baseSeconds: prev.accumulatedSeconds,
      };
    });
  }, []);

  // Start timer (or resume if paused)
  const startTimer = useCallback(
    (cardIndex?: number, description?: string) => {
      setTimerState((prev) => {
        // If paused with an existing entry, just resume
        if (!prev.isRunning && prev.currentEntry) {
          return {
            ...prev,
            isRunning: true,
            startTime: new Date(),
          };
        }

        // If already running, do nothing (shouldn't happen normally)
        if (prev.isRunning) {
          return prev;
        }

        // Starting fresh - create a new entry
        const selectedIndex = cardIndex ?? prev.selectedCardIndex;
        const taskDescription = description || prev.currentDescription;

        if (selectedIndex === null || selectedIndex === undefined) {
          console.warn('Cannot start timer without selecting a card');
          return prev;
        }

        const card = dailyDeck[selectedIndex];
        if (!card) {
          console.warn('Selected card index out of bounds');
          return prev;
        }

        const newEntry: TimeEntry = {
          id: uuidv4(),
          cardId: card.id,
          description: taskDescription,
          startedAt: new Date().toISOString(),
          seconds: 0,
        };

        return {
          isRunning: true,
          currentEntry: newEntry,
          selectedCardIndex: selectedIndex,
          currentDescription: taskDescription,
          startTime: new Date(),
          accumulatedSeconds: 0,
          baseSeconds: 0,
        };
      });
    },
    [dailyDeck]
  );

  // Stop timer - saves entry to card and clears everything
  const stopTimer = useCallback(() => {
    setTimerState((prev) => {
      // Save entry to card if there is one
      if (prev.currentEntry && prev.selectedCardIndex !== null) {
        const finalEntry: TimeEntry = {
          ...prev.currentEntry,
          endedAt: new Date().toISOString(),
          seconds: prev.accumulatedSeconds,
        };
        saveTimeEntryToCard(prev.selectedCardIndex, finalEntry);
      }

      return {
        ...prev,
        isRunning: false,
        currentEntry: null,
        selectedCardIndex: null,
        currentDescription: '',
        startTime: null,
        accumulatedSeconds: 0,
        baseSeconds: 0,
      };
    });
  }, [saveTimeEntryToCard]);

  // Switch to a different card - saves current entry and resets timer
  const switchCard = useCallback(
    (newCardIndex: number) => {
      setTimerState((prev) => {
        // Save current entry if there is one
        if (prev.currentEntry && prev.selectedCardIndex !== null) {
          const finalEntry: TimeEntry = {
            ...prev.currentEntry,
            endedAt: new Date().toISOString(),
            seconds: prev.accumulatedSeconds,
          };
          saveTimeEntryToCard(prev.selectedCardIndex, finalEntry);
        }

        // Switch to new card with fresh timer state
        return {
          ...prev,
          isRunning: false,
          currentEntry: null,
          selectedCardIndex: newCardIndex,
          currentDescription: '',
          startTime: null,
          accumulatedSeconds: 0,
          baseSeconds: 0,
        };
      });
    },
    [saveTimeEntryToCard]
  );

  // Update description
  const updateDescription = useCallback((description: string) => {
    setTimerState((prev) => ({
      ...prev,
      currentDescription: description,
    }));
  }, []);

  // Select card without starting timer
  const selectCard = useCallback((cardIndex: number | null) => {
    setTimerState((prev) => ({
      ...prev,
      selectedCardIndex: cardIndex,
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
    selectedCardIndex: timerState.selectedCardIndex,
    currentDescription: timerState.currentDescription,
    accumulatedSeconds: timerState.accumulatedSeconds,
  };
}
