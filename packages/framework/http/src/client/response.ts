import { Mixin } from 'ts-mixer';
import type { AxiosResponse } from 'axios';
import { Macroable } from '@nesvel/macroable';

import { RequestException } from './exceptions/request-exception';
import { DeterminesStatusCode } from './concerns/determines-status-code';
import type { DeterminesStatusCodeInterface } from '../interfaces';

/**
 * HTTP Client Response Wrapper
 *
 * Wraps Axios responses with convenient helper methods for accessing
 * response data, headers, and status codes. Provides a fluent interface
 * similar to Laravel's HTTP client response.
 *
 * This class makes it easy to work with HTTP responses by providing
 * methods to parse JSON, check status codes, access headers, and more.
 *
 * Uses mixins to provide status code checking functionality via the
 * DeterminesStatusCode concern.
 *
 * @example
 * ```typescript
 * const response = await HttpClient.get('https://api.example.com/users');
 *
 * // Access response data
 * const users = response.json();
 * const name = response.json('users.0.name');
 *
 * // Check status
 * if (response.successful()) {
 *   console.log('Success!');
 * }
 *
 * // Check specific status codes
 * if (response.ok()) {
 *   console.log('200 OK');
 * }
 *
 * // Access headers
 * const contentType = response.header('content-type');
 * ```
 */
