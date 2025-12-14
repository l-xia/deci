import { createContext, useContext, type ReactNode } from 'react';
import { useTemplates } from '../hooks/useTemplates';
import type { Template } from '../types';

type TemplatesContextValue = ReturnType<typeof useTemplates>;

const TemplatesContext = createContext<TemplatesContextValue | null>(null);

interface TemplatesProviderProps {
  children: ReactNode;
  initialTemplates?: Template[];
}

export function TemplatesProvider({
  children,
  initialTemplates = [],
}: TemplatesProviderProps) {
  const templatesState = useTemplates(initialTemplates);

  return (
    <TemplatesContext.Provider value={templatesState}>
      {children}
    </TemplatesContext.Provider>
  );
}

export function useTemplatesContext() {
  const context = useContext(TemplatesContext);
  if (!context) {
    throw new Error(
      'useTemplatesContext must be used within a TemplatesProvider'
    );
  }
  return context;
}
