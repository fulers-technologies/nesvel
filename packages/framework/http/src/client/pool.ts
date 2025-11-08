import { PendingRequest } from './pending-request';
import { ClientResponse } from './client-response';
import type { PoolRequest, PoolResult, HttpMethod } from '../types/client.types';

/**
 * HTTP Request Pool
 *
 * Executes multiple HTTP requests concurrently and collects their results.
 * Similar to Laravel's HTTP::pool() method for concurrent requests.
 *
 * @example
 * ```typescript
 * import { Pool } from '@nesvel/nestjs-http';
 *
 * const results = await Pool.send([
 *   { method: 'GET', url: 'https://api.example.com/users' },
 *   { method: 'GET', url: 'https://api.example.com/posts' },
 *   { method: 'GET', url: 'https://api.example.com/comments' },
 * ]);
 *
 * results.forEach((result) => {
 *   if (result.response) {
 *     console.log('Success:', result.response.data);
 *   } else {
 *     console.log('Error:', result.error);
 *   }
 * });
 * ```
 */
export class Pool {
  /**
   * Send multiple requests concurrently.
   *
   * Executes all requests in parallel and returns results in the same order
   * as the input requests. Failed requests will have an error property instead
   * of a response property.
   *
   * @param requests - Array of request configurations
   * @returns Promise resolving to array of wrapped results
   *
   * @example
   * ```typescript
   * const results = await Pool.send([
   *   { method: 'GET', url: '/users' },
   *   { method: 'POST', url: '/posts', data: { title: 'Hello' } },
   *   { method: 'GET', url: '/comments' },
   * ]);
   * ```
   */
  static async send(requests: PoolRequest[]): Promise<PoolResultWrapper[]> {
    const promises = requests.map(async (request, index): Promise<PoolResult> => {
      try {
        // Create a new PendingRequest for each request
        const pendingRequest = new PendingRequest(request.config || {});

        // Execute the request based on method
        let response: ClientResponse;

        switch (request.method.toUpperCase()) {
          case 'GET':
            response = await pendingRequest.get(request.url);
            break;
          case 'POST':
            response = await pendingRequest.post(request.url, request.data);
            break;
          case 'PUT':
            response = await pendingRequest.put(request.url, request.data);
            break;
          case 'PATCH':
            response = await pendingRequest.patch(request.url, request.data);
            break;
          case 'DELETE':
            response = await pendingRequest.delete(request.url, request.data);
            break;
          case 'HEAD':
            response = await pendingRequest.head(request.url);
            break;
          case 'OPTIONS':
            response = await pendingRequest.options(request.url);
            break;
          default:
            throw new Error(`Unsupported HTTP method: ${request.method}`);
        }

        return {
          response: response.toAxiosResponse(),
          request,
          index,
        };
      } catch (error: Error | any) {
        return {
          error,
          request,
          index,
        };
      }
    });

    // Wait for all promises to resolve (either success or failure)
    const results = await Promise.all(promises);
    return results.map((result) => new PoolResultWrapper(result));
  }

  /**
   * Send multiple requests with the same configuration.
   *
   * Useful when you want to apply the same headers, timeout, etc.
   * to multiple different requests.
   *
   * @param requests - Array of request configurations
   * @param globalConfig - Global configuration to apply to all requests
   * @returns Promise resolving to array of results
   *
   * @example
   * ```typescript
   * const results = await Pool.sendWithConfig(
   *   [
   *     { method: 'GET', url: '/users' },
   *     { method: 'GET', url: '/posts' },
   *   ],
   *   {
   *     timeout: 5000,
   *     headers: { 'Authorization': 'Bearer token' }
   *   }
   * );
   * ```
   */
  static async sendWithConfig(requests: PoolRequest[], globalConfig: any): Promise<PoolResultWrapper[]> {
    const requestsWithConfig = requests.map((request) => ({
      ...request,
      config: { ...globalConfig, ...request.config },
    }));

    return this.send(requestsWithConfig);
  }

  /**
   * Create a pool builder for more complex scenarios.
   *
   * Returns a PoolBuilder instance that allows for more advanced
   * configuration and request batching.
   *
   * @returns A new PoolBuilder instance
   *
   * @example
   * ```typescript
   * const results = await Pool.builder()
   *   .add('GET', '/users')
   *   .add('POST', '/posts', { title: 'Hello' })
   *   .withTimeout(10)
   *   .withHeaders({ 'X-Custom': 'value' })
   *   .send();
   * ```
   */
  static builder(): PoolBuilder {
    return new PoolBuilder();
  }

  /**
   * Start building a named pool with fluent API.
   *
   * @param name - Name for the first request
   * @returns A new NamedPoolBuilder instance
   *
   * @example
   * ```typescript
   * const results = await Pool.as('posts')
   *   .get('/posts')
   *   .as('users')
   *   .get('/users')
   *   .send();
   * ```
   */
  static as(name: string): NamedPoolBuilder {
    return new NamedPoolBuilder().as(name);
  }
}

