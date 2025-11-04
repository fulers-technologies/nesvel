import * as path from 'path';

import {
  AcceptLanguageResolver,
  CookieResolver,
  HeaderResolver,
  I18nJsonLoader,
  QueryResolver,
} from 'nestjs-i18n';

import {
  I18nConfig,
  COOKIE_OPTIONS,
  DEFAULT_COOKIE_NAME,
  DEFAULT_LANGUAGE,
  DEFAULT_QUERY_PARAM,
  FALLBACK_LANGUAGES,
  SUPPORTED_LANGUAGES,
} from '@nesvel/nestjs-i18n';

const isDevelopment = process.env.NODE_ENV === 'development';
const isProduction = process.env.NODE_ENV === 'production';

/**
 * I18n Module Configuration
 *
 * Production-ready internationalization configuration for NestJS.
 * Provides comprehensive multi-language support with type safety.
 *
 * Features:
 * - Multiple language resolvers (Query, Cookie, Header)
 * - Fallback language support
 * - Type-safe translation keys
 * - Live reloading in development
 * - JSON loader for translation files
 *
 * @see {@link https://nestjs-i18n.com | nestjs-i18n Documentation}
 */
export const i18nConfig: I18nConfig = {
  /**
   * Default fallback language
   */
  fallbackLanguage: DEFAULT_LANGUAGE,

  /**
   * Fallback languages for each supported language
   *
   * When a translation key is missing, the system will try
   * the fallback languages in order.
   */
  fallbacks: FALLBACK_LANGUAGES || SUPPORTED_LANGUAGES,

  /**
   * Translation File Loader
   *
   * Uses JSON loader to load translation files from the i18n directory.
   */
  loader: I18nJsonLoader,

  /**
   * Loader Options
   */
  loaderOptions: {
    /**
     * Path to translation files
     */
    path: path.join(__dirname, '..', 'i18n/'),

    /**
     * Enable live reloading in development
     *
     * When true, translation files are automatically reloaded
     * when they change (useful for development)
     */
    watch: isDevelopment,
  },

  /**
   * Language Resolvers
   *
   * Resolvers are checked in the order specified here.
   * The first resolver that finds a language will be used.
   *
   * Priority:
   * 1. Query parameter (e.g., ?lang=en)
   * 2. Cookie (e.g., lang=en)
   * 3. Accept-Language header
   */
  resolvers: [
    /**
     * Query Parameter Resolver
     *
     * Extracts language from query parameter (e.g., ?lang=en)
     */
    new QueryResolver([DEFAULT_QUERY_PARAM, 'language', 'locale']),

    /**
     * Cookie Resolver
     *
     * Extracts language from cookie
     */
    new CookieResolver([DEFAULT_COOKIE_NAME, 'language', 'locale', 'i18next']),

    /**
     * Accept-Language Header Resolver
     *
     * Extracts language from Accept-Language HTTP header
     */
    new AcceptLanguageResolver(),

    /**
     * Custom Header Resolver
     *
     * Allows clients to specify language via custom header
     * (e.g., X-Custom-Lang: en)
     */
    new HeaderResolver(['x-lang']),
  ],

  /**
   * Type Generation
   *
   * Generates TypeScript types for translation keys
   * to enable type-safe translations
   */
  typesOutputPath: isDevelopment
    ? path.join(__dirname, '../generated/i18n.generated.ts')
    : undefined,

  /**
   * Logging Options
   */
  logging: !isProduction,

  /**
   * Throw error on missing translation key
   *
   * In development: Throw error (helps catch missing translations)
   * In production: Return key path (graceful degradation)
   */
  throwOnMissingKey: isDevelopment,
};

/**
 * Cookie Configuration for Language Persistence
 *
 * Export cookie options for setting language cookie in controllers
 */
export const languageCookieOptions = COOKIE_OPTIONS;
