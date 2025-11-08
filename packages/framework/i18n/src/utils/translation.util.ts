import { I18nContext, TranslateOptions } from 'nestjs-i18n';

/**
 * Translation Utilities
 *
 * Provides shorthand utility functions for translations.
 * These are convenience wrappers around nestjs-i18n's I18nContext.
 *
 * @module TranslationUtils
 */

/**
 * Translate (Short Form)
 *
 * Shorthand function for translating a key.
 * Alias for I18nContext.current().t()
 *
 * @param key - Translation key (e.g., 'common.welcome')
 * @param options - Translation options (args, lang, defaultValue)
 * @returns Translated string
 *
 * @example
 * ```typescript
 * import { t } from '@nesvel/nestjs-i18n';
 *
 * const message = t('common.welcome');
 * const greeting = t('common.hello', { args: { name: 'John' } });
 * const fallback = t('missing.key', { defaultValue: 'Default text' });
 * ```
 */
export function t(key: string, options?: TranslateOptions): string {
  const i18n = I18nContext.current();
  if (!i18n) {
    return options?.defaultValue || key;
  }
  return i18n.t(key, options);
}

/**
 * Translate (Medium Form)
 *
 * Medium-length function name for translating a key.
 * Alias for I18nContext.current().t()
 *
 * @param key - Translation key (e.g., 'common.welcome')
 * @param options - Translation options (args, lang, defaultValue)
 * @returns Translated string
 *
 * @example
 * ```typescript
 * import { trans } from '@nesvel/nestjs-i18n';
 *
 * const message = trans('common.welcome');
 * const greeting = trans('common.hello', { args: { name: 'John' } });
 * ```
 */
export function trans(key: string, options?: TranslateOptions): string {
  return t(key, options);
}

/**
 * Translate (Long Form)
 *
 * Full-length function name for translating a key.
 * Alias for I18nContext.current().t()
 *
 * @param key - Translation key (e.g., 'common.welcome')
 * @param options - Translation options (args, lang, defaultValue)
 * @returns Translated string
 *
 * @example
 * ```typescript
 * import { translate } from '@nesvel/nestjs-i18n';
 *
 * const message = translate('common.welcome');
 * const greeting = translate('common.hello', { args: { name: 'John' } });
 * ```
 */
export function translate(key: string, options?: TranslateOptions): string {
  return t(key, options);
}
