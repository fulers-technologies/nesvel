/**
 * I18n Interfaces
 *
 * Exports all interfaces for the i18n module.
 *
 * @module Interfaces
 */

export * from './i18n-config.interface';

/**
 * Type Aliases
 *
 * Convenient type aliases for common interfaces.
 */
import type { I18nOptions } from 'nestjs-i18n';

/**
 * I18n Configuration (nestjs-i18n compatible)
 *
 * Alias for I18nOptions from nestjs-i18n to provide compatibility
 * when integrating with the base nestjs-i18n module.
 *
 * Note: For custom Nesvel configuration, use `I18nModuleConfig` instead.
 *
 * @example
 * ```typescript
 * // Using nestjs-i18n options
 * const config: I18nOptions = {
 *   fallbackLanguage: 'en',
 *   loaderOptions: {
 *     path: './src/i18n',
 *     watch: true,
 *   },
 * };
 * ```
 */
export type I18nConfig = I18nOptions;
