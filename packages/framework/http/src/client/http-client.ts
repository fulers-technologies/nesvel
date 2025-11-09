import { Mixin } from 'ts-mixer';
import { EventEmitter2 } from '@nestjs/event-emitter';

import { BuildsHttpRequests } from './concerns/builds-http-requests';
import type { RetryStrategy } from '@/interfaces';
import { CircuitBreaker, CircuitBreakerManager } from './circuit-breaker';
import { Batch } from './batch';
import type { ClientResponse } from './response';
import type { PendingRequest } from './pending-request';

/**
 * HTTP Client Factory
 *
 * Main factory class for creating HTTP requests with a fluent interface.
 * Provides static methods that create and return PendingRequest instances.
 *
 * This is the primary entry point for making HTTP requests in your application.
 * Similar to Laravel's Http facade.
 *
 * Uses mixins to provide request building functionality via the
 * BuildsHttpRequests concern.
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
export class HttpClient extends Mixin(BuildsHttpRequests) {
  /**
   * Global event emitter for HTTP events.
   */
  private static globalEventEmitter?: EventEmitter2;

  /**
   * Global retry strategy.
   */
  private static globalRetryStrategy?: RetryStrategy;

  /**
   * Global circuit breaker manager.
   */
  private static globalCircuitBreakerManager?: CircuitBreakerManager;

  /**
   * Set global event emitter for all HTTP requests.
   *
   * @param emitter - EventEmitter2 instance
   */
  public static setGlobalEventEmitter(emitter: EventEmitter2): void {
    this.globalEventEmitter = emitter;
  }

  /**
   * Set global retry strategy for all HTTP requests.
   *
   * @param strategy - Retry strategy instance
   */
  public static setGlobalRetryStrategy(strategy: RetryStrategy): void {
    this.globalRetryStrategy = strategy;
  }

  /**
   * Set global circuit breaker manager for all HTTP requests.
   *
   * @param manager - Circuit breaker manager instance
   */
  public static setGlobalCircuitBreakerManager(manager: CircuitBreakerManager): void {
    this.globalCircuitBreakerManager = manager;
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
   * const response = await HttpClient.get<User[]>('https://api.example.com/users');
   * const users = response.data; // Type: User[]
   * const response = await HttpClient.get('/users', { page: 1 });
   * ```
   */
  public static async get<T = any, D = any>(url: string, query?: Record<string, any>) {
    return this.create().get<T, D>(url, query);
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
   * const response = await HttpClient.post<User, CreateUserDto>('/users', { name: 'John', email: 'john@example.com' });
   * const user = response.data; // Type: User
   * ```
   */
  public static async post<T = any, D = any>(url: string, data?: D) {
    return this.create().post<T, D>(url, data);
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
   * const response = await HttpClient.put<User, UpdateUserDto>('/users/1', { name: 'Jane' });
   * const user = response.data; // Type: User
   * ```
   */
  public static async put<T = any, D = any>(url: string, data?: D) {
    return this.create().put<T, D>(url, data);
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
   * const response = await HttpClient.patch<User, PatchUserDto>('/users/1', { email: 'new@example.com' });
   * const user = response.data; // Type: User
   * ```
   */
  public static async patch<T = any, D = any>(url: string, data?: D) {
    return this.create().patch<T, D>(url, data);
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
   * const response = await HttpClient.delete<DeleteResponse>('/users/1');
   * const result = response.data; // Type: DeleteResponse
   * ```
   */
  public static async delete<T = any, D = any>(url: string, data?: D) {
    return this.create().delete<T, D>(url, data);
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
   * const response = await HttpClient.head('/users');
   * console.log(response.headers);
   * ```
   */
  public static async head<T = any, D = any>(url: string) {
    return this.create().head<T, D>(url);
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
   * const response = await HttpClient.options('/users');
   * console.log(response.headers['allow']);
   * ```
   */
  public static async options<T = any, D = any>(url: string) {
    return this.create().options<T, D>(url);
  }

  /**
   * Execute multiple requests concurrently with lifecycle callbacks (Laravel-style).
   *
   * Creates a new Batch instance and passes it to the callback function,
   * allowing you to define multiple named requests with progress tracking.
   * All global configurations (event emitter, retry strategy, circuit breaker)
   * are automatically applied to each request in the batch.
   *
   * @param callback - Function that receives the batch and adds requests to it
   * @returns Promise resolving to record of responses by key
   *
   * @example
   * ```typescript
   * const responses = await HttpClient.batch((batch) => {
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
   * const responses = await HttpClient.batch((batch) => {
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
  public static async batch(
    callback: (batch: Batch) => void | Promise<void>
  ): Promise<Record<string, ClientResponse>> {
    return this.create().batch(callback);
  }

  /**
   * Create a new PendingRequest with global configuration applied.
   *
   * Overrides the base create() method to inject global event emitter,
   * retry strategy, and circuit breaker manager.
   *
   * @returns PendingRequest instance with global config
   * @protected
   */
  protected static create(): PendingRequest {
    // Import PendingRequest dynamically to avoid circular dependency
    const { PendingRequest: PendingRequestClass } = require('./pending-request');
    const request = PendingRequestClass.make();

    // Apply global event emitter
    if (this.globalEventEmitter) {
      request.withEventEmitter(this.globalEventEmitter);
    }

    // Apply global retry strategy
    if (this.globalRetryStrategy) {
      request.withRetryStrategy(this.globalRetryStrategy);
    }

    // Apply global circuit breaker (extract from manager per host)
    if (this.globalCircuitBreakerManager) {
      // Circuit breaker will be applied per-request based on host
      // Store the manager so PendingRequest can use it
      (request as any).circuitBreakerManager = this.globalCircuitBreakerManager;
    }

    return request;
  }
}
