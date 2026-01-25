import { createContext, useContext } from 'react';
import { useDayCompletion } from '../hooks/useDayCompletion';

export type DayCompletionContextValue = ReturnType<typeof useDayCompletion>;

export const DayCompletionContext =
  createContext<DayCompletionContextValue | null>(null);

export function useDayCompletionContext() {
  const context = useContext(DayCompletionContext);
  if (!context) {
    throw new Error(
      'useDayCompletionContext must be used within a DayCompletionProvider'
    );
  }
  return context;
}
