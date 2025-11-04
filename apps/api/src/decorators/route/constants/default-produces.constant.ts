/**
 * Default content types that API endpoints produce in responses.
 *
 * These MIME types are automatically applied to all endpoints unless
 * explicitly overridden or defaults are disabled. JSON is the standard
 * response format for modern REST APIs.
 *
 * @constant
 */
export const DEFAULT_PRODUCES = [
  /**
   * Standard JSON content type for API responses.
   */
  'application/json',
];
