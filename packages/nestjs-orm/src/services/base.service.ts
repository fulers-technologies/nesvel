import { Injectable, Logger } from '@nestjs/common';
import { EntityManager, FilterQuery, Loaded, QueryOrderMap, FindOptions } from '@mikro-orm/core';

import { BaseEntity } from '@/entities/base.entity';
import type { IService } from '@/interfaces/service.interface';
import type { IRepository } from '@/interfaces/repository.interface';
import { ModelNotFoundException, QueryException, ValidationException } from '@/exceptions';

/**
 * Abstract Base Service Class
 *
 * Provides a comprehensive Laravel Eloquent-inspired service layer implementation
 * for NestJS applications using MikroORM. This class serves as the foundation for
 * all business logic services, offering consistent CRUD operations, advanced query
 * capabilities, transaction management, and comprehensive error handling.
 *
 * Key Features:
 * - Full CRUD operations with Laravel-like method signatures
 * - Advanced querying with filtering, sorting, and pagination
 * - Bulk operations for performance optimization
 * - Transaction management with automatic rollback on errors
 * - Soft delete support for entities that implement it
 * - Comprehensive exception handling with detailed error information
 * - Built-in logging for all operations with configurable levels
 * - Type-safe operations with full TypeScript support
 * - Relationship management and eager loading capabilities
 *
 * Architecture:
 * - Service Layer: Contains business logic and validation
 * - Repository Pattern: Handles data access through injected repositories
 * - Exception Handling: Uses custom exceptions with detailed error context
 * - Logging: Structured logging for debugging and monitoring
 *
 * @template T - The entity type this service manages, must extend BaseEntity
 *
 * @example
 * ```typescript
 * @Injectable()
 * export class UserService extends BaseService<User> {
 *   constructor(
 *     @Inject('UserRepository') userRepository: IRepository<User>,
 *     em: EntityManager
 *   ) {
 *     super(userRepository, em, 'User');
 *   }
 *
 *   // Custom business logic methods
 *   async findByEmail(email: string): Promise<User | null> {
 *     return this.findBy({ email });
 *   }
 *
 *   async activateUser(id: number): Promise<User> {
 *     return this.update(id, { isActive: true });
 *   }
 * }
 * ```
 *
 * @author Nesvel Team
 * @since 1.0.0
 */
@Injectable()
export abstract class BaseService<T extends BaseEntity> implements IService<T> {
  /**
   * Logger instance for structured logging throughout the service
   *
   * Automatically configured with the service class name as context.
   * Uses NestJS Logger which supports different log levels and can be
   * configured for different environments (development, production, etc.).
   *
   * Log levels supported:
   * - error: Critical errors that need immediate attention
   * - warn: Warning messages for unexpected but non-critical situations
   * - log: General operational messages
   * - debug: Detailed information for debugging (disabled in production)
   * - verbose: Very detailed logging for development
   *
   * @protected
   * @readonly
   */
  protected readonly logger = new Logger(this.constructor.name);

  /**
   * The repository instance for database operations
   *
   * Provides access to all database operations through the repository pattern.
   * This abstraction allows for easier testing and separation of concerns
   * between business logic (service) and data access (repository).
   *
   * @protected
   * @readonly
   */
  protected readonly repository: IRepository<T>;

  /**
   * The MikroORM EntityManager for advanced operations
   *
   * Provides direct access to the ORM's entity manager for operations that
   * require lower-level control, such as transactions, bulk operations,
   * and custom queries that span multiple entities.
   *
   * @protected
   * @readonly
   */
  protected readonly em: EntityManager;

  /**
   * The entity name for error messages and logging
   *
   * Used throughout the service for generating meaningful error messages,
   * log entries, and exception details. Should match the actual entity
   * class name for consistency.
   *
   * @protected
   * @readonly
   */
  protected readonly entityName: string;

  /**
   * Constructor for BaseService
   *
   * Initializes the service with all required dependencies. The repository
   * provides data access capabilities, the entity manager enables transaction
   * management, and the entity name is used for error reporting.
   *
   * @param repository - The repository instance for database operations
   * @param em - The EntityManager instance for transaction handling and advanced operations
   * @param entityName - The name of the entity (used for error messages and logging)
   *
   * @example
   * ```typescript
   * constructor(
   *   @Inject('UserRepository') userRepository: IRepository<User>,
   *   em: EntityManager
   * ) {
   *   super(userRepository, em, 'User');
   * }
   * ```
   */
  constructor(repository: IRepository<T> | any) {
    this.repository = repository;

    this.em = repository.getEntityManager();
    this.entityName = repository.getEntityName();
  }

  /**
   * Get the underlying repository instance
   *
   * Provides direct access to the repository for operations that may require
   * lower-level database access or custom repository methods. Use this when
   * the service abstraction doesn't provide the needed functionality.
   *
   * @returns The repository instance for direct database operations
   *
   * @example
   * ```typescript
   * // Access custom repository methods
   * const userRepo = this;
   * const customResult = await userRepo.findByCustomCriteria(params);
   *
   * // Get native MikroORM repository for advanced queries
   * const nativeRepo = userRepo;
   * const queryBuilder = nativeRepo.createQueryBuilder('u');
   * ```
   *
   * @see {@link repository} For the protected property access
   */
  getRepository(): IRepository<T> {
    return this.repository;
  }
}
