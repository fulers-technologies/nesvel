/**
 * Configuration options for rate limiting.
 *
 * Controls the maximum number of requests allowed within a time window.
 */
export interface IRateLimiterOptions {
  /**
   * Maximum number of requests allowed per time window.
   *
   * @default 100
   */
  maxRequestsPerWindow: number;

  /**
   * Time window duration in milliseconds.
   *
   * @default 60000 (1 minute)
   */
  windowSize: number;

  /**
   * Whether to use a sliding window (true) or fixed window (false).
   *
   * Sliding window provides smoother rate limiting but uses more memory.
   * Fixed window is simpler but can allow bursts at window boundaries.
   *
   * @default true (sliding window)
   */
  useSlidingWindow?: boolean;
}
