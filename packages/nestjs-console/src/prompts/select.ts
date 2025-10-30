import { select as inquirerSelect } from '@inquirer/prompts';
import { getTheme } from '@/themes/config';

/**
 * Select Prompt
 *
 * @description
 * Prompts the user to select one option from a list.
 * Similar to Laravel's select() prompt.
 *
 * @param {string} message - The prompt message
 * @param {Array<string | {value: any, label: string}>} choices - Available choices
 * @param {object} options - Prompt options
 * @param {any} options.default - Default selected value
 * @returns {Promise<any>} The selected value
 *
 * @example
 * ```typescript
 * const role = await select('Select role', [
 *   { value: 'admin', label: 'Administrator' },
 *   { value: 'user', label: 'Regular User' },
 * ]);
 *
 * // Or with simple strings
 * const status = await select('Select status', ['active', 'inactive']);
 * ```
 */
export async function select<T = string>(
  message: string,
  choices: Array<string | { value: T; label: string; description?: string }>,
  options: {
    default?: T;
  } = {},
): Promise<T> {
  const formattedChoices = choices.map((choice) => {
    if (typeof choice === 'string') {
      return {
        value: choice as T,
        name: choice,
      };
    }
    return {
      value: choice.value,
      name: choice.label,
      description: choice.description,
    };
  });

  const theme = getTheme();

  return inquirerSelect({
    message: theme.primary(message),
    choices: formattedChoices,
    default: options.default,
    theme: {
      prefix: theme.success(theme.prefix),
    },
  });
}
