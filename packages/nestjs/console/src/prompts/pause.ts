import { input } from '@inquirer/prompts';
import { getTheme } from '@/themes/config';

/**
 * Pause Prompt
 *
 * @description
 * Pauses execution and waits for the user to press Enter to continue.
 * Useful for creating breakpoints in CLI workflows or waiting for user acknowledgment.
 * Similar to Laravel's pause() function.
 *
 * @param {string} message - The message to display (default: "Press Enter to continue...")
 * @returns {Promise<void>} Resolves when user presses Enter
 *
 * @example
 * ```typescript
 * console.log('About to perform critical operation...');
 * await pause('Press Enter when ready');
 * console.log('Continuing with operation...');
 * ```
 *
 * @example
 * ```typescript
 * // Simple pause with default message
 * await pause();
 * ```
 */
export async function pause(message: string = 'Press Enter to continue...'): Promise<void> {
  const theme = getTheme();

  await input({
    message: theme.primary(message),
    theme: {
      prefix: theme.warning('⏸'),
    },
  });
}
