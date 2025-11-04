/**
 * Default content types that API endpoints can consume.
 *
 * These MIME types are automatically applied to all endpoints unless
 * explicitly overridden or defaults are disabled. They represent the
 * most common request body formats for REST APIs.
 *
 * @constant
 */
export const DEFAULT_CONSUMES = [
  /**
   * Standard JSON content type.
   * Most common format for API request bodies.
   */
  'application/json',

  /**
   * URL-encoded form data.
   * Traditional HTML form submission format.
   */
  'application/x-www-form-urlencoded',
];
