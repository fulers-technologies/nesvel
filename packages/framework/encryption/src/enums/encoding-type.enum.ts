/**
 * Supported encoding types for encrypted data serialization.
 *
 * @enum {string}
 *
 * @remarks
 * - BASE64: Standard base64 encoding (default, most compact)
 * - HEX: Hexadecimal encoding (human-readable)
 * - UTF8: UTF-8 encoding (for text data)
 */
export enum EncodingType {
  /**
   * Base64 encoding - compact and URL-safe
   */
  BASE64 = 'base64',

  /**
   * Hexadecimal encoding - human-readable format
   */
  HEX = 'hex',

  /**
   * UTF-8 encoding - for text data
   */
  UTF8 = 'utf8',
}
