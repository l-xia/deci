import type { ReactNode } from 'react';
import { CardsProvider } from './CardsProvider';
import { DailyDeckProvider } from './DailyDeckProvider';
import { GlobalTimerProvider } from './GlobalTimerProvider';
import { TemplatesProvider } from './TemplatesProvider';
import { DayCompletionProvider } from './DayCompletionProvider';
import { SyncProvider } from './SyncProvider';

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
