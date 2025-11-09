import type { AxiosRequestConfig } from 'axios';

/**
 * Configuration options for HTTP requests.
 *
 * Extends Axios request configuration with additional Laravel-style options
 * for a more fluent and developer-friendly API.
 */
export interface HttpRequestConfig extends AxiosRequestConfig {
  /**
   * Base URL to prepend to all requests.
   * Useful for setting API endpoints globally.
   */
  baseURL?: string;

  /**
   * Request timeout in milliseconds.
   * Default: 30000 (30 seconds)
   */
  timeout?: number;

  /**
   * Connection timeout in milliseconds.
   * Specifically for establishing the connection.
   */
  connectTimeout?: number;

  /**
   * Maximum number of retries for failed requests.
   * Default: 0 (no retries)
   */
  retries?: number;

  /**
   * Delay between retry attempts in milliseconds.
   * Can be a number for fixed delay or a function for exponential backoff.
   */
  retryDelay?: number | ((retryCount: number) => number);

  /**
   * Callback to determine if a request should be retried.
   * Receives the error and retry count, returns true to retry.
   */
  retryCondition?: (error: any, retryCount: number) => boolean;

  /**
   * Body format for the request.
   * Determines how the request body is serialized.
   */
  bodyFormat?: 'json' | 'form' | 'multipart';

  /**
   * Query parameters to append to the URL.
   * Will be serialized and added to the query string.
   */
  query?: Record<string, any>;

  /**
   * Whether to throw an exception on HTTP errors (4xx, 5xx).
   * Default: false
   */
  throwOnError?: boolean;
}
