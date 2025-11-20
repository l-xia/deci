import { useState, useCallback } from 'react';
import type { PostHog } from 'posthog-js';
import type { Template, Card, CategoryKey } from '../types';
import { generateId } from '../utils/generateId';

export function useTemplates(initialTemplates: Template[] = []) {
  const [templates, setTemplates] = useState<Template[]>(initialTemplates);

  const saveTemplate = useCallback((name: string, dailyDeck: Card[], posthog: PostHog | null) => {
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

    posthog?.capture('template_created', {
      template_id: newTemplate.id,
      card_count: dailyDeck.length,
    });

    return newTemplate;
  }, []);

  const deleteTemplate = useCallback((templateId: string, posthog: PostHog | null) => {
    setTemplates(prev => {
      const template = prev.find(t => t.id === templateId);

      posthog?.capture('template_deleted', {
        template_id: templateId,
        card_count: template?.cardCount || 0,
      });

      return prev.filter(t => t.id !== templateId);
    });
  }, []);

  const updateTemplate = useCallback((
    templateId: string,
    updates: Partial<Omit<Template, 'id' | 'createdAt'>>,
    posthog: PostHog | null
  ) => {
    setTemplates(prev =>
      prev.map(template =>
        template.id === templateId
          ? { ...template, ...updates, updatedAt: new Date().toISOString() }
          : template
      )
    );

    posthog?.capture('template_updated', {
      template_id: templateId,
      updated_fields: Object.keys(updates),
    });
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
