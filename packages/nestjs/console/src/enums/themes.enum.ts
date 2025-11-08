/**
 * Theme Types Enum
 *
 * @description
 * Defines the available color themes for console prompts and messages.
 * Themes control the visual appearance and color schemes of all interactive elements.
 *
 * @enum {string}
 *
 * @example
 * ```typescript
 * import { ThemeType } from './enums';
 * import { applyTheme } from './themes';
 *
 * // Apply a theme to customize appearance
 * applyTheme(ThemeType.RED);
 * ```
 */
export enum ThemeType {
  /** Default theme with cyan/green color scheme */
  DEFAULT = 'default',

  /** Red theme for error-focused or critical operations */
  RED = 'red',

  /** Orange theme for warning-focused operations */
  ORANGE = 'orange',

  /** Purple theme for a unique, vibrant appearance */
  PURPLE = 'purple',
}
