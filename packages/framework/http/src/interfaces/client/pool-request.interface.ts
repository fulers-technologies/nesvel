import type { Method } from 'axios';
import type { HttpRequestConfig } from './http-request-config.interface';

/**
 * HTTP request methods supported by the client.
 *
 * Defines all standard HTTP methods that can be used when making requests.
 */
export type HttpMethod = Method;

/**
 * Pool request configuration.
 *
 * Defines a single request in a concurrent request pool.
 */
export interface PoolRequest {
  /**
   * HTTP method for the request.
   */
  method: HttpMethod;

  /**
   * URL to send the request to.
   */
  url: string;

  /**
   * Optional request data/body.
   */
  data?: any;

  /**
   * Optional request configuration.
   */
  config?: HttpRequestConfig;
}
