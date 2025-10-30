/**
 * Internationalization Configuration
 *
 * Language and locale settings for multi-language support.
 */
export const i18nConfig = {
  /**
   * Default locale
   */
  defaultLocale: 'en',

  /**
   * Supported locales
   */
  locales: ['en'],

  /**
   * Locale labels for UI
   */
  localeLabels: {
    en: 'English',
  },

  /**
   * Locale-specific domains (for domain-based routing)
   */
  domains: {
    // en: 'nesvel.com',
  },
} as const;

/**
 * Type export for TypeScript consumers
 */
export type I18nConfig = typeof i18nConfig;
