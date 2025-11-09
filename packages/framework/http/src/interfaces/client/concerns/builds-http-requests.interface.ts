import type { PendingRequest } from '../../../client/pending-request';

/**
 * Interface for BuildsHttpRequests mixin.
 *
 * Provides fluent builder methods for configuring HTTP requests.
 * These methods allow chaining to build complex request configurations.
 */
export interface BuildsHttpRequestsInterface {
  /**
   * Set base URL for requests.
   *
   * @param url - The base URL
   * @returns A new PendingRequest instance
   */
  baseUrl(url: string): PendingRequest;

  /**
   * Set request headers.
   *
   * @param headers - Headers to set
   * @returns A new PendingRequest instance
   */
  withHeaders(headers: Record<string, string>): PendingRequest;

  /**
   * Set a single header.
   *
   * @param name - Header name
   * @param value - Header value
   * @returns A new PendingRequest instance
   */
  withHeader(name: string, value: string): PendingRequest;

  /**
   * Set bearer token authorization.
   *
   * @param token - The bearer token
   * @param type - Token type (default: 'Bearer')
   * @returns A new PendingRequest instance
   */
  withToken(token: string, type?: string): PendingRequest;

  /**
   * Set basic authentication.
   *
   * @param username - Username
   * @param password - Password
   * @returns A new PendingRequest instance
   */
  withBasicAuth(username: string, password: string): PendingRequest;

  /**
   * Set Accept header.
   *
   * @param contentType - Content type to accept
   * @returns A new PendingRequest instance
   */
  accept(contentType: string): PendingRequest;

  /**
   * Set Content-Type header.
   *
   * @param contentType - Content type
   * @returns A new PendingRequest instance
   */
  contentType(contentType: string): PendingRequest;

  /**
   * Set request body format to JSON.
   *
   * @returns A new PendingRequest instance
   */
  asJson(): PendingRequest;

  /**
   * Set request body format to form-urlencoded.
   *
   * @returns A new PendingRequest instance
   */
  asForm(): PendingRequest;

  /**
   * Set request body format to multipart/form-data.
   *
   * @returns A new PendingRequest instance
   */
  asMultipart(): PendingRequest;

  /**
   * Set request timeout.
   *
   * @param seconds - Timeout in seconds
   * @returns A new PendingRequest instance
   */
  timeout(seconds: number): PendingRequest;

  /**
   * Set connection timeout.
   *
   * @param seconds - Connection timeout in seconds
   * @returns A new PendingRequest instance
   */
  connectTimeout(seconds: number): PendingRequest;

  /**
   * Configure retry behavior.
   *
   * @param times - Number of retry attempts
   * @param delay - Delay between retries in milliseconds or callback
   * @param when - Callback to determine if request should be retried
   * @returns A new PendingRequest instance
   */
  retry(
    times: number,
    delay?: number | ((attempt: number) => number),
    when?: (error: any, attempt: number) => boolean
  ): PendingRequest;

  /**
   * Attach a file for multipart upload.
   *
   * @param name - Field name
   * @param contents - File contents
   * @param filename - Optional filename
   * @param options - Optional options (contentType/mimeType)
   * @returns A new PendingRequest instance
   */
  attach(
    name: string,
    contents: Buffer | NodeJS.ReadableStream | string,
    filename?: string,
    options?: string | { contentType?: string }
  ): PendingRequest;

  /**
   * Set query parameters.
   *
   * @param params - Query parameters
   * @returns A new PendingRequest instance
   */
  withQuery(params: Record<string, any>): PendingRequest;

  /**
   * Set Axios options.
   *
   * @param options - Axios options
   * @returns A new PendingRequest instance
   */
  withOptions(options: any): PendingRequest;
}
