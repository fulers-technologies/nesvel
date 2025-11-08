import { QueryException } from '@/exceptions/query.exception';
import { DatabaseException } from '@/exceptions/database.exception';
import { ModelNotFoundException } from '@/exceptions/model-not-found.exception';
import { EntityOperation } from '@/enums';
import type { DatabaseOperationContext } from '@/interfaces/database-operation-context.interface';

/**
 * Database Exception Handler Utility
 *
 * Provides centralized database error handling and conversion to domain exceptions.
 * Detects specific database error types and converts them to appropriate domain exceptions.
 *
 * @example
 * ```typescript
 * async createUser(data: UserData): Promise<User> {
 *   try {
 *     const user = this.em.create(User, data);
 *     await this.em.flush();
 *     return user;
 *   } catch (error: Error | any) {
 *     throw DatabaseExceptionHandler.handle(error, {
 *       entityName: 'User',
 *       operation: 'create',
 *       context: { data }
 *     });
 *   }
 * }
 * ```
 *
 * @author Nesvel Team
 * @since 1.0.0
 */
export class DatabaseExceptionHandler {
  /**
   * Handle and convert database errors to domain exceptions
   *
   * Main entry point for exception handling. Detects the error type
   * and converts it to the appropriate domain exception.
   *
   * @param error - The raw error from database/ORM
   * @param context - Context about the operation
   * @returns Domain exception (QueryException, DatabaseException, etc.)
   *
   * @example
   * ```typescript
   * try {
   *   await this.em.persistAndFlush(entity);
   * } catch (error: Error | any) {
   *   throw DatabaseExceptionHandler.handle(error, {
   *     entityName: 'User',
   *     operation: 'save'
   *   });
   * }
   * ```
   */
  static handle(error: any, context: DatabaseOperationContext): Error {
    // Re-throw if already a domain exception
    if (this.isDomainException(error)) {
      return error;
    }

    const errorMessage = this.getErrorMessage(error);

    // Check error types in order of specificity
    if (this.isConstraintViolation(errorMessage)) {
      return this.createConstraintException(error, context, errorMessage);
    }

    if (this.isConnectionError(errorMessage)) {
      return this.createConnectionException(error, context);
    }

    if (this.isSyntaxError(errorMessage)) {
      return this.createSyntaxException(error, context);
    }

    if (this.isDeadlockError(errorMessage)) {
      return this.createDeadlockException(error, context);
    }

    if (this.isTimeoutError(errorMessage)) {
      return this.createTimeoutException(error, context);
    }

    // Generic database error
    return this.createGenericException(error, context);
  }

  /**
   * Check if error is already a domain exception
   *
   * Public method to check if an error is one of our custom domain exceptions.
   * Use this to avoid re-wrapping exceptions that are already properly typed.
   *
   * @param error - Error to check
   * @returns True if already a domain exception
   *
   * @example
   * ```typescript
   * try {
   *   await someOperation();
   * } catch (error: Error | any) {
   *   if (DatabaseExceptionHandler.isDomainException(error)) {
   *     throw error; // Already properly formatted
   *   }
   *   // Handle raw database error
   * }
   * ```
   */
  static isDomainException(error: any): boolean {
    return (
      error instanceof ModelNotFoundException ||
      error instanceof QueryException ||
      error instanceof DatabaseException
    );
  }

  /**
   * Extract error message from various error types
   *
   * @param error - Error object
   * @returns Lowercase error message string
   */
  private static getErrorMessage(error: any): string {
    return (error?.message || error?.toString() || '').toLowerCase();
  }

  // ============================================================================
  // ERROR TYPE DETECTION
  // ============================================================================

  /**
   * Check if error is a constraint violation
   *
   * Detects unique constraints, foreign keys, check constraints, etc.
   */
  private static isConstraintViolation(errorMessage: string): boolean {
    return (
      errorMessage.includes('unique constraint') ||
      errorMessage.includes('duplicate key') ||
      errorMessage.includes('duplicate entry') ||
      errorMessage.includes('foreign key') ||
      errorMessage.includes('violates') ||
      errorMessage.includes('constraint') ||
      errorMessage.includes('check constraint') ||
      errorMessage.includes('not null') ||
      errorMessage.includes('integrity constraint')
    );
  }

