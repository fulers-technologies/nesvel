import chalk from 'chalk';
import type { Theme } from '@/interfaces/theme.interface';

/**
 * Red Theme Configuration
 *
 * @description
 * A bold red theme ideal for error-focused workflows, critical operations,
 * or when you want to emphasize urgency and importance.
 *
 * Uses red as the primary color with complementary warm tones.
 *
 * @example
 * ```typescript
 * import { redTheme } from './themes';
 *
 * console.log(redTheme.primary('Critical Operation'));
 * console.log(redTheme.success('Completed'));
 * ```
 */
export const redTheme: Theme = {
  primary: chalk.red,
  success: chalk.greenBright,
  error: chalk.redBright.bold,
  warning: chalk.yellow,
  info: chalk.magenta,
  muted: chalk.gray,
  highlight: chalk.red.bold,
  prefix: '›',
  successIcon: '✓',
  errorIcon: '✗',
  warningIcon: '⚠',
  infoIcon: 'ℹ',
};
