import { createContext, useContext } from 'react';
import { useCards } from '../hooks/useCards';

export type CardsContextValue = ReturnType<typeof useCards>;

export const CardsContext = createContext<CardsContextValue | null>(null);

export function useCardsContext() {
  const context = useContext(CardsContext);
  if (!context) {
    throw new Error('useCardsContext must be used within a CardsProvider');
  }
  return context;
}
