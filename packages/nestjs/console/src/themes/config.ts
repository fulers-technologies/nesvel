import type { Theme } from '@/interfaces/theme.interface';
import { defaultTheme } from './default';
import { redTheme } from './red';
import { orangeTheme } from './orange';
import { purpleTheme } from './purpule';
import { ThemeType } from '@/enums/themes.enum';

/**
 * Theme Configuration Manager
 *
 * @description
 * Global theme manager that controls the active theme used by all prompts and messages.
 * Provides functions to get, set, and switch themes dynamically.
 *
 * @example
 * ```typescript
 * import { setTheme, getTheme, ThemeType } from 'console-prompts';
 *
 * // Set a new theme
 * setTheme(ThemeType.RED);
 *
 * // Get current theme
 * const theme = getTheme();
 * console.log(theme.primary('Message'));
 * ```
 */

/**
 * Internal active theme state
 */
let activeTheme: Theme = defaultTheme;

/**
 * Theme registry mapping theme types to theme objects
 */
const themeRegistry: Record<ThemeType, Theme> = {
  [ThemeType.DEFAULT]: defaultTheme,
  [ThemeType.RED]: redTheme,
  [ThemeType.ORANGE]: orangeTheme,
  [ThemeType.PURPLE]: purpleTheme,
};

/**
 * Get Active Theme
 *
 * @description
 * Returns the currently active theme configuration.
 *
 * @returns {Theme} The active theme object
 *
 * @example
 * ```typescript
 * const theme = getTheme();
 * console.log(theme.primary('Hello World'));
 * ```
 */
export function getTheme(): Theme {
  return activeTheme;
}

/**
 * Set Theme
 *
 * @description
 * Sets the active theme for all prompts and messages.
 * Changes take effect immediately for all subsequent operations.
 *
 * @param {ThemeType | Theme} theme - Theme type enum or custom theme object
 *
 * @example
 * ```typescript
 * import { setTheme, ThemeType } from 'console-prompts';
 *
 * // Use a built-in theme
 * setTheme(ThemeType.RED);
 *
 * // Use a custom theme
 * setTheme({
 *   primary: chalk.magenta,
 *   success: chalk.green,
 *   error: chalk.red,
 *   // ... other theme properties
 * });
 * ```
 */
export function setTheme(theme: ThemeType | Theme): void {
  if (typeof theme === 'string') {
    // Theme type enum provided
    if (theme in themeRegistry) {
      activeTheme = themeRegistry[theme];
    } else {
      console.warn(`Unknown theme type: ${theme}, falling back to default`);
      activeTheme = defaultTheme;
    }
  } else {
    // Custom theme object provided
    activeTheme = theme;
  }
}

/**
 * Reset Theme
 *
 * @description
 * Resets the active theme to the default theme.
 *
 * @example
 * ```typescript
 * import { resetTheme } from 'console-prompts';
 *
 * resetTheme();
 * ```
 */
export function resetTheme(): void {
  activeTheme = defaultTheme;
}

/**
 * Get Available Themes
 *
 * @description
 * Returns a list of all available built-in theme types.
 *
 * @returns {ThemeType[]} Array of theme type enums
 *
 * @example
 * ```typescript
 * import { getAvailableThemes } from 'console-prompts';
 *
 * const themes = getAvailableThemes();
 * console.log(themes); // ['default', 'red', 'orange', 'purple']
 * ```
 */
export function getAvailableThemes(): ThemeType[] {
  return Object.values(ThemeType);
}

/**
 * Get Theme By Type
 *
 * @description
 * Returns a theme object for a specific theme type without setting it as active.
 *
 * @param {ThemeType} type - The theme type to retrieve
 * @returns {Theme} The theme object
 *
 * @example
 * ```typescript
 * import { getThemeByType, ThemeType } from 'console-prompts';
 *
 * const redTheme = getThemeByType(ThemeType.RED);
 * console.log(redTheme.primary('Red text'));
 * ```
 */
export function getThemeByType(type: ThemeType): Theme {
  return themeRegistry[type] || defaultTheme;
}
