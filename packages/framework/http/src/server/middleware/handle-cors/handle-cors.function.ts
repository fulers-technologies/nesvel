import { HandleCorsMiddleware } from './handle-cors';
import type { HandleCorsOptions } from '../../../interfaces';

/**
 * Handle CORS Factory Function
 *
 * Creates a HandleCorsMiddleware instance with the specified options.
 * This is the recommended way to use the middleware in functional style.
 *
 * @param options - CORS configuration options
 * @returns HandleCorsMiddleware instance
 *
 * @example Basic usage
 * ```typescript
 * import { Module, MiddlewareConsumer } from '@nestjs/common';
 * import { handleCors } from '@nesvel/nestjs-http';
 *
 * @Module({})
 * export class AppModule {
 *   configure(consumer: MiddlewareConsumer) {
 *     consumer
 *       .apply(handleCors())
 *       .forRoutes('*');
 *   }
 * }
 * ```
 *
 * @example With specific origins
 * ```typescript
 * consumer
 *   .apply(handleCors({
 *     origin: ['https://example.com', 'https://app.example.com'],
 *     credentials: true,
 *   }))
 *   .forRoutes('*');
 * ```
 *
 * @example With custom methods
 * ```typescript
 * consumer
 *   .apply(handleCors({
 *     methods: ['GET', 'POST', 'PUT', 'DELETE'],
 *     allowedHeaders: ['Content-Type', 'Authorization'],
 *   }))
 *   .forRoutes('api/*');
 * ```
 *
 * @example With dynamic origin function
 * ```typescript
 * consumer
 *   .apply(handleCors({
 *     origin: (origin) => origin.endsWith('.example.com'),
 *     credentials: true,
 *   }))
 *   .forRoutes('*');
 * ```
 */
export function handleCors(options: HandleCorsOptions = {}): HandleCorsMiddleware {
  return HandleCorsMiddleware.make(options);
}
