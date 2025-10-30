/**
 * Themes Module
 *
 * @description
 * Exports all available theme configurations and utilities for customizing
 * the visual appearance of console prompts and messages.
 *
 * @module themes
 *
 * @example
 * ```typescript
 * import { setTheme, ThemeType } from './themes';
 *
 * // Set active theme
 * setTheme(ThemeType.RED);
 * ```
 */

export * from './default';
export * from './red';
export * from './orange';
export * from './purpule';

// Export theme configuration functions
export * from './config';
