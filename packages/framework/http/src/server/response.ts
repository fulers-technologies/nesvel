import type { Response as ExpressResponse } from 'express';
import type { CookieOptions } from '../types/server.types';

/**
 * Base Response Builder
 *
 * Fluent response builder for Express with Laravel-style helper methods.
 * Provides a chainable interface for building HTTP responses.
 *
 * @example
 * ```typescript
 * import { Response } from '@nesvel/nestjs-http';
 *
 * @Controller('users')
 * export class UsersController {
 *   @Get()
 *   index(@Res() response: Response) {
 *     return response
 *       .status(200)
 *       .header('X-Custom', 'value')
 *       .json({ users: [] });
 *   }
 * }
 * ```
 */
export class Response {
  /**
   * The underlying Express response.
   */
  protected res: ExpressResponse;

  /**
   * The original content before transformation.
   */
  protected original?: any;

  /**
   * Exception to be thrown with the response.
   */
  protected exception?: Error;

  /**
   * Create a new response builder instance.
   *
   * @param res - The Express response object
   */
  constructor(res: ExpressResponse) {
    this.res = res;
  }

  /**
   * Set the response status code.
   *
   * @param code - HTTP status code
   * @returns This response for chaining
   *
   * @example
   * ```typescript
   * response.status(201).json({ created: true });
   * ```
   */
  public status(code: number): this {
    this.res.status(code);
    return this;
  }

  /**
   * Set a response header.
   *
   * @param name - Header name
   * @param value - Header value
   * @returns This response for chaining
   *
   * @example
   * ```typescript
   * response.header('X-Custom', 'value');
   * ```
   */
  public header(name: string, value: number | string | readonly string[]): this {
    this.res.setHeader(name, value);
    return this;
  }

  /**
   * Set a response header (alias for header).
   *
   * @param name - Header name or headers object
   * @param value - Header value (optional if name is object)
   * @returns This response for chaining
   *
   * @example
   * ```typescript
   * response.set('X-Custom', 'value');
   * response.set({ 'X-Custom': 'value', 'X-Another': 'value2' });
   * ```
   */
  public set(name: string | Record<string, string | number>, value?: string | number): this {
    if (typeof name === 'object') {
      for (const [key, val] of Object.entries(name)) {
        this.res.set(key, String(val));
      }
    } else if (value !== undefined) {
      this.res.set(name, String(value));
    }
    return this;
  }

  /**
   * Set multiple headers.
   *
   * @param headers - Headers object
   * @returns This response for chaining
   *
   * @example
   * ```typescript
   * response.headers({
   *   'X-Custom': 'value',
   *   'X-Another': 'value2'
   * });
   * ```
   */
  public headers(headers: Record<string, string | string[]>): this {
    for (const [name, value] of Object.entries(headers)) {
      this.res.header(name, value);
    }
    return this;
  }

  /**
   * Set a cookie.
   *
   * @param name - Cookie name
   * @param value - Cookie value
   * @param options - Cookie options
   * @returns This response for chaining
   *
   * @example
   * ```typescript
   * response.cookie('session', 'abc123', {
   *   httpOnly: true,
   *   maxAge: 3600000
   * });
   * ```
   */
  public cookie(name: string, value: string, options?: CookieOptions): this {
    if (options) {
      this.res.cookie(name, value, options);
    } else {
      this.res.cookie(name, value);
    }
    return this;
  }

  /**
   * Clear a cookie.
   *
   * @param name - Cookie name
   * @param options - Cookie options
   * @returns This response for chaining
   *
   * @example
   * ```typescript
   * response.clearCookie('session');
   * ```
   */
  public clearCookie(name: string, options?: CookieOptions): this {
    if (options) {
      this.res.clearCookie(name, options);
    } else {
      this.res.clearCookie(name);
    }
    return this;
  }

  /**
   * Send JSON response.
   *
   * @param data - Data to send
   * @returns Express response
   *
   * @example
   * ```typescript
   * response.json({ users: [], total: 0 });
   * ```
   */
  public json(data: any): ExpressResponse {
    return this.res.json(data);
  }

  /**
   * Send response.
   *
   * @param body - Body to send (string, Buffer, or object) - optional
   * @returns Express response
   *
   * @example
   * ```typescript
   * response.send('Hello World');
   * response.send(buffer);
   * response.send({ data: 'value' });
   * response.send(); // No content
   * ```
   */
  public send(body?: string | Buffer | Record<string, any>): ExpressResponse {
    return this.res.send(body);
  }

  /**
   * Redirect to URL.
   *
   * @param url - URL to redirect to
   * @param status - HTTP status code (default: 302)
   * @returns Express response
   *
   * @example
   * ```typescript
   * response.redirect('/login');
   * response.redirect('/home', 301);
   * ```
   */
  public redirect(url: string, status = 302): void {
    this.res.redirect(status, url);
  }

  /**
   * Set cache control header.
   *
   * @param seconds - Cache duration in seconds
   * @returns This response for chaining
   *
   * @example
   * ```typescript
   * response.cache(3600).json({ data });
   * ```
   */
  public cache(seconds: number): this {
    this.res.set('Cache-Control', `public, max-age=${seconds}`);
    return this;
  }

  /**
   * Disable caching.
   *
   * @returns This response for chaining
   *
   * @example
   * ```typescript
   * response.noCache().json({ data });
   * ```
   */
  public noCache(): this {
    this.res.set('Cache-Control', 'no-store, no-cache, must-revalidate, private');
    return this;
  }

  /**
   * Get the underlying Express response.
   *
   * @returns The Express response object
   *
   * @example
   * ```typescript
   * const expressRes = response.getExpressResponse();
   * ```
   */
  public getExpressResponse(): ExpressResponse {
    return this.res;
  }

