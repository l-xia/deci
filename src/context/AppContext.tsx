import type { ReactNode } from 'react';
import { CardsProvider } from './CardsContext';
import { DailyDeckProvider } from './DailyDeckContext';
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
 * 3. TemplatesProvider - No dependencies
 * 4. DayCompletionProvider - No dependencies
 * 5. SyncProvider - Depends on all above providers for Firebase sync
 */
export function AppProvider({ children }: AppProviderProps) {
  return (
    <CardsProvider>
      <DailyDeckProvider>
        <TemplatesProvider>
          <DayCompletionProvider>
            <SyncProvider>{children}</SyncProvider>
          </DayCompletionProvider>
        </TemplatesProvider>
      </DailyDeckProvider>
    </CardsProvider>
  );
}

// Re-export all context hooks for convenience
export { useCardsContext } from './CardsContext';
export { useDailyDeckContext } from './DailyDeckContext';
export { useTemplatesContext } from './TemplatesContext';
export { useDayCompletionContext } from './DayCompletionContext';
export { useSyncContext } from './SyncContext';
