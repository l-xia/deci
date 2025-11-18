import { useState } from 'react';

function TemplateManager({ templates, onSave, onLoad, onDelete, hasDailyDeck }) {
  const [isSaving, setIsSaving] = useState(false);
  const [templateName, setTemplateName] = useState('');

  const handleSave = () => {
    if (templateName.trim()) {
      onSave(templateName.trim());
      setTemplateName('');
      setIsSaving(false);
    }
  };

  const handleLoad = (templateId) => {
    onLoad(templateId);
  };

  return (
    <div className="p-2">
      {/* Saved Templates List */}
      {templates.length > 0 && (
        <>
          <div className="text-xs font-medium text-gray-500 uppercase px-2 py-1 mb-1">
            Saved Templates
          </div>
          {templates.map((template) => (
            <div
              key={template.id}
              className="flex items-center justify-between p-2 hover:bg-gray-50 rounded-md group"
            >
              <button
                onClick={() => handleLoad(template.id)}
                className="flex-1 text-left"
              >
                <div className="font-medium text-gray-800 text-sm">
                  {template.name}
                </div>
                <div className="text-xs text-gray-500">
                  {template.cards.length} cards • {new Date(template.createdAt).toLocaleDateString()}
                </div>
              </button>
              <button
                onClick={() => {
                  if (confirm(`Delete template "${template.name}"?`)) {
                    onDelete(template.id);
                  }
                }}
                className="p-1 text-gray-400 hover:text-red-600 transition-colors opacity-0 group-hover:opacity-100"
                title="Delete template"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                </svg>
              </button>
            </div>
          ))}
        </>
      )}

      {/* Save Template Section */}
      {!isSaving ? (
        hasDailyDeck && (
          <>
            <div className="border-t border-gray-200 my-2"></div>

            <button
              onClick={() => setIsSaving(true)}
              className="w-full flex items-center gap-2 px-3 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 rounded-md transition-colors"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
              </svg>
              Save as new template
            </button>
          </>
        )
      ) : (
        <div className="p-2">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Template Name
          </label>
          <div className="flex flex-col gap-2">
            <input
              type="text"
              value={templateName}
              onChange={(e) => setTemplateName(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter') handleSave();
                if (e.key === 'Escape') {
                  setIsSaving(false);
                  setTemplateName('');
                }
              }}
              placeholder="e.g., Monday routine"
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500 text-sm"
              autoFocus
            />
            <div className="flex gap-2">
              <button
                onClick={handleSave}
                disabled={!templateName.trim()}
                className="flex-1 px-3 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed text-sm font-medium"
              >
                Save
              </button>
              <button
                onClick={() => {
                  setIsSaving(false);
                  setTemplateName('');
                }}
                className="flex-1 px-3 py-2 bg-gray-300 text-gray-700 rounded-md hover:bg-gray-400 transition-colors text-sm"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Empty State */}
      {templates.length === 0 && !hasDailyDeck && (
        <div className="p-4 text-center text-gray-500 text-sm">
          No templates yet. Add cards to your daily deck to save a template!
        </div>
      )}
    </div>
  );
}

export default TemplateManager;
