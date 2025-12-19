import { useState, useCallback } from 'react';
import DailyDeck from '../DailyDeck';
import { DayCompletionModal } from '../DayCompletionModal';
import { TemplatePickerModal } from '../TemplatePickerModal';
import type { Card, Template } from '../../types';
import type {
  DayCompletionSummary,
  UserStreak,
} from '../../types/dayCompletion';

interface DailyDeckManagerProps {
  cards: Card[];
  templates: Template[];
  onSaveTemplate: (name: string) => void;
  onLoadTemplate: (templateId: string) => void;
  onDeleteTemplate: (templateId: string) => void;
  onUpdateCard: (index: number, updates: Partial<Card>) => void;
  onEditCard: (index: number) => void;
  onOneTimeEditCard: (index: number) => void;
  onReturnToStack: (index: number) => void;
  onCompleteDay: () => void;
  onClearDailyDeck: () => void;
}

/**
 * Manages daily deck display and completion flow
 * Handles day completion modal and template picker modal
 */
export function DailyDeckManager({
  cards,
  templates,
  onSaveTemplate,
  onLoadTemplate,
  onDeleteTemplate,
  onUpdateCard,
  onEditCard,
  onOneTimeEditCard,
  onReturnToStack,
  onCompleteDay,
  onClearDailyDeck,
}: DailyDeckManagerProps) {
  const [showDayCompletionModal, setShowDayCompletionModal] = useState(false);
  const [showTemplatePickerModal, setShowTemplatePickerModal] = useState(false);
  const [_completionData, _setCompletionData] = useState<{
    summary: DayCompletionSummary;
    streak: UserStreak;
  } | null>(null);

  const handleCompleteDay = useCallback(() => {
    // Call parent's onCompleteDay which returns completion data
    onCompleteDay();
    // Note: In the refactored version, we'll need to pass completion data back
    // For now, parent will handle showing the modal
  }, [onCompleteDay]);

  return (
    <>
      <DailyDeck
        cards={cards}
        templates={templates}
        onSaveTemplate={onSaveTemplate}
        onLoadTemplate={onLoadTemplate}
        onDeleteTemplate={onDeleteTemplate}
        onUpdateCard={onUpdateCard}
        onEditCard={onEditCard}
        onOneTimeEditCard={onOneTimeEditCard}
        onReturnToStack={onReturnToStack}
        onCompleteDay={handleCompleteDay}
      />

      {showDayCompletionModal && _completionData && (
        <DayCompletionModal
          summary={_completionData.summary}
          streak={_completionData.streak}
          onClose={() => setShowDayCompletionModal(false)}
          onStartNewDay={() => {
            setShowDayCompletionModal(false);
            if (templates.length > 0) {
              setShowTemplatePickerModal(true);
            } else {
              onClearDailyDeck();
            }
          }}
        />
      )}

      {showTemplatePickerModal && (
        <TemplatePickerModal
          templates={templates}
          onSelectTemplate={(templateId) => {
            onLoadTemplate(templateId);
            setShowTemplatePickerModal(false);
          }}
          onSkip={() => {
            onClearDailyDeck();
            setShowTemplatePickerModal(false);
          }}
          onClose={() => setShowTemplatePickerModal(false)}
        />
      )}
    </>
  );
}
