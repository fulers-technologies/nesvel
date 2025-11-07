/**
 * HTTP methods supported by the API endpoint decorator.
 *
 * This enum defines all standard HTTP methods that can be used
 * with the @Route decorator to specify the request method
 * for a given endpoint.
 *
 * @example
 * ```typescript
 * @Route({ method: HttpMethod.GET, path: '/users' })
 * async getUsers() { ... }
 * ```
 */
export enum HttpMethod {
  /**
   * HTTP GET method - Used for retrieving resources.
   * Safe and idempotent operation.
   */
  GET = 'GET',

  /**
   * HTTP POST method - Used for creating new resources.
   * Not idempotent.
   */
  POST = 'POST',

  /**
   * HTTP PUT method - Used for updating/replacing entire resources.
   * Idempotent operation.
   */
  PUT = 'PUT',

  /**
   * HTTP PATCH method - Used for partial updates to resources.
   * Not necessarily idempotent.
   */
  PATCH = 'PATCH',

  /**
   * HTTP DELETE method - Used for deleting resources.
   * Idempotent operation.
   */
  DELETE = 'DELETE',

  /**
   * HTTP OPTIONS method - Used for describing communication options.
   * Typically used for CORS preflight requests.
   */
  OPTIONS = 'OPTIONS',

  /**
   * HTTP HEAD method - Similar to GET but returns only headers.
   * Used for checking resource existence or metadata.
   */
  HEAD = 'HEAD',

  /**
   * Matches all HTTP methods.
   * Use with caution as it accepts any HTTP verb.
   */
  ALL = 'ALL',
}
