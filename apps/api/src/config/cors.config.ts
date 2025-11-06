import type { CorsOptions } from '@nestjs/common/interfaces/external/cors-options.interface';

/**
 * CORS Configuration Interface
 *
 * Extends CorsOptions from NestJS.
 * Configures Cross-Origin Resource Sharing for the API.
 *
 * @interface CorsConfig
 * @extends CorsOptions
 * @see {@link https://docs.nestjs.com/security/cors | NestJS CORS}
 * @see {@link https://developer.mozilla.org/en-US/docs/Web/HTTP/CORS | MDN CORS Documentation}
 */
export interface CorsConfig extends CorsOptions {}

/**
 * CORS Configuration Factory
 *
 * Loads and validates CORS configuration from environment variables.
 * Provides secure defaults with environment-specific behavior.
 *
 * Environment Variables:
 * - `CORS_ORIGINS`: Comma-separated list of allowed origins (supports wildcards like *.example.com)
 * - `CORS_METHODS`: Comma-separated list of allowed HTTP methods
 * - `CORS_ALLOWED_HEADERS`: Comma-separated list of allowed request headers
 * - `CORS_EXPOSED_HEADERS`: Comma-separated list of exposed response headers
 * - `CORS_CREDENTIALS`: Enable/disable credentials support (default: true)
 * - `CORS_MAX_AGE`: Preflight cache duration in seconds (default: 3600)
 * - `CORS_ALLOW_ALL`: Allow all origins in development (default: false)
 *
 * @returns {CorsOptions} CORS configuration object
 *
 * @example
 * ```typescript
 * import { corsConfig } from './config';
 *
 * const config = corsConfig();
 * app.enableCors(config);
 * ```
 *
 * @example Environment Variables
 * ```bash
 * # Production
 * CORS_ORIGINS=https://example.com,https://*.example.com
 * CORS_CREDENTIALS=true
 * CORS_MAX_AGE=7200
 *
 * # Development
 * CORS_ALLOW_ALL=true
 * ```
 */
