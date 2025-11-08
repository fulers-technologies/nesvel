import { stringify } from 'qs';
import FormData from 'form-data';
import axios, { AxiosInstance, AxiosRequestConfig, AxiosResponse, Method } from 'axios';

import { ClientResponse } from './client-response';
import { RequestException } from './exceptions/request-exception';
import { ConnectionException } from './exceptions/connection-exception';
import { TimeoutException } from './exceptions/timeout-exception';
import type { FileAttachment, HttpRequestConfig, RetryOptions } from '../types/client.types';

/**
 * Pending HTTP Request Builder
 *
 * Provides a fluent interface for building and executing HTTP requests.
 * Inspired by Laravel's HTTP client with full TypeScript support.
 *
 * @example
 * ```typescript
 * const response = await new PendingRequest()
 *   .withHeaders({ 'X-Custom': 'value' })
 *   .withToken('token')
 *   .timeout(30)
 *   .retry(3, 100)
 *   .post('https://api.example.com/users', { name: 'John' });
 * ```
 */
export class PendingRequest {
  /**
   * The Axios instance for making requests.
   */
  protected client: AxiosInstance;

  /**
   * The request configuration.
   */
  protected config: HttpRequestConfig = {};

  /**
   * Base URL for all requests.
   */
  protected baseURL?: string;

  /**
   * Request headers.
   */
  protected headers: Record<string, string> = {};

  /**
   * Request timeout in milliseconds.
   */
  protected timeoutMs?: number;

  /**
   * Number of retry attempts.
   */
  protected retryAttempts = 0;

  /**
   * Delay between retries in milliseconds.
   */
  protected retryDelayMs = 100;

  /**
   * Callback to determine if request should be retried.
   */
  protected retryCallback?: (error: any, attempt: number) => boolean;

  /**
   * Files to attach for multipart requests.
   */
  protected files: FileAttachment[] = [];

  /**
   * Body format (json, form, multipart).
   */
  protected bodyFormatType?: 'json' | 'form' | 'multipart';

  /**
   * Create a new PendingRequest instance.
   *
   * @param config - Optional initial configuration
   */
  constructor(config: HttpRequestConfig = {}) {
    this.config = config;
    this.client = axios.create();
  }

  /**
   * Set the base URL for requests.
   *
   * @param url - The base URL
   * @returns This request for chaining
   *
   * @example
   * ```typescript
   * request.baseUrl('https://api.example.com');
   * ```
   */
  public baseUrl(url: string): this {
    this.baseURL = url;
    return this;
  }

  /**
   * Set request headers.
   *
   * @param headers - Headers to set
   * @returns This request for chaining
   *
   * @example
   * ```typescript
   * request.withHeaders({
   *   'Content-Type': 'application/json',
   *   'X-Api-Key': 'key',
   * });
   * ```
   */
  public withHeaders(headers: Record<string, string>): this {
    this.headers = { ...this.headers, ...headers };
    return this;
  }

  /**
   * Set a single header.
   *
   * @param name - Header name
   * @param value - Header value
   * @returns This request for chaining
   *
   * @example
   * ```typescript
   * request.withHeader('Authorization', 'Bearer token');
   * ```
   */
  public withHeader(name: string, value: string): this {
    this.headers[name] = value;
    return this;
  }

  /**
   * Set bearer token authorization.
   *
   * @param token - The bearer token
   * @param type - Token type (default: 'Bearer')
   * @returns This request for chaining
   *
   * @example
   * ```typescript
   * request.withToken('my-api-token');
   * ```
   */
  public withToken(token: string, type = 'Bearer'): this {
    this.headers['Authorization'] = `${type} ${token}`;
    return this;
  }

  /**
   * Set basic authentication.
   *
   * @param username - Username
   * @param password - Password
   * @returns This request for chaining
   *
   * @example
   * ```typescript
   * request.withBasicAuth('user', 'pass');
   * ```
   */
  public withBasicAuth(username: string, password: string): this {
    const credentials = Buffer.from(`${username}:${password}`).toString('base64');
    this.headers['Authorization'] = `Basic ${credentials}`;
    return this;
  }

