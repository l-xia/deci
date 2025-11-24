import { EllipsisHorizontalIcon } from '@heroicons/react/24/solid';
import type { Template } from '../../types';
import TemplateManager from '../TemplateManager';

interface DailyDeckHeaderProps {
  menuOpen: boolean;
  onMenuToggle: () => void;
  onMenuClose: () => void;
  templates: Template[];
  onSaveTemplate: (name: string) => void;
  onLoadTemplate: (templateId: string) => void;
  onDeleteTemplate: (templateId: string) => void;
  hasDailyDeck: boolean;
}

function DailyDeckHeader({
  menuOpen,
  onMenuToggle,
  onMenuClose,
  templates,
  onSaveTemplate,
  onLoadTemplate,
  onDeleteTemplate,
  hasDailyDeck,
}: DailyDeckHeaderProps) {
  return (
    <div className="mb-4 flex-shrink-0 flex justify-between items-start">
      <h2 className="text-2xl font-semibold text-gray-900 relative inline-block">
        <span className="relative z-10">Today</span>
        <span className="absolute bottom-0 left-0 right-0 h-2 bg-blue-300 opacity-50"></span>
      </h2>

      <div className="relative">
        <button
          onClick={onMenuToggle}
          className="p-2 text-gray-600 hover:text-gray-900 transition-colors"
          title="Menu"
        >
          <EllipsisHorizontalIcon className="w-6 h-6" />
        </button>

        {menuOpen && (
          <>
            <div
              className="fixed inset-0 z-10"
              onClick={onMenuClose}
            />
            <div className="absolute right-0 mt-2 w-80 bg-white border-2 border-gray-200 rounded-md shadow-lg z-20 max-h-96 overflow-y-auto">
              <TemplateManager
                templates={templates}
                onSave={onSaveTemplate}
                onLoad={(templateId: string) => {
                  onLoadTemplate(templateId);
                  onMenuClose();
                }}
                onDelete={onDeleteTemplate}
                hasDailyDeck={hasDailyDeck}
              />
            </div>
          </>
        )}
      </div>
    </div>
  );
}

export default DailyDeckHeader;
