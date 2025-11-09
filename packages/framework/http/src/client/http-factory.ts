import { Injectable } from '@nestjs/common';
import { EventEmitter2 } from '@nestjs/event-emitter';

import { PendingRequest } from './pending-request';
import { Batch } from './batch';
import type { RetryStrategy } from '@/interfaces';
import { CircuitBreakerManager } from './circuit-breaker';
import type { ClientResponse } from './response';

/**
 * HTTP Factory Service (Laravel-inspired)
 *
 * Injectable NestJS service that provides a factory for creating HTTP requests.
 * This is the recommended way to use the HTTP client in NestJS applications
 * for better testability and dependency injection support.
 *
 * Similar to Laravel's Http facade, but as an injectable service.
 *
 * @example
 * ```typescript
 * import { Injectable } from '@nestjs/common';
 * import { HttpFactory } from '@nesvel/nestjs-http';
 *
 * @Injectable()
 * export class UserService {
 *   constructor(private readonly http: HttpFactory) {}
 *
 *   async getUsers() {
 *     return this.http.get('https://api.example.com/users');
 *   }
 *
 *   async createUser(data: CreateUserDto) {
 *     return this.http
 *       .withToken(this.apiToken)
 *       .retry(3)
 *       .post('https://api.example.com/users', data);
 *   }
 * }
 * ```
 */
@Injectable()
export class HttpFactory {
  /**
   * Global event emitter for HTTP events.
   */
  private eventEmitter?: EventEmitter2;

  /**
   * Global retry strategy.
   */
  private retryStrategy?: RetryStrategy;

  /**
   * Global circuit breaker manager.
   */
  private circuitBreakerManager?: CircuitBreakerManager;

  /**
   * Create a new HTTP factory instance.
   *
   * @param eventEmitter - Optional EventEmitter2 instance for HTTP events
   */
  constructor(eventEmitter?: EventEmitter2) {
    this.eventEmitter = eventEmitter;
  }

  /**
   * Set global event emitter for all HTTP requests created by this factory.
   *
   * @param emitter - EventEmitter2 instance
   * @returns This factory for chaining
   *
   * @example
   * ```typescript
   * httpFactory.setEventEmitter(eventEmitter);
   * ```
   */
  public setEventEmitter(emitter: EventEmitter2): this {
    this.eventEmitter = emitter;
    return this;
  }

  /**
   * Set global retry strategy for all HTTP requests created by this factory.
   *
   * @param strategy - Retry strategy instance
   * @returns This factory for chaining
   *
   * @example
   * ```typescript
   * import { ExponentialBackoffStrategy } from '@nesvel/nestjs-http';
   *
   * httpFactory.setRetryStrategy(
   *   ExponentialBackoffStrategy.make({
   *     maxAttempts: 5,
   *     baseDelayMs: 1000,
   *     jitter: 'full'
   *   })
   * );
   * ```
   */
  public setRetryStrategy(strategy: RetryStrategy): this {
    this.retryStrategy = strategy;
    return this;
  }

  /**
   * Set global circuit breaker manager for all HTTP requests created by this factory.
   *
   * @param manager - Circuit breaker manager instance
   * @returns This factory for chaining
   *
   * @example
   * ```typescript
   * import { CircuitBreakerManager } from '@nesvel/nestjs-http';
   *
   * httpFactory.setCircuitBreakerManager(
   *   CircuitBreakerManager.make({
   *     failureThreshold: 5,
   *     openTimeoutMs: 30000
   *   })
   * );
   * ```
   */
  public setCircuitBreakerManager(manager: CircuitBreakerManager): this {
    this.circuitBreakerManager = manager;
    return this;
  }

  /**
   * Create a new PendingRequest instance with factory configuration applied.
   *
   * This is the core factory method that creates configured request instances.
   *
   * @returns PendingRequest instance with factory config
   *
   * @example
   * ```typescript
   * const request = httpFactory.createPendingRequest();
   * const response = await request.get('https://api.example.com/users');
   * ```
   */
  public createPendingRequest(): PendingRequest {
    const request = PendingRequest.make();

    // Apply factory configuration
    if (this.eventEmitter) {
      request.withEventEmitter(this.eventEmitter);
    }

    if (this.retryStrategy) {
      request.withRetryStrategy(this.retryStrategy);
    }

    if (this.circuitBreakerManager) {
      (request as any).circuitBreakerManager = this.circuitBreakerManager;
    }

    return request;
  }

