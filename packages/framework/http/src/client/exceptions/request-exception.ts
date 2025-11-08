import { BaseException } from '@nesvel/exceptions';
import type { AxiosError, AxiosResponse } from 'axios';

/**
 * Exception thrown when an HTTP request fails.
 *
 * This exception is thrown when a server or client error occurs during
 * an HTTP request (4xx or 5xx status codes). It wraps the Axios error
 * and provides convenient methods to access error information.
 *
 * Extends BaseException to maintain consistency with the Nesvel exception
 * handling pattern and provides the static `make()` factory method.
 *
 * @extends BaseException
 *
 * @example
 * ```typescript
 * // Using the make() factory method
 * throw RequestException.make(axiosError);
 * throw RequestException.make(axiosError, 'Custom error message');
 *
 * // Traditional try-catch
 * try {
 *   await Http.get('https://api.example.com/users/999');
 * } catch (error: Error | any) {
 *   if (error instanceof RequestException) {
 *     console.log(error.status());        // 404
 *     console.log(error.body());          // Error response body
 *     console.log(error.json());          // Parsed JSON error
 *   }
 * }
 * ```
 */
export class RequestException extends BaseException {
  /**
   * The Axios error that caused this exception.
   */
  protected readonly axiosError: AxiosError;

  /**
   * The HTTP response if available.
   */
  protected readonly response?: AxiosResponse;

  /**
   * Create a new RequestException instance.
   *
   * @param error - The Axios error object
   * @param message - Optional custom error message
   */
  constructor(error: AxiosError, message?: string) {
    // If no message provided, use the Axios error message
    super(message || error.message || 'Request failed');

    // Set the prototype explicitly for proper instanceof checks
    Object.setPrototypeOf(this, RequestException.prototype);

    // Store the original error and response
    this.axiosError = error;
    this.response = error.response;
    this.name = 'RequestException';

    // Capture stack trace for better debugging
    if (Error.captureStackTrace) {
      Error.captureStackTrace(this, RequestException);
    }
  }

  /**
   * Get the HTTP status code from the response.
   *
   * Returns the status code if the response exists, otherwise returns 0
   * to indicate a network or connection error.
   *
   * @returns The HTTP status code or 0 if no response
   *
   * @example
   * ```typescript
   * if (error.status() === 404) {
   *   console.log('Resource not found');
   * }
   * ```
   */
  public status(): number {
    return this.response?.status ?? 0;
  }

  /**
   * Get the response body as a string.
   *
   * Returns the raw response body if available, otherwise returns an empty string.
   *
   * @returns The response body as a string
   *
   * @example
   * ```typescript
   * console.log(error.body()); // Raw HTML or JSON string
   * ```
   */
  public body(): string {
    if (!this.response?.data) {
      return '';
    }

    // If data is already a string, return it
    if (typeof this.response.data === 'string') {
      return this.response.data;
    }

    // Otherwise, stringify it
    try {
      return JSON.stringify(this.response.data);
    } catch {
      return String(this.response.data);
    }
  }

  /**
   * Get the response body parsed as JSON.
   *
   * Attempts to parse the response body as JSON. If parsing fails or
   * no response exists, returns null.
   *
   * @param key - Optional key to extract from the JSON object
   * @param defaultValue - Default value if key doesn't exist
   * @returns The parsed JSON data or null
   *
   * @example
   * ```typescript
   * const errors = error.json('errors');
   * const message = error.json('message', 'Unknown error');
   * ```
   */
  public json(key?: string, defaultValue?: any): any {
    if (!this.response?.data) {
      return null;
    }

    let data = this.response.data;

    // If data is a string, try to parse it
    if (typeof data === 'string') {
      try {
        data = JSON.parse(data);
      } catch {
        return null;
      }
    }

    // If no key specified, return the whole object
    if (!key) {
      return data;
    }

    // Extract the value at the specified key path
    return this.getNestedValue(data, key, defaultValue);
  }

  /**
   * Get a specific header from the response.
   *
   * @param name - The header name (case-insensitive)
   * @returns The header value or undefined
   *
   * @example
   * ```typescript
   * const contentType = error.header('content-type');
   * ```
   */
  public header(name: string): string | undefined {
    return this.response?.headers?.[name.toLowerCase()];
  }

  /**
   * Get all response headers.
   *
   * @returns Record of all headers or empty object
   *
   * @example
   * ```typescript
   * const headers = error.headers();
   * console.log(headers['content-type']);
   * ```
   */
  public headers(): Record<string, any> {
    return this.response?.headers ?? {};
  }

  /**
   * Check if the error is a client error (4xx status).
   *
   * @returns True if status is between 400-499
   *
   * @example
   * ```typescript
   * if (error.isClientError()) {
   *   console.log('Client made a bad request');
   * }
   * ```
   */
  public isClientError(): boolean {
    const status = this.status();
    return status >= 400 && status < 500;
  }

  /**
   * Check if the error is a server error (5xx status).
   *
   * @returns True if status is >= 500
   *
   * @example
   * ```typescript
   * if (error.isServerError()) {
   *   console.log('Server encountered an error');
   * }
   * ```
   */
  public isServerError(): boolean {
    const status = this.status();
    return status >= 500;
  }

  /**
   * Check if the error is a timeout error.
   *
   * @returns True if the request timed out
   *
   * @example
   * ```typescript
   * if (error.isTimeout()) {
   *   console.log('Request took too long');
   * }
   * ```
   */
  public isTimeout(): boolean {
    return this.axiosError.code === 'ECONNABORTED' || this.axiosError.code === 'ETIMEDOUT';
  }

  /**
   * Check if the error is a network error.
   *
   * @returns True if there was a network/connection issue
   *
   * @example
   * ```typescript
   * if (error.isNetworkError()) {
   *   console.log('Could not reach server');
   * }
   * ```
   */
  public isNetworkError(): boolean {
    return !this.response && this.axiosError.code !== 'ECONNABORTED';
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
   * Get the Axios response object if available.
   *
   * @returns The Axios response or undefined
   *
   * @example
   * ```typescript
   * const response = error.getResponse();
   * if (response) {
   *   console.log(response.config.url);
   * }
   * ```
   */
  public getResponse(): AxiosResponse | undefined {
    return this.response;
  }

  /**
   * Helper method to get nested values from objects using dot notation.
   *
   * @param obj - The object to extract from
   * @param path - Dot-separated path (e.g., 'user.address.city')
   * @param defaultValue - Default value if path doesn't exist
   * @returns The value at the path or default value
   */
  private getNestedValue(obj: any, path: string, defaultValue?: any): any {
    const keys = path.split('.');
    let result = obj;

    for (const key of keys) {
      if (result == null || typeof result !== 'object') {
        return defaultValue;
      }
      result = result[key];
    }

    return result !== undefined ? result : defaultValue;
  }

  /**
   * Convert the exception to a string representation.
   *
   * @returns A string describing the error
   */
  public toString(): string {
    const status = this.status();
    if (status > 0) {
      return `RequestException: HTTP ${status} - ${this.message}`;
    }
    return `RequestException: ${this.message}`;
  }
}
