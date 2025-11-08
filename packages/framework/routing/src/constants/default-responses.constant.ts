import { DEFAULT_API_RESPONSE_HEADERS } from '@constants/default-headers.constant';

/**
 * Default response configurations for common HTTP status codes.
 *
 * Provides standard response documentation that is automatically applied
 * to all endpoints. These defaults ensure consistent API documentation
 * and include common headers for tracing, rate limiting, and performance metrics.
 *
 * Individual endpoints can override these defaults or add additional responses.
 *
 * @constant
 */
export const DEFAULT_RESPONSES = {
  /**
   * 200 OK - Standard success response.
   * Used for successful GET, PUT, PATCH, DELETE operations.
   */
  ok: {
    description: 'Request successful',
    headers: DEFAULT_API_RESPONSE_HEADERS,
  },

  /**
   * 201 Created - Resource creation success.
   * Standard response for successful POST operations.
   */
  created: {
    description: 'Resource created successfully',
    headers: DEFAULT_API_RESPONSE_HEADERS,
  },

  /**
   * 400 Bad Request - Client error in request format.
   * Indicates malformed request or invalid parameters.
   */
  badRequest: {
    description: 'Invalid request parameters or body',
    headers: DEFAULT_API_RESPONSE_HEADERS,
  },

  /**
   * 401 Unauthorized - Authentication required or failed.
   * Client must authenticate to access the resource.
   */
  unauthorized: {
    description: 'Authentication required or invalid credentials',
    headers: DEFAULT_API_RESPONSE_HEADERS,
  },

  /**
   * 403 Forbidden - Insufficient permissions.
   * Client is authenticated but lacks required permissions.
   */
  forbidden: {
    description: 'Insufficient permissions to access this resource',
    headers: DEFAULT_API_RESPONSE_HEADERS,
  },

  /**
   * 404 Not Found - Resource does not exist.
   * The requested resource could not be found.
   */
  notFound: {
    description: 'Resource not found',
    headers: DEFAULT_API_RESPONSE_HEADERS,
  },

  /**
   * 500 Internal Server Error - Unexpected server error.
   * Generic error for unhandled server-side exceptions.
   */
  internalError: {
    description: 'Internal server error occurred',
    headers: DEFAULT_API_RESPONSE_HEADERS,
  },
};
