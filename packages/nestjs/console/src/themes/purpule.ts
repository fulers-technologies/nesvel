import chalk from 'chalk';
import type { Theme } from '@/interfaces/theme.interface';

/**
 * Purple Theme Configuration
 *
 * @description
 * A vibrant purple theme that provides a unique, modern aesthetic.
 * Perfect for creative applications or when you want to stand out
 * with a distinctive color palette.
 *
 * Uses purple and magenta tones for a cohesive, eye-catching appearance.
 *
 * @example
 * ```typescript
 * import { purpleTheme } from './themes';
 *
 * console.log(purpleTheme.primary('Creative Project'));
 * console.log(purpleTheme.highlight('Important!'));
 * ```
 */
export const purpleTheme: Theme = {
  primary: chalk.magenta,
  success: chalk.greenBright,
  error: chalk.red,
  warning: chalk.yellow,
  info: chalk.magentaBright,
  muted: chalk.gray,
  highlight: chalk.magenta.bold,
  prefix: '✦',
  successIcon: '✓',
  errorIcon: '✗',
  warningIcon: '⚠',
  infoIcon: 'ℹ',
};
