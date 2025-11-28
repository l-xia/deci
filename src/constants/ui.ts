/**
 * UI-related constants
 */

// Z-Index layers
export const Z_INDEX = {
  MODAL: 50,
  SIDEBAR_OVERLAY: 40,
  CONTEXT_MENU: 99999,
  DROPDOWN: 1000,
} as const;

// Timing constants (in milliseconds)
export const UI_TIMING = {
  SCROLL_ANIMATION_DELAY: 300,
  TIMER_INTERVAL: 1000,
  DEBUG_LOG_INTERVAL: 1000,
} as const;

// Layout constants
export const LAYOUT = {
  MAX_CONTAINER_WIDTH: 1400,
  MIN_CONTEXT_MENU_WIDTH: 180,
} as const;
