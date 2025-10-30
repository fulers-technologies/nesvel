import chalk from 'chalk';
import type { Theme } from '@/interfaces/theme.interface';

/**
 * Orange Theme Configuration
 *
 * @description
 * A warm orange theme perfect for warning-focused workflows or when you want
 * a friendly, energetic appearance. Uses orange/yellow tones for primary elements.
 *
 * @example
 * ```typescript
 * import { orangeTheme } from './themes';
 *
 * console.log(orangeTheme.primary('Warning Check'));
 * console.log(orangeTheme.warning('Be careful'));
 * ```
 */
export const orangeTheme: Theme = {
  primary: chalk.hex('#FFA500'), // Orange color
  success: chalk.green,
  error: chalk.red,
  warning: chalk.hex('#FF8C00').bold, // Dark orange
  info: chalk.cyan,
  muted: chalk.gray,
  highlight: chalk.hex('#FFA500').bold,
  prefix: '▸',
  successIcon: '✓',
  errorIcon: '✗',
  warningIcon: '⚠',
  infoIcon: 'ℹ',
};
