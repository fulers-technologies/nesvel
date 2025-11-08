import { confirm as inquirerConfirm } from '@inquirer/prompts';
import { getTheme } from '@/themes/config';

/**
 * Confirm Prompt
 *
 * @description
 * Prompts the user for yes/no confirmation.
 * Similar to Laravel's confirm() prompt.
 *
 * @param {string} message - The prompt message
 * @param {object} options - Prompt options
 * @param {boolean} options.default - Default value (true or false)
 * @returns {Promise<boolean>} True if confirmed, false otherwise
 *
 * @example
 * ```typescript
 * const confirmed = await confirm('Are you sure you want to delete this?', {
 *   default: false,
 * });
 *
 * if (confirmed) {
 *   // Proceed with deletion
 * }
 * ```
 */
export async function confirm(
  message: string,
  options: {
    default?: boolean;
  } = {}
): Promise<boolean> {
  const theme = getTheme();

  return inquirerConfirm({
    message: theme.primary(message),
    default: options.default ?? true,
    theme: {
      prefix: theme.success(theme.prefix),
    },
  });
}
