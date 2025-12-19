import { createContext, useContext, type ReactNode } from 'react';
import { useFirebase } from '../hooks/useFirebase';
import { useDataSync } from '../hooks/useDataSync';
import { useCardsContext } from './CardsContext';
import { useDailyDeckContext } from './DailyDeckContext';
import { useTemplatesContext } from './TemplatesContext';
import { useDayCompletionContext } from './DayCompletionContext';

type FirebaseState = ReturnType<typeof useFirebase>;
type DataSyncState = ReturnType<typeof useDataSync>;

interface SyncContextValue {
  firebase: FirebaseState;
  sync: DataSyncState;
}

const SyncContext = createContext<SyncContextValue | null>(null);

interface SyncProviderProps {
  children: ReactNode;
}

export function SyncProvider({ children }: SyncProviderProps) {
  const firebase = useFirebase();
  const { cards, setCards } = useCardsContext();
  const { dailyDeck, setDailyDeck } = useDailyDeckContext();
  const { templates, setTemplates } = useTemplatesContext();
  const { dayCompletions, userStreak, setDayCompletions, setUserStreak } =
    useDayCompletionContext();

  const sync = useDataSync({
    firebase,
    cards,
    dailyDeck,
    templates,
    dayCompletions,
    userStreak,
    setCards,
    setDailyDeck,
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

export function useSyncContext() {
  const context = useContext(SyncContext);
  if (!context) {
    throw new Error('useSyncContext must be used within a SyncProvider');
  }
  return context;
}