/**
 * PoolResult Wrapper
 *
 * Wraps PoolResult with helper methods for easier access to response data.
 */
export class PoolResultWrapper {
  constructor(private result: PoolResult) {}

  /**
   * Check if the request was successful.
   */
  successful(): boolean {
    return !!this.result.response && !this.result.error;
  }

  /**
   * Check if the request failed.
   */
  failed(): boolean {
    return !!this.result.error;
  }

  /**
   * Get the response status code.
   */
  status(): number {
    return this.result.response?.status || 0;
  }

  /**
   * Get the response data as JSON.
   */
  json<T = any>(): T {
    return this.result.response?.data as T;
  }

  /**
   * Get the response data as an array.
   */
  array<T = any>(): T[] {
    const data = this.json();
    return Array.isArray(data) ? data : [];
  }

  /**
   * Get the underlying PoolResult.
   */
  unwrap(): PoolResult {
    return this.result;
  }
}

/**
 * Named Pool Builder
 *
 * Fluent interface for building named request pools.
 */
class NamedPoolBuilder {
  private requests: Array<{ name: string; method: HttpMethod; url: string; config?: any }> = [];
  private currentName: string = '';
  private globalConfig: any = {};

  /**
   * Set the name for the next request.
   */
  as(name: string): this {
    this.currentName = name;
    return this;
  }

  /**
   * Add a GET request.
   */
  get(url: string, config?: any): this {
    this.requests.push({
      name: this.currentName,
      method: 'GET',
      url,
      config,
    });
    return this;
  }

  /**
   * Add a POST request.
   */
  post(url: string, data?: any, config?: any): this {
    this.requests.push({
      name: this.currentName,
      method: 'POST',
      url,
      config: { ...config, data },
    });
    return this;
  }

  /**
   * Add a PUT request.
   */
  put(url: string, data?: any, config?: any): this {
    this.requests.push({
      name: this.currentName,
      method: 'PUT',
      url,
      config: { ...config, data },
    });
    return this;
  }

  /**
   * Add a PATCH request.
   */
  patch(url: string, data?: any, config?: any): this {
    this.requests.push({
      name: this.currentName,
      method: 'PATCH',
      url,
      config: { ...config, data },
    });
    return this;
  }

  /**
   * Add a DELETE request.
   */
  delete(url: string, data?: any, config?: any): this {
    this.requests.push({
      name: this.currentName,
      method: 'DELETE',
      url,
      config: { ...config, data },
    });
    return this;
  }

  /**
   * Set global timeout for all requests.
   */
  withTimeout(seconds: number): this {
    this.globalConfig.timeout = seconds * 1000;
    return this;
  }

  /**
   * Set global headers for all requests.
   */
  withHeaders(headers: Record<string, string>): this {
    this.globalConfig.headers = { ...this.globalConfig.headers, ...headers };
    return this;
  }

  /**
   * Execute all requests and return wrapped results.
   */
  async send(): Promise<PoolResultWrapper[]> {
    const poolRequests: PoolRequest[] = this.requests.map((req) => ({
      method: req.method,
      url: req.url,
      data: req.config?.data,
      config: { ...this.globalConfig, ...req.config },
    }));

    return Pool.sendWithConfig(poolRequests, this.globalConfig);
  }
}

/**
 * Pool Builder Class
 *
 * Provides a fluent interface for building request pools.
 */
class PoolBuilder {
  private requests: PoolRequest[] = [];
  private globalConfig: any = {};

  /**
   * Add a request to the pool.
   *
   * @param method - HTTP method
   * @param url - Request URL
   * @param data - Optional request data
   * @param config - Optional request-specific configuration
   * @returns This builder for chaining
   */
  add(method: string, url: string, data?: any, config?: any): this {
    this.requests.push({
      method: method as any,
      url,
      data,
      config,
    });
    return this;
  }

  /**
   * Set global timeout for all requests.
   *
   * @param seconds - Timeout in seconds
   * @returns This builder for chaining
   */
  withTimeout(seconds: number): this {
    this.globalConfig.timeout = seconds * 1000;
    return this;
  }

  /**
   * Set global headers for all requests.
   *
   * @param headers - Headers to set
   * @returns This builder for chaining
   */
  withHeaders(headers: Record<string, string>): this {
    this.globalConfig.headers = { ...this.globalConfig.headers, ...headers };
    return this;
  }

  /**
   * Execute all requests in the pool.
   *
   * @returns Promise resolving to array of results
   */
  async send(): Promise<PoolResultWrapper[]> {
    return Pool.sendWithConfig(this.requests, this.globalConfig);
  }
}
