import { createContext, useContext } from 'react';
import type { ReactNode } from 'react';
import { useFirebase, useCards, useDailyDeck, useTemplates, useDragAndDrop } from '../hooks';
import { useDayCompletion } from '../hooks/useDayCompletion';
import { useDataSync } from '../hooks/useDataSync';
import { CATEGORY_KEYS } from '../constants';

type FirebaseHook = ReturnType<typeof useFirebase>;
type CardsHook = ReturnType<typeof useCards>;
type DailyDeckHook = ReturnType<typeof useDailyDeck>;
type TemplatesHook = ReturnType<typeof useTemplates>;
type DragAndDropHook = ReturnType<typeof useDragAndDrop>;
type DayCompletionHook = ReturnType<typeof useDayCompletion>;

interface AppContextValue {
  firebase: FirebaseHook;
  cards: CardsHook;
  dailyDeck: DailyDeckHook;
  templates: TemplatesHook;
  dragAndDrop: DragAndDropHook;
  dayCompletion: DayCompletionHook;
}

const AppContext = createContext<AppContextValue | null>(null);

const INITIAL_CARDS_STATE = {
  [CATEGORY_KEYS.STRUCTURE]: [],
  [CATEGORY_KEYS.UPKEEP]: [],
  [CATEGORY_KEYS.PLAY]: [],
  [CATEGORY_KEYS.DEFAULT]: [],
};

interface AppProviderProps {
  children: ReactNode;
}

export function AppProvider({ children }: AppProviderProps) {
  const firebase = useFirebase();
  const cards = useCards(INITIAL_CARDS_STATE);
  const dailyDeck = useDailyDeck([]);
  const templates = useTemplates([]);
  const dayCompletion = useDayCompletion();
  const dragAndDrop = useDragAndDrop(
    cards.cards,
    cards.setCards,
    dailyDeck.dailyDeck,
    dailyDeck.setDailyDeck
  );

  useDataSync({
    firebase,
    cards: cards.cards,
    dailyDeck: dailyDeck.dailyDeck,
    templates: templates.templates,
    dayCompletions: dayCompletion.dayCompletions,
    userStreak: dayCompletion.userStreak,
    setCards: cards.setCards,
    setDailyDeck: dailyDeck.setDailyDeck,
    setTemplates: templates.setTemplates,
    setDayCompletions: dayCompletion.setDayCompletions,
    setUserStreak: dayCompletion.setUserStreak,
  });

  const value: AppContextValue = {
    firebase,
    cards,
    dailyDeck,
    templates,
    dragAndDrop,
    dayCompletion,
  };

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
}

export function useApp() {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useApp must be used within an AppProvider');
  }
  return context;
}
