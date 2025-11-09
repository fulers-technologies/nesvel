import type { AxiosError } from 'axios';
import { BaseException } from '@nesvel/exceptions';

/**
 * Exception thrown when a connection cannot be established.
 *
 * This exception is thrown when the HTTP client cannot connect to the
 * remote server due to network issues, DNS resolution failures, or
 * other connection-related problems.
 *
 * Extends BaseException to maintain consistency with the Nesvel exception
 * handling pattern and provides the static `make()` factory method.
 *
 * @extends BaseException
 *
 * @example
 * ```typescript
 * // Using the make() factory method
 * throw ConnectionException.make(axiosError);
 * throw ConnectionException.make(axiosError, 'Failed to connect to API');
 *
 * // In error handling
 * try {
 *   await Http.get('https://api.example.com/users');
 * } catch (error: Error | any) {
 *   if (error instanceof ConnectionException) {
 *     console.log('Could not reach server');
 *     console.log(error.getErrorCode());  // 'ECONNREFUSED', 'ENOTFOUND', etc.
 *   }
 * }
 * ```
 */
export class ConnectionException extends BaseException {
  /**
   * The Axios error that caused this exception.
   */
  protected readonly axiosError: AxiosError;

  /**
   * The error code from the underlying system.
   * Examples: 'ECONNREFUSED', 'ENOTFOUND', 'ECONNRESET', etc.
   */
  protected readonly errorCode?: string;

  /**
   * Create a new ConnectionException instance.
   *
   * @param error - The Axios error object
   * @param message - Optional custom error message
   */
  constructor(error: AxiosError, message?: string) {
    // Build a descriptive error message based on the error code
    const defaultMessage = ConnectionException.buildMessage(error);

    // Call parent constructor with message
    super(message || defaultMessage);

    // Store the original error and error code
    this.axiosError = error;
    this.errorCode = error.code;
    this.name = 'ConnectionException';

    // Capture stack trace for better debugging
    if (Error.captureStackTrace) {
      Error.captureStackTrace(this, ConnectionException);
    }
  }

  /**
   * Get the system error code.
   *
   * Returns the underlying system error code that caused the connection
   * failure. Common codes include:
   * - ECONNREFUSED: Connection refused by server
   * - ENOTFOUND: DNS lookup failed (hostname not found)
   * - ECONNRESET: Connection reset by peer
   * - ETIMEDOUT: Connection timed out
   * - ENETUNREACH: Network unreachable
   *
   * @returns The error code or undefined
   *
   * @example
   * ```typescript
   * const errorCode = error.getErrorCode();
   * if (errorCode === 'ENOTFOUND') {
   *   console.log('Invalid hostname or DNS failure');
   * }
   * ```
   */
  public getErrorCode(): string | undefined {
    return this.errorCode;
  }

  /**
   * Get the URL that failed to connect.
   *
   * @returns The URL or undefined if not available
   *
   * @example
   * ```typescript
   * console.log(`Failed to connect to: ${error.getUrl()}`);
   * ```
   */
  public getUrl(): string | undefined {
    return this.axiosError.config?.url;
  }

  /**
   * Get the hostname that failed to resolve.
   *
   * @returns The hostname or undefined
   *
   * @example
   * ```typescript
   * if (error.getErrorCode() === 'ENOTFOUND') {
   *   console.log(`Could not resolve hostname: ${error.getHostname()}`);
   * }
   * ```
   */
  public getHostname(): string | undefined {
    const url = this.getUrl();
    if (!url) return undefined;

    try {
      return URL.make(url).hostname;
    } catch {
      return undefined;
    }
  }

  /**
   * Check if the error is due to connection refusal.
   *
   * @returns True if the server refused the connection
   *
   * @example
   * ```typescript
   * if (error.isConnectionRefused()) {
   *   console.log('Server is not accepting connections');
   * }
   * ```
   */
  public isConnectionRefused(): boolean {
    return this.errorCode === 'ECONNREFUSED';
  }

  /**
   * Check if the error is due to DNS resolution failure.
   *
   * @returns True if the hostname could not be resolved
   *
   * @example
   * ```typescript
   * if (error.isDnsFailure()) {
   *   console.log('Invalid hostname or DNS server issue');
   * }
   * ```
   */
  public isDnsFailure(): boolean {
    return this.errorCode === 'ENOTFOUND';
  }

  /**
   * Check if the connection was reset by the peer.
   *
   * @returns True if the connection was reset
   *
   * @example
   * ```typescript
   * if (error.isConnectionReset()) {
   *   console.log('Connection was unexpectedly closed');
   * }
   * ```
   */
  public isConnectionReset(): boolean {
    return this.errorCode === 'ECONNRESET';
  }

  /**
   * Check if the network is unreachable.
   *
   * @returns True if the network cannot be reached
   *
   * @example
   * ```typescript
   * if (error.isNetworkUnreachable()) {
   *   console.log('No network connectivity');
   * }
   * ```
   */
  public isNetworkUnreachable(): boolean {
    return this.errorCode === 'ENETUNREACH';
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
   * Creates a human-readable error message based on the error code
   * and other error properties.
   *
   * @param error - The Axios error object
   * @returns A descriptive error message
   */
  private static buildMessage(error: AxiosError): string {
    const url = error.config?.url;
    const code = error.code;

    // Build message based on error code
    switch (code) {
      case 'ECONNREFUSED':
        return `Connection refused to ${url || 'server'}`;
      case 'ENOTFOUND':
        return `Could not resolve hostname for ${url || 'server'}`;
      case 'ECONNRESET':
        return `Connection reset by peer for ${url || 'server'}`;
      case 'ETIMEDOUT':
        return `Connection timed out for ${url || 'server'}`;
      case 'ENETUNREACH':
        return `Network unreachable for ${url || 'server'}`;
      default:
        return error.message || `Connection failed to ${url || 'server'}`;
    }
  }

  /**
   * Convert the exception to a string representation.
   *
   * @returns A string describing the error
   */
  public toString(): string {
    if (this.errorCode) {
      return `ConnectionException [${this.errorCode}]: ${this.message}`;
    }
    return `ConnectionException: ${this.message}`;
  }
}
