import { BaseException } from '@nesvel/shared';

/**
 * Exception thrown when rate limit is exceeded.
 *
 * Contains information about the current rate and when the limit will reset.
 */
export class RateLimitExceededException extends BaseException {
  /**
   * The topic that exceeded its rate limit.
   */
  public readonly topic: string;

  /**
   * Current number of requests in the window.
   */
  public readonly currentRequests: number;

  /**
   * Maximum requests allowed in the window.
   */
  public readonly maxRequests: number;

  /**
   * Timestamp when the rate limit will reset.
   */
  public readonly resetAt: Date;

  /**
   * Creates a new RateLimitExceededException.
   *
   * @param message - Error message
   * @param topic - The topic that hit the rate limit
   * @param currentRequests - Current request count
   * @param maxRequests - Maximum allowed requests
   * @param resetAt - When the limit resets
   *
   * @example
   * ```typescript
   * throw RateLimitExceededException.make(
   *   'Rate limit exceeded for topic "user.created"',
   *   'user.created',
   *   100,
   *   100,
   *   new Date(Date.now() + 60000)
   * );
   * ```
   */
  constructor(
    message: string,
    topic: string,
    currentRequests: number,
    maxRequests: number,
    resetAt: Date,
  ) {
    super(message);
    this.name = 'RateLimitExceededException';
    this.topic = topic;
    this.currentRequests = currentRequests;
    this.maxRequests = maxRequests;
    this.resetAt = resetAt;

    // Maintains proper stack trace for where error was thrown (V8 only)
    if (Error.captureStackTrace) {
      Error.captureStackTrace(this, RateLimitExceededException);
    }
  }
}
