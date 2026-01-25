import type { ReactNode } from 'react';
import { useFirebase } from '../hooks/useFirebase';
import { useDataSync } from '../hooks/useDataSync';
import { useCardsContext } from './CardsContext';
import { useDailyDeckContext } from './DailyDeckContext';
import { useTemplatesContext } from './TemplatesContext';
import { useDayCompletionContext } from './DayCompletionContext';
import { SyncContext, type SyncContextValue } from './SyncContext';

interface SyncProviderProps {
  children: ReactNode;
}

export function SyncProvider({ children }: SyncProviderProps) {
  const firebase = useFirebase();
  const { cards, setCards } = useCardsContext();
  const {
    dailyDeck,
    setDailyDeck,
    deckDate,
    setDeckDate,
    deckLastEditedDate,
    setDeckLastEditedDate,
  } = useDailyDeckContext();
  const { templates, setTemplates } = useTemplatesContext();
  const { dayCompletions, userStreak, setDayCompletions, setUserStreak } =
    useDayCompletionContext();

  const sync = useDataSync({
    firebase,
    cards,
    dailyDeck,
    deckDate,
    deckLastEditedDate,
    templates,
    dayCompletions,
    userStreak,
    setCards,
    setDailyDeck,
    setDeckDate,
    setDeckLastEditedDate,
    setTemplates,
    setDayCompletions,
    setUserStreak,
  });

  const value: SyncContextValue = {
    firebase,
    sync,
  };

  return <SyncContext.Provider value={value}>{children}</SyncContext.Provider>;
}
