/**
 * Validate Path Encoding Configuration Options
 *
 * Validates that incoming request paths have valid UTF-8 encoding.
 * Prevents security issues from malformed URL encodings.
 */
export interface ValidatePathEncodingOptions {
  /**
   * HTTP status code to return for invalid path encoding.
   *
   * @default 400
   */
  statusCode?: number;

  /**
   * Custom error message for invalid path encoding.
   *
   * @default 'Malformed URL path encoding'
   */
  errorMessage?: string;
}
