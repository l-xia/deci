import { createContext, useContext, type ReactNode } from 'react';
import { useDayCompletion } from '../hooks/useDayCompletion';

type DayCompletionContextValue = ReturnType<typeof useDayCompletion>;

const DayCompletionContext = createContext<DayCompletionContextValue | null>(
  null
);

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

export function useDayCompletionContext() {
  const context = useContext(DayCompletionContext);
  if (!context) {
    throw new Error(
      'useDayCompletionContext must be used within a DayCompletionProvider'
    );
  }
  return context;
}
