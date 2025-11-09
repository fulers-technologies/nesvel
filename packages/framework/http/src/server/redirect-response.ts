import { Macroable } from '@nesvel/macroable';
import { Response as ExpressResponse, Request as ExpressRequest } from 'express';

/**
 * Redirect Response Builder
 *
 * Laravel-style redirect response with flash data support.
 * Provides fluent API for building redirects with session data.
 *
 * @example
 * ```typescript
 * // Basic redirect
 * return RedirectResponse.to('/dashboard');
 *
 * // Redirect with flash data
 * return RedirectResponse.to('/dashboard')
 *   .with('success', 'Profile updated!');
 *
 * // Redirect with input
 * return RedirectResponse.back()
 *   .withInput()
 *   .withErrors({ email: 'Invalid email' });
 * ```
 */
@Macroable()
export class RedirectResponse {
  protected url: string;
  protected statusCode: number = 302;
  protected flashData: Record<string, any> = {};
  protected inputData?: Record<string, any>;
  protected errorData?: Record<string, any>;
  protected cookiesData: Array<{ name: string; value: string; options?: any }> = [];
  protected request?: ExpressRequest;
  protected fragment?: string;

  /**
   * Constructor
   *
   * @param url - Target URL for redirect
   * @param status - HTTP status code (default: 302)
   */
  constructor(url: string, status: number = 302) {
    this.url = url;
    this.statusCode = status;
  }

  /**
   * Create a redirect to a given URL.
   *
   * @param url - Target URL
   * @param status - HTTP status code
   * @returns RedirectResponse instance
   *
   * @example
   * ```typescript
   * RedirectResponse.to('/dashboard');
   * RedirectResponse.to('/login', 301); // Permanent redirect
   * ```
   */
  public static to(url: string, status: number = 302): RedirectResponse {
    return RedirectResponse.make(url, status);
  }

  /**
   * Create a redirect to the previous URL.
   *
   * @param status - HTTP status code
   * @param fallback - Fallback URL if referer is not available
   * @returns RedirectResponse instance
   *
   * @example
   * ```typescript
   * RedirectResponse.back();
   * RedirectResponse.back(302, '/home');
   * ```
   */
  public static back(status: number = 302, fallback: string = '/'): RedirectResponse {
    const url = 'back'; // Will be resolved in send() method
    const response = RedirectResponse.make(url, status);
    response.flashData['_fallback'] = fallback;
    return response;
  }

  /**
   * Create a redirect to a route.
   *
   * @param route - Route name
   * @param parameters - Route parameters
   * @param status - HTTP status code
   * @returns RedirectResponse instance
   *
   * @example
   * ```typescript
   * RedirectResponse.route('user.profile', { id: 123 });
   * ```
   */
  public static route(
    route: string,
    parameters?: Record<string, any>,
    status: number = 302
  ): RedirectResponse {
    // Route resolution would be handled by a URL generator
    // For now, we'll store the route info
    const response = RedirectResponse.make(route, status);
    response.flashData['_route'] = { name: route, parameters };
    return response;
  }

  /**
   * Flash a piece of data to the session.
   *
   * @param key - Flash data key or object of key-value pairs
   * @param value - Flash data value
   * @returns This instance for chaining
   *
   * @example
   * ```typescript
   * redirect.with('status', 'Profile updated!');
   * redirect.with({ status: 'Success', message: 'Done' });
   * ```
   */
  public with(key: string | Record<string, any>, value?: any): this {
    if (typeof key === 'object') {
      Object.entries(key).forEach(([k, v]) => {
        this.flashData[k] = v;
      });
    } else {
      this.flashData[key] = value;
    }
    return this;
  }

  /**
   * Flash the request input to the session.
   *
   * @param input - Optional specific input to flash
   * @returns This instance for chaining
   *
   * @example
   * ```typescript
   * redirect.withInput();
   * redirect.withInput({ email: 'user@example.com' });
   * ```
   */
  public withInput(input?: Record<string, any>): this {
    this.inputData = input;
    return this;
  }

  /**
   * Flash only specific input fields to the session.
   *
   * @param keys - Field names to flash
   * @returns This instance for chaining
   *
   * @example
   * ```typescript
   * redirect.onlyInput('email', 'name');
   * ```
   */
  public onlyInput(...keys: string[]): this {
    if (this.request) {
      const input: Record<string, any> = {};
      keys.forEach((key) => {
        if (this.request?.body?.[key] !== undefined) {
          input[key] = this.request.body[key];
        }
      });
      this.inputData = input;
    }
    return this;
  }

  /**
   * Flash all input except specific fields to the session.
   *
   * @param keys - Field names to exclude
   * @returns This instance for chaining
   *
   * @example
   * ```typescript
   * redirect.exceptInput('password', 'password_confirmation');
   * ```
   */
  public exceptInput(...keys: string[]): this {
    if (this.request?.body) {
      const input = { ...this.request.body };
      keys.forEach((key) => {
        delete input[key];
      });
      this.inputData = this.removeFilesFromInput(input);
    }
    return this;
  }

