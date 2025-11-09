import type { RetryContext } from './retry-context.interface';

/**
 * Strategy interface for determining retry behavior.
 *
 * Implementations define when and how requests should be retried,
 * including delay calculations and retry eligibility.
 */
export interface RetryStrategy {
  /**
   * Determine if the request should be retried.
   *
   * @param context - Retry context with error and attempt information
   * @returns true if request should be retried, false otherwise
   */
  shouldRetry(context: RetryContext): boolean;

  /**
   * Calculate the delay in milliseconds before the next retry.
   *
   * @param context - Retry context with error and attempt information
   * @returns Delay in milliseconds, or 0 for immediate retry
   */
  getDelay(context: RetryContext): number;

  /**
   * Maximum number of retry attempts allowed.
   * Returns -1 for unlimited retries (use with caution).
   */
  getMaxAttempts(): number;

  /**
   * Maximum total time in milliseconds for all retry attempts.
   * Returns -1 for no time limit.
   */
  getMaxElapsedTime(): number;
}
