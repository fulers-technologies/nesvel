import { BaseException } from '@nesvel/exceptions';
import type { AxiosError } from 'axios';

/**
 * Exception thrown when an HTTP request times out.
 *
 * This exception is thrown when a request takes longer than the configured
 * timeout period to complete. It can indicate either a connection timeout
 * (time to establish connection) or a request timeout (time to receive response).
 *
 * Extends BaseException to maintain consistency with the Nesvel exception
 * handling pattern and provides the static `make()` factory method.
 *
 * @extends BaseException
 *
 * @example
 * ```typescript
 * // Using the make() factory method
 * throw TimeoutException.make(axiosError);
 * throw TimeoutException.make(axiosError, 30000);
 * throw TimeoutException.make(axiosError, 30000, 'API request took too long');
 *
 * // In error handling
 * try {
 *   await Http.timeout(5).get('https://slow-api.example.com/data');
 * } catch (error: Error | any) {
 *   if (error instanceof TimeoutException) {
 *     console.log(`Request timed out after ${error.getTimeoutDuration()}ms`);
 *     console.log(`URL: ${error.getUrl()}`);
 *   }
 * }
 * ```
 */
export class TimeoutException extends BaseException {
  /**
   * The Axios error that caused this exception.
   */
  protected readonly axiosError: AxiosError;

  /**
   * The timeout duration in milliseconds.
   */
  protected readonly timeoutDuration?: number;

  /**
   * The URL that timed out.
   */
  protected readonly url?: string;

  /**
   * Create a new TimeoutException instance.
   *
   * @param error - The Axios error object
   * @param timeoutDuration - The timeout duration in milliseconds
   * @param message - Optional custom error message
   */
  constructor(error: AxiosError, timeoutDuration?: number, message?: string) {
    // Build a descriptive error message
    const defaultMessage = TimeoutException.buildMessage(error, timeoutDuration);

    // Call parent constructor with message
    super(message || defaultMessage);

    // Store error details
    this.axiosError = error;
    this.timeoutDuration = timeoutDuration || error.config?.timeout;
    this.url = error.config?.url;
    this.name = 'TimeoutException';

    // Capture stack trace for better debugging
    if (Error.captureStackTrace) {
      Error.captureStackTrace(this, TimeoutException);
    }
  }

  /**
   * Get the timeout duration in milliseconds.
   *
   * Returns the configured timeout duration that was exceeded.
   *
   * @returns The timeout duration in milliseconds or undefined
   *
   * @example
   * ```typescript
   * const timeout = error.getTimeoutDuration();
   * console.log(`Request timed out after ${timeout}ms`);
   * ```
   */
  public getTimeoutDuration(): number | undefined {
    return this.timeoutDuration;
  }

  /**
   * Get the timeout duration in seconds.
   *
   * Convenience method to get the timeout in seconds instead of milliseconds.
   *
   * @returns The timeout duration in seconds or undefined
   *
   * @example
   * ```typescript
   * console.log(`Timeout: ${error.getTimeoutInSeconds()}s`);
   * ```
   */
  public getTimeoutInSeconds(): number | undefined {
    return this.timeoutDuration ? Math.round(this.timeoutDuration / 1000) : undefined;
  }

  /**
   * Get the URL that timed out.
   *
   * @returns The URL or undefined if not available
   *
   * @example
   * ```typescript
   * console.log(`Timed out connecting to: ${error.getUrl()}`);
   * ```
   */
  public getUrl(): string | undefined {
    return this.url;
  }

  /**
   * Get the HTTP method that was used.
   *
   * @returns The HTTP method (GET, POST, etc.) or undefined
   *
   * @example
   * ```typescript
   * console.log(`${error.getMethod()} request timed out`);
   * ```
   */
  public getMethod(): string | undefined {
    return this.axiosError.config?.method?.toUpperCase();
  }

  /**
   * Check if this was a connection timeout.
   *
   * Returns true if the timeout occurred while trying to establish
   * the connection (before any data was sent/received).
   *
   * @returns True if connection timeout
   *
   * @example
   * ```typescript
   * if (error.isConnectionTimeout()) {
   *   console.log('Could not establish connection in time');
   * }
   * ```
   */
  public isConnectionTimeout(): boolean {
    // Connection timeout typically has ETIMEDOUT code without a response
    return this.axiosError.code === 'ETIMEDOUT' && !this.axiosError.response;
  }

  /**
   * Check if this was a response timeout.
   *
   * Returns true if the timeout occurred while waiting for the
   * server response (after connection was established).
   *
   * @returns True if response timeout
   *
   * @example
   * ```typescript
   * if (error.isResponseTimeout()) {
   *   console.log('Server took too long to respond');
   * }
   * ```
   */
  public isResponseTimeout(): boolean {
    // ECONNABORTED typically indicates response timeout
    return this.axiosError.code === 'ECONNABORTED';
  }

  /**
   * Get the original Axios error.
   *
   * @returns The underlying Axios error object
   *
   * @example
   * ```typescript
   * const axiosError = error.getAxiosError();
   * console.log(axiosError.config);
   * ```
   */
  public getAxiosError(): AxiosError {
    return this.axiosError;
  }

  /**
   * Build a descriptive error message from the Axios error.
   *
   * Creates a human-readable error message including the timeout
   * duration and URL if available.
   *
   * @param error - The Axios error object
   * @param timeoutDuration - The timeout duration in milliseconds
   * @returns A descriptive error message
   */
  private static buildMessage(error: AxiosError, timeoutDuration?: number): string {
    const url = error.config?.url;
    const method = error.config?.method?.toUpperCase() || 'Request';
    const timeout = timeoutDuration || error.config?.timeout;

    // Build timeout message
    if (timeout) {
      const seconds = Math.round(timeout / 1000);
      if (url) {
        return `${method} request to ${url} timed out after ${seconds} seconds`;
      }
      return `${method} request timed out after ${seconds} seconds`;
    }

    // Fallback message without timeout info
    if (url) {
      return `${method} request to ${url} timed out`;
    }
    return `${method} request timed out`;
  }

  /**
   * Convert the exception to a string representation.
   *
   * @returns A string describing the error
   */
  public toString(): string {
    if (this.timeoutDuration) {
      const seconds = Math.round(this.timeoutDuration / 1000);
      return `TimeoutException (${seconds}s): ${this.message}`;
    }
    return `TimeoutException: ${this.message}`;
  }
}
