import { Mixin } from 'ts-mixer';
import { Macroable } from '@nesvel/macroable';
import { Conditionable } from '@nesvel/conditionable';

import type {
  CanBePrecognitiveInterface,
  InteractsWithInputInterface,
  InteractsWithFlashDataInterface,
  InteractsWithContentTypesInterface,
} from './concerns/interfaces';
import { CanBePrecognitive } from './concerns/can-be-precognitive';
import { InteractsWithInput } from './concerns/interacts-with-input';
import { InteractsWithFlashData } from './concerns/interacts-with-flash-data';
import { InteractsWithContentTypes } from './concerns/interacts-with-content-types';

/**
 * Enhanced HTTP Request
 *
 * Extends Express Request with Laravel-style helper methods using mixins.
 * Provides comprehensive request handling with support for:
 * - Input handling (query, body, params, files, cookies)
 * - Content negotiation (JSON, HTML, etc.)
 * - Flash data (session-based form repopulation)
 * - Precognition (Laravel Precognition support)
 * - Macros (runtime method addition via @Macroable)
 * - Conditional execution (when/unless via @Conditionable)
 * - URL helpers (segments, patterns, full URL manipulation)
 * - Security (IP detection, fingerprinting, HTTPS checking)
 * - Session management
 * - Routing integration
 *
 * @example Basic usage
 * ```typescript
 * import { Request } from '@nesvel/nestjs-http';
 *
 * @Controller('users')
 * export class UsersController {
 *   @Post()
 *   create(@Req() request: Request) {
 *     // Input handling
 *     const data = request.only('name', 'email');
 *     const name = request.input('name', 'Guest');
 *
 *     // Content negotiation
 *     if (request.wantsJson()) {
 *       return { data };
 *     }
 *
 *     // Conditional execution
 *     request
 *       .when(request.has('referrer'), (req) => {
 *         console.log('Referrer:', req.input('referrer'));
 *       })
 *       .unless(request.isJson(), (req) => {
 *         // Handle non-JSON request
 *       });
 *   }
 * }
 * ```
 *
 * @example Advanced features
 * ```typescript
 * // URL helpers
 * const segment = request.segment(2); // Get URL segment
 * const matches = request.is('users/*', 'posts/*'); // Pattern matching
 *
 * // Security
 * const ip = request.ip();
 * const fingerprint = request.fingerprint();
 *
 * // Macros (add custom methods at runtime)
 * Request.macro('isAdmin', function() {
 *   return this.user()?.role === 'admin';
 * });
 *
 * if (request.isAdmin()) {
 *   // Admin-specific logic
 * }
 * ```
 */
