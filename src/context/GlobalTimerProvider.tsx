import type { ReactNode } from 'react';
import { useGlobalTimer } from '../hooks/useGlobalTimer';
import { useDailyDeckContext } from './DailyDeckContext';
import { GlobalTimerContext } from './GlobalTimerContext';

interface GlobalTimerProviderProps {
  children: ReactNode;
}

export function GlobalTimerProvider({ children }: GlobalTimerProviderProps) {
  const { dailyDeck, setDailyDeck } = useDailyDeckContext();

  // Helper to update a card in the daily deck
  const updateCard = (
    index: number,
    updates: Partial<(typeof dailyDeck)[0]>
  ) => {
    const updatedDeck = dailyDeck.map((card, i) =>
      i === index ? { ...card, ...updates } : card
    );
    setDailyDeck(updatedDeck);
  };

  const globalTimer = useGlobalTimer({
    dailyDeck,
    updateCard,
  });

  return (
    <GlobalTimerContext.Provider value={globalTimer}>
      {children}
    </GlobalTimerContext.Provider>
  );
}
