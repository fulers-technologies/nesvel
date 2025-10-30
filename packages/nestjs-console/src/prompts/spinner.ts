import ora, { Ora } from 'ora';
import { getTheme } from '@/themes/config';
import { SpinnerType } from '@/enums/spinner-types.enum';

/**
 * Spinner Utility
 *
 * @description
 * Creates a loading spinner for long-running operations.
 * Supports custom spinner types via the SpinnerType enum.
 *
 * @param {string} text - The spinner text
 * @param {object} options - Spinner options
 * @param {SpinnerType} options.type - Spinner animation type
 * @returns {Ora} Spinner instance
 *
 * @example
 * ```typescript
 * import { spinner, SpinnerType } from 'console-prompts';
 *
 * const spin = spinner('Loading data...', { type: SpinnerType.DOTS });
 *
 * try {
 *   await fetchData();
 *   spin.succeed('Data loaded successfully');
 * } catch (error: Error|any) {
 *   spin.fail('Failed to load data');
 * }
 * ```
 */
export function spinner(text: string, options: { type?: SpinnerType } = {}): Ora {
  const theme = getTheme();

  // Build ora options with optional spinner type
  const oraConfig: any = {
    text: theme.primary(text),
    color: 'cyan',
  };

  // Set spinner type if provided
  if (options.type) {
    oraConfig.spinner = options.type;
  }

  return ora(oraConfig).start();
}

/**
 * Run Task with Spinner
 *
 * @description
 * Runs an async task with a spinner, showing success or error message.
 *
 * @param {string} text - The spinner text
 * @param {function} task - The async task to run
 * @param {object} options - Options
 * @param {string} options.successText - Success message
 * @param {string} options.errorText - Error message
 * @param {SpinnerType} options.spinnerType - Spinner animation type
 * @returns {Promise<T>} The task result
 *
 * @example
 * ```typescript
 * import { runWithSpinner, SpinnerType } from 'console-prompts';
 *
 * const data = await runWithSpinner(
 *   'Fetching data...',
 *   () => fetchData(),
 *   {
 *     successText: 'Data fetched successfully',
 *     errorText: 'Failed to fetch data',
 *     spinnerType: SpinnerType.DOTS3,
 *   }
 * );
 * ```
 */
export async function runWithSpinner<T>(
  text: string,
  task: () => Promise<T>,
  options: {
    successText?: string;
    errorText?: string;
    spinnerType?: SpinnerType;
  } = {},
): Promise<T> {
  const theme = getTheme();
  const spin = spinner(text, { type: options.spinnerType });

  try {
    const result = await task();
    spin.succeed(options.successText || theme.success('Done'));
    return result;
  } catch (error: Error | any) {
    spin.fail(options.errorText || theme.error('Failed'));
    throw error;
  }
}