export const corsConfig = (): CorsConfig => {
  /**
   * Environment detection
   * Used to apply different security policies per environment
   */
  const isDevelopment = process.env.NODE_ENV === 'development';
  const isProduction = process.env.NODE_ENV === 'production';

  /**
   * Allowed Origins Configuration
   *
   * @env CORS_ORIGINS
   * @format Comma-separated list
   * @example 'https://app.example.com,https://*.example.com'
   * @default Development: ['http://localhost:3000', 'http://localhost:5173']
   * @default Production: []
   */
  const originsEnv = process.env.CORS_ORIGINS || '';
  const origins = originsEnv
    ? originsEnv.split(',').map((origin) => origin.trim())
    : isDevelopment
      ? ['http://localhost:3000', 'http://localhost:5173'] // Default dev origins
      : [];

  /**
   * Allowed HTTP Methods Configuration
   *
   * @env CORS_METHODS
   * @format Comma-separated list
   * @example 'GET,POST,PUT,DELETE'
   * @default ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS']
   */
  const methodsEnv = process.env.CORS_METHODS || '';
  const methods = methodsEnv
    ? methodsEnv.split(',').map((method) => method.trim())
    : ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'];

  /**
   * Allowed Request Headers Configuration
   *
   * Headers that clients are allowed to send in requests.
   *
   * @env CORS_ALLOWED_HEADERS
   * @format Comma-separated list
   * @example 'Content-Type,Authorization,X-Custom-Header'
   * @default Standard headers for REST APIs with authentication
   */
  const headersEnv = process.env.CORS_ALLOWED_HEADERS || '';
  const allowedHeaders = headersEnv
    ? headersEnv.split(',').map((header) => header.trim())
    : [
        'Content-Type',
        'Authorization',
        'X-Requested-With',
        'X-API-KEY',
        'Accept',
        'Accept-Language',
        'X-Request-ID',
      ];

  /**
   * Exposed Response Headers Configuration
   *
   * Headers that browsers are allowed to access from responses.
   * Useful for pagination metadata and request tracking.
   *
   * @env CORS_EXPOSED_HEADERS
   * @format Comma-separated list
   * @example 'X-Request-ID,X-Total-Count'
   * @default Headers for pagination and request tracking
   */
  const exposedHeadersEnv = process.env.CORS_EXPOSED_HEADERS || '';
  const exposedHeaders = exposedHeadersEnv
    ? exposedHeadersEnv.split(',').map((header) => header.trim())
    : ['X-Request-ID', 'X-Total-Count', 'X-Page-Count', 'X-Per-Page'];

  return {
    /**
     * Origin Validation Handler
     *
     * Configures the Access-Control-Allow-Origin CORS header.
     * Implements dynamic origin checking with support for:
     * - Exact domain matching
     * - Wildcard subdomain matching (*.example.com)
     * - Development mode override
     * - No-origin requests (mobile apps, Postman)
     *
     * @param origin - The origin of the request (may be undefined)
     * @param callback - Callback function to allow or reject the origin
     *
     * @env CORS_ORIGINS - Comma-separated list of allowed origins
     * @env CORS_ALLOW_ALL - Override to allow all origins in development
     *
     * @example
     * ```typescript
     * // Exact match: https://app.example.com
     * // Wildcard: *.example.com matches https://api.example.com, https://cdn.example.com
     * ```
     */
    origin: (origin, callback) => {
      // Allow requests with no origin (mobile apps, Postman, server-to-server, etc.)
      if (!origin) {
        return callback(null, true);
      }

      // Development mode: allow all origins if CORS_ALLOW_ALL is enabled
      if (isDevelopment && process.env.CORS_ALLOW_ALL?.toLowerCase() === 'true') {
        return callback(null, true);
      }

      // Production: warn if no origins are configured
      if (isProduction && origins.length === 0) {
        console.warn('⚠️  No CORS origins configured for production');
      }

      // Check if origin is in the allowed list
      const isAllowed = origins.some((allowedOrigin) => {
        // Exact match: https://app.example.com
        if (allowedOrigin === origin) return true;

        // Wildcard subdomain match: *.example.com
        if (allowedOrigin.startsWith('*.')) {
          const domain = allowedOrigin.slice(1); // Remove * to get .example.com
          return origin.endsWith(domain);
        }

        return false;
      });

      if (isAllowed) {
        callback(null, true);
      } else {
        callback(new Error(`Origin ${origin} not allowed by CORS`));
      }
    },

    /**
     * Allowed HTTP Methods
     *
     * Configures the Access-Control-Allow-Methods CORS header.
     * Specifies which HTTP methods are allowed for cross-origin requests.
     *
     * @env CORS_METHODS
     * @default ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS']
     */
    methods,

    /**
     * Allowed Request Headers
     *
     * Configures the Access-Control-Allow-Headers CORS header.
     * Specifies which headers clients are allowed to send in requests.
     *
     * Common headers included:
     * - Content-Type: Request body type
     * - Authorization: JWT/Bearer tokens
     * - X-API-KEY: API key authentication
     * - Accept-Language: i18n support
     * - X-Request-ID: Request tracing
     *
     * @env CORS_ALLOWED_HEADERS
     * @default Standard headers for REST APIs with authentication and i18n
     */
    allowedHeaders,

    /**
     * Exposed Response Headers
     *
     * Configures the Access-Control-Expose-Headers CORS header.
     * Specifies which response headers browsers can access from JavaScript.
     *
     * Exposed headers include:
     * - X-Request-ID: Request tracking and debugging
     * - X-Total-Count: Total number of items (pagination)
     * - X-Page-Count: Total number of pages (pagination)
     * - X-Per-Page: Items per page (pagination)
     *
     * @env CORS_EXPOSED_HEADERS
     * @default Pagination and tracking headers
     */
    exposedHeaders,

    /**
     * Credentials Support
     *
     * Configures the Access-Control-Allow-Credentials CORS header.
     * When true, allows cookies and authentication headers in cross-origin requests.
     *
     * Security Note:
     * - When credentials are enabled, origin cannot be '*'
     * - Must specify exact allowed origins
     *
     * @env CORS_CREDENTIALS
     * @default true
     */
    credentials: process.env.CORS_CREDENTIALS?.toLowerCase() !== 'false',

    /**
     * Preflight Cache Duration
     *
     * Configures the Access-Control-Max-Age CORS header.
     * Specifies how long (in seconds) browsers can cache preflight responses.
     *
     * Benefits of longer cache:
     * - Reduces preflight requests
     * - Improves performance
     * - Lower server load
     *
     * @env CORS_MAX_AGE
     * @default 3600 (1 hour)
     * @example 7200 (2 hours), 86400 (24 hours)
     */
    maxAge: parseInt(process.env.CORS_MAX_AGE || '3600', 10), // 1 hour default

    /**
     * Preflight Continue
     *
     * When false, preflight requests (OPTIONS) are handled and terminated.
     * When true, passes preflight requests to the next handler.
     *
     * @default false (terminate preflight requests)
     */
    preflightContinue: false,

    /**
     * OPTIONS Request Status Code
     *
     * HTTP status code returned for successful OPTIONS (preflight) requests.
     *
     * Standard status codes:
     * - 200: OK (some legacy clients)
     * - 204: No Content (preferred, no response body)
     *
     * @default 204 (No Content)
     */
    optionsSuccessStatus: 204,
  };
};
