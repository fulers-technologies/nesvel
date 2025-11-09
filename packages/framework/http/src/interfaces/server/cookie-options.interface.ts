/**
 * Cookie options for setting cookies in responses.
 *
 * Extends Express cookie options with additional Laravel-style options.
 */
export interface CookieOptions {
  /**
   * Domain for the cookie.
   */
  domain?: string;

  /**
   * Path for the cookie.
   */
  path?: string;

  /**
   * Whether cookie is secure (HTTPS only).
   */
  secure?: boolean;

  /**
   * Whether cookie is HTTP only.
   */
  httpOnly?: boolean;

  /**
   * Max age in milliseconds.
   */
  maxAge?: number;

  /**
   * Expiration date.
   */
  expires?: Date;

  /**
   * SameSite policy.
   */
  sameSite?: boolean | 'lax' | 'strict' | 'none';

  /**
   * Whether to sign the cookie.
   */
  signed?: boolean;
}
