/**
 * Default rate limiting configuration.
 *
 * Applied when rate limiting is enabled but no specific limits are provided.
 * These values provide reasonable protection against abuse while allowing
 * normal usage patterns.
 *
 * @constant
 */
export const DEFAULT_RATE_LIMIT = {
  /**
   * Maximum number of requests allowed per time window.
   * @default 100 requests
   */
  limit: 100,

  /**
   * Time window in seconds for rate limiting.
   * @default 60 seconds (1 minute)
   */
  ttl: 60,
};
