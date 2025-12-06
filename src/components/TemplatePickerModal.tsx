import { XMarkIcon } from '@heroicons/react/24/outline';
import type { Template } from '../types/template';

interface TemplatePickerModalProps {
  templates: Template[];
  onSelectTemplate: (templateId: string) => void;
  onSkip: () => void;
  onClose: () => void;
}

export function TemplatePickerModal({ templates, onSelectTemplate, onSkip, onClose }: TemplatePickerModalProps) {
  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 backdrop-blur-sm flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-lg shadow-2xl max-w-md w-full">
        <div className="p-6 border-b border-gray-200 flex justify-between items-start">
          <div>
            <h2 className="text-2xl font-bold text-gray-900">Start New Day</h2>
            <p className="text-sm text-gray-500 mt-1">Choose a template or start fresh</p>
          </div>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600 transition-colors">
            <XMarkIcon className="w-6 h-6" />
          </button>
        </div>

        <div className="p-6 space-y-3 max-h-96 overflow-y-auto">
          {templates.length === 0 ? (
            <p className="text-gray-500 text-center py-4">No templates saved yet</p>
          ) : (
            templates.map(template => (
              <button
                key={template.id}
                onClick={() => {
                  onSelectTemplate(template.id);
                  onClose();
                }}
                className="w-full text-left p-4 border border-gray-200 rounded-lg hover:border-blue-500 hover:bg-blue-50 transition-colors"
              >
                <div className="font-semibold text-gray-900">{template.name}</div>
                <div className="text-sm text-gray-500 mt-1">
                  {template.cardCount} card{template.cardCount !== 1 ? 's' : ''}
                </div>
              </button>
            ))
          )}
        </div>

        <div className="p-6 border-t border-gray-200 flex gap-3">
          <button
            onClick={() => {
              onSkip();
              onClose();
            }}
            className="flex-1 px-4 py-3 border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50 transition-colors font-medium"
          >
            Start Fresh
          </button>
        </div>
      </div>
    </div>
  );
}
