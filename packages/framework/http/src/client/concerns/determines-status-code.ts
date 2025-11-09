import type { DeterminesStatusCodeInterface } from './interfaces';

/**
 * Mixin that provides methods for determining HTTP status codes.
 *
 * Implements Laravel's DeterminesStatusCode trait functionality
 * for checking response status codes with semantic method names.
 *
 * This mixin provides convenient boolean methods for checking common
 * HTTP status codes without having to manually check status() values.
 *
 * @example
 * ```typescript
 * import { Mixin } from 'ts-mixer';
 * import { DeterminesStatusCode } from './concerns/determines-status-code';
 *
 * class MyResponse extends Mixin(BaseResponse, DeterminesStatusCode) {
 *   // ... response implementation
 * }
 *
 * const response = MyResponse.make(...);
 * if (response.ok()) {
 *   console.log('Request successful');
 * }
 * ```
 */
export class DeterminesStatusCode implements DeterminesStatusCodeInterface {
  /**
   * Get the HTTP status code.
   *
   * This method must be implemented by the base class.
   * It's defined here to satisfy TypeScript's type checking.
   *
   * @returns The HTTP status code
   */
  status(): number {
    return (this as any).status();
  }

  /**
   * Get the response body as a string.
   *
   * This method must be implemented by the base class.
   * It's defined here to satisfy TypeScript's type checking.
   *
   * @returns The response body
   */
  body(): string {
    return (this as any).body();
  }

  /**
   * Determine if the response code was 200 "OK" response.
   *
   * @returns True if status is 200
   *
   * @example
   * ```typescript
   * if (response.ok()) {
   *   console.log('Request was successful');
   * }
   * ```
   */
  ok(): boolean {
    return this.status() === 200;
  }

  /**
   * Determine if the response code was 201 "Created" response.
   *
   * @returns True if status is 201
   *
   * @example
   * ```typescript
   * if (response.created()) {
   *   console.log('Resource was created');
   * }
   * ```
   */
  created(): boolean {
    return this.status() === 201;
  }

  /**
   * Determine if the response code was 202 "Accepted" response.
   *
   * @returns True if status is 202
   *
   * @example
   * ```typescript
   * if (response.accepted()) {
   *   console.log('Request was accepted');
   * }
   * ```
   */
  accepted(): boolean {
    return this.status() === 202;
  }

  /**
   * Determine if the response code was the given status code and the body has no content.
   *
   * @param status - The status code to check (default: 204)
   * @returns True if status matches and body is empty
   *
   * @example
   * ```typescript
   * if (response.noContent()) {
   *   console.log('No content (204)');
   * }
   *
   * if (response.noContent(205)) {
   *   console.log('Reset content (205)');
   * }
   * ```
   */
  noContent(status: number = 204): boolean {
    return this.status() === status && this.body() === '';
  }

  /**
   * Determine if the response code was a 301 "Moved Permanently".
   *
   * @returns True if status is 301
   *
   * @example
   * ```typescript
   * if (response.movedPermanently()) {
   *   console.log('Resource moved permanently');
   * }
   * ```
   */
  movedPermanently(): boolean {
    return this.status() === 301;
  }

  /**
   * Determine if the response code was a 302 "Found" response.
   *
   * @returns True if status is 302
   *
   * @example
   * ```typescript
   * if (response.found()) {
   *   console.log('Temporary redirect');
   * }
   * ```
   */
  found(): boolean {
    return this.status() === 302;
  }

  /**
   * Determine if the response code was a 304 "Not Modified" response.
   *
   * @returns True if status is 304
   *
   * @example
   * ```typescript
   * if (response.notModified()) {
   *   console.log('Resource not modified, use cached version');
   * }
   * ```
   */
  notModified(): boolean {
    return this.status() === 304;
  }

  /**
   * Determine if the response was a 400 "Bad Request" response.
   *
   * @returns True if status is 400
   *
   * @example
   * ```typescript
   * if (response.badRequest()) {
   *   console.log('Invalid request syntax');
   * }
   * ```
   */
  badRequest(): boolean {
    return this.status() === 400;
  }

  /**
   * Determine if the response was a 401 "Unauthorized" response.
   *
   * @returns True if status is 401
   *
   * @example
   * ```typescript
   * if (response.unauthorized()) {
   *   console.log('Authentication required');
   * }
   * ```
   */
  unauthorized(): boolean {
    return this.status() === 401;
  }

  /**
   * Determine if the response was a 402 "Payment Required" response.
   *
   * @returns True if status is 402
   *
   * @example
   * ```typescript
   * if (response.paymentRequired()) {
   *   console.log('Payment is required');
   * }
   * ```
   */
  paymentRequired(): boolean {
    return this.status() === 402;
  }

  /**
   * Determine if the response was a 403 "Forbidden" response.
   *
   * @returns True if status is 403
   *
   * @example
   * ```typescript
   * if (response.forbidden()) {
   *   console.log('Access forbidden');
   * }
   * ```
   */
  forbidden(): boolean {
    return this.status() === 403;
  }

  /**
   * Determine if the response was a 404 "Not Found" response.
   *
   * @returns True if status is 404
   *
   * @example
   * ```typescript
   * if (response.notFound()) {
   *   console.log('Resource not found');
   * }
   * ```
   */
  notFound(): boolean {
    return this.status() === 404;
  }

  /**
   * Determine if the response was a 408 "Request Timeout" response.
   *
   * @returns True if status is 408
   *
   * @example
   * ```typescript
   * if (response.requestTimeout()) {
   *   console.log('Request timed out');
   * }
   * ```
   */
  requestTimeout(): boolean {
    return this.status() === 408;
  }

  /**
   * Determine if the response was a 409 "Conflict" response.
   *
   * @returns True if status is 409
   *
   * @example
   * ```typescript
   * if (response.conflict()) {
   *   console.log('Request conflicts with current state');
   * }
   * ```
   */
  conflict(): boolean {
    return this.status() === 409;
  }

  /**
   * Determine if the response was a 422 "Unprocessable Content" response.
   *
   * @returns True if status is 422
   *
   * @example
   * ```typescript
   * if (response.unprocessableContent()) {
   *   console.log('Validation failed');
   * }
   * ```
   */
  unprocessableContent(): boolean {
    return this.status() === 422;
  }

  /**
   * Determine if the response was a 422 "Unprocessable Entity" response.
   *
   * Alias for unprocessableContent().
   *
   * @returns True if status is 422
   *
   * @example
   * ```typescript
   * if (response.unprocessableEntity()) {
   *   console.log('Validation failed');
   * }
   * ```
   */
  unprocessableEntity(): boolean {
    return this.unprocessableContent();
  }

  /**
   * Determine if the response was a 429 "Too Many Requests" response.
   *
   * @returns True if status is 429
   *
   * @example
   * ```typescript
   * if (response.tooManyRequests()) {
   *   console.log('Rate limit exceeded');
   * }
   * ```
   */
  tooManyRequests(): boolean {
    return this.status() === 429;
  }
}
