/**
 * I18n Module
 *
 * Production-ready internationalization module for NestJS applications.
 * Provides comprehensive multi-language support with type safety.
 *
 * @module I18n
 *
 * @example
 * ```typescript
 * // Import module
 * import { I18nModule } from '@/modules/i18n';
 *
 * // Import constants
 * import { SUPPORTED_LANGUAGES, DEFAULT_LANGUAGE } from '@/modules/i18n';
 *
 * // Import utilities
 * import { getCurrentLanguage, setLanguageCookie } from '@/modules/i18n';
 * ```
 */

// Re-export everything from nestjs-i18n except I18nModule (to avoid conflict)
export { I18nContext, I18nService, I18n, I18nLang, I18nJsonLoader, I18nLoader } from 'nestjs-i18n';

export type {
  I18nResolver,
  I18nOptions,
  I18nOptionsWithoutResolvers,
  TranslateOptions,
  Path,
  PathValue,
} from 'nestjs-i18n';

// Module (our custom wrapper)
export * from './i18n.module';

// Constants
export * from './constants';

// Interfaces
export * from './interfaces';

// Utilities
export * from './utils';
