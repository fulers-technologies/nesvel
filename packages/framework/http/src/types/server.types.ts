import type { Request as ExpressRequest, Response as ExpressResponse } from 'express';

/**
 * Extended Express request with Laravel-style helper methods.
 *
 * This interface adds convenience methods for accessing request data,
 * similar to Laravel's request object.
 */
export interface EnhancedRequest extends ExpressRequest {
  /**
   * Get an input value from the request.
   * Checks body, query, and route params in that order.
   *
   * @param key - The input key to retrieve
   * @param defaultValue - Default value if key doesn't exist
   */
  input<T = any>(key?: string, defaultValue?: T): T;

  /**
   * Get all input data from body, query, and params.
   */
  all(): Record<string, any>;

  /**
   * Get only specified keys from input.
   *
   * @param keys - Keys to retrieve
   */
  only(...keys: string[]): Record<string, any>;

  /**
   * Get all input except specified keys.
   *
   * @param keys - Keys to exclude
   */
  except(...keys: string[]): Record<string, any>;

  /**
   * Check if input has a key.
   *
   * @param key - Key to check
   */
  has(key: string): boolean;

  /**
   * Check if input has a key and it's not empty.
   *
   * @param key - Key to check
   */
  filled(key: string): boolean;

  /**
   * Check if input is missing a key.
   *
   * @param key - Key to check
   */
  missing(key: string): boolean;

  /**
   * Execute callback when input has key.
   *
   * @param key - Key to check
   * @param callback - Callback to execute
   */
  whenHas(key: string, callback: (value: any) => void): this;

  /**
   * Execute callback when input has key and it's filled.
   *
   * @param key - Key to check
   * @param callback - Callback to execute
   */
  whenFilled(key: string, callback: (value: any) => void): this;

  /**
   * Check if request expects JSON response.
   */
  expectsJson(): boolean;

  /**
   * Check if request accepts given content types.
   *
   * @param types - Content types to check
   */
  acceptsAny(...types: string[]): boolean;

  /**
   * Check if request accepts HTML.
   */
  acceptsHtml(): boolean;

  /**
   * Check if request accepts JSON.
   */
  acceptsJson(): boolean;

  /**
   * Get the bearer token from authorization header.
   */
  bearerToken(): string | null;

  /**
   * Check if request is AJAX.
   */
  isAjax(): boolean;

  /**
   * Check if request is PJAX.
   */
  isPjax(): boolean;

  /**
   * Check if request is prefetch.
   */
  isPrefetch(): boolean;

  /**
   * Get full URL with query string.
   */
  fullUrl(): string;

  /**
   * Get full URL with added query parameters.
   *
   * @param query - Query parameters to add
   */
  fullUrlWithQuery(query: Record<string, any>): string;
}

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

/**
 * Options for JSON responses.
 *
 * Controls JSON serialization and response formatting.
 */
export interface JsonResponseOptions {
  /**
   * HTTP status code.
   * Default: 200
   */
  status?: number;

  /**
   * Additional headers to send.
   */
  headers?: Record<string, string | string[]>;

  /**
   * JSON stringify replacer function.
   */
  replacer?: (key: string, value: any) => any;

  /**
   * Number of spaces for indentation.
   */
  spaces?: number;
}

/**
 * Options for redirect responses.
 *
 * Controls redirect behavior and status codes.
 */
export interface RedirectOptions {
  /**
   * HTTP status code for redirect.
   * Default: 302
   */
  status?: number;

  /**
   * Flash data to include in session.
   */
  with?: Record<string, any>;

  /**
   * Input data to flash to session.
   */
  withInput?: Record<string, any>;

  /**
   * Errors to flash to session.
   */
  withErrors?: Record<string, any> | string[];

  /**
   * Fragment identifier to append to URL.
   */
  fragment?: string;
}

/**
 * Options for file download responses.
 *
 * Controls file download behavior and headers.
 */
export interface DownloadOptions {
  /**
   * Filename to use for download.
   * If not provided, uses the original filename.
   */
  filename?: string;

  /**
   * Content type for the file.
   * Will be auto-detected if not provided.
   */
  contentType?: string;

  /**
   * Whether to force download (Content-Disposition: attachment).
   * Default: true
   */
  attachment?: boolean;

  /**
   * Additional headers to send.
   */
  headers?: Record<string, string | string[]>;

  /**
   * Whether to inline the file instead of downloading.
   * Default: false
   */
  inline?: boolean;
}

/**
 * Options for streamed responses.
 *
 * Controls streaming response behavior.
 */
export interface StreamOptions {
  /**
   * HTTP status code.
   * Default: 200
   */
  status?: number;

  /**
   * Content type for the stream.
   */
  contentType?: string;

  /**
   * Additional headers to send.
   */
  headers?: Record<string, string | string[]>;

  /**
   * Buffer size for streaming.
   */
  bufferSize?: number;
}

/**
 * Cache control options for responses.
 *
 * Provides fine-grained control over HTTP caching.
 */
export interface CacheOptions {
  /**
   * Time to live in seconds.
   */
  ttl?: number;

  /**
   * Whether response is public (can be cached by proxies).
   * Default: true
   */
  public?: boolean;

  /**
   * Whether response is private (only client can cache).
   */
  private?: boolean;

  /**
   * Whether response must be revalidated.
   */
  mustRevalidate?: boolean;

  /**
   * Whether to disable caching entirely.
   */
  noCache?: boolean;

  /**
   * Whether to disable storing.
   */
  noStore?: boolean;

  /**
   * ETag value for conditional requests.
   */
  etag?: string;

  /**
   * Last modified date for conditional requests.
   */
  lastModified?: Date;

  /**
   * Max age in seconds.
   */
  maxAge?: number;

  /**
   * Shared max age in seconds (for CDNs).
   */
  sMaxAge?: number;
}

/**
 * Uploaded file information.
 *
 * Represents a file uploaded via multipart/form-data.
 */
export interface UploadedFile {
  /**
   * Field name from the form.
   */
  fieldname: string;

  /**
   * Original filename.
   */
  originalname: string;

  /**
   * Encoding type.
   */
  encoding: string;

  /**
   * MIME type.
   */
  mimetype: string;

  /**
   * File size in bytes.
   */
  size: number;

  /**
   * Temporary file path.
   */
  path: string;

  /**
   * File buffer (if stored in memory).
   */
  buffer?: Buffer;
}

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
