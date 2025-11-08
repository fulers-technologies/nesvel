import type { AxiosRequestConfig, AxiosResponse, Method } from 'axios';

/**
 * HTTP request methods supported by the client.
 *
 * Defines all standard HTTP methods that can be used when making requests.
 */
export type HttpMethod = Method;

/**
 * Configuration options for HTTP requests.
 *
 * Extends Axios request configuration with additional Laravel-style options
 * for a more fluent and developer-friendly API.
 */
export interface HttpRequestConfig extends AxiosRequestConfig {
  /**
   * Base URL to prepend to all requests.
   * Useful for setting API endpoints globally.
   */
  baseURL?: string;

  /**
   * Request timeout in milliseconds.
   * Default: 30000 (30 seconds)
   */
  timeout?: number;

  /**
   * Connection timeout in milliseconds.
   * Specifically for establishing the connection.
   */
  connectTimeout?: number;

  /**
   * Maximum number of retries for failed requests.
   * Default: 0 (no retries)
   */
  retries?: number;

  /**
   * Delay between retry attempts in milliseconds.
   * Can be a number for fixed delay or a function for exponential backoff.
   */
  retryDelay?: number | ((retryCount: number) => number);

  /**
   * Callback to determine if a request should be retried.
   * Receives the error and retry count, returns true to retry.
   */
  retryCondition?: (error: any, retryCount: number) => boolean;

  /**
   * Body format for the request.
   * Determines how the request body is serialized.
   */
  bodyFormat?: 'json' | 'form' | 'multipart';

  /**
   * Query parameters to append to the URL.
   * Will be serialized and added to the query string.
   */
  query?: Record<string, any>;

  /**
   * Whether to throw an exception on HTTP errors (4xx, 5xx).
   * Default: false
   */
  throwOnError?: boolean;
}

/**
 * Options for retry configuration.
 *
 * Provides fine-grained control over retry behavior including
 * exponential backoff, max attempts, and conditional retries.
 */
export interface RetryOptions {
  /**
   * Maximum number of retry attempts.
   * Default: 3
   */
  times?: number;

  /**
   * Delay between retries in milliseconds.
   * Can be a fixed number or a function for dynamic delays.
   * Default: 100
   */
  delay?: number | ((retryCount: number) => number);

  /**
   * Callback to determine if request should be retried.
   * Return true to retry, false to stop.
   */
  when?: (error: any, retryCount: number) => boolean;

  /**
   * Whether to throw exception after all retries are exhausted.
   * Default: true
   */
  throw?: boolean;
}

/**
 * Middleware function for HTTP requests.
 *
 * Can modify the request config before it's sent or handle
 * the response/error after it's received.
 */
export type HttpMiddleware = (
  config: AxiosRequestConfig
) => AxiosRequestConfig | Promise<AxiosRequestConfig>;

/**
 * Response middleware function.
 *
 * Processes responses before they're returned to the caller.
 */
export type ResponseMiddleware = (
  response: AxiosResponse
) => AxiosResponse | Promise<AxiosResponse>;

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
 * Recorded request/response pair.
 *
 * Captured during testing to allow assertions on sent requests.
 */
export interface RecordedRequest {
  /**
   * The request configuration that was sent.
   */
  request: AxiosRequestConfig;

  /**
   * The response that was received (or stubbed).
   */
  response: AxiosResponse | null;

  /**
   * Timestamp when the request was made.
   */
  timestamp: Date;
}

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

/**
 * File attachment for multipart uploads.
 *
 * Represents a file or blob to be uploaded in a multipart request.
 */
export interface FileAttachment {
  /**
   * Field name for the file input.
   */
  name: string;

  /**
   * File contents as Buffer, Stream, or string.
   */
  contents: Buffer | NodeJS.ReadableStream | string;

  /**
   * Optional filename for the uploaded file.
   * If not provided, will use the name field.
   */
  filename?: string;

  /**
   * Optional content type for the file.
   * Will be auto-detected if not provided.
   */
  contentType?: string;
}

/**
 * Response assertion callback.
 *
 * Used in testing to assert that certain requests were made.
 * Returns true if the request matches the assertion criteria.
 */
export type AssertionCallback = (
  request: AxiosRequestConfig,
  response: AxiosResponse | null
) => boolean;
