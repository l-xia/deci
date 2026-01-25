import { createContext, useContext } from 'react';
import { useDailyDeck } from '../hooks/useDailyDeck';
import { useDragAndDrop } from '../hooks/useDragAndDrop';

type DailyDeckState = ReturnType<typeof useDailyDeck>;
type DragAndDropState = ReturnType<typeof useDragAndDrop>;

export interface DailyDeckContextValue extends DailyDeckState {
  dragAndDrop: DragAndDropState;
}

export const DailyDeckContext = createContext<DailyDeckContextValue | null>(
  null
);

export function useDailyDeckContext() {
  const context = useContext(DailyDeckContext);
  if (!context) {
    throw new Error(
      'useDailyDeckContext must be used within a DailyDeckProvider'
    );
  }
  return context;
}
