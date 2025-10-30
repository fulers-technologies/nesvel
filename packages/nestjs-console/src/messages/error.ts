import { getTheme } from '@/themes/config';

/**
 * Error Message
 *
 * @description
 * Displays an error message to the console using the active theme.
 * The color and icon are determined by the current theme configuration.
 *
 * @param {string} message - The message to display
 *
 * @example
 * ```typescript
 * import { error, setTheme, ThemeType } from 'console-prompts';
 *
 * error('Operation failed');
 *
 * // With custom theme
 * setTheme(ThemeType.RED);
 * error('Now using red theme');
 * ```
 */
export function error(message: string): void {
  const theme = getTheme();
  console.log(theme.error(`${theme.errorIcon} ${message}`));
}
