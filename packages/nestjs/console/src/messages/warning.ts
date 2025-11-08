import { getTheme } from '@/themes/config';

/**
 * Warning Message
 *
 * @description
 * Displays a warning message to the console using the active theme.
 * The color and icon are determined by the current theme configuration.
 *
 * @param {string} message - The message to display
 *
 * @example
 * ```typescript
 * import { warning, setTheme, ThemeType } from 'console-prompts';
 *
 * warning('This action cannot be undone');
 *
 * // With custom theme
 * setTheme(ThemeType.ORANGE);
 * warning('Now using orange theme');
 * ```
 */
export function warning(message: string): void {
  const theme = getTheme();
  console.log(theme.warning(`${theme.warningIcon} ${message}`));
}
