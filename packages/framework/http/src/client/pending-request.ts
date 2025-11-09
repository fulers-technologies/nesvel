import { stringify } from 'qs';
import FormData from 'form-data';
import type { RetryStrategy } from '@/interfaces';
import { EventEmitter2 } from '@nestjs/event-emitter';
import axios, { AxiosInstance, AxiosRequestConfig, AxiosResponse, Method } from 'axios';

import { Batch } from './batch';
import { ClientRequest } from './request';
import { ClientResponse } from './response';
import { CircuitBreaker } from './circuit-breaker';
import { ExponentialBackoffStrategy } from './retry';
import { RequestException } from './exceptions/request-exception';
import { TimeoutException } from './exceptions/timeout-exception';
import type { FileAttachment, HttpRequestConfig } from '../interfaces';
import { ConnectionException } from './exceptions/connection-exception';
import { RequestSendingEvent, ResponseReceivedEvent, ConnectionFailedEvent } from './events';

/**
 * Pending HTTP Request Builder
 *
 * Provides a fluent interface for building and executing HTTP requests.
 * Inspired by Laravel's HTTP client with full TypeScript support.
 *
 * @example
 * ```typescript
 * const response = await PendingRequest.make()
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
   * Retry strategy for advanced retry logic with exponential backoff.
   * Defaults to ExponentialBackoffStrategy with sensible defaults.
   */
  protected retryStrategy: RetryStrategy = ExponentialBackoffStrategy.make({
    maxAttempts: 0, // No retries by default
    baseDelayMs: 100,
    maxDelayMs: 5000,
    jitter: 'full',
  });

  /**
   * Circuit breaker for preventing cascading failures.
   */
  protected circuitBreaker?: CircuitBreaker;

  /**
   * Circuit breaker manager for per-host breakers.
   */
  protected circuitBreakerManager?: import('./circuit-breaker').CircuitBreakerManager;

  /**
   * Event emitter for HTTP events.
   */
  protected eventEmitter?: EventEmitter2;

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
   * Create a new PendingRequest instance (Laravel-style factory method).
   *
   * @param config - Optional initial configuration
   * @returns A new PendingRequest instance
   *
   * @example
   * ```typescript
   * const request = PendingRequest.make({ timeout: 5000 });
   * ```
   */
  public static make(config: HttpRequestConfig = {}): PendingRequest {
    return new PendingRequest(config);
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
   * Configure retry behavior using ExponentialBackoffStrategy.
   *
   * @param times - Number of retry attempts (0 = no retries)
   * @param delayMs - Base delay in milliseconds (default: 100)
   * @param when - Optional callback to determine if request should be retried
   * @returns This request for chaining
   *
   * @example
   * ```typescript
   * // Simple retry with exponential backoff
   * request.retry(3);
   *
   * // Custom base delay
   * request.retry(3, 1000);
   *
   * // Conditional retry
   * request.retry(3, 100, (error, attempt) => {
   *   return error.response?.status >= 500;
   * });
   * ```
   */
  public retry(
    times: number,
    delayMs: number = 100,
    when?: (error: any, attempt: number) => boolean
  ): this {
    // Create ExponentialBackoffStrategy with provided parameters
    this.retryStrategy = ExponentialBackoffStrategy.make({
      maxAttempts: times,
      baseDelayMs: delayMs,
      maxDelayMs: 30000, // 30 seconds max
      jitter: 'full',
      retryableStatusCodes: [408, 429, 500, 502, 503, 504],
      shouldRetryPredicate: when ? (context) => when(context.error, context.attempt) : undefined,
    });

    return this;
  }

  /**
   * Set retry strategy for advanced retry logic with exponential backoff.
   *
   * @param strategy - Retry strategy instance
   * @returns This request for chaining
   *
   * @example
   * ```typescript
   * import { ExponentialBackoffStrategy } from '@nesvel/nestjs-http';
   *
   * request.withRetryStrategy(
   *   ExponentialBackoffStrategy.make({
   *     maxAttempts: 5,
   *     baseDelayMs: 1000,
   *     jitter: 'full'
   *   })
   * );
   * ```
   */
  public withRetryStrategy(strategy: RetryStrategy): this {
    this.retryStrategy = strategy;
    return this;
  }

  /**
   * Set circuit breaker for preventing cascading failures.
   *
   * @param breaker - Circuit breaker instance
   * @returns This request for chaining
   *
   * @example
   * ```typescript
   * import { CircuitBreaker } from '@nesvel/nestjs-http';
   *
   * request.withCircuitBreaker(
   *   CircuitBreaker.make({
   *     failureThreshold: 5,
   *     openTimeoutMs: 30000
   *   })
   * );
   * ```
   */
  public withCircuitBreaker(breaker: CircuitBreaker): this {
    this.circuitBreaker = breaker;
    return this;
  }

  /**
   * Set event emitter for HTTP events.
   *
   * @param emitter - EventEmitter2 instance
   * @returns This request for chaining
   * @internal
   */
  public withEventEmitter(emitter: EventEmitter2): this {
    this.eventEmitter = emitter;
    return this;
  }

  /**
   * Set callback to determine if request should be retried.
   * Updates the current retry strategy with custom shouldRetry logic.
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
    // Get current strategy config
    const currentStrategy = this.retryStrategy as ExponentialBackoffStrategy;
    const maxAttempts = currentStrategy.getMaxAttempts();

    // Create new strategy with custom shouldRetry
    this.retryStrategy = ExponentialBackoffStrategy.make({
      maxAttempts,
      baseDelayMs: 100,
      maxDelayMs: 30000,
      jitter: 'full',
      shouldRetryPredicate: (context) => callback(context.attempt, context.error),
    });

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
   * @template T - The expected response data type
   * @template D - The request data type
   * @param url - Request URL
   * @param query - Optional query parameters
   * @returns Promise resolving to ClientResponse
   *
   * @example
   * ```typescript
   * interface User { id: number; name: string; }
   * const response = await request.get<User[]>('/users');
   * const users = response.data; // Type: User[]
   * const response = await request.get('/users', { page: 1 });
   * ```
   */
  public async get<T = any, D = any>(
    url: string,
    query?: Record<string, any>
  ): Promise<ClientResponse> {
    if (query) {
      this.withQuery(query);
    }
    return this.send<T, D>('GET', url);
  }

  /**
   * Make a POST request.
   *
   * @template T - The expected response data type
   * @template D - The request data type
   * @param url - Request URL
   * @param data - Request body data
   * @returns Promise resolving to ClientResponse
   *
   * @example
   * ```typescript
   * interface User { id: number; name: string; }
   * interface CreateUserDto { name: string; email: string; }
   * const response = await request.post<User, CreateUserDto>('/users', { name: 'John', email: 'john@example.com' });
   * const user = response.data; // Type: User
   * ```
   */
  public async post<T = any, D = any>(url: string, data?: D): Promise<ClientResponse> {
    return this.send<T, D>('POST', url, data);
  }

  /**
   * Make a PUT request.
   *
   * @template T - The expected response data type
   * @template D - The request data type
   * @param url - Request URL
   * @param data - Request body data
   * @returns Promise resolving to ClientResponse
   *
   * @example
   * ```typescript
   * interface User { id: number; name: string; }
   * interface UpdateUserDto { name: string; }
   * const response = await request.put<User, UpdateUserDto>('/users/1', { name: 'Jane' });
   * const user = response.data; // Type: User
   * ```
   */
  public async put<T = any, D = any>(url: string, data?: D): Promise<ClientResponse> {
    return this.send<T, D>('PUT', url, data);
  }

  /**
   * Make a PATCH request.
   *
   * @template T - The expected response data type
   * @template D - The request data type
   * @param url - Request URL
   * @param data - Request body data
   * @returns Promise resolving to ClientResponse
   *
   * @example
   * ```typescript
   * interface User { id: number; name: string; email: string; }
   * interface PatchUserDto { email?: string; }
   * const response = await request.patch<User, PatchUserDto>('/users/1', { email: 'new@example.com' });
   * const user = response.data; // Type: User
   * ```
   */
  public async patch<T = any, D = any>(url: string, data?: D): Promise<ClientResponse> {
    return this.send<T, D>('PATCH', url, data);
  }

  /**
   * Make a DELETE request.
   *
   * @template T - The expected response data type
   * @template D - The request data type
   * @param url - Request URL
   * @param data - Optional request body data
   * @returns Promise resolving to ClientResponse
   *
   * @example
   * ```typescript
   * interface DeleteResponse { success: boolean; }
   * const response = await request.delete<DeleteResponse>('/users/1');
   * const result = response.data; // Type: DeleteResponse
   * ```
   */
  public async delete<T = any, D = any>(url: string, data?: D): Promise<ClientResponse> {
    return this.send<T, D>('DELETE', url, data);
  }

  /**
   * Make a HEAD request.
   *
   * @template T - The expected response data type
   * @template D - The request data type
   * @param url - Request URL
   * @returns Promise resolving to ClientResponse
   *
   * @example
   * ```typescript
   * const response = await request.head('/users');
   * console.log(response.headers);
   * ```
   */
  public async head<T = any, D = any>(url: string): Promise<ClientResponse> {
    return this.send<T, D>('HEAD', url);
  }

  /**
   * Make an OPTIONS request.
   *
   * @template T - The expected response data type
   * @template D - The request data type
   * @param url - Request URL
   * @returns Promise resolving to ClientResponse
   *
   * @example
   * ```typescript
   * const response = await request.options('/users');
   * console.log(response.headers['allow']);
   * ```
   */
  public async options<T = any, D = any>(url: string): Promise<ClientResponse> {
    return this.send<T, D>('OPTIONS', url);
  }

  /**
   * Execute multiple requests concurrently with lifecycle callbacks (Laravel-style).
   *
   * Creates a new Batch instance and passes it to the callback function,
   * allowing you to define multiple named requests with progress tracking.
   *
   * @param callback - Function that receives the batch and adds requests to it
   * @returns Promise resolving to record of responses by key
   *
   * @example
   * ```typescript
   * const responses = await request.batch((batch) => {
   *   batch.as('users').get('https://api.example.com/users');
   *   batch.as('posts').get('https://api.example.com/posts');
   *   batch.as('comments').get('https://api.example.com/comments');
   * });
   *
   * console.log(responses.users.json());
   * console.log(responses.posts.json());
   * ```
   *
   * @example
   * ```typescript
   * // With lifecycle hooks
   * const responses = await request.batch((batch) => {
   *   batch
   *     .as('users').get('https://api.example.com/users')
   *     .as('posts').get('https://api.example.com/posts')
   *     .before((b) => console.log('Starting batch...'))
   *     .progress((b, key, response) => {
   *       console.log(`${key}: ${response.status()}`);
   *     })
   *     .catch((b, key, error) => {
   *       console.error(`${key} failed:`, error.message);
   *     })
   *     .then((b, responses) => {
   *       console.log('All requests succeeded!');
   *     });
   * });
   * ```
   */
  public async batch(
    callback: (batch: Batch) => void | Promise<void>
  ): Promise<Record<string, ClientResponse>> {
    // Create batch with factory that clones this request's configuration
    const batch = Batch.make(() => {
      const request = PendingRequest.make();

      // Clone configuration from this request
      if (this.baseURL) request.baseUrl(this.baseURL);
      if (Object.keys(this.headers).length > 0) request.withHeaders(this.headers);
      if (this.timeoutMs) request.timeout(this.timeoutMs / 1000);
      if (this.retryStrategy) request.withRetryStrategy(this.retryStrategy);
      if (this.circuitBreaker) request.withCircuitBreaker(this.circuitBreaker);
      if (this.circuitBreakerManager)
        (request as any).circuitBreakerManager = this.circuitBreakerManager;
      if (this.eventEmitter) request.withEventEmitter(this.eventEmitter);
      if (this.bodyFormatType === 'json') request.asJson();
      if (this.bodyFormatType === 'form') request.asForm();
      if (this.bodyFormatType === 'multipart') request.asMultipart();

      return request;
    });

    await callback(batch);
    return batch.dispatch();
  }

  /**
   * Send the HTTP request.
   *
   * @template T - The expected response data type
   * @template D - The request data type
   * @param method - HTTP method
   * @param url - Request URL
   * @param data - Optional request body
   * @returns Promise resolving to ClientResponse
   */
  protected async send<T = any, D = any>(
    method: Method,
    url: string,
    data?: D
  ): Promise<ClientResponse> {
    const config = this.buildConfig(method, url, data);
    const requestStartTime = Date.now();

    // Create ClientRequest for event emission
    const clientRequest = ClientRequest.make(config);

    // Emit request sending event
    if (this.eventEmitter) {
      await this.eventEmitter.emit(
        RequestSendingEvent.EVENT_NAME,
        RequestSendingEvent.make(clientRequest)
      );
    }

    // Wrap in circuit breaker if provided
    const executeRequest = async () => {
      try {
        const response = await this.executeWithRetry(config);
        const clientResponse = ClientResponse.make(response);
        const duration = Date.now() - requestStartTime;

        // Emit response received event
        if (this.eventEmitter) {
          await this.eventEmitter.emit(
            ResponseReceivedEvent.EVENT_NAME,
            ResponseReceivedEvent.make(clientRequest, clientResponse, duration)
          );
        }

        return clientResponse;
      } catch (error: any) {
        // Emit connection failed event
        if (this.eventEmitter && this.isConnectionError(error)) {
          await this.eventEmitter.emit(
            ConnectionFailedEvent.EVENT_NAME,
            ConnectionFailedEvent.make(clientRequest, error)
          );
        }

        this.handleError(error);
        throw error;
      }
    };

    // Execute with circuit breaker if provided
    if (this.circuitBreaker) {
      const host = this.extractHost(config.url || '');
      return this.circuitBreaker.execute(executeRequest, host);
    }

    // Execute with circuit breaker manager if provided
    if (this.circuitBreakerManager) {
      const host = this.extractHost(config.url || '');
      return this.circuitBreakerManager.execute(host, executeRequest);
    }

    return executeRequest();
  }

  /**
   * Execute request with retry logic using ExponentialBackoffStrategy.
   * Always uses the retry strategy (which may have 0 retries).
   *
   * @param config - Request configuration
   * @returns Promise resolving to Axios response
   */
  protected async executeWithRetry(config: AxiosRequestConfig): Promise<AxiosResponse> {
    // Always use retry strategy (ExponentialBackoffStrategy)
    return this.executeWithRetryStrategy(config);
  }

  /**
   * Execute request with ExponentialBackoffStrategy.
   * Handles retry logic with exponential backoff, jitter, and Retry-After headers.
   *
   * @param config - Request configuration
   * @returns Promise resolving to Axios response
   * @private
   */
  private async executeWithRetryStrategy(config: AxiosRequestConfig): Promise<AxiosResponse> {
    const startTime = Date.now();
    let attempt = 0;
    let lastError: any;
    const maxAttempts = this.retryStrategy.getMaxAttempts();

    // If no retries configured, just execute once
    if (maxAttempts === 0) {
      return await this.client.request(config);
    }

    // Execute with retries
    while (attempt <= maxAttempts) {
      try {
        return await this.client.request(config);
      } catch (error: any) {
        lastError = error;
        const elapsedMs = Date.now() - startTime;

        // Build retry context
        const context = {
          attempt,
          error,
          statusCode: error.response?.status,
          headers: error.response?.headers,
          elapsedMs,
          url: config.url || '',
          method: (config.method || 'GET').toUpperCase(),
        };

        // Check if we should retry
        if (!this.retryStrategy.shouldRetry(context)) {
          break;
        }

        // Get delay (handles exponential backoff, jitter, Retry-After)
        const delay = this.retryStrategy.getDelay(context);
        await this.delay(delay);

        attempt++;
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
    const form = FormData.make();

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

  /**
   * Check if error is a connection error.
   *
   * @param error - Error object
   * @returns true if connection error
   * @private
   */
  private isConnectionError(error: any): boolean {
    return (
      !error.response ||
      error.code === 'ECONNREFUSED' ||
      error.code === 'ECONNRESET' ||
      error.code === 'ETIMEDOUT' ||
      error.code === 'ENOTFOUND' ||
      error.code === 'ENETUNREACH'
    );
  }

  /**
   * Extract host from URL.
   *
   * @param url - Full URL or path
   * @returns Host name
   * @private
   */
  private extractHost(url: string): string {
    try {
      const parsed = URL.make(url);
      return parsed.hostname;
    } catch {
      return this.baseURL || 'unknown';
    }
  }
}
