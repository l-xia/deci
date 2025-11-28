import { useState, useCallback } from 'react';
import type { Template, Card, CategoryKey } from '../types';
import { generateId } from '../utils/generateId';

export function useTemplates(initialTemplates: Template[] = []) {
  const [templates, setTemplates] = useState<Template[]>(initialTemplates);

  const saveTemplate = useCallback((name: string, dailyDeck: Card[]) => {
    const newTemplate: Template = {
      id: generateId('template'),
      name,
      cards: dailyDeck.map(card => ({
        id: card.id,
        sourceCategory: (card.sourceCategory || 'default') as CategoryKey,
      })),
      createdAt: new Date().toISOString(),
      cardCount: dailyDeck.length,
    };

    setTemplates(prev => [...prev, newTemplate]);

    return newTemplate;
  }, []);

  const deleteTemplate = useCallback((templateId: string) => {
    setTemplates(prev => prev.filter(t => t.id !== templateId));
  }, []);

  const updateTemplate = useCallback((
    templateId: string,
    updates: Partial<Omit<Template, 'id' | 'createdAt'>>
  ) => {
    setTemplates(prev =>
      prev.map(template =>
        template.id === templateId
          ? { ...template, ...updates, updatedAt: new Date().toISOString() }
          : template
      )
    );
  }, []);

  const getTemplate = useCallback((templateId: string): Template | undefined => {
    return templates.find(t => t.id === templateId);
  }, [templates]);

  const getTemplatesSorted = useCallback((ascending: boolean = false): Template[] => {
    return [...templates].sort((a, b) => {
      const dateA = new Date(a.createdAt).getTime();
      const dateB = new Date(b.createdAt).getTime();
      return ascending ? dateA - dateB : dateB - dateA;
    });
  }, [templates]);

  return {
    templates,
    setTemplates,
    saveTemplate,
    deleteTemplate,
    updateTemplate,
    getTemplate,
    getTemplatesSorted,
  };
}
