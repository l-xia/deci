import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import type { Template } from '../types';
import { VALIDATION_RULES } from '../utils/validators';

interface TemplateManagerProps {
  templates: Template[];
  onSave: (name: string) => void;
  onLoad: (templateId: string) => void;
  onDelete: (templateId: string) => void;
  hasDailyDeck: boolean;
}

const templateSchema = z.object({
  name: z.string()
    .min(VALIDATION_RULES.TEMPLATE_NAME_MIN_LENGTH, 'Template name is required')
    .max(VALIDATION_RULES.TEMPLATE_NAME_MAX_LENGTH, `Template name must be at most ${VALIDATION_RULES.TEMPLATE_NAME_MAX_LENGTH} characters`),
});

type TemplateFormData = z.infer<typeof templateSchema>;

function TemplateManager({ templates, onSave, onLoad, onDelete, hasDailyDeck }: TemplateManagerProps) {
  const [isSaving, setIsSaving] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
    watch,
    reset,
  } = useForm<TemplateFormData>({
    resolver: zodResolver(templateSchema),
    mode: 'onBlur',
    defaultValues: {
      name: '',
    },
  });

  const templateName = watch('name');

  const onSubmit = (data: TemplateFormData) => {
    onSave(data.name.trim());
    reset();
    setIsSaving(false);
  };

  const handleLoad = (templateId: string) => {
    onLoad(templateId);
  };

  const handleCancel = () => {
    setIsSaving(false);
    reset();
  };

  return (
    <div className="p-2">
      {/* Saved Templates List */}
      {templates.length > 0 && (
        <>
          <div className="text-xs font-medium text-gray-500 uppercase px-2 py-1 mb-1">
            Saved Templates
          </div>
          {templates.map((template: Template) => (
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
        <form onSubmit={handleSubmit(onSubmit)} className="p-2">
          <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-2">
            Template Name
          </label>
          <div className="flex flex-col gap-2">
            <input
              type="text"
              id="name"
              {...register('name')}
              maxLength={VALIDATION_RULES.TEMPLATE_NAME_MAX_LENGTH}
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  e.preventDefault();
                  handleSubmit(onSubmit)();
                }
                if (e.key === 'Escape') {
                  handleCancel();
                }
              }}
              placeholder="e.g., Monday routine"
              className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 text-sm ${
                errors.name
                  ? 'border-red-500 focus:ring-red-500'
                  : 'border-gray-300 focus:ring-green-500'
              }`}
              autoFocus
            />
            <div className="flex justify-between items-center">
              {errors.name ? (
                <p className="text-xs text-red-500">
                  {errors.name.message}
                </p>
              ) : (
                <div></div>
              )}
              <span className="text-xs text-gray-400">
                {templateName?.length || 0}/{VALIDATION_RULES.TEMPLATE_NAME_MAX_LENGTH}
              </span>
            </div>
            <div className="flex gap-2">
              <button
                type="submit"
                disabled={!templateName?.trim()}
                className="flex-1 px-3 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed text-sm font-medium"
              >
                Save
              </button>
              <button
                type="button"
                onClick={handleCancel}
                className="flex-1 px-3 py-2 bg-gray-300 text-gray-700 rounded-md hover:bg-gray-400 transition-colors text-sm"
              >
                Cancel
              </button>
            </div>
          </div>
        </form>
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
