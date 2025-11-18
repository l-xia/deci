/**
 * Application-wide configuration constants
 */

// Debounce delays (milliseconds)
export const DEBOUNCE_DELAY = {
  SAVE: 500,        // Delay for auto-save operations
  SEARCH: 300,      // Delay for search input
  RESIZE: 150,      // Delay for window resize handlers
};

// Recurrence types for cards
export const RECURRENCE_TYPES = {
  ALWAYS: 'always',     // Can be added unlimited times
  ONCE: 'once',         // Can only be added once
  LIMITED: 'limited',   // Can be added a limited number of times
};

export const RECURRENCE_TYPE_LABELS = {
  [RECURRENCE_TYPES.ALWAYS]: 'Always Available',
  [RECURRENCE_TYPES.ONCE]: 'One-Time Only',
  [RECURRENCE_TYPES.LIMITED]: 'Limited Uses',
};

// Storage keys for Firebase/localStorage
export const STORAGE_KEYS = {
  CARDS: 'cards',
  DAILY_DECK: 'dailyDeck',
  TEMPLATES: 'templates',
  USER_PREFERENCES: 'userPreferences',
};

// UI constants
export const UI_CONSTANTS = {
  DAILY_DECK_HEIGHT: 820, // px
  MAX_UNDO_HISTORY: 20,
  TOAST_DURATION: 3000, // ms
  ANIMATION_DURATION: 200, // ms
};

// Feature flags
export const FEATURES = {
  OFFLINE_MODE: true,
  UNDO_REDO: false, // To be implemented
  DATA_EXPORT: false, // To be implemented
  SEARCH_FILTER: false, // To be implemented
  KEYBOARD_SHORTCUTS: false, // To be implemented
};

// Data version for migrations
export const DATA_VERSION = '1.0.0';

// Firebase configuration
export const FIREBASE_CONFIG = {
  RETRY_ATTEMPTS: 3,
  RETRY_DELAY: 1000, // ms
  OFFLINE_PERSISTENCE: true,
};

// PostHog configuration
export const ANALYTICS_CONFIG = {
  CAPTURE_PAGEVIEWS: true,
  CAPTURE_PAGELEAVES: true,
  ENABLE_RECORDINGS: false, // Privacy consideration
};
