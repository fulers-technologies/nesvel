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

// Module
export * from './i18n.module';

// Constants
export * from './constants';

// Interfaces
export * from './interfaces';

// Utilities
export * from './utils';
