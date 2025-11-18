/**
 * Data validation utilities for ensuring data integrity
 */

const CURRENT_VERSION = '1.0.0';

/**
 * Validate card object structure
 */
export function validateCard(card) {
  if (!card || typeof card !== 'object') return false;

  return (
    typeof card.id === 'string' &&
    typeof card.title === 'string' &&
    (card.description === undefined || typeof card.description === 'string') &&
    (card.duration === undefined || typeof card.duration === 'number') &&
    (card.recurrenceType === undefined || ['once', 'limited', 'always'].includes(card.recurrenceType)) &&
    (card.maxUses === undefined || typeof card.maxUses === 'number')
  );
}

/**
 * Validate cards object (all categories)
 */
export function validateCards(cards) {
  if (!cards || typeof cards !== 'object') return false;

  const requiredCategories = ['structure', 'upkeep', 'play', 'default'];

  for (const category of requiredCategories) {
    if (!Array.isArray(cards[category])) {
      return false;
    }

    // Validate each card in the category
    for (const card of cards[category]) {
      if (!validateCard(card)) {
        return false;
      }
    }
  }

  return true;
}

/**
 * Validate daily deck array
 */
export function validateDailyDeck(dailyDeck) {
  if (!Array.isArray(dailyDeck)) return false;

  return dailyDeck.every(card =>
    validateCard(card) && typeof card.sourceCategory === 'string'
  );
}

/**
 * Validate template object
 */
export function validateTemplate(template) {
  if (!template || typeof template !== 'object') return false;

  return (
    typeof template.id === 'string' &&
    typeof template.name === 'string' &&
    Array.isArray(template.cards) &&
    typeof template.createdAt === 'string' &&
    template.cards.every(card =>
      typeof card.id === 'string' &&
      typeof card.sourceCategory === 'string'
    )
  );
}

/**
 * Validate templates array
 */
export function validateTemplates(templates) {
  if (!Array.isArray(templates)) return false;
  return templates.every(validateTemplate);
}

/**
 * Validate complete data structure
 */
export function validateData(data) {
  if (!data || typeof data !== 'object') {
    return { valid: false, error: 'Data is not an object' };
  }

  // Check version (optional for now, required in future)
  if (data.version && data.version !== CURRENT_VERSION) {
    console.warn(`Data version mismatch: ${data.version} vs ${CURRENT_VERSION}`);
  }

  // Validate cards
  if (data.cards && !validateCards(data.cards)) {
    return { valid: false, error: 'Invalid cards structure' };
  }

  // Validate daily deck
  if (data.dailyDeck && !validateDailyDeck(data.dailyDeck)) {
    return { valid: false, error: 'Invalid daily deck structure' };
  }

  // Validate templates
  if (data.templates && !validateTemplates(data.templates)) {
    return { valid: false, error: 'Invalid templates structure' };
  }

  return { valid: true };
}

/**
 * Sanitize and repair data where possible
 */
export function sanitizeData(data) {
  const sanitized = {};

  // Ensure cards structure exists
  sanitized.cards = {
    structure: [],
    upkeep: [],
    play: [],
    default: [],
  };

  // Copy valid cards
  if (data.cards && typeof data.cards === 'object') {
    for (const category of ['structure', 'upkeep', 'play', 'default']) {
      if (Array.isArray(data.cards[category])) {
        sanitized.cards[category] = data.cards[category].filter(validateCard);
      }
    }
  }

  // Sanitize daily deck
  if (Array.isArray(data.dailyDeck)) {
    sanitized.dailyDeck = data.dailyDeck.filter(card =>
      validateCard(card) && typeof card.sourceCategory === 'string'
    );
  } else {
    sanitized.dailyDeck = [];
  }

  // Sanitize templates
  if (Array.isArray(data.templates)) {
    sanitized.templates = data.templates.filter(validateTemplate);
  } else {
    sanitized.templates = [];
  }

  // Add version
  sanitized.version = CURRENT_VERSION;

  return sanitized;
}

/**
 * Safe JSON parse with validation
 */
export function safeJSONParse(jsonString, defaultValue = null) {
  if (!jsonString || typeof jsonString !== 'string') {
    return defaultValue;
  }

  try {
    return JSON.parse(jsonString);
  } catch (error) {
    console.error('JSON parse error:', error);
    return defaultValue;
  }
}

export { CURRENT_VERSION };
