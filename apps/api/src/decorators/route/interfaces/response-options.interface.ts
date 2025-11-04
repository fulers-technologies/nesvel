import { ApiResponseOptions } from '@nestjs/swagger';

/**
 * Response configuration options for API endpoints.
 *
 * Defines all possible HTTP response types and their OpenAPI documentation.
 * Supports both success and error responses with customizable descriptions.
 */
export interface ResponseOptions {
  /**
   * 200 OK response configuration.
   * Standard success response for GET, PUT, PATCH, DELETE requests.
   */
  ok?: ApiResponseOptions;

  /**
   * 201 Created response configuration.
   * Standard success response for POST requests that create resources.
   */
  created?: ApiResponseOptions;

  /**
   * 202 Accepted response configuration.
   * Indicates request accepted for processing but not yet completed.
   */
  accepted?: ApiResponseOptions;

  /**
   * 204 No Content response configuration.
   * Success response with no body content.
   */
  noContent?: ApiResponseOptions;

  /**
   * 301 Moved Permanently response configuration.
   * Resource permanently moved to new location.
   */
  movedPermanently?: ApiResponseOptions;

  /**
   * 302 Found response configuration.
   * Resource temporarily moved to different location.
   */
  found?: ApiResponseOptions;

  /**
   * 400 Bad Request response configuration.
   * Client sent invalid or malformed request.
   */
  badRequest?: string | ApiResponseOptions;

  /**
   * 401 Unauthorized response configuration.
   * Authentication required or failed.
   */
  unauthorized?: string | ApiResponseOptions;

  /**
   * 403 Forbidden response configuration.
   * Authenticated but lacks permission.
   */
  forbidden?: string | ApiResponseOptions;

  /**
   * 404 Not Found response configuration.
   * Requested resource does not exist.
   */
  notFound?: string | ApiResponseOptions;

  /**
   * 409 Conflict response configuration.
   * Request conflicts with current server state.
   */
  conflict?: string | ApiResponseOptions;

  /**
   * 422 Unprocessable Entity response configuration.
   * Request syntax correct but semantically invalid.
   */
  unprocessableEntity?: string | ApiResponseOptions;

  /**
   * 429 Too Many Requests response configuration.
   * Rate limit exceeded.
   */
  tooManyRequests?: string | ApiResponseOptions;

  /**
   * 500 Internal Server Error response configuration.
   * Unexpected server error occurred.
   */
  internalError?: string | ApiResponseOptions;

  /**
   * 502 Bad Gateway response configuration.
   * Invalid response from upstream server.
   */
  badGateway?: string | ApiResponseOptions;

  /**
   * 503 Service Unavailable response configuration.
   * Server temporarily unable to handle request.
   */
  serviceUnavailable?: string | ApiResponseOptions;

  /**
   * 504 Gateway Timeout response configuration.
   * Upstream server failed to respond in time.
   */
  gatewayTimeout?: string | ApiResponseOptions;

  /**
   * Default response configuration.
   * Fallback for undocumented status codes.
   */
  default?: ApiResponseOptions;

  /**
   * Custom response configurations.
   * Map of status codes to their configurations.
   *
   * @example
   * ```typescript
   * custom: {
   *   418: { description: "I'm a teapot" },
   *   451: { description: 'Unavailable for legal reasons' }
   * }
   * ```
   */
  custom?: Record<number, ApiResponseOptions>;
}
