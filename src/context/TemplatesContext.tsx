import { createContext, useContext } from 'react';
import { useTemplates } from '../hooks/useTemplates';

export type TemplatesContextValue = ReturnType<typeof useTemplates>;

export const TemplatesContext = createContext<TemplatesContextValue | null>(
  null
);

export function useTemplatesContext() {
  const context = useContext(TemplatesContext);
  if (!context) {
    throw new Error(
      'useTemplatesContext must be used within a TemplatesProvider'
    );
  }
  return context;
}
