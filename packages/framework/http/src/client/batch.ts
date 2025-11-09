import type {
  BeforeCallback,
  ProgressCallback,
  CatchCallback,
  ThenCallback,
  FinallyCallback,
} from '@/types';
import { ClientResponse } from './response';
import { PendingRequest } from './pending-request';
import { BatchInProgressException } from './exceptions/batch-in-progress.exception';

/**
 * Enhanced batch for concurrent HTTP requests with named keys and lifecycle hooks.
 *
 * This class provides a Laravel-inspired API for executing multiple requests
 * concurrently with fine-grained control over success/failure handling.
 *
 * @example
 * ```typescript
 * const batch = Batch.make();
 *
 * const responses = await batch
 *   .as('users')
 *   .get('https://api.example.com/users')
 *   .as('posts')
 *   .get('https://api.example.com/posts')
 *   .before((batch) => console.log('Starting batch...'))
 *   .progress((batch, key, response) => {
 *     console.log(`${key}: ${response.status()}`);
 *   })
 *   .catch((batch, key, error) => {
 *     console.error(`${key} failed:`, error.message);
 *   })
 *   .then((batch, responses) => {
 *     console.log('All requests succeeded!', responses);
 *   })
 *   .finally((batch) => {
 *     console.log('Batch finished:', batch.getMetrics());
 *   })
 *   .dispatch();
 * ```
 */
export class Batch {
  /**
   * Factory function for creating PendingRequest instances.
   * Allows inheriting configuration from HttpClient/HttpFactory.
   */
  private requestFactory: () => PendingRequest = () => PendingRequest.make();
  /**
   * Map of named request promises.
   */
  private requestPromises: Map<string, Promise<ClientResponse>> = new Map();

  /**
   * Current key for the next request.
   */
  private pendingKey: string | null = null;

  /**
   * Whether the batch has been dispatched.
   */
  private inProgress: boolean = false;

  /**
   * Total number of requests in the batch.
   */
  public totalRequests: number = 0;

  /**
   * Number of requests still pending.
   */
  public pendingRequests: number = 0;

  /**
   * Number of failed requests.
   */
  public failedRequests: number = 0;

  /**
   * Number of successful requests.
   */
  public successfulRequests: number = 0;

  /**
   * Timestamp when the batch was created.
   */
  public readonly createdAt: Date = new Date();

  /**
   * Timestamp when the batch finished.
   */
  public finishedAt: Date | null = null;

  /**
   * Before callback.
   */
  private beforeCallback?: BeforeCallback;

  /**
   * Progress callback.
   */
  private progressCallback?: ProgressCallback;

  /**
   * Catch callback.
   */
  private catchCallback?: CatchCallback;

  /**
   * Then callback.
   */
  private thenCallback?: ThenCallback;

  /**
   * Finally callback.
   */
  private finallyCallback?: FinallyCallback;

  /**
   * Create a new batch instance.
   *
   * @param requestFactory - Optional factory function for creating PendingRequest instances
   */
  constructor(requestFactory?: () => PendingRequest) {
    if (requestFactory) {
      this.requestFactory = requestFactory;
    }
  }

  /**
   * Static factory method to create a new batch.
   *
   * @param requestFactory - Optional factory function for creating PendingRequest instances
   * @returns New batch instance
   */
  public static make(requestFactory?: () => PendingRequest): Batch {
    return new Batch(requestFactory);
  }

  /**
   * Set the key for the next request and return a proxy that captures the promise.
   *
   * @param key - Unique identifier for the request
   * @returns BatchProxy that looks like PendingRequest
   * @throws BatchInProgressException if batch already started
   *
   * @example
   * ```typescript
   * batch.as('users').get('/users');
   * batch.as('posts').get('/posts');
   * await batch.dispatch();
   * ```
   */
  public as(key: string): any {
    if (this.inProgress) {
      throw BatchInProgressException.make();
    }

    this.pendingKey = key;
    const request = this.requestFactory();

    // Create a proxy that intercepts HTTP method calls and stores promises
    return new Proxy(request, {
      get: (target: any, prop: string) => {
        const original = target[prop];

        // Intercept HTTP method calls (get, post, put, patch, delete, head, options)
        if (
          typeof original === 'function' &&
          ['get', 'post', 'put', 'patch', 'delete', 'head', 'options'].includes(prop)
        ) {
          return (...args: any[]) => {
            // Execute the original method to get the promise
            const promise = original.apply(target, args);

            // Store the promise with the current key
            if (this.pendingKey) {
              this.requestPromises.set(this.pendingKey, promise);
              this.totalRequests++;
              this.pendingRequests++;
              this.pendingKey = null;
            }

            // Return the batch for chaining (not the promise)
            return this;
          };
        }

        // For all other properties/methods, return as-is
        return original;
      },
    });
  }

