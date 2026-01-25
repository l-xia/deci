import type { ReactNode } from 'react';
import { useDayCompletion } from '../hooks/useDayCompletion';
import { DayCompletionContext } from './DayCompletionContext';

interface DayCompletionProviderProps {
  children: ReactNode;
}

export function DayCompletionProvider({
  children,
}: DayCompletionProviderProps) {
  const dayCompletionState = useDayCompletion();

  return (
    <DayCompletionContext.Provider value={dayCompletionState}>
      {children}
    </DayCompletionContext.Provider>
  );
}
