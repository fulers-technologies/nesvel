import chalk from 'chalk';
import type { Theme } from '@/interfaces/theme.interface';

/**
 * Default Theme
 *
 * @description
 * Provides a balanced, professional color scheme suitable for most CLI applications.
 * Uses cyan for primary interactions and green for success feedback.
 *
 * @example
 * ```typescript
 * import { defaultTheme } from './themes';
 *
 * console.log(defaultTheme.primary('Hello World'));
 * console.log(defaultTheme.success('Success!'));
 * ```
 */
export const defaultTheme: Theme = {
  primary: chalk.cyan,
  success: chalk.green,
  error: chalk.red,
  warning: chalk.yellow,
  info: chalk.blue,
  muted: chalk.gray,
  highlight: chalk.bold,
  prefix: '?',
  successIcon: '✓',
  errorIcon: '✗',
  warningIcon: '⚠',
  infoIcon: 'ℹ',
};
