import type { QueryException } from '@/exceptions/query.exception';
import type { DatabaseException } from '@/exceptions/database.exception';
import type { ValidationException } from '@/exceptions/validation.exception';
import type { ModelNotFoundException } from '@/exceptions/model-not-found.exception';
import type { MassAssignmentException } from '@/exceptions/mass-assignment.exception';
import type { RelationNotFoundException } from '@/exceptions/relation-not-found.exception';

/**
 * Union type representing all ORM exception types
 *
 * This type is a discriminated union of all custom exception classes
 * provided by the ORM package. It's useful for type-safe error handling
 * and ensures that all exception types are properly handled in catch blocks.
 *
 * @example
 * ```typescript
 * function handleOrmError(error: OrmException) {
 *   // TypeScript knows error is one of the ORM exception types
 *   if (error instanceof ModelNotFoundException) {
 *     console.log('Resource not found:', error.getApiMessage());
 *   } else if (error instanceof ValidationException) {
 *     console.log('Validation failed:', error.getErrors());
 *   }
 * }
 * ```
 *
 * @example
 * ```typescript
 * // In a try-catch with type narrowing
 * try {
 *   await repository.findOrFail(id);
 * } catch (error) {
 *   if (isOrmException(error)) {
 *     // error is typed as OrmException here
 *     const apiMessage = getOrmExceptionApiMessage(error);
 *     const logDetails = getOrmExceptionLogDetails(error);
 *   }
 * }
 * ```
 *
 * @author Nesvel
 * @since 1.0.0
 */
export type OrmException =
  | DatabaseException
  | QueryException
  | ModelNotFoundException
  | MassAssignmentException
  | RelationNotFoundException
  | ValidationException;
