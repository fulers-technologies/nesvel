import type { Request as ExpressRequest } from 'express';

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
