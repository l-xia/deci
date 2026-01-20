import { createContext, useContext, type ReactNode } from 'react';
import { useDailyDeck } from '../hooks/useDailyDeck';
import { useDragAndDrop } from '../hooks/useDragAndDrop';
import { useCardsContext } from './CardsContext';
import type { Card } from '../types';

type DailyDeckState = ReturnType<typeof useDailyDeck>;
type DragAndDropState = ReturnType<typeof useDragAndDrop>;

interface DailyDeckContextValue extends DailyDeckState {
  dragAndDrop: DragAndDropState;
}

const DailyDeckContext = createContext<DailyDeckContextValue | null>(null);

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

export function useDailyDeckContext() {
  const context = useContext(DailyDeckContext);
  if (!context) {
    throw new Error(
      'useDailyDeckContext must be used within a DailyDeckProvider'
    );
  }
  return context;
}
