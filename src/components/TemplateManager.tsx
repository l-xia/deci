import { useState } from 'react';
import { useForm, useWatch } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import type { Template } from '../types';
import { VALIDATION_RULES } from '../utils/validators';
import { FormFieldCounter } from './FormFieldCounter';
import {
  TrashIcon,
  PlusIcon,
  ArchiveBoxIcon,
} from '@heroicons/react/24/outline';

interface TemplateManagerProps {
  templates: Template[];
  onSave: (name: string) => void;
  onLoad: (templateId: string) => void;
  onDelete: (templateId: string) => void;
  onArchive: (templateId: string) => void;
  onResetToToday: () => void;
  hasDailyDeck: boolean;
}

const templateSchema = z.object({
  name: z
    .string()
    .min(VALIDATION_RULES.TEMPLATE_NAME_MIN_LENGTH, 'Template name is required')
    .max(
      VALIDATION_RULES.TEMPLATE_NAME_MAX_LENGTH,
      `Template name must be at most ${VALIDATION_RULES.TEMPLATE_NAME_MAX_LENGTH} characters`
    ),
});

type TemplateFormData = z.infer<typeof templateSchema>;

function TemplateManager({
  templates,
  onSave,
  onLoad,
  onDelete,
  onArchive,
  onResetToToday,
  hasDailyDeck,
}: TemplateManagerProps) {
  const [isSaving, setIsSaving] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
    control,
    reset,
  } = useForm<TemplateFormData>({
    resolver: zodResolver(templateSchema),
    mode: 'onBlur',
    defaultValues: {
      name: '',
    },
  });

  const templateName = useWatch({ control, name: 'name' });

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
      <div className="text-xs font-medium text-gray-500 uppercase px-2 py-1 mb-1">
        Controls
      </div>
      {/* Reset to Today */}
      <button
        onClick={onResetToToday}
        className="w-full flex items-center gap-2 px-2 py-2 text-sm text-red-700 hover:bg-gray-50 rounded-md transition-colors"
      >
        Reset to Today
      </button>

      <div className="border-t border-gray-200 my-2"></div>

      {/* Saved Templates List */}
      {templates.filter((t) => !t.archived).length > 0 && (
        <>
          <div className="text-xs font-medium text-gray-500 uppercase px-2 py-1 mb-1">
            Saved Templates
          </div>
          {templates
            .filter((t) => !t.archived)
            .map((template: Template) => (
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
                    {template.cards.length} cards •{' '}
                    {new Date(template.createdAt).toLocaleDateString()}
                  </div>
                </button>
                <div className="flex items-center gap-1">
                  <button
                    onClick={() => {
                      if (confirm(`Archive template "${template.name}"?`)) {
                        onArchive(template.id);
                      }
                    }}
                    className="p-1 text-gray-400 hover:text-yellow-600 transition-colors opacity-0 group-hover:opacity-100"
                    title="Archive template"
                  >
                    <ArchiveBoxIcon className="w-4 h-4" />
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
                    <TrashIcon className="w-4 h-4" />
                  </button>
                </div>
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
              <PlusIcon className="w-4 h-4" />
              Save as new template
            </button>
          </>
        )
      ) : (
        <form onSubmit={handleSubmit(onSubmit)} className="p-2">
          <label
            htmlFor="name"
            className="block text-sm font-medium text-gray-700 mb-2"
          >
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
            <FormFieldCounter
              error={errors.name?.message}
              currentLength={templateName?.length || 0}
              maxLength={VALIDATION_RULES.TEMPLATE_NAME_MAX_LENGTH}
            />
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
      {templates.filter((t) => !t.archived).length === 0 && !hasDailyDeck && (
        <div className="p-4 text-center text-gray-500 text-sm">
          No templates yet. Add cards to your daily deck to save a template!
        </div>
      )}
    </div>
  );
}

export default TemplateManager;
