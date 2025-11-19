/**
 * Comprehensive validation utilities for production-ready input handling
 */

import DOMPurify from 'isomorphic-dompurify';

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
 * Sanitize user input to prevent XSS attacks
 * @param {string} input - Raw user input
 * @returns {string} Sanitized string safe for rendering
 */
export function sanitizeInput(input) {
  if (typeof input !== 'string') {
    return '';
  }

  // DOMPurify removes all HTML tags and dangerous content
  return DOMPurify.sanitize(input, {
    ALLOWED_TAGS: [], // No HTML tags allowed
    ALLOWED_ATTR: [], // No attributes allowed
    KEEP_CONTENT: true, // Keep the text content
  }).trim();
}

/**
 * Validate card title
 * @param {string} title - Card title
 * @returns {{valid: boolean, error: string|null, sanitized: string}}
 */
export function validateTitle(title) {
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
 * @param {string} description - Card description
 * @returns {{valid: boolean, error: string|null, sanitized: string}}
 */
export function validateDescription(description) {
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
 * @param {string|number} duration - Duration in minutes
 * @returns {{valid: boolean, error: string|null, value: number|null}}
 */
export function validateDuration(duration) {
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
 * @param {string|number} maxUses - Maximum number of uses
 * @returns {{valid: boolean, error: string|null, value: number|null}}
 */
export function validateMaxUses(maxUses) {
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
 * @param {string} recurrenceType - Type of recurrence
 * @returns {{valid: boolean, error: string|null}}
 */
export function validateRecurrenceType(recurrenceType) {
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
 * @param {string} category - Card category
 * @returns {{valid: boolean, error: string|null}}
 */
export function validateCategory(category) {
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
 * @param {string} name - Template name
 * @returns {{valid: boolean, error: string|null, sanitized: string}}
 */
export function validateTemplateName(name) {
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
 * @param {object} cardData - Card data object
 * @returns {{valid: boolean, errors: object, sanitizedData: object}}
 */
export function validateCard(cardData) {
  const errors = {};
  const sanitizedData = {};

  // Validate title
  const titleValidation = validateTitle(cardData.title);
  if (!titleValidation.valid) {
    errors.title = titleValidation.error;
  }
  sanitizedData.title = titleValidation.sanitized;

  // Validate description
  const descriptionValidation = validateDescription(cardData.description);
  if (!descriptionValidation.valid) {
    errors.description = descriptionValidation.error;
  }
  sanitizedData.description = descriptionValidation.sanitized;

  // Validate duration
  const durationValidation = validateDuration(cardData.duration);
  if (!durationValidation.valid) {
    errors.duration = durationValidation.error;
  }
  sanitizedData.duration = durationValidation.value;

  // Validate recurrence type
  const recurrenceValidation = validateRecurrenceType(cardData.recurrenceType);
  if (!recurrenceValidation.valid) {
    errors.recurrenceType = recurrenceValidation.error;
  }
  sanitizedData.recurrenceType = cardData.recurrenceType;

  // Validate max uses if recurrence type is 'limited'
  if (cardData.recurrenceType === 'limited') {
    const maxUsesValidation = validateMaxUses(cardData.maxUses);
    if (!maxUsesValidation.valid) {
      errors.maxUses = maxUsesValidation.error;
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
 * @param {*} data - Data loaded from Firebase
 * @param {string} expectedType - Expected data type ('cards'|'dailyDeck'|'templates')
 * @returns {{valid: boolean, error: string|null}}
 */
export function validateLoadedData(data, expectedType) {
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