  /**
   * Flash validation errors to the session.
   *
   * @param errors - Validation errors
   * @param key - Error bag key (default: 'default')
   * @returns This instance for chaining
   *
   * @example
   * ```typescript
   * redirect.withErrors({ email: 'Invalid email' });
   * redirect.withErrors(validator.errors(), 'form');
   * ```
   */
  public withErrors(errors: Record<string, any> | string, key: string = 'default'): this {
    if (!this.errorData) {
      this.errorData = {};
    }
    this.errorData[key] = typeof errors === 'string' ? { message: errors } : errors;
    return this;
  }

  /**
   * Add cookies to the response.
   *
   * @param cookies - Array of cookie objects
   * @returns This instance for chaining
   *
   * @example
   * ```typescript
   * redirect.withCookies([
   *   { name: 'theme', value: 'dark', options: { maxAge: 86400 } }
   * ]);
   * ```
   */
  public withCookies(cookies: Array<{ name: string; value: string; options?: any }>): this {
    this.cookiesData = [...this.cookiesData, ...cookies];
    return this;
  }

  /**
   * Add a cookie to the response.
   *
   * @param name - Cookie name
   * @param value - Cookie value
   * @param options - Cookie options
   * @returns This instance for chaining
   *
   * @example
   * ```typescript
   * redirect.withCookie('theme', 'dark', { maxAge: 86400 });
   * ```
   */
  public withCookie(name: string, value: string, options?: any): this {
    this.cookiesData.push({ name, value, options });
    return this;
  }

  /**
   * Add a fragment identifier to the URL.
   *
   * @param fragment - Fragment identifier (with or without #)
   * @returns This instance for chaining
   *
   * @example
   * ```typescript
   * redirect.withFragment('section-2');
   * redirect.withFragment('#comments');
   * ```
   */
  public withFragment(fragment: string): this {
    this.fragment = fragment.startsWith('#') ? fragment.substring(1) : fragment;
    return this;
  }

  /**
   * Remove any fragment identifier from the URL.
   *
   * @returns This instance for chaining
   *
   * @example
   * ```typescript
   * redirect.withoutFragment();
   * ```
   */
  public withoutFragment(): this {
    this.fragment = undefined;
    return this;
  }

  /**
   * Get the target URL.
   *
   * @returns Target URL
   */
  public getTargetUrl(): string {
    let url = this.url;
    if (this.fragment) {
      url = url.split('#')[0] + '#' + this.fragment;
    }
    return url;
  }

  /**
   * Set the target URL.
   *
   * @param url - New target URL
   * @returns This instance for chaining
   */
  public setTargetUrl(url: string): this {
    this.url = url;
    return this;
  }

  /**
   * Set the request instance.
   *
   * @param request - Express request object
   * @returns This instance for chaining
   */
  public setRequest(request: ExpressRequest): this {
    this.request = request;
    return this;
  }

  /**
   * Get the request instance.
   *
   * @returns Express request object
   */
  public getRequest(): ExpressRequest | undefined {
    return this.request;
  }

  /**
   * Send the redirect response.
   *
   * @param res - Express response object
   * @param req - Express request object (optional, for back() redirect)
   *
   * @example
   * ```typescript
   * const redirect = RedirectResponse.to('/dashboard').with('success', 'Done!');
   * redirect.send(res, req);
   * ```
   */
  public send(res: ExpressResponse, req?: ExpressRequest): void {
    // Set request if provided
    if (req && !this.request) {
      this.request = req;
    }

    // Resolve 'back' URL
    let targetUrl = this.url;
    if (targetUrl === 'back') {
      targetUrl = this.request?.get('referer') || this.flashData['_fallback'] || '/';
      delete this.flashData['_fallback'];
    }

    // Add fragment if present
    if (this.fragment) {
      targetUrl = targetUrl.split('#')[0] + '#' + this.fragment;
    }

    // Flash data to session if available
    if (this.request && (this.request as any).session) {
      const session = (this.request as any).session;

      // Flash regular data
      Object.entries(this.flashData).forEach(([key, value]) => {
        if (!key.startsWith('_')) {
          session.flash = session.flash || {};
          session.flash[key] = value;
        }
      });

      // Flash input data
      if (this.inputData) {
        session.flash = session.flash || {};
        session.flash._old_input = this.inputData;
      }

      // Flash errors
      if (this.errorData) {
        session.flash = session.flash || {};
        session.flash.errors = this.errorData;
      }
    }

    // Set cookies
    this.cookiesData.forEach(({ name, value, options }) => {
      res.cookie(name, value, options);
    });

    // Send redirect
    res.redirect(this.statusCode, targetUrl);
  }

  /**
   * Remove uploaded files from input data.
   *
   * @param input - Input data
   * @returns Sanitized input without file objects
   */
  protected removeFilesFromInput(input: Record<string, any>): Record<string, any> {
    const result: Record<string, any> = {};

    for (const [key, value] of Object.entries(input)) {
      if (typeof value === 'object' && value !== null) {
        // Check if it's a file object (has common file properties)
        if ('fieldname' in value || 'mimetype' in value || 'buffer' in value) {
          continue; // Skip file objects
        }
        // Recursively process nested objects
        if (Array.isArray(value)) {
          result[key] = value.filter((item) => {
            return !(
              typeof item === 'object' &&
              item !== null &&
              ('fieldname' in item || 'mimetype' in item || 'buffer' in item)
            );
          });
        } else {
          result[key] = this.removeFilesFromInput(value);
        }
      } else {
        result[key] = value;
      }
    }

    return result;
  }
}
