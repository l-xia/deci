export { sanitizeInput } from './input';
export type { BasicValidationResult } from './input';

export {
  validateTitle,
  validateDescription,
  validateDuration,
  validateMaxUses,
  validateRecurrenceType,
  validateCategory,
  validateTemplateName,
  validateCard,
  validateLoadedData,
  VALIDATION_RULES,
  ERROR_MESSAGES,
} from './card';

export type {
  ValidationResult,
  NumericValidationResult,
  CardValidationResult,
} from './card';

// Export Zod schemas for form validation
export { cardSchema, templateNameSchema } from './schemas';
export type { CardFormData } from './schemas';
