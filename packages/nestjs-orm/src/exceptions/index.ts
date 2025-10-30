/**
 * ORM Exceptions Module
 *
 * This module exports all exception classes used throughout the ORM package.
 * These exceptions provide comprehensive error handling for database operations,
 * model management, validation, and other ORM-related functionality.
 *
 * Each exception class is designed to provide detailed error information,
 * support for logging, and user-friendly API messages while maintaining
 * compatibility with NestJS error handling patterns.
 *
 * @author Nesvel
 * @since 1.0.0
 */

// Core ORM Exceptions
export * from './database.exception';
export * from './query.exception';
export * from './model-not-found.exception';
export * from './mass-assignment.exception';

// Relationship and Validation Exceptions
export * from './relation-not-found.exception';
export * from './validation.exception';

// Import classes for type definitions and instanceof checks
import { DatabaseException } from './database.exception';
import { QueryException } from './query.exception';
import { ModelNotFoundException } from './model-not-found.exception';
import { MassAssignmentException } from './mass-assignment.exception';
import { RelationNotFoundException } from './relation-not-found.exception';
import { ValidationException } from './validation.exception';

// Type definitions for exception handling
export type OrmException =
  | DatabaseException
  | QueryException
  | ModelNotFoundException
  | MassAssignmentException
  | RelationNotFoundException
  | ValidationException;

/**
 * Check if an error is an ORM exception
 *
 * @param error - The error to check
 * @returns True if the error is one of our ORM exceptions
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
 * @param error - The ORM exception
 * @returns API-friendly error message
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
 * @param error - The ORM exception
 * @returns Detailed error information for logging
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
