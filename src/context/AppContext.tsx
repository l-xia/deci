import type { ReactNode } from 'react';
import { CardsProvider } from './CardsContext';
import { DailyDeckProvider } from './DailyDeckContext';
import { GlobalTimerProvider } from './GlobalTimerContext';
import { TemplatesProvider } from './TemplatesContext';
import { DayCompletionProvider } from './DayCompletionContext';
import { SyncProvider } from './SyncContext';

interface AppProviderProps {
  children: ReactNode;
}

/**
 * Composed provider that sets up all application contexts in the correct order.
 *
 * Provider hierarchy (bottom-up dependency order):
 * 1. CardsProvider - No dependencies
 * 2. DailyDeckProvider - Depends on CardsProvider
 * 3. GlobalTimerProvider - Depends on DailyDeckProvider
 * 4. TemplatesProvider - No dependencies
 * 5. DayCompletionProvider - No dependencies
 * 6. SyncProvider - Depends on all above providers for Firebase sync
 */
export function AppProvider({ children }: AppProviderProps) {
  return (
    <CardsProvider>
      <DailyDeckProvider>
        <GlobalTimerProvider>
          <TemplatesProvider>
            <DayCompletionProvider>
              <SyncProvider>{children}</SyncProvider>
            </DayCompletionProvider>
          </TemplatesProvider>
        </GlobalTimerProvider>
      </DailyDeckProvider>
    </CardsProvider>
  );
}

// Re-export all context hooks for convenience
export { useCardsContext } from './CardsContext';
export { useDailyDeckContext } from './DailyDeckContext';
export { useGlobalTimerContext } from './GlobalTimerContext';
export { useTemplatesContext } from './TemplatesContext';
export { useDayCompletionContext } from './DayCompletionContext';
export { useSyncContext } from './SyncContext';
