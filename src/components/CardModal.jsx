import { useState, useEffect } from 'react';
import {
  validateTitle,
  validateDescription,
  validateDuration,
  validateMaxUses,
  VALIDATION_RULES,
} from '../utils/validators';

function CardModal({ category, card, onSave, onClose }) {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [duration, setDuration] = useState('');
  const [recurrenceType, setRecurrenceType] = useState('always');
  const [maxUses, setMaxUses] = useState('');

  const [errors, setErrors] = useState({
    title: null,
    description: null,
    duration: null,
    maxUses: null,
  });

  const [touched, setTouched] = useState({
    title: false,
    description: false,
    duration: false,
    maxUses: false,
  });

  useEffect(() => {
    if (card) {
      setTitle(card.title || '');
      setDescription(card.description || '');
      setDuration(card.duration || '');
      setRecurrenceType(card.recurrenceType || 'always');
      setMaxUses(card.maxUses || '');
    }
  }, [card]);

  useEffect(() => {
    const titleValidation = validateTitle(title);
    const descriptionValidation = validateDescription(description);
    const durationValidation = validateDuration(duration);
    const maxUsesValidation = recurrenceType === 'limited' ? validateMaxUses(maxUses) : { valid: true, error: null };

    setErrors({
      title: titleValidation.error,
      description: descriptionValidation.error,
      duration: durationValidation.error,
      maxUses: maxUsesValidation.error,
    });
  }, [title, description, duration, maxUses, recurrenceType]);

  const handleBlur = (field) => {
    setTouched((prev) => ({ ...prev, [field]: true }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    // Mark all fields as touched
    setTouched({
      title: true,
      description: true,
      duration: true,
      maxUses: true,
    });

    // Validate all fields
    const titleValidation = validateTitle(title);
    const descriptionValidation = validateDescription(description);
    const durationValidation = validateDuration(duration);
    const maxUsesValidation = recurrenceType === 'limited' ? validateMaxUses(maxUses) : { valid: true, error: null, value: null };

    // Check if all validations passed
    if (!titleValidation.valid || !descriptionValidation.valid || !durationValidation.valid || !maxUsesValidation.valid) {
      return; // Don't submit if there are errors
    }

    onSave({
      title: titleValidation.sanitized,
      description: descriptionValidation.sanitized,
      duration: durationValidation.value,
      recurrenceType,
      maxUses: maxUsesValidation.value,
      timesUsed: card?.timesUsed || 0,
    });
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
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label htmlFor="title" className="block text-sm font-medium text-gray-700 mb-1">
              Title <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              id="title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              onBlur={() => handleBlur('title')}
              maxLength={VALIDATION_RULES.TITLE_MAX_LENGTH}
              className={`w-full px-3 py-2 border rounded-md focus:ring-2 focus:border-transparent ${
                touched.title && errors.title
                  ? 'border-red-500 focus:ring-red-500'
                  : 'border-gray-300 focus:ring-blue-500'
              }`}
              placeholder="e.g., Walk the dog"
              aria-required="true"
              aria-invalid={touched.title && errors.title ? 'true' : 'false'}
              aria-describedby={touched.title && errors.title ? 'title-error' : undefined}
            />
            <div className="flex justify-between items-center mt-1">
              {touched.title && errors.title ? (
                <p id="title-error" className="text-xs text-red-500" role="alert">
                  {errors.title}
                </p>
              ) : (
                <div></div>
              )}
              <span className="text-xs text-gray-400">
                {title.length}/{VALIDATION_RULES.TITLE_MAX_LENGTH}
              </span>
            </div>
          </div>

          <div>
            <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-1">
              Description
            </label>
            <textarea
              id="description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              onBlur={() => handleBlur('description')}
              maxLength={VALIDATION_RULES.DESCRIPTION_MAX_LENGTH}
              rows="3"
              className={`w-full px-3 py-2 border rounded-md focus:ring-2 focus:border-transparent resize-none ${
                touched.description && errors.description
                  ? 'border-red-500 focus:ring-red-500'
                  : 'border-gray-300 focus:ring-blue-500'
              }`}
              placeholder="Optional details..."
              aria-invalid={touched.description && errors.description ? 'true' : 'false'}
              aria-describedby={touched.description && errors.description ? 'description-error' : undefined}
            />
            <div className="flex justify-between items-center mt-1">
              {touched.description && errors.description ? (
                <p id="description-error" className="text-xs text-red-500" role="alert">
                  {errors.description}
                </p>
              ) : (
                <div></div>
              )}
              <span className="text-xs text-gray-400">
                {description.length}/{VALIDATION_RULES.DESCRIPTION_MAX_LENGTH}
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
              value={duration}
              onChange={(e) => setDuration(e.target.value)}
              onBlur={() => handleBlur('duration')}
              min={VALIDATION_RULES.DURATION_MIN}
              max={VALIDATION_RULES.DURATION_MAX}
              className={`w-full px-3 py-2 border rounded-md focus:ring-2 focus:border-transparent ${
                touched.duration && errors.duration
                  ? 'border-red-500 focus:ring-red-500'
                  : 'border-gray-300 focus:ring-blue-500'
              }`}
              placeholder="e.g., 30"
              aria-invalid={touched.duration && errors.duration ? 'true' : 'false'}
              aria-describedby={touched.duration && errors.duration ? 'duration-error' : 'duration-help'}
            />
            {touched.duration && errors.duration ? (
              <p id="duration-error" className="text-xs text-red-500 mt-1" role="alert">
                {errors.duration}
              </p>
            ) : (
              <p id="duration-help" className="text-xs text-gray-500 mt-1">
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
                  name="recurrence"
                  value="always"
                  checked={recurrenceType === 'always'}
                  onChange={(e) => setRecurrenceType(e.target.value)}
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
                  name="recurrence"
                  value="limited"
                  checked={recurrenceType === 'limited'}
                  onChange={(e) => setRecurrenceType(e.target.value)}
                  className="mt-1"
                />
                <div className="flex-1">
                  <div className="font-medium text-sm">Limited Uses</div>
                  <div className="text-xs text-gray-500 mb-1">Can be added X times per day (e.g., Walk dog 3x)</div>
                  {recurrenceType === 'limited' && (
                    <div className="mt-1">
                      <input
                        type="number"
                        value={maxUses}
                        onChange={(e) => setMaxUses(e.target.value)}
                        onBlur={() => handleBlur('maxUses')}
                        min={VALIDATION_RULES.MAX_USES_MIN}
                        max={VALIDATION_RULES.MAX_USES_MAX}
                        className={`w-20 px-2 py-1 border rounded-md text-sm ${
                          touched.maxUses && errors.maxUses
                            ? 'border-red-500'
                            : 'border-gray-300'
                        }`}
                        placeholder="3"
                        required
                        aria-required="true"
                        aria-invalid={touched.maxUses && errors.maxUses ? 'true' : 'false'}
                        aria-describedby={touched.maxUses && errors.maxUses ? 'maxUses-error' : undefined}
                      />
                      {touched.maxUses && errors.maxUses && (
                        <p id="maxUses-error" className="text-xs text-red-500 mt-1" role="alert">
                          {errors.maxUses}
                        </p>
                      )}
                    </div>
                  )}
                </div>
              </label>

              <label className="flex items-start gap-2 cursor-pointer">
                <input
                  type="radio"
                  name="recurrence"
                  value="once"
                  checked={recurrenceType === 'once'}
                  onChange={(e) => setRecurrenceType(e.target.value)}
                  className="mt-1"
                />
                <div>
                  <div className="font-medium text-sm">One-Time Only</div>
                  <div className="text-xs text-gray-500">Disappears after being added once (e.g., Take out trash)</div>
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
