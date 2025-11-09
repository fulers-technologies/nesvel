import type { JitterType } from '../../types/client/jitter-type.type';
import type { RetryContext } from './retry-context.interface';

/**
 * Configuration options for exponential backoff strategy.
 */
export interface ExponentialBackoffOptions {
  /**
   * Maximum number of retry attempts.
   * @default 3
   */
  maxAttempts?: number;

  /**
   * Base delay in milliseconds for first retry.
   * @default 1000
   */
  baseDelayMs?: number;

  /**
   * Maximum delay in milliseconds between retries.
   * @default 30000 (30 seconds)
   */
  maxDelayMs?: number;

  /**
   * Exponential multiplier for each retry.
   * @default 2
   */
  multiplier?: number;

  /**
   * Jitter type to apply to delays.
   * @default 'full'
   */
  jitter?: JitterType;

  /**
   * Maximum total elapsed time for all retries in milliseconds.
   * @default 120000 (2 minutes)
   */
  maxElapsedTimeMs?: number;

  /**
   * HTTP status codes that should trigger a retry.
   * @default [408, 429, 500, 502, 503, 504]
   */
  retryableStatusCodes?: number[];

  /**
   * Whether to retry on network errors (ECONNREFUSED, ETIMEDOUT, etc.).
   * @default true
   */
  retryOnNetworkError?: boolean;

  /**
   * Custom predicate to determine if error should be retried.
   */
  shouldRetryPredicate?: (context: RetryContext) => boolean;
}
