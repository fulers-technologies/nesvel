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
export * from './query.exception';
export * from './database.exception';
export * from './model-not-found.exception';
export * from './mass-assignment.exception';

// Relationship and Validation Exceptions
export * from './validation.exception';
export * from './relation-not-found.exception';

// Re-export OrmException type from types module
export type { OrmException } from '@/types';

// Re-export exception utilities from utils module
export { isOrmException, getOrmExceptionApiMessage, getOrmExceptionLogDetails } from '@/utils';
