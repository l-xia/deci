/**
 * Custom hook for template management
 */

import { useState, useCallback } from 'react';

export function useTemplates(initialTemplates = []) {
  const [templates, setTemplates] = useState(initialTemplates);

  // Save current daily deck as a template
  const saveTemplate = useCallback((name, dailyDeck, posthog) => {
    const newTemplate = {
      id: `template-${Date.now()}-${Math.random().toString(36).substring(2, 11)}`,
      name,
      cards: dailyDeck.map((card) => ({
        id: card.id,
        sourceCategory: card.sourceCategory,
      })),
      createdAt: new Date().toISOString(),
      cardCount: dailyDeck.length,
    };

    setTemplates((prev) => [...prev, newTemplate]);

    posthog?.capture('template_created', {
      template_id: newTemplate.id,
      card_count: dailyDeck.length,
    });

    return newTemplate;
  }, []);

  // Delete a template
  const deleteTemplate = useCallback((templateId, posthog) => {
    setTemplates((prev) => {
      const template = prev.find((t) => t.id === templateId);

      posthog?.capture('template_deleted', {
        template_id: templateId,
        card_count: template?.cardCount || 0,
      });

      return prev.filter((t) => t.id !== templateId);
    });
  }, []);

  // Update a template (rename)
  const updateTemplate = useCallback((templateId, updates, posthog) => {
    setTemplates((prev) =>
      prev.map((template) =>
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

  // Get a template by ID
  const getTemplate = useCallback((templateId) => {
    return templates.find((t) => t.id === templateId);
  }, [templates]);

  // Get templates sorted by creation date
  const getTemplatesSorted = useCallback((ascending = false) => {
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
