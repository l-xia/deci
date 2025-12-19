import { z } from 'zod';
import { VALIDATION_RULES } from './card';

/**
 * Zod schema for card validation
 * Used by CardModal for form validation with react-hook-form
 */
export const cardSchema = z
  .object({
    title: z
      .string()
      .min(1, 'Title is required')
      .max(
        VALIDATION_RULES.TITLE_MAX_LENGTH,
        `Title must be at most ${VALIDATION_RULES.TITLE_MAX_LENGTH} characters`
      ),
    description: z
      .string()
      .max(
        VALIDATION_RULES.DESCRIPTION_MAX_LENGTH,
        `Description must be at most ${VALIDATION_RULES.DESCRIPTION_MAX_LENGTH} characters`
      )
      .optional(),
    duration: z
      .string()
      .optional()
      .refine(
        (val) => {
          if (!val) return true; // Empty is valid (optional field)
          const num = Number(val);
          return (
            num > 0 &&
            num >= VALIDATION_RULES.DURATION_MIN &&
            num <= VALIDATION_RULES.DURATION_MAX
          );
        },
        {
          message: `Duration must be between ${VALIDATION_RULES.DURATION_MIN} and ${VALIDATION_RULES.DURATION_MAX} minutes`,
        }
      ),
    recurrenceType: z.enum(['always', 'once', 'limited', 'scheduled']),
    maxUses: z.string().optional(),
    scheduleType: z.enum(['daily', 'weekly', 'monthly']).optional(),
    scheduleDays: z.array(z.number()).optional(),
  })
  .refine(
    (data) => {
      if (data.recurrenceType === 'limited') {
        if (!data.maxUses) return false;
        const num = Number(data.maxUses);
        return (
          num >= VALIDATION_RULES.MAX_USES_MIN &&
          num <= VALIDATION_RULES.MAX_USES_MAX
        );
      }
      return true;
    },
    {
      message: `Max uses must be between ${VALIDATION_RULES.MAX_USES_MIN} and ${VALIDATION_RULES.MAX_USES_MAX}`,
      path: ['maxUses'],
    }
  )
  .refine(
    (data) => {
      if (data.recurrenceType === 'scheduled') {
        if (!data.scheduleType) return false;
        if (
          data.scheduleType !== 'daily' &&
          (!data.scheduleDays || data.scheduleDays.length === 0)
        ) {
          return false;
        }
      }
      return true;
    },
    {
      message: 'Please select at least one day for scheduled tasks',
      path: ['scheduleDays'],
    }
  );

export type CardFormData = z.infer<typeof cardSchema>;

/**
 * Zod schema for template name validation
 */
export const templateNameSchema = z
  .string()
  .min(VALIDATION_RULES.TEMPLATE_NAME_MIN_LENGTH, 'Template name is required')
  .max(
    VALIDATION_RULES.TEMPLATE_NAME_MAX_LENGTH,
    `Template name must be at most ${VALIDATION_RULES.TEMPLATE_NAME_MAX_LENGTH} characters`
  );
