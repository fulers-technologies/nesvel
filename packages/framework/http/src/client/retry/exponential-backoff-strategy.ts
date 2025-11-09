import type {
  JitterType,
  RetryContext,
  RetryStrategy,
  ExponentialBackoffOptions,
} from '@/interfaces';

/**
 * Exponential backoff retry strategy with jitter support.
 *
 * This strategy implements exponential backoff with configurable jitter
 * to prevent thundering herd problems in distributed systems.
 *
 * @example
 * ```typescript
 * // Basic exponential backoff
 * const strategy = ExponentialBackoffStrategy.make({
 *   maxAttempts: 5,
 *   baseDelayMs: 1000,
 *   multiplier: 2
 * });
 *
 * // With full jitter (AWS recommendation)
 * const strategy = ExponentialBackoffStrategy.make({
 *   maxAttempts: 3,
 *   baseDelayMs: 100,
 *   jitter: 'full'
 * });
 *
 * // With custom retry logic
 * const strategy = ExponentialBackoffStrategy.make({
 *   maxAttempts: 5,
 *   shouldRetryPredicate: (ctx) => ctx.statusCode === 503
 * });
 * ```
 */
export class ExponentialBackoffStrategy implements RetryStrategy {
  private readonly maxAttempts: number;
  private readonly baseDelayMs: number;
  private readonly maxDelayMs: number;
  private readonly multiplier: number;
  private readonly jitter: JitterType;
  private readonly maxElapsedTimeMs: number;
  private readonly retryableStatusCodes: Set<number>;
  private readonly retryOnNetworkError: boolean;
  private readonly shouldRetryPredicate?: (context: RetryContext) => boolean;
  private lastDelay: number = 0;

  /**
   * Create a new exponential backoff strategy.
   *
   * @param options - Configuration options
   */
  constructor(options: ExponentialBackoffOptions = {}) {
    this.jitter = options.jitter ?? 'full';
    this.multiplier = options.multiplier ?? 2;
    this.maxAttempts = options.maxAttempts ?? 3;
    this.maxDelayMs = options.maxDelayMs ?? 30000;
    this.baseDelayMs = options.baseDelayMs ?? 1000;
    this.shouldRetryPredicate = options.shouldRetryPredicate;
    this.maxElapsedTimeMs = options.maxElapsedTimeMs ?? 120000;
    this.retryOnNetworkError = options.retryOnNetworkError ?? true;
    this.retryableStatusCodes = new Set(
      options.retryableStatusCodes ?? [408, 429, 500, 502, 503, 504]
    );
  }

  /**
   * Static factory method to create a new strategy instance.
   *
   * @param options - Configuration options
   * @returns New strategy instance
   */
  public static make(options: ExponentialBackoffOptions = {}): ExponentialBackoffStrategy {
    return new ExponentialBackoffStrategy(options);
  }

  /**
   * Determine if the request should be retried.
   *
   * @param context - Retry context
   * @returns true if request should be retried
   */
  public shouldRetry(context: RetryContext): boolean {
    // Check max attempts
    if (context.attempt >= this.maxAttempts) {
      return false;
    }

    // Check max elapsed time
    if (this.maxElapsedTimeMs > 0 && context.elapsedMs >= this.maxElapsedTimeMs) {
      return false;
    }

    // Custom predicate takes precedence
    if (this.shouldRetryPredicate) {
      return this.shouldRetryPredicate(context);
    }

    // Check if it's a network error
    if (context.error && this.isNetworkError(context.error)) {
      return this.retryOnNetworkError;
    }

    // Check if status code is retryable
    if (context.statusCode !== undefined) {
      return this.retryableStatusCodes.has(context.statusCode);
    }

    // Default: retry if no status code (likely network error)
    return this.retryOnNetworkError;
  }

  /**
   * Calculate delay with exponential backoff and jitter.
   *
   * @param context - Retry context
   * @returns Delay in milliseconds
   */
  public getDelay(context: RetryContext): number {
    // Check for Retry-After header
    const retryAfterDelay = this.getRetryAfterDelay(context.headers);
    if (retryAfterDelay !== null) {
      return Math.min(retryAfterDelay, this.maxDelayMs);
    }

    // Calculate base exponential delay
    const exponentialDelay = this.baseDelayMs * Math.pow(this.multiplier, context.attempt);
    const cappedDelay = Math.min(exponentialDelay, this.maxDelayMs);

    // Apply jitter
    return this.applyJitter(cappedDelay, context.attempt);
  }

  /**
   * Get maximum number of retry attempts.
   *
   * @returns Maximum attempts
   */
  public getMaxAttempts(): number {
    return this.maxAttempts;
  }

  /**
   * Get maximum elapsed time for retries.
   *
   * @returns Maximum elapsed time in milliseconds
   */
  public getMaxElapsedTime(): number {
    return this.maxElapsedTimeMs;
  }

  /**
   * Apply jitter to the calculated delay.
   *
   * @param delay - Base delay in milliseconds
   * @param attempt - Current attempt number
   * @returns Jittered delay
   */
  private applyJitter(delay: number, attempt: number): number {
    switch (this.jitter) {
      case 'none':
        return delay;

      case 'full':
        // Random value between 0 and delay
        return Math.random() * delay;

      case 'equal':
        // Half of delay + random half
        return delay / 2 + Math.random() * (delay / 2);

      case 'decorrelated':
        // AWS-style decorrelated jitter
        // sleep = min(maxDelay, random(baseDelay, lastDelay * 3))
        const minDelay = this.baseDelayMs;
        const maxDecorrelated = Math.min(this.maxDelayMs, this.lastDelay * 3);
        this.lastDelay = minDelay + Math.random() * (maxDecorrelated - minDelay);
        return this.lastDelay;

      default:
        return delay;
    }
  }

  /**
   * Parse Retry-After header and return delay in milliseconds.
   *
   * @param headers - Response headers
   * @returns Delay in milliseconds, or null if header not present
   */
  private getRetryAfterDelay(headers?: Record<string, string | string[]>): number | null {
    if (!headers) {
      return null;
    }

    const retryAfter = headers['retry-after'] || headers['Retry-After'];
    if (!retryAfter) {
      return null;
    }

    const value = Array.isArray(retryAfter) ? retryAfter[0] : retryAfter;

    // Check if it's a number (seconds)
    const seconds = parseInt(value, 10);
    if (!isNaN(seconds)) {
      return seconds * 1000;
    }

    // Check if it's a date
    const date = new Date(value);
    if (!isNaN(date.getTime())) {
      return Math.max(0, date.getTime() - Date.now());
    }

    return null;
  }

  /**
   * Check if error is a network error.
   *
   * @param error - Error object
   * @returns true if network error
   */
  private isNetworkError(error: any): boolean {
    const networkErrorCodes = [
      'ECONNREFUSED',
      'ECONNRESET',
      'ETIMEDOUT',
      'ENOTFOUND',
      'ENETUNREACH',
      'EAI_AGAIN',
      'ECONNABORTED',
    ];

    return (
      error &&
      (networkErrorCodes.includes(error.code) ||
        error.message?.includes('network') ||
        error.message?.includes('ETIMEDOUT') ||
        error.message?.includes('ECONNREFUSED'))
    );
  }
}