  /**
   * Check if error is a connection error
   *
   * Detects connection failures, timeouts, network issues, etc.
   */
  private static isConnectionError(errorMessage: string): boolean {
    return (
      errorMessage.includes('connection') ||
      errorMessage.includes('econnrefused') ||
      errorMessage.includes('enotfound') ||
      errorMessage.includes('network') ||
      errorMessage.includes('connect') ||
      errorMessage.includes('pool') ||
      errorMessage.includes('etimedout')
    );
  }

  /**
   * Check if error is a SQL syntax error
   *
   * Detects invalid SQL, unknown columns, invalid field names, etc.
   */
  private static isSyntaxError(errorMessage: string): boolean {
    return (
      errorMessage.includes('syntax') ||
      errorMessage.includes('column') ||
      errorMessage.includes('unknown column') ||
      errorMessage.includes('no such column') ||
      errorMessage.includes('invalid field') ||
      errorMessage.includes('near')
    );
  }

  /**
   * Check if error is a deadlock
   *
   * Detects database deadlocks and lock wait timeouts.
   */
  private static isDeadlockError(errorMessage: string): boolean {
    return (
      errorMessage.includes('deadlock') ||
      errorMessage.includes('lock wait timeout') ||
      errorMessage.includes('lock timeout')
    );
  }

  /**
   * Check if error is a timeout
   *
   * Detects query timeouts and execution timeouts.
   */
  private static isTimeoutError(errorMessage: string): boolean {
    return (
      errorMessage.includes('timeout') ||
      errorMessage.includes('timed out') ||
      errorMessage.includes('execution exceeded')
    );
  }

  // ============================================================================
  // EXCEPTION CREATION
  // ============================================================================

  /**
   * Create constraint violation exception
   */
  private static createConstraintException(
    error: Error,
    context: DatabaseOperationContext,
    errorMessage: string,
  ): QueryException {
    let detailedMessage = `Data integrity constraint violated during ${context.operation} on ${context.entityName}`;

    // Add more specific constraint type if detected
    if (errorMessage.includes('unique') || errorMessage.includes('duplicate')) {
      detailedMessage = `Duplicate entry detected during ${context.operation} on ${context.entityName}`;
    } else if (errorMessage.includes('foreign key')) {
      detailedMessage = `Foreign key constraint violated during ${context.operation} on ${context.entityName}`;
    } else if (errorMessage.includes('not null')) {
      detailedMessage = `Required field missing during ${context.operation} on ${context.entityName}`;
    }

    return QueryException.make(
      context.connection || 'default',
      '',
      [],
      error,
      detailedMessage,
      'CONSTRAINT_VIOLATION',
    );
  }

  /**
   * Create connection error exception
   */
  private static createConnectionException(
    error: Error,
    context: DatabaseOperationContext,
  ): DatabaseException {
    return DatabaseException.make(
      'CONNECTION_FAILED',
      `Database connection failed during ${context.operation} on ${context.entityName}: ${error.message}`,
      context.context || {},
      context.connection || 'default',
      error,
    );
  }

  /**
   * Create SQL syntax error exception
   */
  private static createSyntaxException(
    error: Error,
    context: DatabaseOperationContext,
  ): QueryException {
    let detailedMessage = `SQL syntax error during ${context.operation} on ${context.entityName}`;

    // Extract field name if present in context
    if (context.context?.field) {
      detailedMessage = `Invalid field '${context.context.field}' in ${context.operation} operation on ${context.entityName}`;
    }

    return QueryException.make(
      context.connection || 'default',
      '',
      [],
      error,
      detailedMessage,
      'SYNTAX_ERROR',
    );
  }

  /**
   * Create deadlock exception
   */
  private static createDeadlockException(
    error: Error,
    context: DatabaseOperationContext,
  ): DatabaseException {
    return DatabaseException.make(
      'DEADLOCK_DETECTED',
      `Database deadlock detected during ${context.operation} on ${context.entityName}. Please retry the operation.`,
      context.context || {},
      context.connection || 'default',
      error,
    );
  }

  /**
   * Create timeout exception
   */
  private static createTimeoutException(
    error: Error,
    context: DatabaseOperationContext,
  ): DatabaseException {
    return DatabaseException.make(
      'QUERY_TIMEOUT',
      `Query timeout during ${context.operation} on ${context.entityName}: ${error.message}`,
      context.context || {},
      context.connection || 'default',
      error,
    );
  }

