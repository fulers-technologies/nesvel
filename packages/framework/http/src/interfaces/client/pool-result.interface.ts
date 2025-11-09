import type { AxiosResponse } from 'axios';
import type { PoolRequest } from './pool-request.interface';

/**
 * Result of a pool request.
 *
 * Contains either the successful response or an error.
 */
export interface PoolResult {
  /**
   * The response if request was successful.
   */
  response?: AxiosResponse;

  /**
   * The error if request failed.
   */
  error?: any;

  /**
   * The original request configuration.
   */
  request: PoolRequest;

  /**
   * Index of this request in the pool.
   */
  index: number;
}
