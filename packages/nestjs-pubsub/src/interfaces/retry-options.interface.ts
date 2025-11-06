/**
 * Configuration options for retry behavior.
 *
 * Controls how failed operations are retried, including delays,
 * backoff strategies, and error filtering.
 */
export interface IRetryOptions {
  /**
   * Maximum number of retry attempts.
   * After this many failures, the operation fails permanently.
   *
   * @default 3
   */
  maxRetries: number;

  /**
   * Initial delay in milliseconds between retry attempts.
   * This is multiplied by the backoff multiplier for each subsequent retry.
   *
   * @default 1000
   */
  retryDelay: number;

  /**
   * Multiplier applied to retry delay for exponential backoff.
   *
   * For example, with backoffMultiplier=2 and retryDelay=1000:
   * - Attempt 1: Wait 1000ms
   * - Attempt 2: Wait 2000ms
   * - Attempt 3: Wait 4000ms
   *
   * @default 2
   */
  backoffMultiplier?: number;

  /**
   * Maximum delay in milliseconds between retries.
   * Prevents exponential backoff from growing too large.
   *
   * @default 30000 (30 seconds)
   */
  maxRetryDelay?: number;

  /**
   * Array of error types/messages that should trigger a retry.
   * If provided, only errors matching these patterns will be retried.
   * If undefined, all errors are considered retryable.
   *
   * @example
   * ['ECONNREFUSED', 'ETIMEDOUT', 'Network timeout']
   */
  retryableErrors?: string[];

  /**
   * Array of error types/messages that should NOT trigger a retry.
   * These errors cause immediate failure without retries.
   * Takes precedence over retryableErrors.
   *
   * @example
   * ['ValidationError', 'Unauthorized', 'Invalid schema']
   */
  nonRetryableErrors?: string[];

  /**
   * Custom function to determine if an error should be retried.
   * If provided, this overrides retryableErrors and nonRetryableErrors.
   *
   * @param error - The error to check
   * @returns True if the error should trigger a retry, false otherwise
   *
   * @example
   * ```typescript
   * isRetryable: (error) => {
   *   return error.code >= 500 && error.code < 600; // Retry server errors only
   * }
   * ```
   */
  isRetryable?: (error: Error) => boolean;
}
