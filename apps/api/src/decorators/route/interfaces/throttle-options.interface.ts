/**
 * Throttle configuration for API endpoints.
 *
 * Controls request rate limiting to prevent abuse and ensure fair usage.
 * Similar to rate limiting but typically applied per-endpoint rather than globally.
 */
export interface ThrottleOptions {
  /**
   * Maximum number of requests allowed within the time window.
   *
   * Requests exceeding this limit will be rejected with 429 status.
   * Set based on endpoint capacity and expected usage patterns.
   *
   * @example 100 // Allow 100 requests per TTL window
   * @default 100
   */
  limit?: number;

  /**
   * Time window in seconds for throttling.
   *
   * Duration over which the request limit is enforced.
   * Counter resets after this period expires.
   *
   * @example 60 // 60 seconds (1 minute window)
   * @default 60
   */
  ttl?: number;
}
