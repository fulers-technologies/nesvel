import { getTheme } from '@/themes/config';

/**
 * Info Message
 *
 * @description
 * Displays an info message to the console using the active theme.
 * The color and icon are determined by the current theme configuration.
 *
 * @param {string} message - The message to display
 *
 * @example
 * ```typescript
 * import { info, setTheme, ThemeType } from 'console-prompts';
 *
 * info('Operation completed successfully');
 *
 * // With custom theme
 * setTheme(ThemeType.PURPLE);
 * info('Now using purple theme');
 * ```
 */
export function info(message: string): void {
  const theme = getTheme();
  console.log(theme.info(`${theme.infoIcon} ${message}`));
}