  /**
   * Set Accept header.
   *
   * @param contentType - Content type to accept
   * @returns This request for chaining
   *
   * @example
   * ```typescript
   * request.accept('application/json');
   * ```
   */
  public accept(contentType: string): this {
    this.headers['Accept'] = contentType;
    return this;
  }

  /**
   * Set Content-Type header.
   *
   * @param contentType - Content type
   * @returns This request for chaining
   *
   * @example
   * ```typescript
   * request.contentType('application/json');
   * ```
   */
  public contentType(contentType: string): this {
    this.headers['Content-Type'] = contentType;
    return this;
  }

  /**
   * Set request body format to JSON.
   *
   * @returns This request for chaining
   *
   * @example
   * ```typescript
   * request.asJson().post('/api', { data });
   * ```
   */
  public asJson(): this {
    this.bodyFormatType = 'json';
    this.headers['Content-Type'] = 'application/json';
    return this;
  }

  /**
   * Alias for asJson() - set Accept header to JSON.
   *
   * @returns This request for chaining
   *
   * @example
   * ```typescript
   * request.acceptJson().post('/api', { data });
   * ```
   */
  public acceptJson(): this {
    return this.accept('application/json').asJson();
  }

  /**
   * Set request body format to form-urlencoded.
   *
   * @returns This request for chaining
   *
   * @example
   * ```typescript
   * request.asForm().post('/api', { data });
   * ```
   */
  public asForm(): this {
    this.bodyFormatType = 'form';
    this.headers['Content-Type'] = 'application/x-www-form-urlencoded';
    return this;
  }

  /**
   * Set request body format to multipart/form-data.
   *
   * @returns This request for chaining
   *
   * @example
   * ```typescript
   * request.asMultipart().post('/api', { data });
   * ```
   */
  public asMultipart(): this {
    this.bodyFormatType = 'multipart';
    return this;
  }

  /**
   * Alias for withQuery() - set query parameters.
   *
   * @param params - Query parameters
   * @returns This request for chaining
   *
   * @example
   * ```typescript
   * request.withQueryParameters({ page: 1, limit: 10 });
   * ```
   */
  public withQueryParameters(params: Record<string, any>): this {
    return this.withQuery(params);
  }

  /**
   * Alias for post/put/patch data - set request body.
   *
   * @param data - Request body data
   * @returns This request for chaining
   *
   * @example
   * ```typescript
   * request.withBody({ name: 'John' }).post('/api/users');
   * ```
   */
  public withBody(data: any): this {
    this.config.data = data;
    return this;
  }

  /**
   * Set request timeout.
   *
   * @param seconds - Timeout in seconds
   * @returns This request for chaining
   *
   * @example
   * ```typescript
   * request.timeout(30); // 30 seconds
   * ```
   */
  public timeout(seconds: number): this {
    this.timeoutMs = seconds * 1000;
    return this;
  }

  /**
   * Set connection timeout.
   *
   * @param seconds - Connection timeout in seconds
   * @returns This request for chaining
   *
   * @example
   * ```typescript
   * request.connectTimeout(10);
   * ```
   */
  public connectTimeout(seconds: number): this {
    // Axios doesn't have separate connection timeout
    // Use regular timeout
    this.timeoutMs = seconds * 1000;
    return this;
  }

  /**
   * Configure retry behavior.
   *
   * @param times - Number of retry attempts
   * @param delay - Delay between retries in milliseconds or callback
   * @param when - Callback to determine if request should be retried
   * @returns This request for chaining
   *
   * @example
   * ```typescript
   * request.retry(3, 100);
   * request.retry(3, (attempt) => Math.pow(2, attempt) * 1000);
   * request.retry(3, 100, (error, attempt) => error.isNetworkError());
   * ```
   */
  public retry(
    times: number,
    delay: number | ((attempt: number) => number) = 100,
    when?: (error: any, attempt: number) => boolean
  ): this {
    this.retryAttempts = times;

    if (typeof delay === 'number') {
      this.retryDelayMs = delay;
    }

    if (when) {
      this.retryCallback = when;
    }

    return this;
  }

