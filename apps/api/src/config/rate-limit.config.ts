import {
  ThrottlerGenerateKeyFunction,
  ThrottlerGetTrackerFunction,
  ThrottlerLimitDetail,
  ThrottlerOptions,
  ThrottlerStorage,
  seconds,
} from '@nestjs/throttler';
import { ExecutionContext } from '@nestjs/common';

/**
 * Rate Limit Tier Configuration
 *
 * Defines a single rate limit tier with time window and request limits.
 * Tiers provide pre-configured rate limits for different endpoint types.
 *
 * @interface RateLimitTier
 * @example
 * ```typescript
 * const authTier: RateLimitTier = {
 *   name: 'auth',
 *   ttl: 60,
 *   limit: 5
 * };
 * ```
 */
export interface RateLimitTier {
  /**
   * Unique identifier for the tier
   * @example 'auth', 'mutation', 'query'
   */
  name: string;

  /**
   * Time-to-live window in seconds
   * Specifies the time window for counting requests
   * @example 60 (1 minute), 3600 (1 hour)
   */
  ttl: number;

  /**
   * Maximum number of requests allowed within the TTL window
   * @example 5 (for auth endpoints), 300 (for query endpoints)
   */
  limit: number;
}

/**
 * Rate Limit Configuration Interface
 *
 * Complete configuration for @nestjs/throttler module.
 * Defines multiple throttlers, error handling, and pre-configured tiers for different endpoint types.
 *
 * @interface RateLimitConfig
 * @see {@link https://docs.nestjs.com/security/rate-limiting | NestJS Rate Limiting}
 * @example
 * ```typescript
 * import { rateLimitConfig } from './config/rate-limit.config';
 *
 * @Module({
 *   imports: [ThrottlerModule.forRoot(rateLimitConfig)]
 * })
 * export class AppModule {}
 * ```
 */
export interface RateLimitConfig {
  /**
   * Function to conditionally skip throttling
   * Return true to bypass rate limiting for the request
   *
   * @param context - Execution context containing request information
   * @returns true to skip throttling, false to apply it
   *
   * @example
   * ```typescript
   * skipIf: (context) => {
   *   const request = context.switchToHttp().getRequest();
   *   return request.url.includes('/health');
   * }
   * ```
   * @optional
   */
  skipIf?: (context: ExecutionContext) => boolean;

  /**
   * Array of user agent regex patterns to ignore
   * Requests from matching user agents will bypass rate limiting
   *
   * @example [/health-check-bot/i, /monitoring-agent/i]
   * @optional
   */
  ignoreUserAgents?: RegExp[];

  /**
   * Custom function to extract client identifier for tracking
   * By default, uses IP address
   *
   * @param request - HTTP request object
   * @returns String identifier for the client
   *
   * @example
   * ```typescript
   * getTracker: (request) => request.user?.id || request.ip
   * ```
   * @optional
   */
  getTracker?: ThrottlerGetTrackerFunction;

  /**
   * Custom function to generate cache key for rate limit storage
   * Allows fine-grained control over rate limit scoping
   *
   * @param context - Execution context
   * @param tracker - Client identifier
   * @param throttler - Throttler name
   * @returns Cache key string
   *
   * @optional
   */
  generateKey?: ThrottlerGenerateKeyFunction;

  /**
   * Error message returned when rate limit is exceeded
   * Can be a static string or a function that generates dynamic messages
   *
   * @default 'Too many requests, please try again later.'
   *
   * @example
   * ```typescript
   * // Static message
   * errorMessage: 'Rate limit exceeded'
   *
   * // Dynamic message
   * errorMessage: (context, throttlerLimitDetail) => {
   *   return `Too many requests. Retry after ${throttlerLimitDetail.ttl} seconds.`;
   * }
   * ```
   * @optional
   */
  errorMessage?:
    | string
    | ((context: ExecutionContext, throttlerLimitDetail: ThrottlerLimitDetail) => string);

  /**
   * Custom storage implementation for rate limit data
   * By default, uses in-memory storage (not suitable for multi-instance deployments)
   *
   * For production with multiple instances, use Redis or similar distributed storage
   *
   * @example
   * ```typescript
   * import { ThrottlerStorageRedisService } from '@nestjs/throttler-storage-redis';
   * import Redis from 'ioredis';
   *
   * storage: new ThrottlerStorageRedisService(
   *   new Redis({ host: 'localhost', port: 6379 })
   * )
   * ```
   * @optional
   */
  storage?: ThrottlerStorage;

  /**
   * Array of throttler configurations with different time windows
   * Each throttler defines a separate rate limit check that must pass
   *
   * Multiple throttlers allow layered protection:
   * - Short window: Burst protection
   * - Medium window: Normal usage
   * - Long window: Sustained usage
   *
   * @example
   * ```typescript
   * throttlers: [
   *   { name: 'short', ttl: 1, limit: 10 },
   *   { name: 'medium', ttl: 10, limit: 100 },
   *   { name: 'long', ttl: 60, limit: 1000 }
   * ]
   * ```
   */
  throttlers: Array<ThrottlerOptions>;

