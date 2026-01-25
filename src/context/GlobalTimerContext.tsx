import { createContext, useContext } from 'react';
import { useGlobalTimer } from '../hooks/useGlobalTimer';

export type GlobalTimerState = ReturnType<typeof useGlobalTimer>;

export const GlobalTimerContext = createContext<GlobalTimerState | null>(null);

export function useGlobalTimerContext() {
  const context = useContext(GlobalTimerContext);
  if (!context) {
    throw new Error(
      'useGlobalTimerContext must be used within a GlobalTimerProvider'
    );
  }
  return context;
}