  /**
   * Register a callback to run before the batch starts.
   *
   * @param callback - Callback function
   * @returns This batch for chaining
   */
  public before(callback: BeforeCallback): this {
    this.beforeCallback = callback;
    return this;
  }

  /**
   * Register a callback to run after each successful request.
   *
   * @param callback - Callback function
   * @returns This batch for chaining
   */
  public progress(callback: ProgressCallback): this {
    this.progressCallback = callback;
    return this;
  }

  /**
   * Register a callback to run after each failed request.
   *
   * @param callback - Callback function
   * @returns This batch for chaining
   */
  public catch(callback: CatchCallback): this {
    this.catchCallback = callback;
    return this;
  }

  /**
   * Register a callback to run if all requests succeed.
   *
   * @param callback - Callback function
   * @returns This batch for chaining
   */
  public then(callback: ThenCallback): this {
    this.thenCallback = callback;
    return this;
  }

  /**
   * Register a callback to run after all requests finish.
   *
   * @param callback - Callback function
   * @returns This batch for chaining
   */
  public finally(callback: FinallyCallback): this {
    this.finallyCallback = callback;
    return this;
  }

  /**
   * Dispatch the batch and execute all requests.
   *
   * @returns Promise resolving to record of responses by key
   * @throws BatchInProgressException if batch already dispatched
   */
  public async dispatch(): Promise<Record<string, ClientResponse>> {
    if (this.inProgress) {
      throw BatchInProgressException.make();
    }

    this.inProgress = true;

    // Call before callback
    if (this.beforeCallback) {
      await this.beforeCallback(this);
    }

    const responses: Record<string, ClientResponse> = {};

    // Execute all stored request promises concurrently
    const promiseEntries = Array.from(this.requestPromises.entries());
    const results = await Promise.allSettled(
      promiseEntries.map(([key, promise]) =>
        promise.then(
          (response) => ({ key, response, success: true }),
          (error) => ({ key, error, success: false })
        )
      )
    );

    // Process results
    for (const result of results) {
      if (result.status === 'fulfilled') {
        const { key, response, error, success } = result.value;

        if (success) {
          responses[key] = response;
          this.successfulRequests++;
          this.pendingRequests--;

          // Call progress callback
          if (this.progressCallback) {
            await this.progressCallback(this, key, response);
          }
        } else {
          responses[key] = error;
          this.failedRequests++;
          this.pendingRequests--;

          // Call catch callback
          if (this.catchCallback) {
            await this.catchCallback(this, key, error);
          }
        }
      }
    }

    this.finishedAt = new Date();

    // Call then callback if all succeeded
    if (this.failedRequests === 0 && this.thenCallback) {
      await this.thenCallback(this, responses);
    }

    // Call finally callback
    if (this.finallyCallback) {
      await this.finallyCallback(this);
    }

    return responses;
  }

  /**
   * Get batch metrics.
   */
  public getMetrics() {
    const duration = this.finishedAt
      ? this.finishedAt.getTime() - this.createdAt.getTime()
      : Date.now() - this.createdAt.getTime();

    return {
      total: this.totalRequests,
      successful: this.successfulRequests,
      failed: this.failedRequests,
      pending: this.pendingRequests,
      duration,
      createdAt: this.createdAt,
      finishedAt: this.finishedAt,
    };
  }

  /**
   * Check if the batch is in progress.
   *
   * @returns true if batch is executing
   */
  public isInProgress(): boolean {
    return this.inProgress;
  }

  /**
   * Check if all requests succeeded.
   *
   * @returns true if no failures
   */
  public allSucceeded(): boolean {
    return this.failedRequests === 0 && this.totalRequests > 0;
  }

  /**
   * Check if any requests failed.
   *
   * @returns true if has failures
   */
  public hasFailures(): boolean {
    return this.failedRequests > 0;
  }

  /**
   * Get the number of requests in the batch.
   *
   * @returns Request count
   */
  public count(): number {
    return this.totalRequests;
  }
}
