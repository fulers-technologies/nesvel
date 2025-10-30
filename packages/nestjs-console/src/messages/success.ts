import { getTheme } from '@/themes/config';

/**
 * Success Message
 *
 * @description
 * Displays a success message to the console using the active theme.
 * The color and icon are determined by the current theme configuration.
 *
 * @param {string} message - The message to display
 *
 * @example
 * ```typescript
 * import { success, setTheme, ThemeType } from 'console-prompts';
 *
 * success('Operation completed successfully');
 *
 * // With custom theme
 * setTheme(ThemeType.RED);
 * success('Now using red theme');
 * ```
 */
export function success(message: string): void {
  const theme = getTheme();
  console.log(theme.success(`${theme.successIcon} ${message}`));
}
