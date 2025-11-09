import type { CookieOptions } from './cookie-options.interface';

/**
 * Response builder interface.
 *
 * Provides a fluent interface for building HTTP responses.
 */
export interface ResponseBuilder {
  /**
   * Set the response status code.
   *
   * @param code - HTTP status code
   */
  status(code: number): this;

  /**
   * Set a response header.
   *
   * @param key - Header name
   * @param value - Header value
   */
  header(key: string, value: string | string[]): this;

  /**
   * Set multiple headers.
   *
   * @param headers - Headers object
   */
  headers(headers: Record<string, string | string[]>): this;

  /**
   * Set a cookie.
   *
   * @param name - Cookie name
   * @param value - Cookie value
   * @param options - Cookie options
   */
  cookie(name: string, value: string, options?: CookieOptions): this;

  /**
   * Remove a cookie.
   *
   * @param name - Cookie name
   */
  clearCookie(name: string): this;

  /**
   * Send the response.
   */
  send(): void | Promise<void>;
}
