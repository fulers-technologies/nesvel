import type { CookieOptions } from '../server/cookie-options.interface';

/**
 * Cookie Parser Configuration
 *
 * Settings for parsing and signing cookies.
 */
export interface HttpCookieParserConfig {
  /**
   * Enable cookie parser
   *
   * @env HTTP_COOKIE_PARSER_ENABLED
   * @default true
   */
  enabled?: boolean;

  /**
   * Secret for signing cookies
   *
   * Can be a string or array of strings for key rotation.
   *
   * @env HTTP_COOKIE_SECRET
   */
  secret?: string | string[];

  /**
   * Default cookie options
   *
   * Applied to all cookies unless overridden.
   */
  defaultOptions?: CookieOptions;
}
