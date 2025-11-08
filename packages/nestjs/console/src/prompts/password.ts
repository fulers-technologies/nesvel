import { password as inquirerPassword } from '@inquirer/prompts';
import { getTheme } from '@/themes/config';

/**
 * Password Prompt
 *
 * @description
 * Prompts the user for password input (hidden).
 * Similar to Laravel's password() prompt.
 *
 * @param {string} message - The prompt message
 * @param {object} options - Prompt options
 * @param {boolean} options.required - Whether password is required
 * @param {number} options.minLength - Minimum password length
 * @param {function} options.validate - Custom validation function
 * @returns {Promise<string>} The password
 *
 * @example
 * ```typescript
 * const password = await password('Enter password', {
 *   required: true,
 *   minLength: 8,
 *   validate: (value) => {
 *     if (!/[A-Z]/.test(value)) {
 *       return 'Password must contain at least one uppercase letter';
 *     }
 *     return true;
 *   },
 * });
 * ```
 */
export async function password(
  message: string,
  options: {
    required?: boolean;
    minLength?: number;
    validate?: (value: string) => boolean | string;
  } = {}
): Promise<string> {
  const { required = true, minLength, validate } = options;
  const theme = getTheme();

  return inquirerPassword({
    message: theme.primary(message),
    mask: '*',
    validate: (value: string) => {
      // Required validation
      if (required && !value) {
        return theme.error('Password is required');
      }

      // Min length validation
      if (minLength && value.length < minLength) {
        return theme.error(`Password must be at least ${minLength} characters`);
      }

      // Custom validation
      if (validate) {
        const result = validate(value);
        if (result !== true) {
          return theme.error(typeof result === 'string' ? result : 'Invalid password');
        }
      }

      return true;
    },
    theme: {
      prefix: theme.success(theme.prefix),
    },
  });
}
