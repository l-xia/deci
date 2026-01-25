import type { Template } from '../../types';
import TemplateManager from '../TemplateManager';
import { EllipsisVerticalIcon } from '@heroicons/react/24/outline';
import {
  parseISO,
  startOfDay,
  subDays,
  addDays,
  isSameDay,
  format,
} from 'date-fns';

interface DailyDeckHeaderProps {
  menuOpen: boolean;
  onMenuToggle: () => void;
  onMenuClose: () => void;
  templates: Template[];
  onSaveTemplate: (name: string) => void;
  onLoadTemplate: (templateId: string) => void;
  onDeleteTemplate: (templateId: string) => void;
  onArchiveTemplate: (templateId: string) => void;
  onResetToToday: () => void;
  hasDailyDeck: boolean;
  onCompleteDay?: (() => void) | undefined;
  deckDate: string | null;
  deckLastEditedDate: string | null;
}

function DailyDeckHeader({
  menuOpen,
  onMenuToggle,
  onMenuClose,
  templates,
  onSaveTemplate,
  onLoadTemplate,
  onDeleteTemplate,
  onArchiveTemplate,
  onResetToToday,
  hasDailyDeck,
  onCompleteDay,
  deckDate,
  deckLastEditedDate,
}: DailyDeckHeaderProps) {
  const getDisplayDate = () => {
    const now = new Date();
    const today = startOfDay(now);
    const yesterday = startOfDay(subDays(today, 1));
    const tomorrow = startOfDay(addDays(today, 1));

    if (!deckDate) {
      return {
        label: 'Today',
        date: format(now, 'EEEE, MMM d'),
      };
    }

    const deck = parseISO(deckDate);
    const deckDay = startOfDay(deck);

    // Check if deck was edited yesterday
    const wasEditedYesterday =
      deckLastEditedDate && isSameDay(parseISO(deckLastEditedDate), yesterday);

    // If edited yesterday and deck is for yesterday, show "Yesterday's Deck"
    if (wasEditedYesterday && isSameDay(deckDay, yesterday)) {
      return {
        label: "Yesterday's Deck",
        date: format(deck, 'EEEE, MMM d'),
      };
    }

    // Standard logic
    let label = 'Today';
    if (isSameDay(deckDay, yesterday)) label = 'Yesterday';
    else if (isSameDay(deckDay, tomorrow)) label = 'Tomorrow';

    return {
      label,
      date: format(deck, 'EEEE, MMM d'),
    };
  };

  const displayDate = getDisplayDate();

  return (
    <div className="mb-4 flex-shrink-0 flex justify-between items-start">
      <div>
        <h2 className="text-2xl font-semibold text-gray-900 relative inline-block">
          <span className="relative z-10">{displayDate.label}</span>
          <span className="absolute bottom-0 left-0 right-0 h-2 bg-blue-300 opacity-50"></span>
        </h2>
        <p className="text-sm text-gray-500 mt-0.5">{displayDate.date}</p>
      </div>

      <div className="flex items-center gap-2">
        {onCompleteDay && hasDailyDeck && (
          <button
            onClick={onCompleteDay}
            className="px-3 py-1.5 bg-green-600 text-white text-sm font-medium rounded-md hover:bg-green-700 transition-colors"
          >
            Complete Day
          </button>
        )}

        <div className="relative">
          <button
            onClick={onMenuToggle}
            className="p-1 text-gray-600 hover:text-gray-900 transition-colors"
            title="Menu"
          >
            <EllipsisVerticalIcon className="w-6 h-6" />
          </button>

          {menuOpen && (
            <>
              <div className="fixed inset-0 z-10" onClick={onMenuClose} />
              <div className="absolute right-0 mt-2 w-80 bg-white border-2 border-gray-200 rounded-md shadow-lg z-20 max-h-96 overflow-y-auto">
                <TemplateManager
                  templates={templates}
                  onSave={onSaveTemplate}
                  onLoad={(templateId: string) => {
                    onLoadTemplate(templateId);
                    onMenuClose();
                  }}
                  onDelete={onDeleteTemplate}
                  onArchive={onArchiveTemplate}
                  onResetToToday={() => {
                    onResetToToday();
                    onMenuClose();
                  }}
                  hasDailyDeck={hasDailyDeck}
                />
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}

export default DailyDeckHeader;
