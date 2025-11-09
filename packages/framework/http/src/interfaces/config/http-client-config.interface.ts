import type { HttpProxyConfig } from './http-proxy-config.interface';
import type { HttpAuthConfig } from './http-auth-config.interface';

/**
 * HTTP Client Configuration
 *
 * Configuration options for the Axios-based HTTP client.
 * Controls request behavior, retry logic, timeouts, and middleware.
 */
export interface HttpClientConfig {
  /**
   * Base URL to prepend to all requests
   *
   * Useful for setting API endpoints globally.
   *
   * @env HTTP_CLIENT_BASE_URL
   * @example 'https://api.example.com'
   */
  baseURL?: string;

  /**
   * Request timeout in milliseconds
   *
   * Maximum time to wait for a response before timing out.
   *
   * @env HTTP_CLIENT_TIMEOUT
   * @default 30000 (30 seconds)
   */
  timeout?: number;

  /**
   * Connection timeout in milliseconds
   *
   * Specifically for establishing the connection.
   *
   * @env HTTP_CLIENT_CONNECT_TIMEOUT
   * @default 5000 (5 seconds)
   */
  connectTimeout?: number;

  /**
   * Maximum number of retries for failed requests
   *
   * Number of times to retry a failed request before giving up.
   *
   * @env HTTP_CLIENT_MAX_RETRIES
   * @default 0 (no retries)
   */
  maxRetries?: number;

  /**
   * Delay between retry attempts in milliseconds
   *
   * Fixed delay between retries.
   *
   * @env HTTP_CLIENT_RETRY_DELAY
   * @default 1000 (1 second)
   */
  retryDelay?: number;

  /**
   * Use exponential backoff for retries
   *
   * When enabled, retry delays increase exponentially.
   *
   * @env HTTP_CLIENT_RETRY_EXPONENTIAL
   * @default false
   */
  retryExponential?: boolean;

  /**
   * Maximum number of redirects to follow
   *
   * @env HTTP_CLIENT_MAX_REDIRECTS
   * @default 5
   */
  maxRedirects?: number;

  /**
   * Maximum content length in bytes
   *
   * Limits response size to prevent memory issues.
   *
   * @env HTTP_CLIENT_MAX_CONTENT_LENGTH
   * @default -1 (unlimited)
   */
  maxContentLength?: number;

  /**
   * Maximum body length in bytes
   *
   * Limits request body size.
   *
   * @env HTTP_CLIENT_MAX_BODY_LENGTH
   * @default -1 (unlimited)
   */
  maxBodyLength?: number;

  /**
   * Default request headers
   *
   * Headers to include with every request.
   *
   * @example { 'User-Agent': 'MyApp/1.0.0' }
   */
  headers?: Record<string, string>;

  /**
   * Whether to throw an exception on HTTP errors (4xx, 5xx)
   *
   * @env HTTP_CLIENT_THROW_ON_ERROR
   * @default false
   */
  throwOnError?: boolean;

  /**
   * Whether to validate HTTP status codes
   *
   * When false, all responses (including errors) are resolved.
   *
   * @env HTTP_CLIENT_VALIDATE_STATUS
   * @default true
   */
  validateStatus?: boolean;

  /**
   * Proxy configuration
   *
   * Proxy server for routing requests.
   */
  proxy?: HttpProxyConfig;

  /**
   * Authentication configuration
   *
   * Default authentication for all requests.
   */
  auth?: HttpAuthConfig;
}
