import { Type, PipeTransform } from '@nestjs/common';
import {
  ApiOperationOptions,
  ApiParamOptions,
  ApiQueryOptions,
  ApiBodyOptions,
  ApiHeaderOptions,
} from '@nestjs/swagger';
import { AuthOptions } from './auth-options.interface';
import { ResponseOptions } from './response-options.interface';
import { CacheConfig } from './cache-config.interface';
import { CorsOptions } from './cors-options.interface';
import { SecurityOptions } from './security-options.interface';
import { TelemetryOptions } from './telemetry-options.interface';
import { CircuitBreakerOptions } from './circuit-breaker-options.interface';
import { RetryOptions } from './retry-options.interface';
import { ThrottleOptions } from './throttle-options.interface';
import { FileUploadOptions } from './file-upload-options.interface';

/**
 * Comprehensive configuration options for the @Route decorator.
 *
 * This interface combines all possible configuration options for defining
 * API endpoints including HTTP method, path, authentication, responses,
 * caching, security, and more. It provides a unified way to configure
 * both NestJS routing and OpenAPI documentation.
 *
 * @template TBody - Type of the request body DTO
 *
 * @example
 * Basic GET endpoint:
 * ```typescript
 * @Route({
 *   method: HttpMethod.GET,
 *   path: '/users',
 *   documentation: { summary: 'List all users' }
 * })
 * async getUsers() { ... }
 * ```
 *
 * @example
 * POST endpoint with authentication and caching:
 * ```typescript
 * @Route({
 *   method: HttpMethod.POST,
 *   path: '/users',
 *   auth: { bearer: true },
 *   body: CreateUserDto,
 *   cache: { enabled: true, ttl: 300 },
 *   responses: {
 *     created: { description: 'User created successfully' },
 *     badRequest: 'Invalid user data'
 *   }
 * })
 * async createUser(@Body() dto: CreateUserDto) { ... }
 * ```
 */
export interface RouteOptions<TBody = any> {
  /**
   * Preset configuration to apply.
   *
   * Presets provide pre-configured settings for common endpoint types.
   * When specified, preset values are applied first, then overridden by
   * explicit options.
   *
   * @see EndpointPreset
   */
  preset?: string;

  /**
   * HTTP method for the endpoint.
   *
   * Determines which HTTP verb the endpoint responds to.
   * If not specified, defaults to GET.
   *
   * @default HttpMethod.GET
   * @see HttpMethod
   */
  method?: string;

  /**
   * URL path or paths for the endpoint.
   *
   * Defines the route path(s) where the endpoint will be accessible.
   * Can be a single path string or an array of path strings.
   * Supports path parameters using ':param' syntax.
   *
   * @example '/users'
   * @example ':id'
   * @example [':id/activate', ':id/enable']
   */
  path?: string | string[];

  /**
   * Disable all default configurations.
   *
   * When true, skips applying default headers, responses, and other
   * automatic configurations. Use for full manual control.
   *
   * @default false
   */
  disableDefaults?: boolean;

  /**
   * OpenAPI documentation options.
   *
   * Configures how the endpoint appears in Swagger/OpenAPI documentation.
   * Includes summary, description, operation ID, tags, and more.
   * Auto-generates values when not provided.
   */
  documentation?: ApiOperationOptions;

  /**
   * Authentication configuration.
   *
   * Specifies which authentication schemes are required for the endpoint.
   * Supports multiple schemes simultaneously.
   */
  auth?: AuthOptions;

  /**
   * Response configurations.
   *
   * Defines all possible HTTP responses for the endpoint including
   * success and error cases. Used for OpenAPI documentation and
   * runtime validation.
   */
  responses?: ResponseOptions;

  /**
   * Path parameter configurations.
   *
   * Documents parameters extracted from the URL path.
   * Each entry describes a parameter's name, type, and constraints.
   */
  params?: ApiParamOptions[];

  /**
   * Query parameter configurations.
   *
   * Documents parameters passed in the URL query string.
   * Includes validation rules and documentation.
   */
  queries?: ApiQueryOptions[];

  /**
   * Request body configuration.
   *
   * Specifies the expected request body structure.
   * Can be a DTO class or detailed configuration object.
   */
  body?: ApiBodyOptions | Type<TBody>;

  /**
   * Single file upload configuration.
   *
   * Enables file upload handling for a single file.
   * Configures field name, size limits, and allowed types.
   */
  file?: FileUploadOptions;

  /**
   * Multiple files upload configuration.
   *
   * Enables file upload handling for multiple files.
   * Configures field name, count limits, and allowed types.
   */
  files?: FileUploadOptions;

  /**
   * Request header configurations.
   *
   * Documents expected or required HTTP headers.
   * Default headers are automatically included unless disabled.
   */
  headers?: ApiHeaderOptions[];

  /**
   * Consumed content types.
   *
   * MIME types the endpoint can accept in request bodies.
   *
   * @default ['application/json', 'application/x-www-form-urlencoded']
   */
  consumes?: string[];

  /**
   * Produced content types.
   *
   * MIME types the endpoint can return in responses.
   *
   * @default ['application/json']
   */
  produces?: string[];

  /**
   * OpenAPI extensions.
   *
   * Custom vendor extensions for OpenAPI specification.
   * Keys should start with 'x-' per OpenAPI convention.
   *
   * @example { 'x-custom-field': 'value' }
   */
  extensions?: Record<string, any>;

  /**
   * HTTP status code for successful responses.
   *
   * Overrides the default status code for the HTTP method.
   *
   * @example HttpStatus.CREATED for POST
   * @example HttpStatus.NO_CONTENT for DELETE
   */
  httpCode?: number;

