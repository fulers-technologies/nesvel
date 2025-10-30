/**
 * CORS Configuration
 *
 * Cross-Origin Resource Sharing settings for API security.
 *
 * @module CorsConfig
 */

import type { CorsOptions } from '@nestjs/common/interfaces/external/cors-options.interface';

/**
 * CORS Configuration Factory
 *
 * Loads and validates CORS configuration from environment variables
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
 */
export const corsConfig = (): CorsOptions => {
  const isDevelopment = process.env.NODE_ENV === 'development';
  const isProduction = process.env.NODE_ENV === 'production';

  // Parse allowed origins
  const originsEnv = process.env.CORS_ORIGINS || '';
  const origins = originsEnv
    ? originsEnv.split(',').map((origin) => origin.trim())
    : isDevelopment
      ? ['http://localhost:3000', 'http://localhost:5173'] // Default dev origins
      : [];

  // Parse allowed methods
  const methodsEnv = process.env.CORS_METHODS || '';
  const methods = methodsEnv
    ? methodsEnv.split(',').map((method) => method.trim())
    : ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'];

  // Parse allowed headers
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

  // Parse exposed headers
  const exposedHeadersEnv = process.env.CORS_EXPOSED_HEADERS || '';
  const exposedHeaders = exposedHeadersEnv
    ? exposedHeadersEnv.split(',').map((header) => header.trim())
    : ['X-Request-ID', 'X-Total-Count', 'X-Page-Count', 'X-Per-Page'];

  return {
    /**
     * Configures the Access-Control-Allow-Origin CORS header
     * Can be:
     * - Boolean (true for reflect origin, false for disable)
     * - String (single origin)
     * - RegExp (pattern matching)
     * - Array of above types
     * - Function for dynamic origin checking
     */
    origin: (origin, callback) => {
      // Allow requests with no origin (mobile apps, Postman, etc.)
      if (!origin) {
        return callback(null, true);
      }

      // Development: allow all origins
      if (isDevelopment && process.env.CORS_ALLOW_ALL?.toLowerCase() === 'true') {
        return callback(null, true);
      }

      // Production: strict origin checking
      if (isProduction && origins.length === 0) {
        console.warn('⚠️  No CORS origins configured for production');
      }

      // Check if origin is allowed
      const isAllowed = origins.some((allowedOrigin) => {
        // Exact match
        if (allowedOrigin === origin) return true;

        // Wildcard subdomain match (e.g., *.example.com)
        if (allowedOrigin.startsWith('*.')) {
          const domain = allowedOrigin.slice(1); // Remove *
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
     * Configures the Access-Control-Allow-Methods CORS header
     */
    methods,

    /**
     * Configures the Access-Control-Allow-Headers CORS header
     */
    allowedHeaders,

    /**
     * Configures the Access-Control-Expose-Headers CORS header
     */
    exposedHeaders,

    /**
     * Configures the Access-Control-Allow-Credentials CORS header
     * Set to true to pass the header, false omits the header
     */
    credentials: process.env.CORS_CREDENTIALS?.toLowerCase() !== 'false',

    /**
     * Configures the Access-Control-Max-Age CORS header
     * In seconds, how long the response to preflight can be cached
     */
    maxAge: parseInt(process.env.CORS_MAX_AGE || '3600', 10), // 1 hour

    /**
     * Pass the CORS preflight response to the next handler
     */
    preflightContinue: false,

    /**
     * Provides a status code to use for successful OPTIONS requests
     */
    optionsSuccessStatus: 204,
  };
};
