import type { Response } from 'express';
import { I18nContext } from 'nestjs-i18n';
import { TextDirection } from '../enums';

import {
  COOKIE_OPTIONS,
  DEFAULT_COOKIE_NAME,
  DEFAULT_LANGUAGE,
  isRTL,
  isSupportedLanguage,
  LANGUAGE_NAMES,
  type SupportedLanguage,
} from '../constants';

/**
 * Language Helper Utilities
 *
 * Provides utility functions for language management.
 *
 * @module LanguageHelpers
 */

/**
 * Get Current Language
 *
 * Gets the current language from the I18n context.
 *
 * @returns Current language code
 *
 * @example
 * ```typescript
 * const lang = getCurrentLanguage(); // 'en', 'ar', 'fr', or 'es'
 * ```
 */
export function getCurrentLanguage(): SupportedLanguage {
  const i18n = I18nContext.current();
  const lang = i18n?.lang || DEFAULT_LANGUAGE;

  return isSupportedLanguage(lang) ? lang : DEFAULT_LANGUAGE;
}

/**
 * Get Current Text Direction
 *
 * Gets the text direction (LTR or RTL) for the current language.
 *
 * @returns TextDirection.LTR or TextDirection.RTL
 *
 * @example
 * ```typescript
 * const direction = getCurrentTextDirection(); // TextDirection.LTR or TextDirection.RTL
 * ```
 */
export function getCurrentTextDirection(): TextDirection {
  const lang = getCurrentLanguage();
  return isRTL(lang) ? TextDirection.RTL : TextDirection.LTR;
}

/**
 * Get Language Display Name
 *
 * Gets the human-readable display name for a language.
 *
 * @param lang - Language code
 * @returns Display name
 *
 * @example
 * ```typescript
 * getLanguageDisplayName('en'); // 'English'
 * getLanguageDisplayName('ar'); // 'العربية'
 * ```
 */
export function getLanguageDisplayName(lang: string): string {
  if (!isSupportedLanguage(lang)) {
    return LANGUAGE_NAMES[DEFAULT_LANGUAGE];
  }

  return LANGUAGE_NAMES[lang];
}

/**
 * Set Language Cookie
 *
 * Sets the language cookie in the response.
 *
 * @param res - Express response object
 * @param lang - Language code to set
 *
 * @example
 * ```typescript
 * @Post('language')
 * setLanguage(@Res() res: Response, @Body('lang') lang: string) {
 *   setLanguageCookie(res, lang);
 *   return { message: 'Language updated' };
 * }
 * ```
 */
export function setLanguageCookie(res: Response, lang: string): void {
  if (!isSupportedLanguage(lang)) {
    lang = DEFAULT_LANGUAGE;
  }

  res.cookie(DEFAULT_COOKIE_NAME, lang, COOKIE_OPTIONS);
}

/**
 * Clear Language Cookie
 *
 * Clears the language cookie from the response.
 *
 * @param res - Express response object
 *
 * @example
 * ```typescript
 * @Delete('language')
 * clearLanguage(@Res() res: Response) {
 *   clearLanguageCookie(res);
 *   return { message: 'Language cookie cleared' };
 * }
 * ```
 */
export function clearLanguageCookie(res: Response): void {
  res.clearCookie(DEFAULT_COOKIE_NAME);
}

/**
 * Validate and Sanitize Language
 *
 * Validates a language code and returns a sanitized version.
 * Falls back to default language if invalid.
 *
 * @param lang - Language code to validate
 * @returns Validated language code
 *
 * @example
 * ```typescript
 * validateLanguage('en'); // 'en'
 * validateLanguage('invalid'); // 'en' (fallback)
 * validateLanguage('FR'); // 'fr' (normalized)
 * ```
 */
export function validateLanguage(lang?: string | null): SupportedLanguage {
  if (!lang) {
    return DEFAULT_LANGUAGE;
  }

  const normalized = lang.toLowerCase().trim();

  return isSupportedLanguage(normalized) ? normalized : DEFAULT_LANGUAGE;
}