  /**
   * Response headers to set.
   *
   * Headers automatically added to all responses from this endpoint.
   * Useful for CORS, caching directives, and custom headers.
   */
  responseHeaders?: Record<string, string>;

  /**
   * Guards to apply to the endpoint.
   *
   * NestJS guards for authentication, authorization, and other
   * request validation logic.
   */
  guards?: Array<Type<any>>;

  /**
   * Pipes to apply to the endpoint.
   *
   * NestJS pipes for request transformation and validation.
   */
  pipes?: Array<Type<any> | PipeTransform>;

  /**
   * Interceptors to apply to the endpoint.
   *
   * NestJS interceptors for request/response transformation,
   * logging, caching, and other cross-cutting concerns.
   */
  interceptors?: Array<Type<any>>;

  /**
   * Exception filters to apply to the endpoint.
   *
   * NestJS exception filters for custom error handling.
   */
  filters?: Array<Type<any>>;

  /**
   * Custom metadata to attach to the endpoint.
   *
   * Key-value pairs stored as route metadata, accessible in
   * guards, interceptors, and other decorators.
   */
  metadata?: Record<string, any>;

  /**
   * Redirect configuration.
   *
   * Automatically redirects requests to a different URL.
   */
  redirect?: {
    /** Target URL for redirection */
    url: string;
    /** HTTP status code (301, 302, etc.) */
    statusCode?: number;
  };

  /**
   * Template to render for this endpoint.
   *
   * Template file name for server-side rendering.
   * Used with template engines like EJS, Pug, etc.
   */
  render?: string;

  /**
   * API version or versions.
   *
   * Enables API versioning for this endpoint.
   * Can be a single version or array of versions.
   *
   * @example '1'
   * @example ['1', '2']
   */
  version?: string | string[];

  /**
   * Enable Server-Sent Events (SSE).
   *
   * Configures the endpoint to stream events to clients.
   *
   * @default false
   */
  sse?: boolean;

  /**
   * Exclude from OpenAPI documentation.
   *
   * When true, the endpoint won't appear in Swagger UI.
   * Useful for internal or deprecated endpoints.
   *
   * @default false
   */
  exclude?: boolean;

  /**
   * Throttle configuration.
   *
   * Rate limiting specific to this endpoint.
   * Provide empty object to enable with defaults.
   */
  throttle?: ThrottleOptions;

  /**
   * Cache configuration.
   *
   * Response caching settings for improved performance.
   */
  cache?: CacheConfig;

  /**
   * Required roles for authorization.
   *
   * Array of role names required to access the endpoint.
   * Used with role-based access control (RBAC).
   *
   * @example ['admin', 'moderator']
   */
  roles?: string[];

  /**
   * CORS configuration.
   *
   * Cross-Origin Resource Sharing settings specific to this endpoint.
   */
  cors?: CorsOptions;

  /**
   * Security configuration.
   *
   * Security policies including CSP, rate limiting, IP whitelisting.
   */
  security?: SecurityOptions;

  /**
   * Telemetry configuration.
   *
   * Distributed tracing and metrics collection settings.
   */
  telemetry?: TelemetryOptions;

  /**
   * Feature flag identifier.
   *
   * Associates the endpoint with a feature flag for gradual rollouts.
   * Endpoint is only accessible when the feature is enabled.
   */
  featureFlag?: string;

  /**
   * Circuit breaker configuration.
   *
   * Prevents cascading failures by temporarily blocking failing endpoints.
   * Provide empty object to enable with defaults.
   */
  circuitBreaker?: CircuitBreakerOptions;

  /**
   * Retry policy configuration.
   *
   * Automatically retries failed requests with configurable delays.
   * Provide empty object to enable with defaults.
   */
  retry?: RetryOptions;

  /**
   * Mark endpoint as deprecated.
   *
   * Adds deprecation notice to API documentation and optionally
   * sets Sunset header indicating when the endpoint will be removed.
   *
   * @example
   * ```typescript
   * deprecated: {
   *   reason: 'Use /v2/users instead',
   *   sunset: new Date('2025-12-31'),
   *   migration: 'https://docs.example.com/migration'
   * }
   * ```
   */
  deprecated?: {
    /** Reason for deprecation */
    reason?: string;
    /** Date when the endpoint will be removed */
    sunset?: Date;
    /** Link to migration guide or alternative endpoint */
    migration?: string;
  };

  /**
   * Request/Response logging configuration.
   *
   * Enables detailed logging for debugging and audit trails.
   * Useful for tracking API usage and troubleshooting issues.
   *
   * @example
   * ```typescript
   * logging: {
   *   enabled: true,
   *   logBody: true,
   *   logHeaders: false,
   *   logQuery: true
   * }
   * ```
   */
  logging?: {
    /** Enable logging for this endpoint */
    enabled: boolean;
    /** Log request body */
    logBody?: boolean;
    /** Log request headers */
    logHeaders?: boolean;
    /** Log query parameters */
    logQuery?: boolean;
    /** Log response body */
    logResponse?: boolean;
  };

  /**
   * Batch operation configuration.
   *
   * Enables processing multiple items in a single request.
   * Useful for bulk operations like creating/updating multiple records.
   *
   * @example
   * ```typescript
   * batch: {
   *   enabled: true,
   *   maxItems: 100
   * }
   * ```
   */
  batch?: {
    /** Enable batch operations */
    enabled: boolean;
    /** Maximum number of items per batch request */
    maxItems?: number;
    /** Allow partial success (continue on individual item failures) */
    allowPartialSuccess?: boolean;
  };
}
