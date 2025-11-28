import { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import type { Card } from '../types';
import { VALIDATION_RULES } from '../utils/validators';
import { cardSchema, type CardFormData } from '../utils/validation/schemas';
import { XMarkIcon } from '@heroicons/react/24/outline';
import { ScheduleSelector } from './ScheduleSelector';
import { SCHEDULE_PRESETS } from '../utils/scheduling';

interface CardModalProps {
  card?: Card | null;
  onSave: (cardData: Partial<Card>) => void;
  onClose: () => void;
}

function CardModal({ card, onSave, onClose }: CardModalProps) {
  const [scheduleType, setScheduleType] = useState<'daily' | 'weekly' | 'monthly'>('daily');
  const [scheduleDays, setScheduleDays] = useState<number[]>([]);

  const {
    register,
    handleSubmit,
    formState: { errors },
    watch,
    reset,
    setValue,
  } = useForm<CardFormData>({
    resolver: zodResolver(cardSchema),
    mode: 'onBlur',
    defaultValues: {
      title: '',
      description: '',
      duration: '',
      recurrenceType: 'always',
      maxUses: '',
      scheduleType: 'daily',
      scheduleDays: [],
    },
  });

  const recurrenceType = watch('recurrenceType');
  const title = watch('title');
  const description = watch('description');

  useEffect(() => {
    if (card) {
      reset({
        title: card.title || '',
        description: card.description || '',
        duration: card.duration ? String(card.duration) : '',
        recurrenceType: card.recurrenceType || 'always',
        maxUses: card.maxUses ? String(card.maxUses) : '',
      });
    }
  }, [card, reset]);

  const onSubmit = (data: CardFormData) => {
    const cardData: Partial<Card> = {
      title: data.title.trim(),
      description: data.description?.trim() || '',
      recurrenceType: data.recurrenceType,
      timesUsed: card?.timesUsed || 0,
    };

    if (data.duration) {
      cardData.duration = Number(data.duration);
    }

    if (data.maxUses) {
      cardData.maxUses = Number(data.maxUses);
    }

    // Handle scheduled recurrence
    if (data.recurrenceType === 'scheduled' && data.scheduleType) {
      let rruleString = '';

      if (data.scheduleType === 'daily') {
        rruleString = SCHEDULE_PRESETS.daily;
      } else if (data.scheduleType === 'weekly' && scheduleDays.length > 0) {
        rruleString = SCHEDULE_PRESETS.weekly(scheduleDays);
      } else if (data.scheduleType === 'monthly' && scheduleDays.length > 0) {
        rruleString = SCHEDULE_PRESETS.monthly(scheduleDays);
      }

      if (rruleString) {
        cardData.scheduleConfig = { rrule: rruleString };
      }
    }

    onSave(cardData);
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-md shadow-2xl max-w-md w-full p-6">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-2xl font-bold text-gray-800">
            {card ? 'Edit Card' : 'New Card'}
          </h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors"
          >
            <XMarkIcon className="w-6 h-6" />
          </button>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div>
            <label htmlFor="title" className="block text-sm font-medium text-gray-700 mb-1">
              Title <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              id="title"
              {...register('title')}
              maxLength={VALIDATION_RULES.TITLE_MAX_LENGTH}
              className={`w-full px-3 py-2 border rounded-md focus:ring-2 focus:border-transparent ${
                errors.title
                  ? 'border-red-500 focus:ring-red-500'
                  : 'border-gray-300 focus:ring-blue-500'
              }`}
              placeholder="e.g., Walk the dog"
            />
            <div className="flex justify-between items-center mt-1">
              {errors.title ? (
                <p className="text-xs text-red-500">
                  {errors.title.message}
                </p>
              ) : (
                <div></div>
              )}
              <span className="text-xs text-gray-400">
                {title?.length || 0}/{VALIDATION_RULES.TITLE_MAX_LENGTH}
              </span>
            </div>
          </div>

          <div>
            <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-1">
              Description
            </label>
            <textarea
              id="description"
              {...register('description')}
              maxLength={VALIDATION_RULES.DESCRIPTION_MAX_LENGTH}
              rows={3}
              className={`w-full px-3 py-2 border rounded-md focus:ring-2 focus:border-transparent resize-none ${
                errors.description
                  ? 'border-red-500 focus:ring-red-500'
                  : 'border-gray-300 focus:ring-blue-500'
              }`}
              placeholder="Optional details..."
            />
            <div className="flex justify-between items-center mt-1">
              {errors.description ? (
                <p className="text-xs text-red-500">
                  {errors.description.message}
                </p>
              ) : (
                <div></div>
              )}
              <span className="text-xs text-gray-400">
                {description?.length || 0}/{VALIDATION_RULES.DESCRIPTION_MAX_LENGTH}
              </span>
            </div>
          </div>

          <div>
            <label htmlFor="duration" className="block text-sm font-medium text-gray-700 mb-1">
              Suggested Duration (minutes)
            </label>
            <input
              type="number"
              id="duration"
              {...register('duration')}
              min={VALIDATION_RULES.DURATION_MIN}
              max={VALIDATION_RULES.DURATION_MAX}
              className={`w-full px-3 py-2 border rounded-md focus:ring-2 focus:border-transparent ${
                errors.duration
                  ? 'border-red-500 focus:ring-red-500'
                  : 'border-gray-300 focus:ring-blue-500'
              }`}
              placeholder="e.g., 30"
            />
            {errors.duration ? (
              <p className="text-xs text-red-500 mt-1">
                {errors.duration.message}
              </p>
            ) : (
              <p className="text-xs text-gray-500 mt-1">
                Between {VALIDATION_RULES.DURATION_MIN} and {VALIDATION_RULES.DURATION_MAX} minutes
              </p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Recurrence Type
            </label>
            <div className="space-y-2">
              <label className="flex items-start gap-2 cursor-pointer">
                <input
                  type="radio"
                  value="always"
                  {...register('recurrenceType')}
                  className="mt-1"
                />
                <div>
                  <div className="font-medium text-sm">Always Available</div>
                  <div className="text-xs text-gray-500">Can be added to daily deck unlimited times (e.g., Reading)</div>
                </div>
              </label>

              <label className="flex items-start gap-2 cursor-pointer">
                <input
                  type="radio"
                  value="limited"
                  {...register('recurrenceType')}
                  className="mt-1"
                />
                <div className="flex-1">
                  <div className="font-medium text-sm">Limited Uses</div>
                  <div className="text-xs text-gray-500 mb-1">Can be added X times per day (e.g., Walk dog 3x)</div>
                  {recurrenceType === 'limited' && (
                    <div className="mt-1">
                      <input
                        type="number"
                        {...register('maxUses')}
                        min={VALIDATION_RULES.MAX_USES_MIN}
                        max={VALIDATION_RULES.MAX_USES_MAX}
                        className={`w-20 px-2 py-1 border rounded-md text-sm ${
                          errors.maxUses
                            ? 'border-red-500'
                            : 'border-gray-300'
                        }`}
                        placeholder="3"
                      />
                      {errors.maxUses && (
                        <p className="text-xs text-red-500 mt-1">
                          {errors.maxUses.message}
                        </p>
                      )}
                    </div>
                  )}
                </div>
              </label>

              <label className="flex items-start gap-2 cursor-pointer">
                <input
                  type="radio"
                  value="once"
                  {...register('recurrenceType')}
                  className="mt-1"
                />
                <div>
                  <div className="font-medium text-sm">One-Time Only</div>
                  <div className="text-xs text-gray-500">Disappears after being added once (e.g., Take out trash)</div>
                </div>
              </label>

              <label className="flex items-start gap-2 cursor-pointer">
                <input
                  type="radio"
                  value="scheduled"
                  {...register('recurrenceType')}
                  className="mt-1"
                />
                <div className="flex-1">
                  <div className="font-medium text-sm">Scheduled</div>
                  <div className="text-xs text-gray-500 mb-2">Only available on specific days (e.g., Team meeting every Monday)</div>
                  {recurrenceType === 'scheduled' && (
                    <div className="mt-2 p-3 bg-gray-50 rounded-md">
                      <ScheduleSelector
                        scheduleType={scheduleType}
                        selectedDays={scheduleDays}
                        onChange={(days) => {
                          setScheduleDays(days);
                          setValue('scheduleDays', days);
                        }}
                        onScheduleTypeChange={(type) => {
                          setScheduleType(type);
                          setScheduleDays([]);
                          setValue('scheduleType', type);
                          setValue('scheduleDays', []);
                        }}
                      />
                      {errors.scheduleDays && (
                        <p className="text-xs text-red-500 mt-2">
                          {errors.scheduleDays.message}
                        </p>
                      )}
                    </div>
                  )}
                </div>
              </label>
            </div>
          </div>

          <div className="flex gap-3 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="flex-1 px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 transition-colors"
            >
              {card ? 'Save' : 'Create'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default CardModal;
