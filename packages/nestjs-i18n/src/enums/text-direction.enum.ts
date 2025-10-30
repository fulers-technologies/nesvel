/**
 * Text Direction Enum
 *
 * Defines the text direction for internationalization (i18n) support.
 * Different languages and scripts require different text flow directions.
 *
 * @enum {string}
 * @since 1.0.0
 */
export enum TextDirection {
  /**
   * Left-to-right text direction
   * Used by most Latin-based languages (English, Spanish, French, etc.)
   * and many Asian languages (Chinese, Japanese, Korean, etc.)
   */
  LTR = 'ltr',

  /**
   * Right-to-left text direction
   * Used by Arabic, Hebrew, Persian, Urdu, and other Semitic languages
   */
  RTL = 'rtl',
}