  /**
   * Set callback to determine if request should be retried.
   *
   * @param callback - Callback function receiving attempt number and exception
   * @returns This request for chaining
   *
   * @example
   * ```typescript
   * request.retryWhen((attempt, exception) => {
   *   return exception.isServerError() && attempt < 3;
   * });
   * ```
   */
  public retryWhen(callback: (attempt: number, exception: RequestException) => boolean): this {
    this.retryCallback = (error, attempt) => callback(attempt, error);
    return this;
  }

  /**
   * Attach a file for multipart upload.
   *
   * @param name - Field name
   * @param contents - File contents
   * @param filename - Optional filename
   * @param options - Optional options (contentType/mimeType)
   * @returns This request for chaining
   *
   * @example
   * ```typescript
   * request.attach('avatar', fileBuffer, 'profile.jpg');
   * request.attach('image', buffer, 'photo.png', 'image/png');
   * request.attach('doc', buffer, 'file.pdf', { contentType: 'application/pdf' });
   * ```
   */
  public attach(
    name: string,
    contents: Buffer | NodeJS.ReadableStream | string,
    filename?: string,
    options?: string | { contentType?: string }
  ): this {
    const fileAttachment: FileAttachment = { name, contents, filename };

    // Handle options - can be a string (contentType) or object
    if (typeof options === 'string') {
      fileAttachment.contentType = options;
    } else if (options?.contentType) {
      fileAttachment.contentType = options.contentType;
    }

    this.files.push(fileAttachment);
    this.asMultipart();
    return this;
  }

  /**
   * Set query parameters.
   *
   * @param params - Query parameters
   * @returns This request for chaining
   *
   * @example
   * ```typescript
   * request.withQuery({ page: 1, limit: 10 });
   * ```
   */
  public withQuery(params: Record<string, any>): this {
    this.config.params = { ...this.config.params, ...params };
    return this;
  }

  /**
   * Set Axios options.
   *
   * @param options - Axios options
   * @returns This request for chaining
   *
   * @example
   * ```typescript
   * request.withOptions({ maxRedirects: 5 });
   * ```
   */
  public withOptions(options: AxiosRequestConfig): this {
    this.config = { ...this.config, ...options };
    return this;
  }

  /**
   * Make a GET request.
   *
   * @param url - Request URL
   * @param query - Optional query parameters
   * @returns Promise resolving to ClientResponse
   *
   * @example
   * ```typescript
   * const response = await request.get('/users');
   * const response = await request.get('/users', { page: 1 });
   * ```
   */
  public async get(url: string, query?: Record<string, any>): Promise<ClientResponse> {
    if (query) {
      this.withQuery(query);
    }
    return this.send('GET', url);
  }

  /**
   * Make a POST request.
   *
   * @param url - Request URL
   * @param data - Request body data
   * @returns Promise resolving to ClientResponse
   *
   * @example
   * ```typescript
   * const response = await request.post('/users', { name: 'John' });
   * ```
   */
  public async post(url: string, data?: any): Promise<ClientResponse> {
    return this.send('POST', url, data);
  }

  /**
   * Make a PUT request.
   *
   * @param url - Request URL
   * @param data - Request body data
   * @returns Promise resolving to ClientResponse
   *
   * @example
   * ```typescript
   * const response = await request.put('/users/1', { name: 'Jane' });
   * ```
   */
  public async put(url: string, data?: any): Promise<ClientResponse> {
    return this.send('PUT', url, data);
  }

  /**
   * Make a PATCH request.
   *
   * @param url - Request URL
   * @param data - Request body data
   * @returns Promise resolving to ClientResponse
   *
   * @example
   * ```typescript
   * const response = await request.patch('/users/1', { email: 'new@example.com' });
   * ```
   */
  public async patch(url: string, data?: any): Promise<ClientResponse> {
    return this.send('PATCH', url, data);
  }

