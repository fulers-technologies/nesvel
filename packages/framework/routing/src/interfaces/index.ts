/**
 * Interface exports for the API endpoint decorator.
 *
 * This module provides all TypeScript interfaces used to configure
 * API endpoints, including options for authentication, caching,
 * security, responses, and more.
 */

export type { RouteOptions } from './api-endpoint-options.interface';
export type { AuthOptions } from './auth-options.interface';
export type { ResponseOptions } from './response-options.interface';
export type { CacheConfig } from './cache-config.interface';
export type { CorsOptions } from './cors-options.interface';
export type { SecurityOptions } from './security-options.interface';
export type { TelemetryOptions } from './telemetry-options.interface';
export type { CircuitBreakerOptions } from './circuit-breaker-options.interface';
export type { RetryOptions } from './retry-options.interface';
export type { ThrottleOptions } from './throttle-options.interface';
export type { FileUploadOptions } from './file-upload-options.interface';
export type { ParsedPath } from './parsed-path.interface';