  /**
   * Get the response content.
   *
   * Laravel-compatible method for getting response body.
   *
   * @returns The response content or false
   *
   * @example
   * ```typescript
   * const content = response.getContent();
   * ```
   */
  public getContent(): string | false {
    // In Express, we can't easily get the content after it's sent
    // This would require intercepting res.send/json
    return this.original ? JSON.stringify(this.original) : '';
  }

  /**
   * Set the response content.
   *
   * Laravel-compatible method for setting response body.
   *
   * @param content - Content to set
   * @returns This response for chaining
   *
   * @example
   * ```typescript
   * response.setContent({ data: 'value' });
   * response.setContent('Hello World');
   * ```
   */
  public setContent(content: any): this {
    this.original = content;

    // Determine content type and send appropriately
    if (this.shouldBeJson(content)) {
      this.res.setHeader('Content-Type', 'application/json');
      const jsonContent = this.morphToJson(content);
      if (jsonContent === false) {
        throw new Error('Failed to encode content to JSON');
      }
    }

    return this;
  }

  /**
   * Get the response status code.
   *
   * @returns The HTTP status code
   *
   * @example
   * ```typescript
   * const code = response.status(); // 200
   * ```
   */
  public getStatus(): number {
    return this.res.statusCode;
  }

  /**
   * Get the response status text.
   *
   * @returns The HTTP status message
   *
   * @example
   * ```typescript
   * const text = response.statusText(); // 'OK'
   * ```
   */
  public statusText(): string {
    return this.res.statusMessage || '';
  }

  /**
   * Get the response content (alias for getContent).
   *
   * @returns The response content
   *
   * @example
   * ```typescript
   * const content = response.content();
   * ```
   */
  public content(): string | false {
    return this.getContent();
  }

  /**
   * Get the original content before transformation.
   *
   * @returns The original content
   *
   * @example
   * ```typescript
   * const original = response.getOriginalContent();
   * ```
   */
  public getOriginalContent(): any {
    return this.original;
  }

  /**
   * Set multiple headers (Laravel signature).
   *
   * @param headers - Headers to set
   * @returns This response for chaining
   *
   * @example
   * ```typescript
   * response.withHeaders({
   *   'X-Custom': 'value',
   *   'X-Another': 'value2'
   * });
   * ```
   */
  public withHeaders(headers: Record<string, string | string[]>): this {
    return this.headers(headers);
  }

  /**
   * Set a cookie (Laravel signature - accepts cookie object).
   *
   * @param cookie - Cookie object or name
   * @param value - Cookie value (if cookie is string)
   * @param options - Cookie options
   * @returns This response for chaining
   *
   * @example
   * ```typescript
   * response.withCookie({ name: 'session', value: 'abc', options: {...} });
   * response.withCookie('session', 'abc', { httpOnly: true });
   * ```
   */
  public withCookie(
    cookie: string | { name: string; value: string; options?: CookieOptions },
    value?: string,
    options?: CookieOptions,
  ): this {
    if (typeof cookie === 'string') {
      return this.cookie(cookie, value!, options);
    } else {
      return this.cookie(cookie.name, cookie.value, cookie.options);
    }
  }

  /**
   * Remove a cookie (Laravel signature).
   *
   * @param cookie - Cookie name or object
   * @param path - Cookie path
   * @param domain - Cookie domain
   * @returns This response for chaining
   *
   * @example
   * ```typescript
   * response.withoutCookie('session');
   * response.withoutCookie('session', '/', 'example.com');
   * ```
   */
  public withoutCookie(
    cookie: string | { name: string; path?: string; domain?: string },
    path?: string,
    domain?: string,
  ): this {
    if (typeof cookie === 'string') {
      return this.clearCookie(cookie, { path, domain } as CookieOptions);
    } else {
      return this.clearCookie(cookie.name, {
        path: cookie.path,
        domain: cookie.domain,
      } as CookieOptions);
    }
  }

  /**
   * Get the callback to be executed.
   *
   * Used for streaming responses or custom response handling.
   *
   * @returns The callback function
   *
   * @example
   * ```typescript
   * const callback = response.getCallback();
   * ```
   */
  public getCallback(): Function | null {
    // Not directly applicable in Express, return null
    return null;
  }

  /**
   * Set an exception to be thrown with the response.
   *
   * @param error - The error to associate with response
   * @returns This response for chaining
   *
   * @example
   * ```typescript
   * response.withException(new Error('Something went wrong'));
   * ```
   */
  public withException(error: Error): this {
    this.exception = error;
    return this;
  }

  /**
   * Throw the response exception if set.
   *
   * @throws Error if exception was set
   *
   * @example
   * ```typescript
   * response.withException(new Error('Failed')).throwResponse();
   * ```
   */
  public throwResponse(): void {
    if (this.exception) {
      throw this.exception;
    }
  }

  /**
   * Determine if the given content should be turned into JSON.
   *
   * @param content - Content to check
   * @returns True if should be JSON
   */
  protected shouldBeJson(content: any): boolean {
    return (
      typeof content === 'object' &&
      content !== null &&
      !Buffer.isBuffer(content) &&
      !(content instanceof Date)
    );
  }

  /**
   * Morph the given content into JSON.
   *
   * @param content - Content to convert
   * @returns JSON string or false on failure
   */
  protected morphToJson(content: any): string | false {
    try {
      // Check if content has toJSON method
      if (content && typeof content.toJSON === 'function') {
        return JSON.stringify(content.toJSON());
      }

      // Check if content has toArray method (Laravel-style)
      if (content && typeof content.toArray === 'function') {
        return JSON.stringify(content.toArray());
      }

      return JSON.stringify(content);
    } catch (error) {
      return false;
    }
  }
}
