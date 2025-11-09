/**
 * Context information passed to retry strategies.
 *
 * Provides comprehensive information about the retry attempt
 * including error details, response data, and timing metrics.
 */
export interface RetryContext {
  /**
   * Current retry attempt number (0-indexed).
   * First attempt is 0, first retry is 1, etc.
   */
  attempt: number;

  /**
   * The error that caused the retry, if any.
   */
  error?: any;

  /**
   * HTTP status code from the response, if available.
   */
  statusCode?: number;

  /**
   * Response headers from the failed request.
   */
  headers?: Record<string, string | string[]>;

  /**
   * Total elapsed time in milliseconds since first attempt.
   */
  elapsedMs: number;

  /**
   * Request URL that failed.
   */
  url: string;

  /**
   * HTTP method used.
   */
  method: string;
}