  /**
   * Create generic database exception
   */
  private static createGenericException(
    error: Error,
    context: DatabaseOperationContext,
  ): QueryException {
    return QueryException.make(
      context.connection || 'default',
      '',
      [],
      error,
      `Failed to ${context.operation} ${context.entityName}: ${error.message}`,
    );
  }

  // ============================================================================
  // CONVENIENCE METHODS FOR COMMON OPERATIONS
  // ============================================================================

  /**
   * Handle error for create/insert operations
   *
   * @example
   * ```typescript
   * try {
   *   await this.em.persistAndFlush(entity);
   * } catch (error: Error | any) {
   *   throw DatabaseExceptionHandler.handleCreate(error, 'User', { data });
   * }
   * ```
   */
  static handleCreate(error: any, entityName: string, context?: Record<string, any>): Error {
    return this.handle(error, {
      entityName,
      operation: EntityOperation.CREATED,
      context,
    });
  }

  /**
   * Handle error for update operations
   *
   * @example
   * ```typescript
   * try {
   *   await this.em.flush();
   * } catch (error: Error | any) {
   *   throw DatabaseExceptionHandler.handleUpdate(error, 'User', { id, data });
   * }
   * ```
   */
  static handleUpdate(error: any, entityName: string, context?: Record<string, any>): Error {
    return this.handle(error, {
      entityName,
      operation: EntityOperation.UPDATED,
      context,
    });
  }

  /**
   * Handle error for delete operations
   *
   * @example
   * ```typescript
   * try {
   *   await this.em.removeAndFlush(entity);
   * } catch (error: Error | any) {
   *   throw DatabaseExceptionHandler.handleDelete(error, 'User', { id });
   * }
   * ```
   */
  static handleDelete(error: any, entityName: string, context?: Record<string, any>): Error {
    return this.handle(error, {
      entityName,
      operation: EntityOperation.DELETED,
      context,
    });
  }

  /**
   * Handle error for find/query operations
   *
   * @example
   * ```typescript
   * try {
   *   return await this.em.findOne(User, criteria);
   * } catch (error: Error | any) {
   *   throw DatabaseExceptionHandler.handleFind(error, 'User', { criteria });
   * }
   * ```
   */
  static handleFind(error: any, entityName: string, context?: Record<string, any>): Error {
    return this.handle(error, {
      entityName,
      operation: EntityOperation.LOADED,
      context,
    });
  }

  /**
   * Handle error for count operations
   *
   * @example
   * ```typescript
   * try {
   *   return await this.em.count(User, where);
   * } catch (error: Error | any) {
   *   throw DatabaseExceptionHandler.handleCount(error, 'User', { where });
   * }
   * ```
   */
  static handleCount(error: any, entityName: string, context?: Record<string, any>): Error {
    return this.handle(error, {
      entityName,
      operation: EntityOperation.COUNTED,
      context,
    });
  }

  /**
   * Handle error for aggregation operations (sum, avg, min, max)
   *
   * @example
   * ```typescript
   * try {
   *   return await this.em.getConnection().execute(sql);
   * } catch (error: Error | any) {
   *   throw DatabaseExceptionHandler.handleAggregation(error, 'User', EntityOperation.SUM, { field, where });
   * }
   * ```
   */
  static handleAggregation(
    error: any,
    entityName: string,
    aggregationType:
      | EntityOperation.SUM
      | EntityOperation.AVG
      | EntityOperation.MIN
      | EntityOperation.MAX,
    context?: Record<string, any>,
  ): Error {
    return this.handle(error, {
      entityName,
      operation: aggregationType,
      context,
    });
  }

  /**
   * Handle error for pagination operations
   *
   * @example
   * ```typescript
   * try {
   *   return await this.findAndCount(where, options);
   * } catch (error: Error | any) {
   *   throw DatabaseExceptionHandler.handlePagination(error, 'User', { perPage });
   * }
   * ```
   */
  static handlePagination(error: any, entityName: string, context?: Record<string, any>): Error {
    return this.handle(error, {
      entityName,
      operation: EntityOperation.PAGINATED,
      context,
    });
  }
}
