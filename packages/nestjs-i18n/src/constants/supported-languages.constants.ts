/**
 * Supported Languages Constants
 *
 * Defines all languages supported by the application.
 *
 * @module SupportedLanguages
 */

/**
 * Supported Language Codes
 *
 * ISO 639-1 two-letter language codes
 */
export const SUPPORTED_LANGUAGES = ['en', 'ar'] as const;

/**
 * Type-safe language code type
 */
export type SupportedLanguage = (typeof SUPPORTED_LANGUAGES)[number];

/**
 * Default Language
 *
 * Used when no language is specified or detected
 */
export const DEFAULT_LANGUAGE: SupportedLanguage = 'en';

/**
 * Fallback Languages Map
 *
 * Defines fallback language for each supported language.
 * Used when a translation key is missing in the requested language.
 * Compatible with nestjs-i18n which expects a single fallback language string.
 *
 * @example
 * ```typescript
 * // If Arabic translation is missing, fall back to English
 * FALLBACK_LANGUAGES['ar'] // Returns 'en'
 * ```
 */
export const FALLBACK_LANGUAGES: Record<string, string> = {
  'en-*': 'en',
  'ar-*': 'ar',
  ar: 'en', // Arabic falls back to English
};

/**
 * Language Display Names
 *
 * Human-readable names for each language
 */
export const LANGUAGE_NAMES: Record<SupportedLanguage, string> = {
  en: 'English',
  ar: 'العربية',
};

/**
 * Check if a language is RTL (Right-to-Left)
 *
 * @param lang - Language code to check
 * @returns True if language is RTL
 */
export function isRTL(lang: string): boolean {
  const rtlLanguages: SupportedLanguage[] = ['ar'];
  return rtlLanguages.includes(lang as SupportedLanguage);
}

/**
 * Check if a language is supported
 *
 * @param lang - Language code to check
 * @returns True if language is supported
 */
export function isSupportedLanguage(lang: string): lang is SupportedLanguage {
  return SUPPORTED_LANGUAGES.includes(lang as SupportedLanguage);
}
