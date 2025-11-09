import type { PendingRequest } from '../pending-request';

/**
 * Mixin that provides fluent builder methods for HTTP requests.
 *
 * Implements Laravel's BuildsHttpRequests trait functionality
 * for configuring HTTP requests with a fluent interface.
 *
 * This mixin provides all the configuration methods needed to build
 * HTTP requests including headers, authentication, timeouts, retries,
 * file attachments, and more.
 *
 * Note: This class provides static methods that will be mixed into
 * the HttpClient class using ts-mixer.
 *
 * @example
 * ```typescript
 * import { Mixin } from 'ts-mixer';
 * import { BuildsHttpRequests } from './concerns/builds-http-requests';
 *
 * @Mixin(BuildsHttpRequests)
 * class MyHttpClient {
 *   // ... implementation
 * }
 *
 * const response = await MyHttpClient
 *   .withToken('token')
 *   .timeout(30)
 *   .get('/users');
 * ```
 */
export class BuildsHttpRequests {
  /**
   * Create a new pending request instance.
   *
   * This method must be implemented by the base class.
   * It's defined here to satisfy TypeScript's type checking.
   *
   * @returns A new PendingRequest instance
   */
  protected static create(...args: any[]): PendingRequest {
    return (this as any).create(...args);
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
}
