import type { AxiosRequestConfig, AxiosResponse } from 'axios';

/**
 * Stub callback for testing.
 *
 * Returns a response or promise that will be used instead of making
 * an actual HTTP request. Used for mocking in tests.
 */
export type StubCallback = (
  config: AxiosRequestConfig
) => AxiosResponse | Promise<AxiosResponse> | void;

/**
 * Options for faking HTTP requests in tests.
 *
 * Allows stubbing specific URLs or all requests with custom responses.
 */
export interface FakeOptions {
  /**
   * URL patterns to stub with their corresponding responses.
   * Keys can use wildcards (*) for pattern matching.
   *
   * @example
   * {
   *   'api.example.com/*': { data: { success: true }, status: 200 },
   *   'api.example.com/users': { data: [], status: 200 }
   * }
   */
  [url: string]: StubCallback | AxiosResponse | any;
}
