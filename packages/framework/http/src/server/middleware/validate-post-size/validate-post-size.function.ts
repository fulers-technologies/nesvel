import { ValidatePostSizeMiddleware } from './validate-post-size';
import type { ValidatePostSizeOptions } from '../../../interfaces';

/**
 * Validate Post Size Factory Function
 *
 * Creates a ValidatePostSizeMiddleware instance with the specified options.
 * This is the recommended way to use the middleware in functional style.
 *
 * @param options - Size validation configuration
 * @returns ValidatePostSizeMiddleware instance
 *
 * @example Basic usage
 * ```typescript
 * import { Module, MiddlewareConsumer } from '@nestjs/common';
 * import { validatePostSize } from '@nesvel/nestjs-http';
 *
 * @Module({})
 * export class AppModule {
 *   configure(consumer: MiddlewareConsumer) {
 *     consumer
 *       .apply(validatePostSize({ maxSize: '10mb' }))
 *       .forRoutes('*');
 *   }
 * }
 * ```
 *
 * @example With custom error message
 * ```typescript
 * consumer
 *   .apply(validatePostSize({
 *     maxSize: '5mb',
 *     errorMessage: 'File is too large. Maximum is 5MB.',
 *     statusCode: 413,
 *   }))
 *   .forRoutes('upload/*');
 * ```
 *
 * @example Disable Content-Length check
 * ```typescript
 * consumer
 *   .apply(validatePostSize({
 *     maxSize: '10mb',
 *     checkContentLength: false,
 *   }))
 *   .forRoutes('*');
 * ```
 */
export function validatePostSize(
  options: ValidatePostSizeOptions = {}
): ValidatePostSizeMiddleware {
  return new ValidatePostSizeMiddleware(options);
}
