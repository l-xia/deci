import type { ReactNode } from 'react';
import { useCards } from '../hooks/useCards';
import { CATEGORY_KEYS } from '../constants';
import type { CardsByCategory } from '../types';
import { CardsContext } from './CardsContext';

const INITIAL_CARDS_STATE: CardsByCategory = {
  [CATEGORY_KEYS.STRUCTURE]: [],
  [CATEGORY_KEYS.UPKEEP]: [],
  [CATEGORY_KEYS.PLAY]: [],
  [CATEGORY_KEYS.DEFAULT]: [],
};

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
