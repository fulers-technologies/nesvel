import type { SupportedLanguage } from '../constants';

/**
 * I18n Module Configuration Interface
 *
 * Configuration options for the i18n module.
 *
 * @interface I18nConfig
 *
 * @example
 * ```typescript
 * const config: I18nConfig = {
 *   fallbackLanguage: 'en',
 *   supportedLanguages: ['en', 'ar', 'fr', 'es'],
 *   translationsPath: './src/i18n',
 *   watch: true
 * };
 * ```
 */
export interface I18nConfig {
  /**
   * Default fallback language
   *
   * Used when no language is detected or translation is missing
   *
   * @default 'en'
   */
  fallbackLanguage: SupportedLanguage;

  /**
   * List of supported languages
   *
   * @example ['en', 'ar', 'fr', 'es']
   */
  supportedLanguages: readonly SupportedLanguage[];

  /**
   * Path to translation files
   *
   * @example './src/i18n'
   * @example path.join(__dirname, 'i18n')
   */
  translationsPath: string;

  /**
   * Enable live reloading of translation files in development
   *
   * When true, translation files are automatically reloaded
   * when they change (useful for development)
   *
   * @default true (development), false (production)
   */
  watch?: boolean;

  /**
   * Enable type generation for translations
   *
   * When true, generates TypeScript types for translation keys
   *
   * @default true
   */
  typesOutputPath?: string;

  /**
   * Logging configuration
   */
  logging?: {
    /**
     * Enable logging
     * @default true (development), false (production)
     */
    enabled?: boolean;

    /**
     * Log missing translation keys
     * @default true
     */
    logMissing?: boolean;
  };
}
