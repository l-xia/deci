/**
 * Card-specific validation utilities
 */

import { sanitizeInput } from './input';

export interface ValidationResult {
  valid: boolean;
  error: string | null;
  sanitized: string;
}

export interface NumericValidationResult {
  valid: boolean;
  error: string | null;
  value: number | null;
}

export interface BasicValidationResult {
  valid: boolean;
  error: string | null;
}

export interface CardValidationResult {
  valid: boolean;
  errors: Record<string, string>;
  sanitizedData: Record<string, any>;
}

// Validation constants
export const VALIDATION_RULES = {
  TITLE_MIN_LENGTH: 1,
  TITLE_MAX_LENGTH: 100,
  DESCRIPTION_MAX_LENGTH: 1000,
  DURATION_MIN: 1,
  DURATION_MAX: 480, // 8 hours in minutes
  MAX_USES_MIN: 1,
  MAX_USES_MAX: 100,
  TEMPLATE_NAME_MIN_LENGTH: 1,
  TEMPLATE_NAME_MAX_LENGTH: 50,
};

// Error messages
export const ERROR_MESSAGES = {
  TITLE_REQUIRED: 'Title is required',
  TITLE_TOO_LONG: `Title must be ${VALIDATION_RULES.TITLE_MAX_LENGTH} characters or less`,
  DESCRIPTION_TOO_LONG: `Description must be ${VALIDATION_RULES.DESCRIPTION_MAX_LENGTH} characters or less`,
  DURATION_INVALID: `Duration must be between ${VALIDATION_RULES.DURATION_MIN} and ${VALIDATION_RULES.DURATION_MAX} minutes`,
  MAX_USES_INVALID: `Max uses must be between ${VALIDATION_RULES.MAX_USES_MIN} and ${VALIDATION_RULES.MAX_USES_MAX}`,
  TEMPLATE_NAME_REQUIRED: 'Template name is required',
  TEMPLATE_NAME_TOO_LONG: `Template name must be ${VALIDATION_RULES.TEMPLATE_NAME_MAX_LENGTH} characters or less`,
  INVALID_RECURRENCE_TYPE: 'Invalid recurrence type',
  INVALID_CATEGORY: 'Invalid category',
};

/**
 * Validate card title
 */
export function validateTitle(title: string): ValidationResult {
  const sanitized = sanitizeInput(title);

  if (!sanitized || sanitized.length < VALIDATION_RULES.TITLE_MIN_LENGTH) {
    return {
      valid: false,
      error: ERROR_MESSAGES.TITLE_REQUIRED,
      sanitized,
    };
  }

  if (sanitized.length > VALIDATION_RULES.TITLE_MAX_LENGTH) {
    return {
      valid: false,
      error: ERROR_MESSAGES.TITLE_TOO_LONG,
      sanitized: sanitized.substring(0, VALIDATION_RULES.TITLE_MAX_LENGTH),
    };
  }

  return {
    valid: true,
    error: null,
    sanitized,
  };
}

/**
 * Validate card description
 */
export function validateDescription(description: string): ValidationResult {
  const sanitized = sanitizeInput(description || '');

  if (sanitized.length > VALIDATION_RULES.DESCRIPTION_MAX_LENGTH) {
    return {
      valid: false,
      error: ERROR_MESSAGES.DESCRIPTION_TOO_LONG,
      sanitized: sanitized.substring(0, VALIDATION_RULES.DESCRIPTION_MAX_LENGTH),
    };
  }

  return {
    valid: true,
    error: null,
    sanitized,
  };
}

/**
 * Validate duration value
 */
export function validateDuration(duration: string | number): NumericValidationResult {
  if (!duration || duration === '') {
    return {
      valid: true,
      error: null,
      value: null,
    };
  }

  const parsed = typeof duration === 'string' ? parseInt(duration, 10) : duration;

  if (isNaN(parsed)) {
    return {
      valid: false,
      error: ERROR_MESSAGES.DURATION_INVALID,
      value: null,
    };
  }

  if (parsed < VALIDATION_RULES.DURATION_MIN || parsed > VALIDATION_RULES.DURATION_MAX) {
    return {
      valid: false,
      error: ERROR_MESSAGES.DURATION_INVALID,
      value: null,
    };
  }

  return {
    valid: true,
    error: null,
    value: parsed,
  };
}

/**
 * Validate max uses value
 */
export function validateMaxUses(maxUses: string | number): NumericValidationResult {
  if (!maxUses || maxUses === '') {
    return {
      valid: false,
      error: ERROR_MESSAGES.MAX_USES_INVALID,
      value: null,
    };
  }

  const parsed = typeof maxUses === 'string' ? parseInt(maxUses, 10) : maxUses;

  if (isNaN(parsed)) {
    return {
      valid: false,
      error: ERROR_MESSAGES.MAX_USES_INVALID,
      value: null,
    };
  }

  if (parsed < VALIDATION_RULES.MAX_USES_MIN || parsed > VALIDATION_RULES.MAX_USES_MAX) {
    return {
      valid: false,
      error: ERROR_MESSAGES.MAX_USES_INVALID,
      value: null,
    };
  }

  return {
    valid: true,
    error: null,
    value: parsed,
  };
}

