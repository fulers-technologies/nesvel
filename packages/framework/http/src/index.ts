/**
 * Nesvel HTTP Package
 *
 * Laravel-inspired HTTP client and server utilities for NestJS.
 * Provides a fluent API for making HTTP requests and handling responses,
 * along with enhanced Express request/response helpers.
 *
 * This package re-exports Express and @nestjs/axios for convenience,
 * allowing developers to import everything they need from a single package.
 *
 * @module @nesvel/nestjs-http
 * @author Nesvel Team
 * @since 1.0.0
 *
 * @example
 * ```typescript
 * // HTTP Client usage
 * import { HttpClient } from '@nesvel/nestjs-http';
 *
 * const response = await HttpClient
 *   .withToken(token)
 *   .timeout(30)
 *   .retry(3)
 *   .post('https://api.example.com/users', { name: 'John' });
 *
 * // Enhanced Express usage
 * import { Request, Response } from '@nesvel/nestjs-http';
 *
 * @Controller('users')
 * export class UsersController {
 *   @Post()
 *   create(@Req() request: Request) {
 *     const data = request.only('name', 'email');
 *     return { data };
 *   }
 * }
 * ```
 */

// ============================================================================
// Re-export Express types and utilities
// ============================================================================
// Export all Express types, interfaces, and utilities for convenience.
// This allows users to import Express-related functionality directly
// from @nesvel/nestjs-http without needing to install express separately.
// Note: Express uses 'export =' so we import and re-export
import express from 'express';
export { express as Express };

// Re-export native Express types for edge cases only
// Most users should use our Request/Response classes instead
export type {
  Request as ExpressRequest,
  Response as ExpressResponse,
  NextFunction,
  RequestHandler,
  ErrorRequestHandler,
  Application,
  Router,
} from 'express';

// ============================================================================
// Re-export @nestjs/axios module (excluding HttpModule to avoid conflict)
// ============================================================================
// Export the NestJS Axios module and HttpService for users who want
// to use the native NestJS HTTP client alongside our custom implementation.
// We exclude HttpModule to avoid naming conflict with our own HttpModule.
export { HttpService } from '@nestjs/axios';

// ============================================================================
// HTTP Client - Laravel-style fluent HTTP client
// ============================================================================
// Main HTTP client factory and fluent request builder
export * from './client/http-client';
export * from './client/pending-request';
export * from './client/response';
export * from './client/response-sequence';
export * from './client/pool';

// ============================================================================
// HTTP Client Retry & Circuit Breaker
// ============================================================================
// Enterprise-grade retry strategies and circuit breakers for resilience
export * from './client/retry';
export * from './client/circuit-breaker';

// ============================================================================
// HTTP Client Exceptions
// ============================================================================
// Exception classes for HTTP client errors
export * from './client/exceptions';

// ============================================================================
// HTTP Client Concerns (mixins/traits)
// ============================================================================
// Reusable concerns for HTTP client functionality
export * from './client/concerns';

// ============================================================================
// HTTP Server - Enhanced Request/Response (PRIMARY EXPORTS)
// ============================================================================
// Our enhanced Request and Response classes - use these everywhere!
// They wrap Express Request/Response with Laravel-style helper methods
export { Request } from './server/request';
export { Response } from './server/response';
export { UploadedFile } from './server/uploaded-file';
export * from './server/json-response';
export * from './server/redirect-response';
export * from './server/streamed-response';
export * from './server/file-response';

// ============================================================================
// HTTP Server Concerns
// ============================================================================
// Concerns for server-side request/response handling (mixins)
export * from './server/concerns/interacts-with-input';
export * from './server/concerns/interacts-with-files';
export * from './server/concerns/interacts-with-content-types';
export * from './server/concerns/interacts-with-flash-data';
export * from './server/concerns/can-be-precognitive';

// ============================================================================
// HTTP Server Middleware
// ============================================================================
// Common HTTP middleware for NestJS applications
export * from './server/middleware/base-http.middleware';
export * from './server/middleware/handle-cors';
export * from './server/middleware/trust-proxies';
export * from './server/middleware/validate-post-size';

// ============================================================================
// Rate Limiting - @nestjs/throttler
// ============================================================================
// Re-export NestJS's official throttler for server-side rate limiting.
// Use @Throttle() decorator or ThrottlerGuard for protecting your endpoints.
// Documentation: https://docs.nestjs.com/security/rate-limiting
export * from '@nestjs/throttler';

// ============================================================================
// TypeScript Types and Interfaces
// ============================================================================
// All interfaces are now centralized in the interfaces directory
export * from './interfaces';

// ============================================================================
// Decorators - Drop-in replacements for @Req() and @Res()
// ============================================================================
// Custom decorators that provide our enhanced Request/Response
export * from './decorators';

// ============================================================================
// NestJS Module
// ============================================================================
// Main NestJS module for dependency injection
export * from './http.module';
