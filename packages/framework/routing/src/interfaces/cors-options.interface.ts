/**
 * Cross-Origin Resource Sharing (CORS) configuration options.
 *
 * Controls how the API handles cross-origin requests from web browsers.
 * Properly configured CORS settings are essential for security while
 * enabling legitimate cross-origin access.
 */
export interface CorsOptions {
  /**
   * Allowed origins for cross-origin requests.
   *
   * Can be a single origin string, array of origins, or boolean.
   * Use `true` to reflect the request origin (allow all), or `false` to disable CORS.
   * For production, specify exact origins for security.
   *
   * @example 'https://example.com'
   * @example ['https://app.example.com', 'https://admin.example.com']
   * @default false
   */
  origin?: string | string[] | boolean;

  /**
   * HTTP methods allowed for cross-origin requests.
   *
   * Specifies which HTTP methods can be used in actual requests.
   * Should match the methods your API actually supports.
   *
   * @example ['GET', 'POST', 'PUT', 'DELETE']
   * @default ['GET', 'HEAD', 'PUT', 'PATCH', 'POST', 'DELETE']
   */
  methods?: string[];

  /**
   * Request headers allowed in cross-origin requests.
   *
   * Headers that clients are permitted to send in actual requests.
   * Include custom headers your API expects (e.g., 'X-API-KEY').
   *
   * @example ['Content-Type', 'Authorization', 'X-Requested-With']
   * @default ['Content-Type', 'Authorization']
   */
  allowedHeaders?: string[];

  /**
   * Response headers exposed to the client.
   *
   * Headers that browsers are allowed to access from the response.
   * By default, only simple response headers are exposed.
   *
   * @example ['X-Total-Count', 'X-Request-ID']
   * @default []
   */
  exposedHeaders?: string[];

  /**
   * Whether to allow credentials in cross-origin requests.
   *
   * Enables sending cookies, authorization headers, and TLS certificates.
   * When true, 'origin' cannot be '*' for security reasons.
   *
   * @default false
   */
  credentials?: boolean;

  /**
   * Maximum age (in seconds) for caching preflight request results.
   *
   * Indicates how long browsers can cache the preflight response.
   * Reduces the number of OPTIONS requests for improved performance.
   *
   * @example 3600 // 1 hour
   * @default undefined (browser default)
   */
  maxAge?: number;
}
