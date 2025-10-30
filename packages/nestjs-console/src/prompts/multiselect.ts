import { checkbox } from '@inquirer/prompts';
import { getTheme } from '@/themes/config';

/**
 * Multiselect Prompt
 *
 * @description
 * Prompts the user to select multiple options from a list.
 * Similar to Laravel's multiselect() prompt.
 *
 * @param {string} message - The prompt message
 * @param {Array<string | {value: any, label: string}>} choices - Available choices
 * @param {object} options - Prompt options
 * @param {Array<any>} options.default - Default selected values
 * @param {boolean} options.required - Whether at least one selection is required
 * @returns {Promise<Array<any>>} Array of selected values
 *
 * @example
 * ```typescript
 * const permissions = await multiselect('Select permissions', [
 *   { value: 'read', label: 'Read' },
 *   { value: 'write', label: 'Write' },
 *   { value: 'delete', label: 'Delete' },
 * ], {
 *   required: true,
 * });
 * ```
 */
export async function multiselect<T = string>(
  message: string,
  choices: Array<string | { value: T; label: string; description?: string }>,
  options: {
    default?: T[];
    required?: boolean;
  } = {},
): Promise<T[]> {
  const formattedChoices = choices.map((choice) => {
    if (typeof choice === 'string') {
      return {
        value: choice as T,
        name: choice,
        checked: options.default?.includes(choice as T) ?? false,
      };
    }
    return {
      value: choice.value,
      name: choice.label,
      description: choice.description,
      checked: options.default?.includes(choice.value) ?? false,
    };
  });

  const theme = getTheme();

  return checkbox({
    message: theme.primary(message),
    choices: formattedChoices,
    validate: (selected: readonly any[]) => {
      if (options.required && selected.length === 0) {
        return theme.error('Please select at least one option');
      }
      return true;
    },
    theme: {
      prefix: theme.success(theme.prefix),
    },
  });
}