@Macroable()
@Conditionable()
export class Request
  extends Mixin(
    CanBePrecognitive,
    InteractsWithInput,
    InteractsWithFlashData,
    InteractsWithContentTypes
  )
  implements
    CanBePrecognitiveInterface,
    InteractsWithInputInterface,
    InteractsWithFlashDataInterface,
    InteractsWithContentTypesInterface
{
  /**
   * User resolver callback for authentication.
   */
  protected userResolver?: (guard?: string) => any;

  /**
   * Route resolver callback.
   */
  protected routeResolver?: () => any;

  /**
   * Return the Request instance.
   *
   * Provides a fluent way to reference the request itself.
   *
   * @returns This request instance
   *
   * @example
   * ```typescript
   * const req = request.instance();
   * ```
   */
  public instance(): this {
    return this;
  }

  /**
   * Get the request method.
   *
   * Returns the HTTP method (GET, POST, PUT, DELETE, etc.).
   *
   * @returns The HTTP method
   *
   * @example
   * ```typescript
   * const method = request.method(); // 'POST'
   * if (request.method() === 'GET') {
   *   // Handle GET request
   * }
   * ```
   */
  public method(): string {
    const self = this as any;
    const methodStr =
      typeof self.method === 'string' ? self.method : (self.method as () => string)?.() || 'GET';
    return methodStr.toUpperCase();
  }

  /**
   * Get a URI instance for the request.
   *
   * Returns the full URL as a string (or URI object if Uri class is available).
   *
   * @returns The full URL
   *
   * @example
   * ```typescript
   * const uri = request.uri(); // 'https://example.com/users?page=1'
   * ```
   */
  public uri(): string {
    return this.fullUrl();
  }

  /**
   * Get the root URL for the application.
   *
   * Returns the base URL without path or query string.
   *
   * @returns The root URL
   *
   * @example
   * ```typescript
   * const root = request.root(); // 'https://example.com'
   * ```
   */
  public root(): string {
    const self = this as any;
    return `${self.protocol}://${self.get('host')}`;
  }

  /**
   * Get the URL (no query string) for the request.
   *
   * @returns The URL without query string
   *
   * @example
   * ```typescript
   * const url = request.url(); // 'https://example.com/users'
   * ```
   */
  public url(): string {
    const self = this as any;
    return `${self.protocol}://${self.get('host')}${self.path}`;
  }

  /**
   * Get the full URL for the request including query string.
   *
   * @returns The complete URL with query parameters
   *
   * @example
   * ```typescript
   * const fullUrl = request.fullUrl();
   * // 'https://example.com/users?page=1&sort=name'
   * ```
   */
  public fullUrl(): string {
    const self = this as any;
    return `${self.protocol}://${self.get('host')}${self.originalUrl}`;
  }

  /**
   * Get the full URL with added query parameters.
   *
   * Merges provided query parameters with existing ones.
   *
   * @param query - Query parameters to add/override
   * @returns The full URL with merged query parameters
   *
   * @example
   * ```typescript
   * const url = request.fullUrlWithQuery({ page: 2, sort: 'date' });
   * // 'https://example.com/users?page=2&sort=date'
   * ```
   */
  public fullUrlWithQuery(query: Record<string, any>): string {
    const self = this as any;
    const merged = { ...self.query, ...query };
    const queryString = new URLSearchParams(merged as any).toString();
    return queryString ? `${this.url()}?${queryString}` : this.url();
  }

  /**
   * Get the full URL without specified query parameters.
   *
   * @param keys - Query parameter keys to exclude
   * @returns The full URL without specified query parameters
   *
   * @example
   * ```typescript
   * const url = request.fullUrlWithoutQuery(['token', 'temp']);
   * // Removes 'token' and 'temp' from query string
   * ```
   */
  public fullUrlWithoutQuery(keys: string | string[]): string {
    const self = this as any;
    const keysArray = Array.isArray(keys) ? keys : [keys];
    const filtered: Record<string, any> = {};

    for (const [key, value] of Object.entries(self.query)) {
      if (!keysArray.includes(key)) {
        filtered[key] = value;
      }
    }

    const queryString = new URLSearchParams(filtered as any).toString();
    return queryString ? `${this.url()}?${queryString}` : this.url();
  }

  /**
   * Get the current path for the request.
   *
   * @returns The request path
   *
   * @example
   * ```typescript
   * const path = request.path(); // '/users/123'
   * ```
   */
  public path(): string {
    const self = this as any;
    const pathStr =
      typeof self.path === 'string' ? self.path : (self.path as () => string)?.() || '/';
    return pathStr;
  }

  /**
   * Get the current decoded path for the request.
   *
   * URL decodes the path to handle special characters.
   *
   * @returns The decoded path
   *
   * @example
   * ```typescript
   * const path = request.decodedPath(); // '/users/John Doe'
   * ```
   */
  public decodedPath(): string {
    return decodeURIComponent(this.path());
  }

  /**
   * Get a segment from the URI (1-based index).
   *
   * @param index - The segment index (1-based)
   * @param defaultValue - Default value if segment doesn't exist
   * @returns The segment value or default
   *
   * @example
   * ```typescript
   * // URL: /users/123/posts/456
   * const userId = request.segment(2); // '123'
   * const postId = request.segment(4); // '456'
   * const missing = request.segment(10, 'default'); // 'default'
   * ```
   */
  public segment(index: number, defaultValue: string | null = null): string | null {
    const segments = this.segments();
    return segments[index - 1] ?? defaultValue;
  }

  /**
   * Get all segments from the URI.
   *
   * @returns Array of path segments
   *
   * @example
   * ```typescript
   * // URL: /users/123/posts
   * const segments = request.segments(); // ['users', '123', 'posts']
   * ```
   */
  public segments(): string[] {
    return this.path()
      .split('/')
      .filter((segment: string) => segment.length > 0);
  }

  /**
   * Determine if the request URI matches a pattern.
   *
   * Supports wildcards (*) for pattern matching.
   *
   * @param patterns - URL patterns to match against
   * @returns True if any pattern matches
   *
   * @example
   * ```typescript
   * if (request.is('users/*', 'posts/*')) {
   *   // Matches /users/123 or /posts/456
   * }
   * ```
   */
  public is(...patterns: string[]): boolean {
    const path = this.decodedPath();

    for (const pattern of patterns) {
      const regex = new RegExp('^' + pattern.replace(/\*/g, '.*').replace(/\//g, '\\/') + '$');
      if (regex.test(path)) {
        return true;
      }
    }

    return false;
  }

  /**
   * Determine if the current route name matches a pattern.
   *
   * @param patterns - Route name patterns to match
   * @returns True if any pattern matches
   *
   * @example
   * ```typescript
   * if (request.routeIs('users.*', 'posts.*')) {
   *   // Route name starts with 'users.' or 'posts.'
   * }
   * ```
   */
  public routeIs(...patterns: string[]): boolean {
    const route = this.route();
    if (!route || !route.name) {
      return false;
    }

    const routeName = route.name;

    for (const pattern of patterns) {
      const regex = new RegExp('^' + pattern.replace(/\*/g, '.*').replace(/\./g, '\\.') + '$');
      if (regex.test(routeName)) {
        return true;
      }
    }

    return false;
  }

  /**
   * Determine if the request full URL matches a pattern.
   *
   * @param patterns - URL patterns to match against
   * @returns True if any pattern matches
   *
   * @example
   * ```typescript
   * if (request.fullUrlIs('https://example.com/*')) {
   *   // Matches any URL on example.com
   * }
   * ```
   */
  public fullUrlIs(...patterns: string[]): boolean {
    const url = this.fullUrl();

    for (const pattern of patterns) {
      const regex = new RegExp('^' + pattern.replace(/\*/g, '.*').replace(/\//g, '\\/') + '$');
      if (regex.test(url)) {
        return true;
      }
    }

    return false;
  }

  /**
   * Get the host name from the request.
   *
   * Returns just the hostname without port.
   *
   * @returns The hostname
   *
   * @example
   * ```typescript
   * const host = request.host(); // 'example.com'
   * ```
   */
  public host(): string {
    const self = this as any;
    const host = (self.hostname as string) || self.get('host') || '';
    return host.split(':')[0] || '';
  }

  /**
   * Get the host with port.
   *
   * @returns The host with port
   *
   * @example
   * ```typescript
   * const httpHost = request.httpHost(); // 'example.com:3000'
   * ```
   */
  public httpHost(): string {
    const self = this as any;
    return self.get('host') || '';
  }

  /**
   * Get the scheme and HTTP host.
   *
   * @returns The scheme and host
   *
   * @example
   * ```typescript
   * const schemeAndHost = request.schemeAndHttpHost();
   * // 'https://example.com:443'
   * ```
   */
  public schemeAndHttpHost(): string {
    const self = this as any;
    return `${self.protocol}://${this.httpHost()}`;
  }

  /**
   * Determine if the request is an AJAX request.
   *
   * @returns True if AJAX request
   *
   * @example
   * ```typescript
   * if (request.ajax()) {
   *   return response.json({ data });
   * }
   * ```
   */
  public ajax(): boolean {
    const self = this as any;
    return self.xhr || self.get('x-requested-with') === 'XMLHttpRequest';
  }

  /**
   * Determine if the request is a PJAX request.
   *
   * @returns True if PJAX request
   *
   * @example
   * ```typescript
   * if (request.pjax()) {
   *   // Return partial HTML
   * }
   * ```
   */
  public pjax(): boolean {
    const self = this as any;
    return self.get('x-pjax') === 'true';
  }

  /**
   * Determine if the request is a prefetch request.
   *
   * @returns True if prefetch request
   *
   * @example
   * ```typescript
   * if (request.prefetch()) {
   *   // Handle prefetch differently
   * }
   * ```
   */
  public prefetch(): boolean {
    const self = this as any;
    const purpose = self.get('purpose') || self.get('x-purpose');
    return purpose === 'prefetch';
  }

  /**
   * Determine if the request is over HTTPS.
   *
   * @returns True if HTTPS
   *
   * @example
   * ```typescript
   * if (request.secure()) {
   *   // Connection is encrypted
   * }
   * ```
   */
  public secure(): boolean {
    const self = this as any;
    return self.protocol === 'https';
  }

  /**
   * Get the client IP address.
   *
   * Respects X-Forwarded-For and other proxy headers.
   *
   * @returns The client IP address
   *
   * @example
   * ```typescript
   * const ip = request.ip(); // '192.168.1.1'
   * ```
   */
  public ip(): string {
    const self = this as any;
    const ipValue = typeof self.ip === 'string' ? self.ip : (self.ip as () => string)?.();
    return ipValue || self.connection?.remoteAddress || '';
  }

  /**
   * Get all IP addresses from the request (including proxies).
   *
   * @returns Array of IP addresses
   *
   * @example
   * ```typescript
   * const ips = request.ips(); // ['192.168.1.1', '10.0.0.1']
   * ```
   */
  public ips(): string[] {
    const self = this as any;
    const ipsValue = Array.isArray(self.ips) ? self.ips : (self.ips as () => string[])?.();
    return ipsValue || [];
  }

  /**
   * Get the user agent string.
   *
   * @returns The user agent string
   *
   * @example
   * ```typescript
   * const userAgent = request.userAgent();
   * // 'Mozilla/5.0 ...'
   * ```
   */
  public userAgent(): string {
    const self = this as any;
    return self.get('user-agent') || '';
  }

  /**
   * Merge new input into the request's input data.
   *
   * @param input - Input data to merge
   * @returns This request for chaining
   *
   * @example
   * ```typescript
   * request.merge({ role: 'user', active: true });
   * ```
   */
  public merge(input: Record<string, any>): this {
    const self = this as any;
    self.body = { ...self.body, ...input };
    return this;
  }

  /**
   * Merge input into the request if keys don't already exist.
   *
   * @param input - Input data to merge conditionally
   * @returns This request for chaining
   *
   * @example
   * ```typescript
   * request.mergeIfMissing({ role: 'guest', page: 1 });
   * // Only adds keys that don't exist
   * ```
   */
  public mergeIfMissing(input: Record<string, any>): this {
    const self = this as any;
    for (const [key, value] of Object.entries(input)) {
      if (self.body[key] === undefined) {
        self.body[key] = value;
      }
    }
    return this;
  }

  /**
   * Replace all input data.
   *
   * @param input - New input data
   * @returns This request for chaining
   *
   * @example
   * ```typescript
   * request.replace({ name: 'John', email: 'john@example.com' });
   * ```
   */
  public replace(input: Record<string, any>): this {
    const self = this as any;
    self.body = input;
    return this;
  }

  /**
   * Get an input value (alias for Express's get method for backward compatibility).
   *
   * @param key - The input key
   * @param defaultValue - Default value if key doesn't exist
   * @returns The input value or default
   *
   * @example
   * ```typescript
   * const name = request.get('name', 'Guest');
   * ```
   */
  public input<T = any>(key?: string, defaultValue?: T): T {
    if (!key) {
      return this.all() as T;
    }

    const allData = this.all();
    return this.getNestedValue(allData, key, defaultValue);
  }

  /**
   * Get JSON input data.
   *
   * @param key - Optional key to retrieve from JSON
   * @param defaultValue - Default value if key doesn't exist
   * @returns The JSON data or default
   *
   * @example
   * ```typescript
   * const data = request.json('user.name', 'Anonymous');
   * ```
   */
  public json(key?: string, defaultValue?: any): any {
    const self = this as any;
    if (!self.body || typeof self.body !== 'object') {
      return defaultValue;
    }

    if (!key) {
      return self.body;
    }

    return this.getNestedValue(self.body, key, defaultValue);
  }

  /**
   * Create a duplicate of the request with modified properties.
   *
   * @param query - New query parameters
   * @param body - New request body
   * @param attributes - New attributes
   * @param cookies - New cookies
   * @param files - New files
   * @param server - New server variables
   * @returns Cloned request instance
   *
   * @example
   * ```typescript
   * const cloned = request.duplicate({ page: 2 }, { name: 'Updated' });
   * ```
   */
  public duplicate(
    query?: Record<string, any>,
    body?: Record<string, any>,
    attributes?: Record<string, any>,
    cookies?: Record<string, any>,
    files?: any,
    server?: Record<string, any>
  ): this {
    // Create a shallow clone
    const cloned = Object.create(Object.getPrototypeOf(this));
    Object.assign(cloned, this);

    // Override with provided values
    if (query) cloned.query = query;
    if (body) cloned.body = body;
    if (cookies) (cloned as any).cookies = cookies;
    if (files) (cloned as any).files = files;

    return cloned;
  }

  /**
   * Determine if the request has a session.
   *
   * @param skipIfUninitialized - Skip check if session is uninitialized
   * @returns True if session exists
   *
   * @example
   * ```typescript
   * if (request.hasSession()) {
   *   const userId = request.session().userId;
   * }
   * ```
   */
  public hasSession(skipIfUninitialized: boolean = false): boolean {
    const session = (this as any).session;
    if (!session) {
      return false;
    }

    if (skipIfUninitialized && !session.id) {
      return false;
    }

    return true;
  }

  /**
   * Get the session instance.
   *
   * @returns The session object
   *
   * @example
   * ```typescript
   * const session = request.getSession();
   * session.userId = 123;
   * ```
   */
  public getSession(): any {
    if (!this.hasSession()) {
      throw new Error('Session not available');
    }
    return (this as any).session;
  }

  /**
   * Get the session instance or a specific session value.
   *
   * @param key - Optional key to retrieve from session
   * @param defaultValue - Default value if key doesn't exist
   * @returns The session or session value
   *
   * @example
   * ```typescript
   * const session = request.session(); // Get entire session
   * const userId = request.session('userId', null); // Get specific value
   * ```
   */
  public session(key?: string, defaultValue?: any): any {
    const session = this.hasSession() ? (this as any).session : null;

    if (!key) {
      return session;
    }

    if (!session) {
      return defaultValue;
    }

    return session[key] ?? defaultValue;
  }

  /**
   * Set the session instance (Laravel compatibility).
   *
   * @param session - The session to set
   *
   * @example
   * ```typescript
   * request.setLaravelSession(customSession);
   * ```
   */
  public setLaravelSession(session: any): void {
    (this as any).session = session;
  }

  /**
   * Set the locale for the request.
   *
   * @param locale - The locale to set
   *
   * @example
   * ```typescript
   * request.setRequestLocale('fr');
   * ```
   */
  public setRequestLocale(locale: string): void {
    (this as any).locale = locale;
  }

  /**
   * Set the default locale for the request.
   *
   * @param locale - The default locale
   *
   * @example
   * ```typescript
   * request.setDefaultRequestLocale('en');
   * ```
   */
  public setDefaultRequestLocale(locale: string): void {
    (this as any).defaultLocale = locale;
  }

  /**
   * Get the authenticated user.
   *
   * @param guard - Optional authentication guard
   * @returns The authenticated user or null
   *
   * @example
   * ```typescript
   * const user = request.user();
   * if (user) {
   *   console.log('User ID:', user.id);
   * }
   * ```
   */
  public user(guard?: string): any {
    if (this.userResolver) {
      return this.userResolver(guard);
    }

    return (this as any).user ?? null;
  }

  /**
   * Get the route handling the request.
   *
   * @param param - Optional route parameter to retrieve
   * @param defaultValue - Default value if parameter doesn't exist
   * @returns The route object or parameter value
   *
   * @example
   * ```typescript
   * const route = request.route();
   * const userId = request.route('id', null);
   * ```
   */
  public route(param?: string, defaultValue?: any): any {
    const route = this.routeResolver ? this.routeResolver() : (this as any).route;

    if (!param) {
      return route;
    }

    if (!route) {
      return defaultValue;
    }

    const self = this as any;
    return route.params?.[param] ?? self.params?.[param] ?? defaultValue;
  }

  /**
   * Generate a fingerprint for the request.
   *
   * Creates a unique identifier based on URL and IP.
   *
   * @returns The request fingerprint
   *
   * @example
   * ```typescript
   * const fingerprint = request.fingerprint();
   * // Use for rate limiting, tracking, etc.
   * ```
   */
  public fingerprint(): string {
    const path = this.decodedPath();
    const ip = this.ip();

    // Simple hash-like fingerprint
    const str = `${path}|${ip}`;
    let hash = 0;

    for (let i = 0; i < str.length; i++) {
      const char = str.charCodeAt(i);
      hash = (hash << 5) - hash + char;
      hash = hash & hash; // Convert to 32-bit integer
    }

    return Math.abs(hash).toString(36);
  }

  /**
   * Set the JSON data for the request.
   *
   * @param json - JSON data to set
   *
   * @example
   * ```typescript
   * request.setJson({ user: { name: 'John' } });
   * ```
   */
  public setJson(json: any): void {
    const self = this as any;
    self.body = json;
  }

  /**
   * Get the user resolver callback.
   *
   * @returns The user resolver function
   *
   * @example
   * ```typescript
   * const resolver = request.getUserResolver();
   * ```
   */
  public getUserResolver(): ((guard?: string) => any) | undefined {
    return this.userResolver;
  }

  /**
   * Set the user resolver callback.
   *
   * @param callback - The user resolver function
   *
   * @example
   * ```typescript
   * request.setUserResolver((guard) => {
   *   return authService.getUser(guard);
   * });
   * ```
   */
  public setUserResolver(callback: (guard?: string) => any): void {
    this.userResolver = callback;
  }

  /**
   * Get the route resolver callback.
   *
   * @returns The route resolver function
   *
   * @example
   * ```typescript
   * const resolver = request.getRouteResolver();
   * ```
   */
  public getRouteResolver(): (() => any) | undefined {
    return this.routeResolver;
  }

  /**
   * Set the route resolver callback.
   *
   * @param callback - The route resolver function
   *
   * @example
   * ```typescript
   * request.setRouteResolver(() => {
   *   return currentRoute;
   * });
   * ```
   */
  public setRouteResolver(callback: () => any): void {
    this.routeResolver = callback;
  }

  /**
   * Convert the request to an array.
   *
   * Returns all input data as a plain object.
   *
   * @returns The request data as an object
   *
   * @example
   * ```typescript
   * const data = request.toArray();
   * // { name: 'John', email: 'john@example.com', ... }
   * ```
   */
  public toArray(): Record<string, any> {
    return this.all();
  }

  /**
   * Get only specified keys from input.
   *
   * @param keys - Keys to retrieve
   * @returns Object with only specified keys
   *
   * @example
   * ```typescript
   * const data = request.only('name', 'email', 'age');
   * ```
   */
  public only(...keys: string[]): Record<string, any> {
    const allData = this.all();
    const result: Record<string, any> = {};

    for (const key of keys) {
      if (key in allData) {
        result[key] = allData[key];
      }
    }

    return result;
  }

  /**
   * Get all input except specified keys.
   *
   * @param keys - Keys to exclude
   * @returns Object without excluded keys
   *
   * @example
   * ```typescript
   * const data = request.except('password', 'token');
   * ```
   */
  public except(...keys: string[]): Record<string, any> {
    const allData = this.all();
    const result = { ...allData };

    for (const key of keys) {
      delete result[key];
    }

    return result;
  }

  /**
   * Check if input has a key.
   *
   * @param key - Key to check
   * @returns True if key exists
   *
   * @example
   * ```typescript
   * if (request.has('email')) {
   *   // Email was provided
   * }
   * ```
   */
  public has(key: string): boolean {
    return key in this.all();
  }

  /**
   * Check if input has a key and it's not empty.
   *
   * @param key - Key to check
   * @returns True if key exists and has value
   *
   * @example
   * ```typescript
   * if (request.filled('bio')) {
   *   // Bio was provided and not empty
   * }
   * ```
   */
  public filled(key: string): boolean {
    if (!this.has(key)) {
      return false;
    }

    const value = this.input(key);
    return value !== null && value !== undefined && value !== '';
  }

  /**
   * Check if input is missing a key.
   *
   * @param key - Key to check
   * @returns True if key doesn't exist
   *
   * @example
   * ```typescript
   * if (request.missing('optional_field')) {
   *   // Field not provided
   * }
   * ```
   */
  public missing(key: string): boolean {
    return !this.has(key);
  }

  /**
   * Helper method to get nested values from objects using dot notation.
   *
   * @param obj - The object to extract from
   * @param path - Dot-separated path
   * @param defaultValue - Default value if path doesn't exist
   * @returns The value at the path or default value
   */
  private getNestedValue<T>(obj: any, path: string, defaultValue?: T): T {
    const keys = path.split('.');
    let result = obj;

    for (const key of keys) {
      if (result == null || typeof result !== 'object') {
        return defaultValue as T;
      }
      result = result[key];
    }

    return (result !== undefined ? result : defaultValue) as T;
  }
}
