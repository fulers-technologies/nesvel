import type { OrmException } from '@/types/orm-exception.type';

import { QueryException } from '@/exceptions/query.exception';
import { DatabaseException } from '@/exceptions/database.exception';
import { ValidationException } from '@/exceptions/validation.exception';
import { ModelNotFoundException } from '@/exceptions/model-not-found.exception';
import { MassAssignmentException } from '@/exceptions/mass-assignment.exception';
import { RelationNotFoundException } from '@/exceptions/relation-not-found.exception';

/**
 * Check if an error is an ORM exception
 *
 * Type guard function that determines if a given error is one of the
 * custom ORM exception types defined in the package.
 *
 * @param error - The error to check
 * @returns True if the error is one of our ORM exceptions
 *
 * @example
 * ```typescript
 * try {
 *   await repository.findOrFail(id);
 * } catch (error) {
 *   if (isOrmException(error)) {
 *     console.log('ORM Error:', error.message);
 *     console.log('API Message:', getOrmExceptionApiMessage(error));
 *   } else {
 *     console.log('Unknown error:', error);
 *   }
 * }
 * ```
 *
 * @author Nesvel
 * @since 1.0.0
 */
export function isOrmException(error: any): error is OrmException {
  return (
    error instanceof DatabaseException ||
    error instanceof QueryException ||
    error instanceof ModelNotFoundException ||
    error instanceof MassAssignmentException ||
    error instanceof RelationNotFoundException ||
    error instanceof ValidationException
  );
}

/**
 * Get a user-friendly API message from any ORM exception
 *
 * Extracts a sanitized, user-facing error message from ORM exceptions.
 * This message is safe to send to API clients without exposing sensitive
 * internal details.
 *
 * @param error - The ORM exception
 * @returns API-friendly error message
 *
 * @example
 * ```typescript
 * try {
 *   await repository.findOrFail(999);
 * } catch (error) {
 *   if (isOrmException(error)) {
 *     return res.status(404).json({
 *       message: getOrmExceptionApiMessage(error)
 *     });
 *   }
 * }
 * ```
 *
 * @example
 * ```typescript
 * // In a NestJS exception filter
 * @Catch()
 * export class OrmExceptionFilter implements ExceptionFilter {
 *   catch(exception: any, host: ArgumentsHost) {
 *     const response = host.switchToHttp().getResponse();
 *
 *     if (isOrmException(exception)) {
 *       response.status(exception.getStatusCode()).json({
 *         statusCode: exception.getStatusCode(),
 *         message: getOrmExceptionApiMessage(exception),
 *         timestamp: new Date().toISOString(),
 *       });
 *     }
 *   }
 * }
 * ```
 *
 * @author Nesvel
 * @since 1.0.0
 */
export function getOrmExceptionApiMessage(error: OrmException): string {
  if ('getApiMessage' in error && typeof error.getApiMessage === 'function') {
    return error.getApiMessage();
  }
  return 'An error occurred while processing your request.';
}

/**
 * Get detailed logging information from any ORM exception
 *
 * Extracts comprehensive error details suitable for logging and debugging.
 * This includes internal details that should not be exposed to end users
 * but are valuable for developers and monitoring systems.
 *
 * @param error - The ORM exception
 * @returns Detailed error information for logging
 *
 * @example
 * ```typescript
 * try {
 *   await repository.create(invalidData);
 * } catch (error) {
 *   if (isOrmException(error)) {
 *     const details = getOrmExceptionLogDetails(error);
 *     logger.error('ORM operation failed', details);
 *     // Logs: { name, message, stack, query, parameters, etc. }
 *   }
 * }
 * ```
 *
 * @example
 * ```typescript
 * // In a NestJS interceptor for logging
 * @Injectable()
 * export class LoggingInterceptor implements NestInterceptor {
 *   intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
 *     return next.handle().pipe(
 *       catchError(error => {
 *         if (isOrmException(error)) {
 *           const details = getOrmExceptionLogDetails(error);
 *           this.logger.error('Database operation failed', details);
 *         }
 *         throw error;
 *       })
 *     );
 *   }
 * }
 * ```
 *
 * @author Nesvel
 * @since 1.0.0
 */
export function getOrmExceptionLogDetails(error: OrmException): Record<string, any> {
  if ('getLogDetails' in error && typeof error.getLogDetails === 'function') {
    return error.getLogDetails();
  }

  return {
    name: error.name,
    message: error.message,
    stack: error.stack,
  };
}