  /**
   * Pre-configured rate limit tiers for different endpoint types
   * Provides sensible defaults that can be applied using the @Route decorator
   *
   * @example
   * ```typescript
   * import { rateLimitConfig } from './config/rate-limit.config';
   *
   * @Route({
   *   path: '/login',
   *   method: 'POST',
   *   throttle: rateLimitConfig.tiers.auth
   * })
   * ```
   */
  tiers: {
    /**
     * Authentication endpoints tier
     * Very strict limits to prevent brute force attacks
     *
     * @example Login, register, password reset endpoints
     * @default 5 requests per minute (production), 50 (development)
     */
    auth: RateLimitTier;

    /**
     * Mutation endpoints tier
     * Moderate limits for write operations to prevent abuse
     *
     * @example POST, PUT, PATCH, DELETE operations
     * @default 60 requests per minute (production), 600 (development)
     */
    mutation: RateLimitTier;

    /**
     * Query endpoints tier
     * More relaxed limits for read operations
     *
     * @example GET requests, list endpoints, search
     * @default 300 requests per minute (production), 3000 (development)
     */
    query: RateLimitTier;

    /**
     * Public endpoints tier
     * Generous but protected limits for unauthenticated access
     *
     * @example Public content, landing pages, documentation
     * @default 100 requests per minute (production), 1000 (development)
     */
    public: RateLimitTier;

    /**
     * File upload endpoints tier
     * Stricter limits due to resource intensity and storage costs
     *
     * @example Image uploads, document processing, file attachments
     * @default 10 requests per minute (production), 100 (development)
     */
    upload: RateLimitTier;
  };
}

/**
 * Environment-based configuration helper
 */
const isProduction = process.env.NODE_ENV === 'production';
const isDevelopment = process.env.NODE_ENV === 'development';

/**
 * Rate limit configuration for @nestjs/throttler
 *
 * Default configuration provides multiple time windows:
 * - Short: 10 requests per 1 second (burst protection)
 * - Medium: 100 requests per 10 seconds (normal usage)
 * - Long: 1000 requests per 1 minute (sustained usage)
 *
 * In development mode, limits are relaxed for easier testing.
 *
 * Access pre-configured tiers via `rateLimitConfig.tiers`
 */
export const rateLimitConfig: RateLimitConfig = {
  /**
   * Throttler configuration with multiple time windows
   *
   * Each throttler defines a limit and TTL (time-to-live).
   * Requests are counted separately for each throttler.
   */
  throttlers: [
    {
      name: 'short',
      ttl: seconds(1), // 1 second window
      limit: isDevelopment ? 100 : 10, // Relaxed in development
    },
    {
      name: 'medium',
      ttl: seconds(10), // 10 second window
      limit: isDevelopment ? 1000 : 100,
    },
    {
      name: 'long',
      ttl: seconds(60), // 1 minute window
      limit: isDevelopment ? 10000 : 1000,
    },
  ],

  /**
   * Error message returned when rate limit is exceeded
   */
  errorMessage: 'Too many requests, please try again later.',

  /**
   * Skip throttling if function returns true
   *
   * Useful for:
   * - Whitelisting specific IPs
   * - Skipping health check endpoints
   * - Bypassing for admin users
   */
  skipIf: (context: ExecutionContext) => {
    // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
    const request = context.switchToHttp().getRequest();

    // Skip throttling for health check endpoints
    // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access, @typescript-eslint/no-unsafe-call
    if (request.url?.includes('/health')) {
      return true;
    }

    // Skip throttling for internal requests (optional)
    // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
    const isInternal = request.headers['x-internal-request'] === 'true';
    if (isInternal) {
      return true;
    }

    return false;
  },

  /**
   * Ignore user agents (optional)
   *
   * Skip throttling for specific user agents like monitoring tools
   */
  ignoreUserAgents: [
    // Add monitoring tools or health check agents here
    // /health-check-bot/i,
    // /monitoring-agent/i,
  ],

  /**
   * Storage configuration
   *
   * Default: In-memory storage (suitable for single instance)
   * For production with multiple instances, use Redis:
   *
   * storage: new ThrottlerStorageRedisService(
   *   new Redis({
   *     host: process.env.REDIS_HOST,
   *     port: process.env.REDIS_PORT,
   *   })
   * ),
   */
  // storage: undefined, // Uses default in-memory storage

  /**
   * Pre-configured rate limit tiers for different endpoint types
   *
   * Use these for consistent rate limiting across your application:
   * - `tiers.auth`: Authentication endpoints (5 req/min in prod)
   * - `tiers.mutation`: Write operations (60 req/min in prod)
   * - `tiers.query`: Read operations (300 req/min in prod)
   * - `tiers.public`: Public endpoints (100 req/min in prod)
   * - `tiers.upload`: File uploads (10 req/min in prod)
   */
  tiers: {
    /**
     * Authentication endpoints (login, register, password reset)
     * Very strict to prevent brute force attacks
     */
    auth: {
      name: 'auth',
      ttl: seconds(60),
      limit: isProduction ? 5 : 50,
    },

    /**
     * Mutation endpoints (POST, PUT, PATCH, DELETE)
     * Moderate limits to prevent abuse
     */
    mutation: {
      name: 'mutation',
      ttl: seconds(60),
      limit: isProduction ? 60 : 600,
    },

    /**
     * Query endpoints (GET)
     * More relaxed limits for read operations
     */
    query: {
      name: 'query',
      ttl: seconds(60),
      limit: isProduction ? 300 : 3000,
    },

    /**
     * Public endpoints (no authentication required)
     * Generous limits but still protected
     */
    public: {
      name: 'public',
      ttl: seconds(60),
      limit: isProduction ? 100 : 1000,
    },

    /**
     * File upload endpoints
     * Stricter limits due to resource intensity
     */
    upload: {
      name: 'upload',
      ttl: seconds(60),
      limit: isProduction ? 10 : 100,
    },
  },
};
