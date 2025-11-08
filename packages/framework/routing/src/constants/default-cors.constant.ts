import { CorsOptions } from '@interfaces/cors-options.interface';

/**
 * Default CORS (Cross-Origin Resource Sharing) configuration.
 *
 * Provides secure defaults for cross-origin requests with environment-aware
 * origin handling. In development, allows localhost origins for easier testing.
 * In production, origins must be explicitly configured for security.
 *
 * @constant
 */
export const DEFAULT_CORS: CorsOptions = {
  /**
   * Allowed origins based on environment.
   * Development: localhost URLs for local testing.
   * Production: Empty array (must be explicitly configured).
   */
  origin:
    process.env.NODE_ENV === 'development'
      ? ['http://localhost:3000', 'http://localhost:5173']
      : [],

  /**
   * Allowed HTTP methods for cross-origin requests.
   * Covers all standard REST operations.
   */
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],

  /**
   * Request headers allowed in cross-origin requests.
   * Includes common headers for authentication and content negotiation.
   */
  allowedHeaders: [
    'Content-Type',
    'Authorization',
    'X-Requested-With',
    'X-API-KEY',
    'Accept',
    'Accept-Language',
    'X-Request-ID',
  ],

  /**
   * Response headers exposed to the client.
   * Allows access to pagination and tracing headers.
   */
  exposedHeaders: ['X-Request-ID', 'X-Total-Count', 'X-Page-Count', 'X-Per-Page'],

  /**
   * Allow credentials (cookies, authorization headers) in requests.
   * Required for cookie-based authentication.
   */
  credentials: true,

  /**
   * Cache duration for preflight requests (in seconds).
   * Reduces OPTIONS request frequency.
   */
  maxAge: 3600, // 1 hour
};
