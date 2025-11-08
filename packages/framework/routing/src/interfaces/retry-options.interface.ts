/**
 * Retry policy configuration for API endpoints.
 *
 * Automatically retries failed requests with configurable attempts and delays.
 * Useful for handling transient failures in distributed systems.
 */
export interface RetryOptions {
  /**
   * Maximum number of retry attempts.
   *
   * Total number of times to retry a failed request before giving up.
   * Does not include the initial attempt.
   *
   * @example 3 // Retry up to 3 times (4 total attempts including initial)
   * @default 3
   */
  attempts?: number;

  /**
   * Delay between retry attempts in milliseconds.
   *
   * Time to wait before retrying after a failure.
   * Consider using exponential backoff for production systems.
   *
   * @example 1000 // Wait 1 second between retries
   * @default 1000
   */
  delay?: number;
}