  /**
   * Make a DELETE request.
   *
   * @param url - Request URL
   * @param data - Optional request body data
   * @returns Promise resolving to ClientResponse
   *
   * @example
   * ```typescript
   * const response = await request.delete('/users/1');
   * ```
   */
  public async delete(url: string, data?: any): Promise<ClientResponse> {
    return this.send('DELETE', url, data);
  }

  /**
   * Make a HEAD request.
   *
   * @param url - Request URL
   * @returns Promise resolving to ClientResponse
   *
   * @example
   * ```typescript
   * const response = await request.head('/users');
   * ```
   */
  public async head(url: string): Promise<ClientResponse> {
    return this.send('HEAD', url);
  }

  /**
   * Make an OPTIONS request.
   *
   * @param url - Request URL
   * @returns Promise resolving to ClientResponse
   *
   * @example
   * ```typescript
   * const response = await request.options('/users');
   * ```
   */
  public async options(url: string): Promise<ClientResponse> {
    return this.send('OPTIONS', url);
  }

  /**
   * Send the HTTP request.
   *
   * @param method - HTTP method
   * @param url - Request URL
   * @param data - Optional request body
   * @returns Promise resolving to ClientResponse
   */
  protected async send(method: Method, url: string, data?: any): Promise<ClientResponse> {
    const config = this.buildConfig(method, url, data);

    try {
      const response = await this.executeWithRetry(config);
      return new ClientResponse(response);
    } catch (error: any) {
      this.handleError(error);
      throw error;
    }
  }

  /**
   * Execute request with retry logic.
   *
   * @param config - Request configuration
   * @returns Promise resolving to Axios response
   */
  protected async executeWithRetry(config: AxiosRequestConfig): Promise<AxiosResponse> {
    let lastError: any;
    let attempt = 0;

    while (attempt <= this.retryAttempts) {
      try {
        return await this.client.request(config);
      } catch (error: any) {
        lastError = error;
        attempt++;

        // Don't retry if we've exhausted attempts
        if (attempt > this.retryAttempts) {
          break;
        }

        // Check if we should retry this error
        if (this.retryCallback && !this.retryCallback(error, attempt)) {
          break;
        }

        // Wait before retrying
        await this.delay(this.retryDelayMs);
      }
    }

    throw lastError;
  }

  /**
   * Build request configuration.
   *
   * @param method - HTTP method
   * @param url - Request URL
   * @param data - Optional request body
   * @returns Axios request configuration
   */
  protected buildConfig(method: Method, url: string, data?: any): AxiosRequestConfig {
    const fullUrl = this.baseURL ? `${this.baseURL}${url}` : url;

    const config: AxiosRequestConfig = {
      method,
      url: fullUrl,
      headers: this.headers,
      timeout: this.timeoutMs,
      ...this.config,
    };

    // Handle request body
    if (data) {
      if (this.bodyFormatType === 'multipart' || this.files.length > 0) {
        config.data = this.buildMultipartData(data);
      } else if (this.bodyFormatType === 'form') {
        config.data = stringify(data);
      } else {
        config.data = data;
      }
    }

    return config;
  }

  /**
   * Build multipart form data.
   *
   * @param data - Form data
   * @returns FormData instance
   */
  protected buildMultipartData(data: any): FormData {
    const form = new FormData();

    // Add regular fields
    for (const [key, value] of Object.entries(data)) {
      form.append(key, value as any);
    }

    // Add files
    for (const file of this.files) {
      form.append(file.name, file.contents, file.filename);
    }

    return form;
  }

  /**
   * Handle request errors.
   *
   * @param error - The error to handle
   * @throws Appropriate exception type
   */
  protected handleError(error: any): never {
    if (error.code === 'ECONNABORTED' || error.code === 'ETIMEDOUT') {
      throw TimeoutException.make(error, this.timeoutMs);
    }

    if (!error.response) {
      throw ConnectionException.make(error);
    }

    throw RequestException.make(error);
  }

  /**
   * Delay execution.
   *
   * @param ms - Milliseconds to delay
   * @returns Promise that resolves after delay
   */
  protected delay(ms: number): Promise<void> {
    return new Promise((resolve) => setTimeout(resolve, ms));
  }
}