/**
 * Validate recurrence type
 */
export function validateRecurrenceType(recurrenceType: string): BasicValidationResult {
  const validTypes = ['always', 'once', 'limited'];

  if (!validTypes.includes(recurrenceType)) {
    return {
      valid: false,
      error: ERROR_MESSAGES.INVALID_RECURRENCE_TYPE,
    };
  }

  return {
    valid: true,
    error: null,
  };
}

/**
 * Validate category
 */
export function validateCategory(category: string): BasicValidationResult {
  const validCategories = ['structure', 'upkeep', 'play', 'default'];

  if (!validCategories.includes(category)) {
    return {
      valid: false,
      error: ERROR_MESSAGES.INVALID_CATEGORY,
    };
  }

  return {
    valid: true,
    error: null,
  };
}

/**
 * Validate template name
 */
export function validateTemplateName(name: string): ValidationResult {
  const sanitized = sanitizeInput(name);

  if (!sanitized || sanitized.length < VALIDATION_RULES.TEMPLATE_NAME_MIN_LENGTH) {
    return {
      valid: false,
      error: ERROR_MESSAGES.TEMPLATE_NAME_REQUIRED,
      sanitized,
    };
  }

  if (sanitized.length > VALIDATION_RULES.TEMPLATE_NAME_MAX_LENGTH) {
    return {
      valid: false,
      error: ERROR_MESSAGES.TEMPLATE_NAME_TOO_LONG,
      sanitized: sanitized.substring(0, VALIDATION_RULES.TEMPLATE_NAME_MAX_LENGTH),
    };
  }

  return {
    valid: true,
    error: null,
    sanitized,
  };
}

/**
 * Validate complete card data
 */
export function validateCard(cardData: any): CardValidationResult {
  const errors: Record<string, string> = {};
  const sanitizedData: Record<string, any> = {};

  // Validate title
  const titleValidation = validateTitle(cardData.title);
  if (!titleValidation.valid) {
    errors.title = titleValidation.error!;
  }
  sanitizedData.title = titleValidation.sanitized;

  // Validate description
  const descriptionValidation = validateDescription(cardData.description);
  if (!descriptionValidation.valid) {
    errors.description = descriptionValidation.error!;
  }
  sanitizedData.description = descriptionValidation.sanitized;

  // Validate duration
  const durationValidation = validateDuration(cardData.duration);
  if (!durationValidation.valid) {
    errors.duration = durationValidation.error!;
  }
  sanitizedData.duration = durationValidation.value;

  // Validate recurrence type
  const recurrenceValidation = validateRecurrenceType(cardData.recurrenceType);
  if (!recurrenceValidation.valid) {
    errors.recurrenceType = recurrenceValidation.error!;
  }
  sanitizedData.recurrenceType = cardData.recurrenceType;

  // Validate max uses if recurrence type is 'limited'
  if (cardData.recurrenceType === 'limited') {
    const maxUsesValidation = validateMaxUses(cardData.maxUses);
    if (!maxUsesValidation.valid) {
      errors.maxUses = maxUsesValidation.error!;
    }
    sanitizedData.maxUses = maxUsesValidation.value;
  }

  return {
    valid: Object.keys(errors).length === 0,
    errors,
    sanitizedData,
  };
}

/**
 * Validate loaded data structure from Firebase
 */
export function validateLoadedData(data: any, expectedType: 'cards' | 'dailyDeck' | 'templates'): BasicValidationResult {
  if (!data) {
    return { valid: true, error: null }; // Null/undefined is acceptable (no data saved)
  }

  switch (expectedType) {
    case 'cards':
      if (typeof data !== 'object' || Array.isArray(data)) {
        return { valid: false, error: 'Cards data must be an object' };
      }
      // Validate structure: { structure: [], upkeep: [], play: [], default: [] }
      const requiredKeys = ['structure', 'upkeep', 'play', 'default'];
      for (const key of requiredKeys) {
        if (!Array.isArray(data[key])) {
          return { valid: false, error: `Cards.${key} must be an array` };
        }
      }
      return { valid: true, error: null };

    case 'dailyDeck':
      if (!Array.isArray(data)) {
        return { valid: false, error: 'Daily deck data must be an array' };
      }
      return { valid: true, error: null };

    case 'templates':
      if (!Array.isArray(data)) {
        return { valid: false, error: 'Templates data must be an array' };
      }
      return { valid: true, error: null };

    default:
      return { valid: false, error: 'Unknown data type' };
  }
}