@Macroable()
export class ClientResponse
  extends Mixin(DeterminesStatusCode)
  implements DeterminesStatusCodeInterface
{
  /**
   * The underlying Axios response object.
   */
  protected readonly response: AxiosResponse;

  /**
   * Cached decoded JSON data.
   */
  protected decodedJson: any = null;

  /**
   * Create a new ClientResponse instance.
   *
   * @param response - The Axios response object to wrap
   */
  constructor(response: AxiosResponse) {
    super();
    this.response = response;
  }

  /**
   * Create a new ClientResponse instance (Laravel-style factory method).
   *
   * @param response - The Axios response object to wrap
   * @returns A new ClientResponse instance
   *
   * @example
   * ```typescript
   * const response = ClientResponse.make(axiosResponse);
   * ```
   */
  public static make(response: AxiosResponse): ClientResponse {
    return new ClientResponse(response);
  }

  /**
   * Get the response body as a string.
   *
   * Returns the raw response body. If the body is not a string,
   * it will be JSON stringified.
   *
   * @returns The response body as a string
   *
   * @example
   * ```typescript
   * const body = response.body();
   * console.log(body); // Raw response text
   * ```
   */
  public body(): string {
    if (typeof this.response.data === 'string') {
      return this.response.data;
    }

    try {
      return JSON.stringify(this.response.data);
    } catch {
      return String(this.response.data);
    }
  }

  /**
   * Get the response body parsed as JSON.
   *
   * Parses the response body as JSON and optionally extracts a value
   * using dot notation. Returns null if parsing fails.
   *
   * @param key - Optional dot-notation key to extract (e.g., 'user.name')
   * @param defaultValue - Default value if key doesn't exist
   * @returns The parsed JSON data or default value
   *
   * @example
   * ```typescript
   * // Get entire JSON object
   * const data = response.json();
   *
   * // Get nested value with dot notation
   * const userName = response.json('user.name');
   * const email = response.json('user.email', 'default@example.com');
   * ```
   */
  public json<T = any>(key?: string, defaultValue?: T): T {
    // Parse JSON if not already cached
    if (this.decodedJson === null) {
      if (typeof this.response.data === 'string') {
        try {
          this.decodedJson = JSON.parse(this.response.data);
        } catch {
          this.decodedJson = this.response.data;
        }
      } else {
        this.decodedJson = this.response.data;
      }
    }

    // Return full data if no key specified
    if (!key) {
      return this.decodedJson as T;
    }

    // Extract nested value using dot notation
    return this.getNestedValue(this.decodedJson, key, defaultValue);
  }

  /**
   * Get the response body as an object.
   *
   * Similar to json() but always returns an object representation.
   *
   * @returns The response as an object
   *
   * @example
   * ```typescript
   * const obj = response.object();
   * console.log(obj.id, obj.name);
   * ```
   */
  public object<T = any>(): T {
    return this.json<T>();
  }

  /**
   * Get the response body as an array.
   *
   * Returns the response data as an array. If a key is provided,
   * extracts that value as an array.
   *
   * @param key - Optional key to extract
   * @returns The response data as an array
   *
   * @example
   * ```typescript
   * const users = response.array();
   * const items = response.array('data.items');
   * ```
   */
  public array<T = any>(key?: string): T[] {
    const data = key ? this.json(key) : this.json();
    return Array.isArray(data) ? data : [data];
  }

  /**
   * Get a specific header from the response.
   *
   * Header names are case-insensitive.
   *
   * @param name - The header name
   * @returns The header value or undefined
   *
   * @example
   * ```typescript
   * const contentType = response.header('content-type');
   * const etag = response.header('ETag');
   * ```
   */
  public header(name: string): string | undefined {
    return this.response.headers[name.toLowerCase()];
  }

  /**
   * Get all response headers.
   *
   * @returns Record of all response headers
   *
   * @example
   * ```typescript
   * const headers = response.headers();
   * console.log(headers['content-type']);
   * ```
   */
  public headers(): Record<string, any> {
    return this.response.headers;
  }

  /**
   * Get the HTTP status code.
   *
   * @returns The HTTP status code
   *
   * @example
   * ```typescript
   * const status = response.status(); // 200, 404, etc.
   * ```
   */
  public status(): number {
    return this.response.status;
  }

  /**
   * Get the status reason phrase.
   *
   * @returns The status text (e.g., "OK", "Not Found")
   *
   * @example
   * ```typescript
   * const reason = response.reason(); // "OK"
   * ```
   */
  public reason(): string {
    return this.response.statusText;
  }

  /**
   * Check if the response was successful (2xx status).
   *
   * @returns True if status is between 200-299
   *
   * @example
   * ```typescript
   * if (response.successful()) {
   *   console.log('Request succeeded');
   * }
   * ```
   */
  public successful(): boolean {
    return this.status() >= 200 && this.status() < 300;
  }

  /**
   * Check if the response indicates failure (4xx or 5xx).
   *
   * @returns True if status is >= 400
   *
   * @example
   * ```typescript
   * if (response.failed()) {
   *   console.log('Request failed');
   * }
   * ```
   */
  public failed(): boolean {
    return this.status() >= 400;
  }

  /**
   * Check if the response is a redirect (3xx status).
   *
   * @returns True if status is between 300-399
   *
   * @example
   * ```typescript
   * if (response.redirect()) {
   *   console.log('Response is a redirect');
   * }
   * ```
   */
  public redirect(): boolean {
    return this.status() >= 300 && this.status() < 400;
  }

  /**
   * Check if the response indicates a client error (4xx status).
   *
   * @returns True if status is between 400-499
   *
   * @example
   * ```typescript
   * if (response.clientError()) {
   *   console.log('Client error occurred');
   * }
   * ```
   */
  public clientError(): boolean {
    return this.status() >= 400 && this.status() < 500;
  }

  /**
   * Check if the response indicates a server error (5xx status).
   *
   * @returns True if status is >= 500
   *
   * @example
   * ```typescript
   * if (response.serverError()) {
   *   console.log('Server error occurred');
   * }
   * ```
   */
  public serverError(): boolean {
    return this.status() >= 500;
  }

  /**
   * Check if the response status matches a specific code.
   *
   * @param status - The status code to check
   * @returns True if status matches
   *
   * @example
   * ```typescript
   * if (response.isStatus(404)) {
   *   console.log('Not found');
   * }
   * ```
   */
  public isStatus(status: number): boolean {
    return this.status() === status;
  }

  /**
   * Throw an exception if the response indicates an error.
   *
   * Throws a RequestException if the status is >= 400.
   *
   * @param callback - Optional callback to execute before throwing
   * @returns This response for chaining
   * @throws RequestException if response failed
   *
   * @example
   * ```typescript
   * response.throw(); // Throws if status >= 400
   *
   * response.throw((response, error) => {
   *   console.log('Request failed:', response.status());
   * });
   * ```
   */
  public throw(callback?: (response: ClientResponse, error: RequestException) => void): this {
    if (this.failed()) {
      const error = this.toException();
      if (callback) {
        callback(this, error);
      }
      throw error;
    }
    return this;
  }

  /**
   * Throw an exception if a condition is met.
   *
   * @param condition - Condition to check (boolean or function)
   * @param callback - Optional callback before throwing
   * @returns This response for chaining
   * @throws RequestException if condition is true and response failed
   *
   * @example
   * ```typescript
   * response.throwIf(response.status() > 400);
   * response.throwIf(() => someCondition);
   * ```
   */
  public throwIf(
    condition: boolean | (() => boolean),
    callback?: (response: ClientResponse, error: RequestException) => void
  ): this {
    const shouldThrow = typeof condition === 'function' ? condition() : condition;
    if (shouldThrow && this.failed()) {
      return this.throw(callback);
    }
    return this;
  }

  /**
   * Throw an exception unless a condition is met.
   *
   * @param condition - Condition to check (boolean or function)
   * @param callback - Optional callback before throwing
   * @returns This response for chaining
   * @throws RequestException if condition is false and response failed
   *
   * @example
   * ```typescript
   * response.throwUnless(response.ok());
   * ```
   */
  public throwUnless(
    condition: boolean | (() => boolean),
    callback?: (response: ClientResponse, error: RequestException) => void
  ): this {
    const shouldNotThrow = typeof condition === 'function' ? condition() : condition;
    if (!shouldNotThrow && this.failed()) {
      return this.throw(callback);
    }
    return this;
  }

  /**
   * Execute a callback if the response failed.
   *
   * @param callback - Callback to execute on error
   * @returns This response for chaining
   *
   * @example
   * ```typescript
   * response.onError((response) => {
   *   console.log('Error:', response.status());
   * });
   * ```
   */
  public onError(callback: (response: ClientResponse) => void): this {
    if (this.failed()) {
      callback(this);
    }
    return this;
  }

  /**
   * Convert the response to a RequestException.
   *
   * Creates a RequestException from this response if it indicates an error.
   *
   * @returns RequestException if response failed, otherwise null
   *
   * @example
   * ```typescript
   * const error = response.toException();
   * if (error) {
   *   throw error;
   * }
   * ```
   */
  public toException(): RequestException {
    const error = {
      response: this.response,
      config: this.response.config,
      request: this.response.request,
      message: `HTTP ${this.status()} ${this.reason()}`,
      name: 'AxiosError',
      isAxiosError: true,
    } as any;

    return RequestException.make(error);
  }

  /**
   * Get the underlying Axios response.
   *
   * @returns The Axios response object
   *
   * @example
   * ```typescript
   * const axiosResponse = response.toAxiosResponse();
   * console.log(axiosResponse.config);
   * ```
   */
  public toAxiosResponse(): AxiosResponse {
    return this.response;
  }

  /**
   * Get string representation of the response.
   *
   * @returns The response body as a string
   */
  public toString(): string {
    return this.body();
  }

  /**
   * Helper method to get nested values from objects using dot notation.
   *
   * @param obj - The object to extract from
   * @param path - Dot-separated path (e.g., 'user.address.city')
   * @param defaultValue - Default value if path doesn't exist
   * @returns The value at the path or default value
   */
  private getNestedValue<T>(obj: any, path: string, defaultValue?: T): T {
    const keys = path.split('.');
    let result = obj;

    for (const key of keys) {
      if (result == null || typeof result !== 'object') {
        return defaultValue as T;
      }
      result = result[key];
    }

    return (result !== undefined ? result : defaultValue) as T;
  }
}
