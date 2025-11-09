import type { HttpConfig } from '@/interfaces';

/**
 * HTTP Module Configuration
 *
 * Production-ready HTTP client and server configuration for NestJS.
 * Provides comprehensive HTTP integration with Axios client and Express server.
 *
 * Features:
 * - Axios-based HTTP client with retry logic
 * - Express middleware configuration (CORS, body parsing, cookies)
 * - Security headers via Helmet
 * - Response compression
 * - Rate limiting
 * - Type-safe operations
 *
 * All configuration values can be overridden via environment variables.
 *
 * @see {@link https://axios-http.com | Axios Documentation}
 * @see {@link https://expressjs.com | Express Documentation}
 * @see {@link https://helmetjs.github.io | Helmet Security}
 *
 * @example
 * ```typescript
 * // Access configuration values
 * const timeout = httpConfig.client?.timeout;
 * const corsEnabled = httpConfig.server?.cors?.enabled;
 * const rateLimitMax = httpConfig.server?.rateLimit?.max;
 * ```
 */
export const httpConfig: HttpConfig = {
  /**
   * Register module globally
   *
   * When true, the module will be available globally without imports.
   *
   * @env HTTP_GLOBAL
   * @default false
   */
  isGlobal: process.env.HTTP_GLOBAL === 'true',

  /**
   * HTTP client configuration
   *
   * Options for the Axios-based HTTP client used for making requests.
   */
  client: {
    /**
     * Base URL to prepend to all requests
     *
     * @env HTTP_CLIENT_BASE_URL
     */
    baseURL: process.env.HTTP_CLIENT_BASE_URL || undefined,

    /**
     * Request timeout in milliseconds
     *
     * @env HTTP_CLIENT_TIMEOUT
     * @default 30000 (30 seconds)
     */
    timeout: parseInt(process.env.HTTP_CLIENT_TIMEOUT || '30000', 10),

    /**
     * Connection timeout in milliseconds
     *
     * @env HTTP_CLIENT_CONNECT_TIMEOUT
     * @default 5000 (5 seconds)
     */
    connectTimeout: parseInt(process.env.HTTP_CLIENT_CONNECT_TIMEOUT || '5000', 10),

    /**
     * Maximum number of retries for failed requests
     *
     * @env HTTP_CLIENT_MAX_RETRIES
     * @default 0 (no retries)
     */
    maxRetries: parseInt(process.env.HTTP_CLIENT_MAX_RETRIES || '0', 10),

    /**
     * Delay between retry attempts in milliseconds
     *
     * @env HTTP_CLIENT_RETRY_DELAY
     * @default 1000 (1 second)
     */
    retryDelay: parseInt(process.env.HTTP_CLIENT_RETRY_DELAY || '1000', 10),

    /**
     * Use exponential backoff for retries
     *
     * @env HTTP_CLIENT_RETRY_EXPONENTIAL
     * @default false
     */
    retryExponential: process.env.HTTP_CLIENT_RETRY_EXPONENTIAL === 'true',

    /**
     * Maximum number of redirects to follow
     *
     * @env HTTP_CLIENT_MAX_REDIRECTS
     * @default 5
     */
    maxRedirects: parseInt(process.env.HTTP_CLIENT_MAX_REDIRECTS || '5', 10),

    /**
     * Maximum content length in bytes
     *
     * @env HTTP_CLIENT_MAX_CONTENT_LENGTH
     * @default -1 (unlimited)
     */
    maxContentLength: parseInt(process.env.HTTP_CLIENT_MAX_CONTENT_LENGTH || '-1', 10),

    /**
     * Maximum body length in bytes
     *
     * @env HTTP_CLIENT_MAX_BODY_LENGTH
     * @default -1 (unlimited)
     */
    maxBodyLength: parseInt(process.env.HTTP_CLIENT_MAX_BODY_LENGTH || '-1', 10),

    /**
     * Whether to throw an exception on HTTP errors (4xx, 5xx)
     *
     * @env HTTP_CLIENT_THROW_ON_ERROR
     * @default false
     */
    throwOnError: process.env.HTTP_CLIENT_THROW_ON_ERROR === 'true',

    /**
     * Whether to validate HTTP status codes
     *
     * @env HTTP_CLIENT_VALIDATE_STATUS
     * @default true
     */
    validateStatus: process.env.HTTP_CLIENT_VALIDATE_STATUS !== 'false',

    /**
     * Proxy configuration
     */
    proxy: process.env.HTTP_PROXY_HOST
      ? {
          host: process.env.HTTP_PROXY_HOST,
          port: parseInt(process.env.HTTP_PROXY_PORT || '8080', 10),
          protocol: (process.env.HTTP_PROXY_PROTOCOL as 'http' | 'https') || 'http',
          auth: process.env.HTTP_PROXY_USERNAME
            ? {
                username: process.env.HTTP_PROXY_USERNAME,
                password: process.env.HTTP_PROXY_PASSWORD || '',
              }
            : undefined,
        }
      : undefined,

    /**
     * Authentication configuration
     */
    auth:
      process.env.HTTP_AUTH_USERNAME || process.env.HTTP_AUTH_BEARER_TOKEN
        ? {
            username: process.env.HTTP_AUTH_USERNAME,
            password: process.env.HTTP_AUTH_PASSWORD,
            bearerToken: process.env.HTTP_AUTH_BEARER_TOKEN,
          }
        : undefined,
  },

  /**
   * HTTP server configuration
   *
   * Options for Express-based server middleware and response handling.
   */
  server: {
    /**
     * Trust proxy configuration
     *
     * @env HTTP_SERVER_TRUST_PROXY
     * @default false
     */
    trustProxy: process.env.HTTP_SERVER_TRUST_PROXY
      ? process.env.HTTP_SERVER_TRUST_PROXY === 'true'
        ? true
        : parseInt(process.env.HTTP_SERVER_TRUST_PROXY, 10) || process.env.HTTP_SERVER_TRUST_PROXY
      : false,

    /**
     * CORS configuration
     */
    cors: {
      enabled: process.env.HTTP_CORS_ENABLED !== 'false',
      origin: process.env.HTTP_CORS_ORIGIN
        ? process.env.HTTP_CORS_ORIGIN.split(',').map((o) => o.trim())
        : '*',
      methods: process.env.HTTP_CORS_METHODS
        ? process.env.HTTP_CORS_METHODS.split(',').map((m) => m.trim())
        : ['GET', 'HEAD', 'PUT', 'PATCH', 'POST', 'DELETE'],
      allowedHeaders: process.env.HTTP_CORS_ALLOWED_HEADERS
        ? process.env.HTTP_CORS_ALLOWED_HEADERS.split(',').map((h) => h.trim())
        : undefined,
      exposedHeaders: process.env.HTTP_CORS_EXPOSED_HEADERS
        ? process.env.HTTP_CORS_EXPOSED_HEADERS.split(',').map((h) => h.trim())
        : undefined,
      credentials: process.env.HTTP_CORS_CREDENTIALS === 'true',
      maxAge: process.env.HTTP_CORS_MAX_AGE
        ? parseInt(process.env.HTTP_CORS_MAX_AGE, 10)
        : undefined,
      preflightContinue: process.env.HTTP_CORS_PREFLIGHT_CONTINUE === 'true',
      optionsSuccessStatus: parseInt(process.env.HTTP_CORS_OPTIONS_SUCCESS_STATUS || '204', 10),
    },

    /**
     * Body parser configuration
     */
    bodyParser: {
      rawLimit: process.env.HTTP_BODY_PARSER_RAW_LIMIT || '100kb',
      textLimit: process.env.HTTP_BODY_PARSER_TEXT_LIMIT || '100kb',
      jsonLimit: process.env.HTTP_BODY_PARSER_JSON_LIMIT || '100kb',
      rawEnabled: process.env.HTTP_BODY_PARSER_RAW_ENABLED === 'true',
      textEnabled: process.env.HTTP_BODY_PARSER_TEXT_ENABLED === 'true',
      jsonEnabled: process.env.HTTP_BODY_PARSER_JSON_ENABLED !== 'false',
      urlencodedLimit: process.env.HTTP_BODY_PARSER_URLENCODED_LIMIT || '100kb',
      urlencodedEnabled: process.env.HTTP_BODY_PARSER_URLENCODED_ENABLED !== 'false',
      urlencodedExtended: process.env.HTTP_BODY_PARSER_URLENCODED_EXTENDED !== 'false',
    },

    /**
     * Cookie parser configuration
     */
    cookieParser: {
      enabled: process.env.HTTP_COOKIE_PARSER_ENABLED !== 'false',
      secret: process.env.HTTP_COOKIE_SECRET
        ? process.env.HTTP_COOKIE_SECRET.split(',').map((s) => s.trim())
        : undefined,
    },

    /**
     * Compression configuration
     */
    compression: {
      enabled: process.env.HTTP_COMPRESSION_ENABLED !== 'false',
      level: parseInt(process.env.HTTP_COMPRESSION_LEVEL || '6', 10),
      threshold: parseInt(process.env.HTTP_COMPRESSION_THRESHOLD || '1024', 10),
    },

    /**
     * Helmet security configuration
     */
    helmet: {
      enabled: process.env.HTTP_HELMET_ENABLED !== 'false',
      noSniff: process.env.HTTP_HELMET_NO_SNIFF !== 'false',
      hsts: process.env.HTTP_HELMET_HSTS_ENABLED !== 'false',
      ieNoOpen: process.env.HTTP_HELMET_IE_NO_OPEN !== 'false',
      xssFilter: process.env.HTTP_HELMET_XSS_FILTER !== 'false',
      frameguard: process.env.HTTP_HELMET_FRAMEGUARD !== 'false',
      hidePoweredBy: process.env.HTTP_HELMET_HIDE_POWERED_BY !== 'false',
      referrerPolicy: process.env.HTTP_HELMET_REFERRER_POLICY !== 'false',
      contentSecurityPolicy: process.env.HTTP_HELMET_CSP_ENABLED === 'true',
      dnsPrefetchControl: process.env.HTTP_HELMET_DNS_PREFETCH_CONTROL !== 'false',
      crossOriginOpenerPolicy: process.env.HTTP_HELMET_CROSS_ORIGIN_OPENER_POLICY === 'true',
      crossOriginEmbedderPolicy: process.env.HTTP_HELMET_CROSS_ORIGIN_EMBEDDER_POLICY === 'true',
      crossOriginResourcePolicy: process.env.HTTP_HELMET_CROSS_ORIGIN_RESOURCE_POLICY === 'true',
    },

    /**
     * Rate limiting configuration
     */
    rateLimit: {
      enabled: process.env.HTTP_RATE_LIMIT_ENABLED === 'true',
      max: parseInt(process.env.HTTP_RATE_LIMIT_MAX || '100', 10),
      windowMs: parseInt(process.env.HTTP_RATE_LIMIT_WINDOW_MS || '60000', 10),
      statusCode: parseInt(process.env.HTTP_RATE_LIMIT_STATUS_CODE || '429', 10),
      skipFailedRequests: process.env.HTTP_RATE_LIMIT_SKIP_FAILED_REQUESTS === 'true',
      skipSuccessfulRequests: process.env.HTTP_RATE_LIMIT_SKIP_SUCCESSFUL_REQUESTS === 'true',
      message: process.env.HTTP_RATE_LIMIT_MESSAGE || 'Too many requests, please try again later.',
    },
  },
};
