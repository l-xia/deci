import type { ReactNode } from 'react';
import { useDailyDeck } from '../hooks/useDailyDeck';
import { useDragAndDrop } from '../hooks/useDragAndDrop';
import { useCardsContext } from './CardsContext';
import type { Card } from '../types';
import {
  DailyDeckContext,
  type DailyDeckContextValue,
} from './DailyDeckContext';

interface DailyDeckProviderProps {
  children: ReactNode;
  initialDeck?: Card[];
}

export function DailyDeckProvider({
  children,
  initialDeck = [],
}: DailyDeckProviderProps) {
  const { cards, setCards } = useCardsContext();
  const dailyDeckState = useDailyDeck(initialDeck);

  const dragAndDrop = useDragAndDrop(
    cards,
    setCards,
    dailyDeckState.dailyDeck,
    dailyDeckState.setDailyDeck,
    dailyDeckState.setDeckLastEditedDate
  );

  const value: DailyDeckContextValue = {
    ...dailyDeckState,
    dragAndDrop,
  };

  return (
    <DailyDeckContext.Provider value={value}>
      {children}
    </DailyDeckContext.Provider>
  );
}
