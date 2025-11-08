import chalk from 'chalk';

/**
 * Default Theme Configuration
 *
 * @description
 * The default theme uses cyan and green colors for a clean, professional appearance.
 * This is the standard theme applied to all prompts and messages by default.
 *
 * @interface Theme
 */
export interface Theme {
  /** Primary color for prompts and questions */
  primary: typeof chalk.cyan;

  /** Secondary color for success messages */
  success: typeof chalk.green;

  /** Color for error messages */
  error: typeof chalk.red;

  /** Color for warning messages */
  warning: typeof chalk.yellow;

  /** Color for info messages */
  info: typeof chalk.blue;

  /** Color for muted/secondary text */
  muted: typeof chalk.gray;

  /** Color for highlighted text */
  highlight: typeof chalk.bold;

  /** Prefix symbol for prompts */
  prefix: string;

  /** Success icon */
  successIcon: string;

  /** Error icon */
  errorIcon: string;

  /** Warning icon */
  warningIcon: string;

  /** Info icon */
  infoIcon: string;
}
