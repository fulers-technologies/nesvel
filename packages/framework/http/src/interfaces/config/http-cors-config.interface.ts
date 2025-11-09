/**
 * CORS Configuration
 *
 * Cross-Origin Resource Sharing settings for server responses.
 */
export interface HttpCorsConfig {
  /**
   * Enable CORS
   *
   * @env HTTP_CORS_ENABLED
   * @default true
   */
  enabled?: boolean;

  /**
   * Allowed origins
   *
   * Can be a string, array of strings, or regex.
   *
   * @env HTTP_CORS_ORIGIN (comma-separated)
   * @default '*'
   */
  origin?: string | string[] | RegExp | boolean;

  /**
   * Allowed HTTP methods
   *
   * @env HTTP_CORS_METHODS (comma-separated)
   * @default ['GET', 'HEAD', 'PUT', 'PATCH', 'POST', 'DELETE']
   */
  methods?: string | string[];

  /**
   * Allowed headers
   *
   * @env HTTP_CORS_ALLOWED_HEADERS (comma-separated)
   */
  allowedHeaders?: string | string[];

  /**
   * Exposed headers
   *
   * @env HTTP_CORS_EXPOSED_HEADERS (comma-separated)
   */
  exposedHeaders?: string | string[];

  /**
   * Allow credentials
   *
   * @env HTTP_CORS_CREDENTIALS
   * @default false
   */
  credentials?: boolean;

  /**
   * Max age for preflight requests (in seconds)
   *
   * @env HTTP_CORS_MAX_AGE
   */
  maxAge?: number;

  /**
   * Whether to pass CORS preflight response to next handler
   *
   * @env HTTP_CORS_PREFLIGHT_CONTINUE
   * @default false
   */
  preflightContinue?: boolean;

  /**
   * Status code for successful OPTIONS request
   *
   * @env HTTP_CORS_OPTIONS_SUCCESS_STATUS
   * @default 204
   */
  optionsSuccessStatus?: number;
}
