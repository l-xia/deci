import DOMPurify from 'isomorphic-dompurify';

export interface BasicValidationResult {
  valid: boolean;
  error: string | null;
}

export function sanitizeInput(input: string): string {
  if (typeof input !== 'string') {
    return '';
  }

  return DOMPurify.sanitize(input, {
    ALLOWED_TAGS: [],
    ALLOWED_ATTR: [],
    KEEP_CONTENT: true,
  }).trim();
}
