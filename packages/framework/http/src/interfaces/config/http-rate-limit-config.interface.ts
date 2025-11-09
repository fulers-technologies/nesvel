/**
 * Rate Limiting Configuration
 *
 * Settings for request rate limiting to prevent abuse.
 */
export interface HttpRateLimitConfig {
  /**
   * Enable rate limiting
   *
   * @env HTTP_RATE_LIMIT_ENABLED
   * @default false
   */
  enabled?: boolean;

  /**
   * Time window in milliseconds
   *
   * @env HTTP_RATE_LIMIT_WINDOW_MS
   * @default 60000 (1 minute)
   */
  windowMs?: number;

  /**
   * Maximum number of requests per window
   *
   * @env HTTP_RATE_LIMIT_MAX
   * @default 100
   */
  max?: number;

  /**
   * Message to send when rate limit is exceeded
   *
   * @env HTTP_RATE_LIMIT_MESSAGE
   * @default 'Too many requests, please try again later.'
   */
  message?: string;

  /**
   * Status code to send when rate limit is exceeded
   *
   * @env HTTP_RATE_LIMIT_STATUS_CODE
   * @default 429
   */
  statusCode?: number;

  /**
   * Whether to skip successful requests
   *
   * @env HTTP_RATE_LIMIT_SKIP_SUCCESSFUL_REQUESTS
   * @default false
   */
  skipSuccessfulRequests?: boolean;

  /**
   * Whether to skip failed requests
   *
   * @env HTTP_RATE_LIMIT_SKIP_FAILED_REQUESTS
   * @default false
   */
  skipFailedRequests?: boolean;

  /**
   * Custom key generator function
   *
   * Determines how to identify unique clients.
   */
  keyGenerator?: (req: any) => string;

  /**
   * Custom handler when rate limit is exceeded
   */
  handler?: (req: any, res: any, next: any) => void;
}
