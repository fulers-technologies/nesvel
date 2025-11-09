import { Macroable } from '@nesvel/macroable';
import { AxiosRequestConfig, Method } from 'axios';

/**
 * Represents an outgoing HTTP request.
 *
 * This class wraps the Axios request configuration and provides
 * convenient methods for inspecting request details. Useful for
 * testing, logging, and debugging HTTP requests.
 *
 * @example
 * ```typescript
 * const request = ClientRequest.make({
 *   method: 'POST',
 *   url: 'https://api.example.com/users',
 *   headers: { 'Authorization': 'Bearer token' },
 *   data: { name: 'John' }
 * });
 *
 * console.log(request.method()); // 'POST'
 * console.log(request.url()); // 'https://api.example.com/users'
 * console.log(request.hasHeader('Authorization')); // true
 * console.log(request.isJson()); // true
 * ```
 */
@Macroable()
export class ClientRequest {
  /**
   * The underlying Axios request configuration.
   */
  private readonly config: AxiosRequestConfig;

  /**
   * Create a new client request instance.
   *
   * @param config - Axios request configuration
   */
  constructor(config: AxiosRequestConfig) {
    this.config = config;
  }

  /**
   * Static factory method to create a new request.
   *
   * @param config - Axios request configuration
   * @returns New request instance
   */
  public static make(config: AxiosRequestConfig): ClientRequest {
    return new ClientRequest(config);
  }

  /**
   * Get the HTTP method.
   *
   * @returns HTTP method (GET, POST, etc.)
   */
  public method(): Method {
    return (this.config.method || 'GET').toUpperCase() as Method;
  }

  /**
   * Get the full request URL.
   *
   * @returns Request URL
   */
  public url(): string {
    return this.config.url || '';
  }

  /**
   * Check if the request has a specific header.
   *
   * @param key - Header name
   * @param value - Optional header value to match
   * @returns true if header exists (and matches value if provided)
   */
  public hasHeader(key: string, value?: string | string[]): boolean {
    if (!this.config.headers) {
      return false;
    }

    const headers = this.config.headers as Record<string, any>;
    const headerKeys = Object.keys(headers);
    const normalizedKey = headerKeys.find((k) => k.toLowerCase() === key.toLowerCase());

    if (!normalizedKey) {
      return false;
    }

    if (value === undefined) {
      return true;
    }

    const headerValue = headers[normalizedKey];
    const values = Array.isArray(value) ? value : [value];
    const actualValues = Array.isArray(headerValue) ? headerValue : [headerValue];

    return values.every((v) => actualValues.includes(v));
  }

  /**
   * Check if the request has multiple headers.
   *
   * @param headers - Headers to check (object or array of header names)
   * @returns true if all headers exist
   */
  public hasHeaders(headers: Record<string, string | string[]> | string[]): boolean {
    if (Array.isArray(headers)) {
      return headers.every((key) => this.hasHeader(key));
    }

    return Object.entries(headers).every(([key, value]) => this.hasHeader(key, value));
  }

  /**
   * Get a specific header value.
   *
   * @param key - Header name
   * @returns Header value or undefined
   */
  public header(key: string): string | string[] | undefined {
    if (!this.config.headers) {
      return undefined;
    }

    const headers = this.config.headers as Record<string, any>;
    const headerKeys = Object.keys(headers);
    const normalizedKey = headerKeys.find((k) => k.toLowerCase() === key.toLowerCase());

    return normalizedKey ? headers[normalizedKey] : undefined;
  }

  /**
   * Get all request headers.
   *
   * @returns Headers object
   */
  public headers(): Record<string, string | string[]> {
    return (this.config.headers as Record<string, string | string[]>) || {};
  }

  /**
   * Get the request body.
   *
   * @returns Request body (any type)
   */
  public body(): any {
    return this.config.data;
  }

  /**
   * Get the request data (body).
   *
   * Alias for body() to match Laravel's naming.
   *
   * @returns Request data
   */
  public data(): any {
    return this.body();
  }

  /**
   * Get query parameters.
   *
   * @returns Query parameters object
   */
  public params(): Record<string, any> {
    return this.config.params || {};
  }

  /**
   * Check if the request has a specific query parameter.
   *
   * @param key - Parameter name
   * @returns true if parameter exists
   */
  public hasParam(key: string): boolean {
    return this.config.params && key in this.config.params;
  }

  /**
   * Get a specific query parameter value.
   *
   * @param key - Parameter name
   * @param defaultValue - Default value if not found
   * @returns Parameter value or default
   */
  public param(key: string, defaultValue?: any): any {
    return this.config.params?.[key] ?? defaultValue;
  }

  /**
   * Check if the request is JSON.
   *
   * @returns true if Content-Type is application/json
   */
  public isJson(): boolean {
    const contentType = this.header('Content-Type');
    const contentTypeStr = Array.isArray(contentType) ? contentType[0] : contentType;
    return contentTypeStr?.toLowerCase().includes('application/json') || false;
  }

  /**
   * Check if the request is form data.
   *
   * @returns true if Content-Type is application/x-www-form-urlencoded
   */
  public isForm(): boolean {
    const contentType = this.header('Content-Type');
    const contentTypeStr = Array.isArray(contentType) ? contentType[0] : contentType;
    return contentTypeStr?.toLowerCase().includes('application/x-www-form-urlencoded') || false;
  }

  /**
   * Check if the request is multipart.
   *
   * @returns true if Content-Type is multipart/form-data
   */
  public isMultipart(): boolean {
    const contentType = this.header('Content-Type');
    const contentTypeStr = Array.isArray(contentType) ? contentType[0] : contentType;
    return contentTypeStr?.toLowerCase().includes('multipart/form-data') || false;
  }

  /**
   * Check if the request contains file uploads.
   *
   * @returns true if request is multipart with FormData
   */
  public hasFiles(): boolean {
    return this.isMultipart() && this.config.data instanceof FormData;
  }

  /**
   * Get the timeout value in milliseconds.
   *
   * @returns Timeout in milliseconds
   */
  public timeout(): number | undefined {
    return this.config.timeout;
  }

  /**
   * Get the base URL.
   *
   * @returns Base URL
   */
  public baseURL(): string | undefined {
    return this.config.baseURL;
  }

  /**
   * Get the full URL including base URL.
   *
   * @returns Full URL
   */
  public fullUrl(): string {
    if (this.config.baseURL) {
      return `${this.config.baseURL}${this.config.url || ''}`;
    }
    return this.config.url || '';
  }

  /**
   * Get the underlying Axios configuration.
   *
   * @returns Axios request configuration
   */
  public getConfig(): AxiosRequestConfig {
    return this.config;
  }

  /**
   * Convert request to plain object for logging/debugging.
   *
   * @returns Plain object representation
   */
  public toObject(): Record<string, any> {
    return {
      method: this.method(),
      url: this.fullUrl(),
      headers: this.headers(),
      params: this.params(),
      body: this.body(),
      timeout: this.timeout(),
    };
  }

  /**
   * Convert request to JSON string.
   *
   * @returns JSON string representation
   */
  public toJSON(): string {
    return JSON.stringify(this.toObject(), null, 2);
  }
}
