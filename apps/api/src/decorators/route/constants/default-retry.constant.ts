/**
 * Default retry policy configuration.
 *
 * Applied when retry is enabled but no specific settings are provided.
 * Automatically retries failed requests to handle transient failures.
 *
 * @constant
 */
export const DEFAULT_RETRY_POLICY = {
  /**
   * Maximum number of retry attempts.
   * Does not include the initial request attempt.
   * Total attempts = initial + retries (1 + 3 = 4 total).
   * @default 3 retries
   */
  attempts: 3,

  /**
   * Delay between retry attempts in milliseconds.
   * Fixed delay; consider exponential backoff for production.
   * @default 1000ms (1 second)
   */
  delay: 1000,
};
