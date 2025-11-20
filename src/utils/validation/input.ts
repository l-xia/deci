/**
 * Input sanitization and basic validation utilities
 */

import DOMPurify from 'isomorphic-dompurify';

export interface BasicValidationResult {
  valid: boolean;
  error: string | null;
}

/**
 * Sanitize user input to prevent XSS attacks
 */
export function sanitizeInput(input: string): string {
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
