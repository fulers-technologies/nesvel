import { ApiHeaderOptions } from '@nestjs/swagger';

/**
 * Default HTTP response headers for security.
 *
 * These headers are automatically added to all endpoint responses
 * to provide baseline security protections against common web vulnerabilities.
 * Applied at runtime to actual HTTP responses.
 *
 * @constant
 */
export const DEFAULT_RESPONSE_HEADERS: Record<string, string> = {
  /**
   * Prevents MIME type sniffing.
   * Forces browsers to respect the declared Content-Type.
   */
  'X-Content-Type-Options': 'nosniff',

  /**
   * Prevents clickjacking attacks.
   * Disallows embedding the page in frames/iframes.
   */
  'X-Frame-Options': 'DENY',

  /**
   * Enables XSS protection in older browsers.
   * Modern browsers use CSP instead.
   */
  'X-XSS-Protection': '1; mode=block',

  /**
   * Controls referrer information sent with requests.
   * Balances privacy and functionality.
   */
  'Referrer-Policy': 'strict-origin-when-cross-origin',
};

/**
 * Default OpenAPI response headers documentation.
 *
 * These headers are documented in Swagger/OpenAPI specification
 * to inform API consumers about standard response headers they
 * can expect from all endpoints.
 *
 * @constant
 */
export const DEFAULT_API_RESPONSE_HEADERS: Record<string, any> = {
  /**
   * Unique request identifier for distributed tracing.
   */
  'X-Request-ID': {
    description: 'Unique request identifier for tracing',
    schema: { type: 'string', format: 'uuid' },
  },

  /**
   * Response processing time in milliseconds.
   */
  'X-Response-Time': {
    description: 'Response time in milliseconds',
    schema: { type: 'integer' },
  },

  /**
   * Maximum requests allowed per time window.
   */
  'X-RateLimit-Limit': {
    description: 'Request limit per time window',
    schema: { type: 'integer' },
  },

  /**
   * Remaining requests in current rate limit window.
   */
  'X-RateLimit-Remaining': {
    description: 'Remaining requests in current window',
    schema: { type: 'integer' },
  },

  /**
   * Unix timestamp when rate limit resets.
   */
  'X-RateLimit-Reset': {
    description: 'Time when the rate limit resets (Unix timestamp)',
    schema: { type: 'integer' },
  },
};

/**
 * Default request headers documentation for OpenAPI.
 *
 * These headers are documented as optional request headers that
 * clients can send to enhance API functionality (localization,
 * tracing, versioning, etc.).
 *
 * @constant
 */
export const DEFAULT_REQUEST_HEADERS: ApiHeaderOptions[] = [
  {
    name: 'Accept-Language',
    description: 'Preferred language for response',
    required: false,
    example: 'en-US,en;q=0.9',
    schema: {
      type: 'string',
      pattern: '^[a-z]{2}(-[A-Z]{2})?(;q=\\d\\.\\d)?(,[a-z]{2}.*)?$',
    },
  },
  {
    name: 'X-Request-ID',
    description: 'Unique request identifier for tracing',
    required: false,
    example: '550e8400-e29b-41d4-a716-446655440000',
    schema: { type: 'string', format: 'uuid' },
  },
  {
    name: 'X-Client-Version',
    description: 'Client application version',
    required: false,
    example: '2.5.0',
    schema: { type: 'string', pattern: '^\\d+\\.\\d+\\.\\d+$' },
  },
];
