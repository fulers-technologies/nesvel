import { PendingRequest } from './pending-request';
import type { HttpRequestConfig } from '../types/client.types';

/**
 * HTTP Client Factory
 *
 * Main factory class for creating HTTP requests with a fluent interface.
 * Provides static methods that create and return PendingRequest instances.
 *
 * This is the primary entry point for making HTTP requests in your application.
 * Similar to Laravel's Http facade.
 *
 * @example
 * ```typescript
 * import { HttpClient } from '@nesvel/nestjs-http';
 *
 * // Simple GET request
 * const response = await HttpClient.get('https://api.example.com/users');
 *
 * // POST with data
 * const user = await HttpClient.post('https://api.example.com/users', {
 *   name: 'John Doe',
 *   email: 'john@example.com'
 * });
 *
 * // Fluent API
 * const response = await HttpClient
 *   .withToken('api-token')
 *   .timeout(30)
 *   .retry(3, 100)
 *   .post('https://api.example.com/users', userData);
 * ```
 */
export class HttpClient {
  /**
   * Create a new pending request instance.
   *
   * @param config - Optional initial configuration
   * @returns A new PendingRequest instance
   *
   * @example
   * ```typescript
   * const request = HttpClient.create();
   * const response = await request.get('/users');
   * ```
   */
  public static create(config?: HttpRequestConfig): PendingRequest {
    return new PendingRequest(config);
  }

  /**
   * Set base URL for requests.
   *
   * @param url - The base URL
   * @returns A new PendingRequest instance
   *
   * @example
   * ```typescript
   * const response = await HttpClient
   *   .baseUrl('https://api.example.com')
   *   .get('/users');
   * ```
   */
  public static baseUrl(url: string): PendingRequest {
    return this.create().baseUrl(url);
  }

  /**
   * Set request headers.
   *
   * @param headers - Headers to set
   * @returns A new PendingRequest instance
   *
   * @example
   * ```typescript
   * const response = await HttpClient
   *   .withHeaders({ 'X-Api-Key': 'key' })
   *   .get('/users');
   * ```
   */
  public static withHeaders(headers: Record<string, string>): PendingRequest {
    return this.create().withHeaders(headers);
  }

  /**
   * Set a single header.
   *
   * @param name - Header name
   * @param value - Header value
   * @returns A new PendingRequest instance
   *
   * @example
   * ```typescript
   * const response = await HttpClient
   *   .withHeader('Authorization', 'Bearer token')
   *   .get('/users');
   * ```
   */
  public static withHeader(name: string, value: string): PendingRequest {
    return this.create().withHeader(name, value);
  }

  /**
   * Set bearer token authorization.
   *
   * @param token - The bearer token
   * @param type - Token type (default: 'Bearer')
   * @returns A new PendingRequest instance
   *
   * @example
   * ```typescript
   * const response = await HttpClient
   *   .withToken('my-api-token')
   *   .get('/users');
   * ```
   */
  public static withToken(token: string, type = 'Bearer'): PendingRequest {
    return this.create().withToken(token, type);
  }

  /**
   * Set basic authentication.
   *
   * @param username - Username
   * @param password - Password
   * @returns A new PendingRequest instance
   *
   * @example
   * ```typescript
   * const response = await HttpClient
   *   .withBasicAuth('user', 'pass')
   *   .get('/users');
   * ```
   */
  public static withBasicAuth(username: string, password: string): PendingRequest {
    return this.create().withBasicAuth(username, password);
  }

  /**
   * Set Accept header.
   *
   * @param contentType - Content type to accept
   * @returns A new PendingRequest instance
   *
   * @example
   * ```typescript
   * const response = await HttpClient
   *   .accept('application/json')
   *   .get('/users');
   * ```
   */
  public static accept(contentType: string): PendingRequest {
    return this.create().accept(contentType);
  }

  /**
   * Set Content-Type header.
   *
   * @param contentType - Content type
   * @returns A new PendingRequest instance
   *
   * @example
   * ```typescript
   * const response = await HttpClient
   *   .contentType('application/json')
   *   .post('/users', data);
   * ```
   */
  public static contentType(contentType: string): PendingRequest {
    return this.create().contentType(contentType);
  }

  /**
   * Set request body format to JSON.
   *
   * @returns A new PendingRequest instance
   *
   * @example
   * ```typescript
   * const response = await HttpClient
   *   .asJson()
   *   .post('/users', data);
   * ```
   */
  public static asJson(): PendingRequest {
    return this.create().asJson();
  }

  /**
   * Set request body format to form-urlencoded.
   *
   * @returns A new PendingRequest instance
   *
   * @example
   * ```typescript
   * const response = await HttpClient
   *   .asForm()
   *   .post('/users', data);
   * ```
   */
  public static asForm(): PendingRequest {
    return this.create().asForm();
  }

