import type { ReactNode } from 'react';
import { useTemplates } from '../hooks/useTemplates';
import type { Template } from '../types';
import { TemplatesContext } from './TemplatesContext';

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
