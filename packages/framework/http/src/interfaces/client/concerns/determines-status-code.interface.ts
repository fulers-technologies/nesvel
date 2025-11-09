/**
 * Interface for DeterminesStatusCode mixin.
 *
 * Provides methods for checking HTTP status codes with semantic names.
 * These methods make it easy to determine the result of an HTTP request
 * without manually checking status codes.
 */
export interface DeterminesStatusCodeInterface {
  /**
   * Determine if the response code was 200 "OK" response.
   *
   * @returns True if status is 200
   */
  ok(): boolean;

  /**
   * Determine if the response code was 201 "Created" response.
   *
   * @returns True if status is 201
   */
  created(): boolean;

  /**
   * Determine if the response code was 202 "Accepted" response.
   *
   * @returns True if status is 202
   */
  accepted(): boolean;

  /**
   * Determine if the response code was the given status code and the body has no content.
   *
   * @param status - The status code to check (default: 204)
   * @returns True if status matches and body is empty
   */
  noContent(status?: number): boolean;

  /**
   * Determine if the response code was a 301 "Moved Permanently".
   *
   * @returns True if status is 301
   */
  movedPermanently(): boolean;

  /**
   * Determine if the response code was a 302 "Found" response.
   *
   * @returns True if status is 302
   */
  found(): boolean;

  /**
   * Determine if the response code was a 304 "Not Modified" response.
   *
   * @returns True if status is 304
   */
  notModified(): boolean;

  /**
   * Determine if the response was a 400 "Bad Request" response.
   *
   * @returns True if status is 400
   */
  badRequest(): boolean;

  /**
   * Determine if the response was a 401 "Unauthorized" response.
   *
   * @returns True if status is 401
   */
  unauthorized(): boolean;

  /**
   * Determine if the response was a 402 "Payment Required" response.
   *
   * @returns True if status is 402
   */
  paymentRequired(): boolean;

  /**
   * Determine if the response was a 403 "Forbidden" response.
   *
   * @returns True if status is 403
   */
  forbidden(): boolean;

  /**
   * Determine if the response was a 404 "Not Found" response.
   *
   * @returns True if status is 404
   */
  notFound(): boolean;

  /**
   * Determine if the response was a 408 "Request Timeout" response.
   *
   * @returns True if status is 408
   */
  requestTimeout(): boolean;

  /**
   * Determine if the response was a 409 "Conflict" response.
   *
   * @returns True if status is 409
   */
  conflict(): boolean;

  /**
   * Determine if the response was a 422 "Unprocessable Content" response.
   *
   * @returns True if status is 422
   */
  unprocessableContent(): boolean;

  /**
   * Determine if the response was a 422 "Unprocessable Entity" response.
   *
   * Alias for unprocessableContent().
   *
   * @returns True if status is 422
   */
  unprocessableEntity(): boolean;

  /**
   * Determine if the response was a 429 "Too Many Requests" response.
   *
   * @returns True if status is 429
   */
  tooManyRequests(): boolean;
}
