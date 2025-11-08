import { number as inquirerNumber } from '@inquirer/prompts';
import { getTheme } from '@/themes/config';

/**
 * Number Prompt
 *
 * @description
 * Prompts the user for numeric input with validation.
 * Similar to Laravel's number() prompt.
 *
 * @param {string} message - The prompt message
 * @param {object} options - Prompt options
 * @param {number} options.default - Default value
 * @param {number} options.min - Minimum value
 * @param {number} options.max - Maximum value
 * @param {boolean} options.required - Whether input is required
 * @returns {Promise<number>} The numeric input
 *
 * @example
 * ```typescript
 * const age = await number('Enter your age', {
 *   min: 0,
 *   max: 120,
 *   required: true,
 * });
 * ```
 */
export async function number(
  message: string,
  options: {
    default?: number;
    min?: number;
    max?: number;
    required?: boolean;
  } = {}
): Promise<number> {
  const { default: defaultValue, min, max, required = false } = options;
  const theme = getTheme();

  const result = await inquirerNumber({
    message: theme.primary(message),
    default: defaultValue,
    validate: (value: number | undefined) => {
      // Required validation
      if (required && (value === null || value === undefined)) {
        return theme.error('This field is required');
      }

      // Skip other validations if value is undefined
      if (value === undefined) return true;

      // Min validation
      if (min !== undefined && value < min) {
        return theme.error(`Value must be at least ${min}`);
      }

      // Max validation
      if (max !== undefined && value > max) {
        return theme.error(`Value must be at most ${max}`);
      }

      return true;
    },
    theme: {
      prefix: theme.success(theme.prefix),
    },
  });

  return result ?? 0;
}
