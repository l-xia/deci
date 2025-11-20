import { createContext, useContext } from 'react';
import type { ReactNode } from 'react';
import { usePostHog } from 'posthog-js/react';
import type { PostHog } from 'posthog-js';
import { useFirebase, useCards, useDailyDeck, useTemplates, useDragAndDrop } from '../hooks';
import { useDataSync } from '../hooks/useDataSync';
import { CATEGORY_KEYS } from '../constants';

type FirebaseHook = ReturnType<typeof useFirebase>;
type CardsHook = ReturnType<typeof useCards>;
type DailyDeckHook = ReturnType<typeof useDailyDeck>;
type TemplatesHook = ReturnType<typeof useTemplates>;
type DragAndDropHook = ReturnType<typeof useDragAndDrop>;

interface AppContextValue {
  firebase: FirebaseHook;
  cards: CardsHook;
  dailyDeck: DailyDeckHook;
  templates: TemplatesHook;
  dragAndDrop: DragAndDropHook;
  posthog: PostHog | null;
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
  const posthog = usePostHog();

  const firebase = useFirebase(posthog);
  const cards = useCards(INITIAL_CARDS_STATE);
  const dailyDeck = useDailyDeck([]);
  const templates = useTemplates([]);
  const dragAndDrop = useDragAndDrop(
    cards.cards,
    cards.setCards,
    dailyDeck.dailyDeck,
    dailyDeck.setDailyDeck,
    posthog
  );

  useDataSync({
    firebase,
    cards: cards.cards,
    dailyDeck: dailyDeck.dailyDeck,
    templates: templates.templates,
    setCards: cards.setCards,
    setDailyDeck: dailyDeck.setDailyDeck,
    setTemplates: templates.setTemplates,
    posthog,
  });

  const value: AppContextValue = {
    firebase,
    cards,
    dailyDeck,
    templates,
    dragAndDrop,
    posthog,
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