  /**
   * Set base URL for requests.
   *
   * @param url - The base URL
   * @returns A new PendingRequest instance
   *
   * @example
   * ```typescript
   * const response = await httpFactory
   *   .baseUrl('https://api.example.com')
   *   .get('/users');
   * ```
   */
  public baseUrl(url: string): PendingRequest {
    return this.createPendingRequest().baseUrl(url);
  }

  /**
   * Set request headers.
   *
   * @param headers - Headers to set
   * @returns A new PendingRequest instance
   *
   * @example
   * ```typescript
   * const response = await httpFactory
   *   .withHeaders({ 'X-Api-Key': 'key' })
   *   .get('/users');
   * ```
   */
  public withHeaders(headers: Record<string, string>): PendingRequest {
    return this.createPendingRequest().withHeaders(headers);
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
   * const response = await httpFactory
   *   .withHeader('Authorization', 'Bearer token')
   *   .get('/users');
   * ```
   */
  public withHeader(name: string, value: string): PendingRequest {
    return this.createPendingRequest().withHeader(name, value);
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
   * const response = await httpFactory
   *   .withToken('my-api-token')
   *   .get('/users');
   * ```
   */
  public withToken(token: string, type = 'Bearer'): PendingRequest {
    return this.createPendingRequest().withToken(token, type);
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
   * const response = await httpFactory
   *   .withBasicAuth('user', 'pass')
   *   .get('/users');
   * ```
   */
  public withBasicAuth(username: string, password: string): PendingRequest {
    return this.createPendingRequest().withBasicAuth(username, password);
  }

  /**
   * Set Accept header.
   *
   * @param contentType - Content type to accept
   * @returns A new PendingRequest instance
   *
   * @example
   * ```typescript
   * const response = await httpFactory
   *   .accept('application/json')
   *   .get('/users');
   * ```
   */
  public accept(contentType: string): PendingRequest {
    return this.createPendingRequest().accept(contentType);
  }

  /**
   * Set Content-Type header.
   *
   * @param contentType - Content type
   * @returns A new PendingRequest instance
   *
   * @example
   * ```typescript
   * const response = await httpFactory
   *   .contentType('application/json')
   *   .post('/users', data);
   * ```
   */
  public contentType(contentType: string): PendingRequest {
    return this.createPendingRequest().contentType(contentType);
  }

  /**
   * Set request body format to JSON.
   *
   * @returns A new PendingRequest instance
   *
   * @example
   * ```typescript
   * const response = await httpFactory
   *   .asJson()
   *   .post('/users', data);
   * ```
   */
  public asJson(): PendingRequest {
    return this.createPendingRequest().asJson();
  }

  /**
   * Set request body format to form-urlencoded.
   *
   * @returns A new PendingRequest instance
   *
   * @example
   * ```typescript
   * const response = await httpFactory
   *   .asForm()
   *   .post('/users', data);
   * ```
   */
  public asForm(): PendingRequest {
    return this.createPendingRequest().asForm();
  }

  /**
   * Set request body format to multipart/form-data.
   *
   * @returns A new PendingRequest instance
   *
   * @example
   * ```typescript
   * const response = await httpFactory
   *   .asMultipart()
   *   .attach('file', buffer, 'image.png')
   *   .post('/upload', data);
   * ```
   */
  public asMultipart(): PendingRequest {
    return this.createPendingRequest().asMultipart();
  }

  /**
   * Set request timeout.
   *
   * @param seconds - Timeout in seconds
   * @returns A new PendingRequest instance
   *
   * @example
   * ```typescript
   * const response = await httpFactory
   *   .timeout(30)
   *   .get('/users');
   * ```
   */
  public timeout(seconds: number): PendingRequest {
    return this.createPendingRequest().timeout(seconds);
  }

  /**
   * Configure retry behavior.
   *
   * @param times - Number of retry attempts
   * @param delayMs - Delay between retries in milliseconds
   * @param when - Optional callback to determine if request should be retried
   * @returns A new PendingRequest instance
   *
   * @example
   * ```typescript
   * const response = await httpFactory
   *   .retry(3, 1000)
   *   .get('/users');
   * ```
   */
  public retry(
    times: number,
    delayMs: number = 100,
    when?: (error: any, attempt: number) => boolean
  ): PendingRequest {
    return this.createPendingRequest().retry(times, delayMs, when);
  }

  /**
   * Attach a file for multipart upload.
   *
   * @param name - Field name
   * @param contents - File contents
   * @param filename - Optional filename
   * @param options - Optional options
   * @returns A new PendingRequest instance
   *
   * @example
   * ```typescript
   * const response = await httpFactory
   *   .attach('avatar', fileBuffer, 'profile.jpg')
   *   .post('/users', data);
   * ```
   */
  public attach(
    name: string,
    contents: Buffer | NodeJS.ReadableStream | string,
    filename?: string,
    options?: string | { contentType?: string }
  ): PendingRequest {
    return this.createPendingRequest().attach(name, contents, filename, options);
  }

  /**
   * Set query parameters.
   *
   * @param params - Query parameters
   * @returns A new PendingRequest instance
   *
   * @example
   * ```typescript
   * const response = await httpFactory
   *   .withQuery({ page: 1, limit: 10 })
   *   .get('/users');
   * ```
   */
  public withQuery(params: Record<string, any>): PendingRequest {
    return this.createPendingRequest().withQuery(params);
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
   * const response = await httpFactory.get('https://api.example.com/users');
   * const response = await httpFactory.get('/users', { page: 1 });
   * ```
   */
  public async get<T = any, D = any>(
    url: string,
    query?: Record<string, any>
  ): Promise<ClientResponse> {
    return this.createPendingRequest().get<T, D>(url, query);
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
   * const response = await httpFactory.post('/users', { name: 'John' });
   * ```
   */
  public async post<T = any, D = any>(url: string, data?: D): Promise<ClientResponse> {
    return this.createPendingRequest().post<T, D>(url, data);
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
   * const response = await httpFactory.put('/users/1', { name: 'Jane' });
   * ```
   */
  public async put<T = any, D = any>(url: string, data?: D): Promise<ClientResponse> {
    return this.createPendingRequest().put<T, D>(url, data);
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
   * const response = await httpFactory.patch('/users/1', { email: 'new@example.com' });
   * ```
   */
  public async patch<T = any, D = any>(url: string, data?: D): Promise<ClientResponse> {
    return this.createPendingRequest().patch<T, D>(url, data);
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
   * const response = await httpFactory.delete('/users/1');
   * ```
   */
  public async delete<T = any, D = any>(url: string, data?: D): Promise<ClientResponse> {
    return this.createPendingRequest().delete<T, D>(url, data);
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
   * const response = await httpFactory.head('/users');
   * ```
   */
  public async head<T = any, D = any>(url: string): Promise<ClientResponse> {
    return this.createPendingRequest().head<T, D>(url);
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
   * const response = await httpFactory.options('/users');
   * ```
   */
  public async options<T = any, D = any>(url: string): Promise<ClientResponse> {
    return this.createPendingRequest().options<T, D>(url);
  }

  /**
   * Execute multiple requests concurrently with lifecycle callbacks (Laravel-style).
   *
   * @param callback - Function that receives the batch and adds requests to it
   * @returns Promise resolving to record of responses by key
   *
   * @example
   * ```typescript
   * const responses = await httpFactory.batch((batch) => {
   *   batch.as('users').get('https://api.example.com/users');
   *   batch.as('posts').get('https://api.example.com/posts');
   * });
   * ```
   */
  public async batch(
    callback: (batch: Batch) => void | Promise<void>
  ): Promise<Record<string, ClientResponse>> {
    return this.createPendingRequest().batch(callback);
  }
}
