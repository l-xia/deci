import { createContext, useContext, type ReactNode } from 'react';
import { useCards } from '../hooks/useCards';
import { CATEGORY_KEYS } from '../constants';
import type { CardsByCategory } from '../types';

const INITIAL_CARDS_STATE: CardsByCategory = {
  [CATEGORY_KEYS.STRUCTURE]: [],
  [CATEGORY_KEYS.UPKEEP]: [],
  [CATEGORY_KEYS.PLAY]: [],
  [CATEGORY_KEYS.DEFAULT]: [],
};

type CardsContextValue = ReturnType<typeof useCards>;

const CardsContext = createContext<CardsContextValue | null>(null);

interface CardsProviderProps {
  children: ReactNode;
  initialCards?: CardsByCategory;
}

export function CardsProvider({
  children,
  initialCards = INITIAL_CARDS_STATE,
}: CardsProviderProps) {
  const cardsState = useCards(initialCards);

  return (
    <CardsContext.Provider value={cardsState}>{children}</CardsContext.Provider>
  );
}

export function useCardsContext() {
  const context = useContext(CardsContext);
  if (!context) {
    throw new Error('useCardsContext must be used within a CardsProvider');
  }
  return context;
}
