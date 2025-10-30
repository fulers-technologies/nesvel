import { input } from '@inquirer/prompts';
import { getTheme } from '@/themes/config';

/**
 * Text Prompt
 *
 * @description
 * Prompts the user for text input with validation.
 * Similar to Laravel's text() prompt.
 *
 * @param {string} message - The prompt message
 * @param {object} options - Prompt options
 * @param {string} options.default - Default value
 * @param {string} options.placeholder - Placeholder text
 * @param {boolean} options.required - Whether input is required
 * @param {function} options.validate - Custom validation function
 * @returns {Promise<string>} The user's input
 *
 * @example
 * ```typescript
 * const name = await text('What is your name?', {
 *   default: 'John Doe',
 *   required: true,
 *   validate: (value) => value.length >= 3 || 'Name must be at least 3 characters',
 * });
 * ```
 */
export async function text(
  message: string,
  options: {
    default?: string;
    placeholder?: string;
    required?: boolean;
    validate?: (value: string) => boolean | string;
  } = {},
): Promise<string> {
  const { default: defaultValue, required = false, validate } = options;
  const theme = getTheme();

  return input({
    message: theme.primary(message),
    default: defaultValue,
    validate: (value: string) => {
      // Required validation
      if (required && !value.trim()) {
        return theme.error('This field is required');
      }

      // Custom validation
      if (validate) {
        const result = validate(value);
        if (result !== true) {
          return theme.error(typeof result === 'string' ? result : 'Invalid input');
        }
      }

      return true;
    },
    theme: {
      prefix: theme.success(theme.prefix),
    },
  });
}