  /**
   * Set request body format to multipart/form-data.
   *
   * @returns A new PendingRequest instance
   *
   * @example
   * ```typescript
   * const response = await HttpClient
   *   .asMultipart()
   *   .post('/users', data);
   * ```
   */
  public static asMultipart(): PendingRequest {
    return this.create().asMultipart();
  }

  /**
   * Set request timeout.
   *
   * @param seconds - Timeout in seconds
   * @returns A new PendingRequest instance
   *
   * @example
   * ```typescript
   * const response = await HttpClient
   *   .timeout(30)
   *   .get('/users');
   * ```
   */
  public static timeout(seconds: number): PendingRequest {
    return this.create().timeout(seconds);
  }

  /**
   * Set connection timeout.
   *
   * @param seconds - Connection timeout in seconds
   * @returns A new PendingRequest instance
   *
   * @example
   * ```typescript
   * const response = await HttpClient
   *   .connectTimeout(10)
   *   .get('/users');
   * ```
   */
  public static connectTimeout(seconds: number): PendingRequest {
    return this.create().connectTimeout(seconds);
  }

  /**
   * Configure retry behavior.
   *
   * @param times - Number of retry attempts
   * @param delay - Delay between retries in milliseconds or callback
   * @param when - Callback to determine if request should be retried
   * @returns A new PendingRequest instance
   *
   * @example
   * ```typescript
   * const response = await HttpClient
   *   .retry(3, 100)
   *   .get('/users');
   * ```
   */
  public static retry(
    times: number,
    delay?: number | ((attempt: number) => number),
    when?: (error: any, attempt: number) => boolean
  ): PendingRequest {
    return this.create().retry(times, delay, when);
  }

  /**
   * Attach a file for multipart upload.
   *
   * @param name - Field name
   * @param contents - File contents
   * @param filename - Optional filename
   * @param options - Optional options (contentType/mimeType)
   * @returns A new PendingRequest instance
   *
   * @example
   * ```typescript
   * const response = await HttpClient
   *   .attach('avatar', fileBuffer, 'profile.jpg')
   *   .post('/users', userData);
   * const response = await HttpClient
   *   .attach('image', buffer, 'photo.png', 'image/png')
   *   .post('/upload', {});
   * ```
   */
  public static attach(
    name: string,
    contents: Buffer | NodeJS.ReadableStream | string,
    filename?: string,
    options?: string | { contentType?: string }
  ): PendingRequest {
    return this.create().attach(name, contents, filename, options);
  }

  /**
   * Set query parameters.
   *
   * @param params - Query parameters
   * @returns A new PendingRequest instance
   *
   * @example
   * ```typescript
   * const response = await HttpClient
   *   .withQuery({ page: 1, limit: 10 })
   *   .get('/users');
   * ```
   */
  public static withQuery(params: Record<string, any>): PendingRequest {
    return this.create().withQuery(params);
  }

  /**
   * Set Axios options.
   *
   * @param options - Axios options
   * @returns A new PendingRequest instance
   *
   * @example
   * ```typescript
   * const response = await HttpClient
   *   .withOptions({ maxRedirects: 5 })
   *   .get('/users');
   * ```
   */
  public static withOptions(options: any): PendingRequest {
    return this.create().withOptions(options);
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
   * const response = await HttpClient.get('https://api.example.com/users');
   * const response = await HttpClient.get('/users', { page: 1 });
   * ```
   */
  public static async get(url: string, query?: Record<string, any>) {
    return this.create().get(url, query);
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
   * const response = await HttpClient.post('/users', { name: 'John' });
   * ```
   */
  public static async post(url: string, data?: any) {
    return this.create().post(url, data);
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
   * const response = await HttpClient.put('/users/1', { name: 'Jane' });
   * ```
   */
  public static async put(url: string, data?: any) {
    return this.create().put(url, data);
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
   * const response = await HttpClient.patch('/users/1', { email: 'new@example.com' });
   * ```
   */
  public static async patch(url: string, data?: any) {
    return this.create().patch(url, data);
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
   * const response = await HttpClient.delete('/users/1');
   * ```
   */
  public static async delete(url: string, data?: any) {
    return this.create().delete(url, data);
  }

  /**
   * Make a HEAD request.
   *
   * @param url - Request URL
   * @returns Promise resolving to ClientResponse
   *
   * @example
   * ```typescript
   * const response = await HttpClient.head('/users');
   * ```
   */
  public static async head(url: string) {
    return this.create().head(url);
  }

  /**
   * Make an OPTIONS request.
   *
   * @param url - Request URL
   * @returns Promise resolving to ClientResponse
   *
   * @example
   * ```typescript
   * const response = await HttpClient.options('/users');
   * ```
   */
  public static async options(url: string) {
    return this.create().options(url);
  }
}
