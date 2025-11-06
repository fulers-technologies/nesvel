import type { Request } from 'express';
import { Injectable, Logger } from '@nestjs/common';
import { EntityManager, FilterQuery, FindOptions, EntityData, Primary } from '@mikro-orm/core';

import { BaseRepository } from '@/repositories';
import { BaseEntity } from '@/entities/base.entity';
import type { IService } from '@/interfaces/service.interface';
import { ModelNotFoundException, InvalidArgumentException } from '@/exceptions';
import { PaginationConfig } from '@/interfaces/pagination/pagination-config.interface';
import type { SimplePaginator, CursorPaginator, LengthAwarePaginator } from '@/utils/pagination';

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
 *     @Inject('UserRepository') userRepository: BaseRepository<User>,
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
  protected readonly repository: BaseRepository<T>;

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
   *   @Inject('UserRepository') userRepository: BaseRepository<User>,
   *   em: EntityManager
   * ) {
   *   super(userRepository, em, 'User');
   * }
   * ```
   */
  constructor(repository: BaseRepository<T>) {
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
   * const userRepo = this.userService.getRepository();
   * const customResult = await userRepo.findByCustomCriteria(params);
   * ```
   *
   * @see {@link repository} For the protected property access
   */
  getRepository(): BaseRepository<T> {
    return this.repository;
  }

  /**
   * Execute operations within a database transaction
   *
   * Provides automatic transaction management with commit on success and rollback on error.
   * Essential for multi-step operations that need to maintain data consistency.
   *
   * @param callback - Function to execute within transaction context
   * @returns Result of the callback function
   *
   * @example
   * ```typescript
   * await this.userService.transaction(async (em) => {
   *   const user = await em.findOne(User, userId);
   *   user.balance -= 100;
   *   const order = em.create(Order, { userId, total: 100 });
   *   await em.flush();
   * });
   * ```
   */
  async transaction<R>(callback: (em: EntityManager) => Promise<R>): Promise<R> {
    return this.repository.transaction(callback);
  }

  // ============================================================================
  // READ OPERATIONS - Delegated to repository
  // ============================================================================

  /**
   * Find all entities
   *
   * Retrieves all entities from the database with optional filtering and ordering.
   * Wraps repository calls with comprehensive exception handling.
   *
   * @param options - Find options (ordering, relations, etc.)
   * @returns Promise resolving to array of all entities
   * @throws {QueryException} If database query fails
   * @throws {DatabaseException} If database connection or infrastructure fails
   * @see {@link BaseRepository.findAll}
   *
   * @example
   * ```typescript
   * // Get all users
   * const users = await userService.findAll();
   *
   * // With ordering
   * const users = await userService.findAll({
   *   orderBy: { createdAt: 'DESC' }
   * });
   * ```
   */
  async findAll(options?: FindOptions<T>): Promise<T[]> {
    // Let repository exceptions bubble up - they already have proper context
    return (await this.repository.findAll(options as any)) as T[];
  }

  /**
   * Find entity by primary key
   *
   * Retrieves a single entity by its primary key. Returns null if not found.
   *
   * @param id - Primary key value
   * @returns Promise resolving to entity or null
   * @throws {InvalidArgumentException} If ID is null or undefined
   * @throws {QueryException} If database query fails
   * @throws {DatabaseException} If database connection fails
   * @see {@link BaseRepository.findById}
   *
   * @example
   * ```typescript
   * const user = await userService.findById(123);
   * if (user) {
   *   console.log(user.name);
   * }
   * ```
   */
  async findById(id: Primary<T>): Promise<T | null> {
    // Service layer validates arguments
    if (id === null || id === undefined) {
      throw InvalidArgumentException.forNullArgument('id');
    }

    // Let repository exceptions bubble up
    return (await this.repository.findById(id)) as T | null;
  }

  /**
   * Find entity by primary key or throw error
   *
   * Retrieves a single entity by its primary key. Throws exception if not found.
   *
   * @param id - Primary key value
   * @returns Promise resolving to entity (never null)
   * @throws {InvalidArgumentException} If ID is null or undefined
   * @throws {ModelNotFoundException} If entity not found
   * @throws {QueryException} If database query fails
   * @throws {DatabaseException} If database connection fails
   * @see {@link BaseRepository.findByIdOrFail}
   *
   * @example
   * ```typescript
   * try {
   *   const user = await userService.findByIdOrFail(123);
   *   // User guaranteed to exist here
   *   console.log(user.name);
   * } catch (error: Error | any) {
   *   if (error instanceof ModelNotFoundException) {
   *     console.error('User not found');
   *   }
   * }
   * ```
   */
  async findByIdOrFail(id: Primary<T>): Promise<T> {
    // Service layer validates arguments
    if (id === null || id === undefined) {
      throw InvalidArgumentException.forNullArgument('id');
    }

    try {
      return (await this.repository.findByIdOrFail(id)) as T;
    } catch (error: Error | any) {
      // Log ModelNotFoundException for monitoring
      if (error instanceof ModelNotFoundException) {
        this.logger.warn(`${this.entityName} not found with ID: ${id}`, error.getLogDetails());
      }
      // Re-throw - repository already provides proper exception
      throw error;
    }
  }

  /**
   *
   * @param where - Filter criteria
   * @param options - Find options
   * @returns Promise resolving to entity or null
   * @see {@link BaseRepository.findOne}
   */
  async findOne(where: FilterQuery<T>, options?: FindOptions<T>): Promise<T | null> {
    return this.repository.findOne(where, options as any) as Promise<T | null>;
  }

  /**
   * Find single entity by criteria or throw error
   *
   * @param where - Filter criteria
   * @param options - Find options
   * @returns Promise resolving to entity
   * @throws EntityNotFoundException if not found
   * @see {@link BaseRepository.findOneOrFail}
   */
  async findOneOrFail(where: FilterQuery<T>, options?: FindOptions<T>): Promise<T> {
    return this.repository.findOneOrFail(where, options as any) as Promise<T>;
  }

  /**
   * Find multiple entities by criteria
   *
   * @param where - Filter criteria
   * @param options - Find options
   * @returns Promise resolving to array of entities
   * @see {@link BaseRepository.find}
   */
  async find(where: FilterQuery<T>, options?: FindOptions<T>): Promise<T[]> {
    return this.repository.find(where, options);
  }

  /**
   * Find entities by multiple IDs
   *
   * Retrieves multiple entities by their primary keys efficiently.
   *
   * @param ids - Array of primary key values
   * @returns Promise resolving to array of entities
   * @throws {InvalidArgumentException} If IDs array is null, undefined, or empty
   * @throws {QueryException} If database query fails
   * @throws {DatabaseException} If database connection fails
   * @see {@link BaseRepository.find}
   *
   * @example
   * ```typescript
   * const users = await userService.findByIds([1, 2, 3, 4, 5]);
   * console.log(`Found ${users.length} users`);
   * ```
   */
  async findByIds(ids: Primary<T>[]): Promise<T[]> {
    // Service layer validates arguments
    if (!ids || ids.length === 0) {
      throw InvalidArgumentException.forEmptyArray('ids');
    }

    // Let repository exceptions bubble up
    return await this.repository.find({ id: { $in: ids } } as FilterQuery<T>);
  }

  /**
   * Get first entity
   *
   * @returns Promise resolving to first entity or null
   * @see {@link BaseRepository.first}
   */
  async first(): Promise<T | null> {
    return this.repository.first();
  }

  /**
   * Get all entities (alias for findAll)
   *
   * @returns Promise resolving to array of all entities
   * @see {@link BaseRepository.all}
   */
  async all(): Promise<T[]> {
    return this.repository.all();
  }

  // ============================================================================
  // COUNT & EXISTENCE - Delegated to repository
  // ============================================================================

  /**
   * Count entities matching criteria
   *
   * @param where - Filter criteria (optional)
   * @returns Promise resolving to count
   * @see {@link BaseRepository.count}
   */
  async count(where?: FilterQuery<T>): Promise<number> {
    return this.repository.count(where);
  }

  /**
   * Check if entity exists matching criteria
   *
   * @param where - Filter criteria
   * @returns Promise resolving to boolean
   * @see {@link BaseRepository.exists}
   */
  async exists(where: FilterQuery<T>): Promise<boolean> {
    return this.repository.exists(where);
  }

  // ============================================================================
  // CREATE OPERATIONS - Delegated to repository
  // ============================================================================

  /**
   * Create a new entity
   *
   * Creates and persists a new entity to the database.
   *
   * @param data - Entity data
   * @returns Promise resolving to created entity
   * @throws {InvalidArgumentException} If data is null or undefined
   * @throws {ValidationException} If entity validation fails
   * @throws {QueryException} If database query fails
   * @throws {DatabaseException} If database connection fails
   * @see {@link BaseRepository.createAndFlush}
   *
   * @example
   * ```typescript
   * const user = await userService.create({
   *   name: 'John Doe',
   *   email: 'john@example.com'
   * });
   * console.log('User created with ID:', user.id);
   * ```
   */
  async create(data: EntityData<T>): Promise<T> {
    // Service layer validates arguments
    if (!data || typeof data !== 'object') {
      throw InvalidArgumentException.forNullArgument('data');
    }

    try {
      this.logger.debug(`Creating new ${this.entityName}`, { data });
      const entity = await this.repository.createAndFlush(data as any);
      this.logger.log(`Successfully created ${this.entityName}`);
      return entity;
    } catch (error: Error | any) {
      // Log the error and re-throw repository exception
      this.logger.error(`Failed to create ${this.entityName}`, { error, data });
      throw error;
    }
  }

  /**
   * Create multiple entities
   *
   * Creates and persists multiple entities to the database in a batch operation.
   *
   * @param data - Array of entity data
   * @returns Promise resolving to array of created entities
   * @throws {InvalidArgumentException} If data array is null, undefined, or empty
   * @throws {ValidationException} If any entity validation fails
   * @throws {QueryException} If database query fails
   * @throws {DatabaseException} If database connection fails
   * @see {@link BaseRepository.createMany}
   *
   * @example
   * ```typescript
   * const users = await userService.createMany([
   *   { name: 'John', email: 'john@example.com' },
   *   { name: 'Jane', email: 'jane@example.com' }
   * ]);
   * console.log(`Created ${users.length} users`);
   * ```
   */
  async createMany(data: EntityData<T>[]): Promise<T[]> {
    // Service layer validates arguments
    if (!data || data.length === 0) {
      throw InvalidArgumentException.forEmptyArray('data');
    }

    try {
      this.logger.debug(`Creating ${data.length} ${this.entityName} entities`);
      const entities = await this.repository.createMany(data as any);
      this.logger.log(`Successfully created ${entities.length} ${this.entityName} entities`);
      return entities;
    } catch (error: Error | any) {
      // Log the error and re-throw repository exception
      this.logger.error(`Failed to create multiple ${this.entityName} entities`, {
        error,
        count: data.length,
      });
      throw error;
    }
  }

  // ============================================================================
  // UPDATE OPERATIONS - Delegated to repository
  // ============================================================================

  /**
   * Update entity by ID
   *
   * Updates an existing entity with new data.
   *
   * @param id - Primary key value
   * @param data - Update data
   * @returns Promise resolving to updated entity
   * @throws {InvalidArgumentException} If ID or data is null/undefined
   * @throws {ModelNotFoundException} If entity not found
   * @throws {ValidationException} If entity validation fails
   * @throws {QueryException} If database query fails
   * @throws {DatabaseException} If database connection fails
   * @see {@link BaseRepository.update}
   *
   * @example
   * ```typescript
   * const user = await userService.update(123, {
   *   name: 'John Updated'
   * });
   * console.log('User updated:', user.name);
   * ```
   */
  async update(id: Primary<T>, data: EntityData<T>): Promise<T> {
    // Service layer validates arguments
    if (id === null || id === undefined) {
      throw InvalidArgumentException.forNullArgument('id');
    }

    if (!data || typeof data !== 'object') {
      throw InvalidArgumentException.forNullArgument('data');
    }

    try {
      this.logger.debug(`Updating ${this.entityName} with ID: ${id}`, { data });
      const entity = await this.repository.update(id, data);
      this.logger.log(`Successfully updated ${this.entityName} with ID: ${id}`);
      return entity;
    } catch (error: Error | any) {
      // Log the error and re-throw repository exception
      this.logger.error(`Failed to update ${this.entityName} with ID: ${id}`, { error, data });
      throw error;
    }
  }

  /**
   * Update multiple entities by criteria
   *
   * Updates all entities matching the given criteria with new data.
   *
   * @param where - Filter criteria
   * @param data - Update data
   * @returns Promise resolving to number of updated entities
   * @throws {InvalidArgumentException} If where or data is null/undefined
   * @throws {ValidationException} If entity validation fails
   * @throws {QueryException} If database query fails
   * @throws {DatabaseException} If database connection fails
   * @see {@link BaseRepository.updateMany}
   *
   * @example
   * ```typescript
   * const count = await userService.updateMany(
   *   { isActive: false },
   *   { status: 'inactive' }
   * );
   * console.log(`Updated ${count} users`);
   * ```
   */
  async updateMany(where: FilterQuery<T>, data: EntityData<T>): Promise<number> {
    // Service layer validates arguments
    if (!where || typeof where !== 'object') {
      throw InvalidArgumentException.forNullArgument('where');
    }

    if (!data || typeof data !== 'object') {
      throw InvalidArgumentException.forNullArgument('data');
    }

    try {
      this.logger.debug(`Updating multiple ${this.entityName} entities`, { where, data });
      const count = await this.repository.updateMany(where, data);
      this.logger.log(`Successfully updated ${count} ${this.entityName} entities`);
      return count;
    } catch (error: Error | any) {
      // Log the error and re-throw repository exception
      this.logger.error(`Failed to update multiple ${this.entityName} entities`, {
        error,
        where,
        data,
      });
      throw error;
    }
  }

  /**
   * Upsert (insert or update) entity
   *
   * @param where - Criteria to find existing entity
   * @param data - Entity data to insert or update
   * @returns Promise resolving to upserted entity
   * @see {@link BaseRepository.upsert}
   */
  async upsert(where: FilterQuery<T>, data: EntityData<T>): Promise<T> {
    // Check if entity exists
    const existing = await this.repository.findOne(where);
    if (existing) {
      // Update existing
      return this.repository.update(existing.getPrimaryKey(), data);
    } else {
      // Create new
      return this.repository.upsert({ ...where, ...data } as any);
    }
  }

  // ============================================================================
  // DELETE OPERATIONS - Delegated to repository
  // ============================================================================

  /**
   * Delete entity by ID
   *
   * Deletes an entity from the database by its primary key.
   *
   * @param id - Primary key value
   * @returns Promise resolving to boolean (true if deleted)
   * @throws {InvalidArgumentException} If ID is null or undefined
   * @throws {ModelNotFoundException} If entity not found
   * @throws {QueryException} If database query fails
   * @throws {DatabaseException} If database connection fails
   * @see {@link BaseRepository.delete}
   *
   * @example
   * ```typescript
   * const deleted = await userService.delete(123);
   * if (deleted) {
   *   console.log('User deleted successfully');
   * }
   * ```
   */
  async delete(id: Primary<T>): Promise<boolean> {
    // Service layer validates arguments
    if (id === null || id === undefined) {
      throw InvalidArgumentException.forNullArgument('id');
    }

    try {
      this.logger.debug(`Deleting ${this.entityName} with ID: ${id}`);
      const result = await this.repository.delete(id);
      this.logger.log(`Successfully deleted ${this.entityName} with ID: ${id}`);
      return result;
    } catch (error: Error | any) {
      // Log the error and re-throw repository exception
      this.logger.error(`Failed to delete ${this.entityName} with ID: ${id}`, { error });
      throw error;
    }
  }

  /**
   * Delete multiple entities by criteria
   *
   * Deletes all entities matching the given criteria from the database.
   *
   * @param where - Filter criteria
   * @returns Promise resolving to number of deleted entities
   * @throws {InvalidArgumentException} If where criteria is null or undefined
   * @throws {QueryException} If database query fails
   * @throws {DatabaseException} If database connection fails
   * @see {@link BaseRepository.deleteMany}
   *
   * @example
   * ```typescript
   * const count = await userService.deleteMany({
   *   isActive: false,
   *   lastLogin: { $lt: thirtyDaysAgo }
   * });
   * console.log(`Deleted ${count} inactive users`);
   * ```
   */
  async deleteMany(where: FilterQuery<T>): Promise<number> {
    // Service layer validates arguments
    if (!where || typeof where !== 'object') {
      throw InvalidArgumentException.forNullArgument('where');
    }

    try {
      this.logger.debug(`Deleting multiple ${this.entityName} entities`, { where });
      const count = await this.repository.deleteMany(where);
      this.logger.log(`Successfully deleted ${count} ${this.entityName} entities`);
      return count;
    } catch (error: Error | any) {
      // Log the error and re-throw repository exception
      this.logger.error(`Failed to delete multiple ${this.entityName} entities`, {
        error,
        where,
      });
      throw error;
    }
  }

  // ============================================================================
  // AGGREGATIONS - Delegated to repository
  // ============================================================================

  /**
   * Calculate sum of numeric field
   *
   * @param field - Field name
   * @param where - Filter criteria (optional)
   * @returns Promise resolving to sum
   * @see {@link BaseRepository.sum}
   */
  async sum(field: keyof T, where?: FilterQuery<T>): Promise<number> {
    return this.repository.sum(field, where);
  }

  /**
   * Calculate average of numeric field
   *
   * @param field - Field name
   * @param where - Filter criteria (optional)
   * @returns Promise resolving to average
   * @see {@link BaseRepository.avg}
   */
  async avg(field: keyof T, where?: FilterQuery<T>): Promise<number> {
    return this.repository.avg(field, where);
  }

  /**
   * Find minimum value of field
   *
   * @param field - Field name
   * @param where - Filter criteria (optional)
   * @returns Promise resolving to minimum value
   * @see {@link BaseRepository.min}
   */
  async min(field: keyof T, where?: FilterQuery<T>): Promise<number> {
    return this.repository.min(field, where);
  }

  /**
   * Find maximum value of field
   *
   * @param field - Field name
   * @param where - Filter criteria (optional)
   * @returns Promise resolving to maximum value
   * @see {@link BaseRepository.max}
   */
  async max(field: keyof T, where?: FilterQuery<T>): Promise<number> {
    return this.repository.max(field, where);
  }

  // ============================================================================
  // PAGINATION - Delegated to repository
  // ============================================================================

  /**
   * Full pagination with total count (Laravel's paginate())
   *
   * Creates a LengthAwarePaginator with complete pagination metadata including
   * total count, last page, and page links. Best for UI with page numbers.
   *
   * @param perPage - Items per page (default: 15)
   * @param request - Express request object (optional)
   * @param config - Pagination configuration
   * @returns Promise resolving to LengthAwarePaginator instance
   * @throws {InvalidArgumentException} If perPage is invalid (less than 1)
   * @throws {QueryException} If database query fails
   * @throws {DatabaseException} If database connection fails
   * @see {@link BaseRepository.paginate}
   *
   * @example
   * ```typescript
   * // Basic usage
   * const paginator = await userService.paginate(15);
   *
   * // With request
   * const paginator = await userService.paginate(15, request);
   *
   * // Get JSON response
   * const response = paginator
   *   .withPath('/api/users')
   *   .appends({ filter: 'active' })
   *   .toJSON();
   * ```
   */
  async paginate(
    perPage: number = 15,
    request?: Request,
    config?: Partial<PaginationConfig>,
  ): Promise<LengthAwarePaginator<T>> {
    // Service layer validates arguments
    if (perPage < 1 || !Number.isInteger(perPage)) {
      throw InvalidArgumentException.forInvalidPerPage(perPage);
    }

    this.logger.debug(`Paginating ${this.entityName} entities`, { perPage });
    // Let repository exceptions bubble up
    return await this.repository.paginate(perPage, request, config);
  }

  /**
   * Simple pagination without total count (Laravel's simplePaginate())
   *
   * Creates a SimplePaginator without counting total items. More performant
   * when you don't need total count or page numbers.
   *
   * @param perPage - Items per page (default: 15)
   * @param request - Express request object (optional)
   * @param config - Pagination configuration
   * @returns Promise resolving to SimplePaginator instance
   * @throws {InvalidArgumentException} If perPage is invalid (less than 1)
   * @throws {QueryException} If database query fails
   * @throws {DatabaseException} If database connection fails
   * @see {@link BaseRepository.simplePaginate}
   *
   * @example
   * ```typescript
   * // Basic usage
   * const paginator = await userService.simplePaginate(15);
   *
   * // Check if more pages exist
   * if (paginator.hasMorePages()) {
   *   console.log('More data available');
   * }
   * ```
   */
  async simplePaginate(
    perPage: number = 15,
    request?: Request,
    config?: Partial<PaginationConfig>,
  ): Promise<SimplePaginator<T>> {
    // Service layer validates arguments
    if (perPage < 1 || !Number.isInteger(perPage)) {
      throw InvalidArgumentException.forInvalidPerPage(perPage);
    }

    this.logger.debug(`Simple paginating ${this.entityName} entities`, { perPage });
    // Let repository exceptions bubble up
    return await this.repository.simplePaginate(perPage, request, config);
  }

  /**
   * Cursor-based pagination (Laravel's cursorPaginate())
   *
   * Creates a CursorPaginator for efficient pagination of large datasets.
   * Best for infinite scroll and real-time feeds.
   *
   * @param perPage - Items per page (default: 15)
   * @param request - Express request object (optional)
   * @param config - Pagination configuration
   * @returns Promise resolving to CursorPaginator instance
   * @throws {InvalidArgumentException} If perPage is invalid (less than 1)
   * @throws {QueryException} If database query fails
   * @throws {DatabaseException} If database connection fails
   * @see {@link BaseRepository.cursorPaginate}
   *
   * @example
   * ```typescript
   * // Requires ordering in repository query builder
   * const paginator = await userService.cursorPaginate(20, request);
   *
   * // Get next/prev cursors
   * const response = paginator.toJSON();
   * console.log(response.meta.nextCursor);
   * console.log(response.meta.prevCursor);
   * ```
   */
  async cursorPaginate(
    perPage: number = 15,
    request?: Request,
    config?: Partial<PaginationConfig>,
  ): Promise<CursorPaginator<T>> {
    // Service layer validates arguments
    if (perPage < 1 || !Number.isInteger(perPage)) {
      throw InvalidArgumentException.forInvalidPerPage(perPage);
    }

    this.logger.debug(`Cursor paginating ${this.entityName} entities`, { perPage });
    // Let repository exceptions bubble up
    return await this.repository.cursorPaginate(perPage, request, config);
  }

  // ============================================================================
  // UTILITY METHODS - Delegated to repository
  // ============================================================================

  /**
   * Get fresh copy of entity from database
   *
   * @param entity - Entity to refresh
   * @returns Promise resolving to fresh entity or null
   * @see {@link BaseRepository.fresh}
   */
  async fresh(entity: T): Promise<T | null> {
    return this.repository.fresh(entity);
  }

  /**
   * Refresh entity in place from database
   *
   * @param entity - Entity to refresh
   * @returns Promise resolving to refreshed entity
   * @see {@link BaseRepository.refresh}
   */
  async refresh(entity: T): Promise<T> {
    return this.repository.refresh(entity);
  }

  /**
   * Process entities in chunks
   *
   * @param chunkSize - Number of entities per chunk
   * @param callback - Function to process each chunk
   * @returns Promise that resolves when all chunks processed
   * @see {@link BaseRepository.chunk}
   */
  async chunk(chunkSize: number, callback: (entities: T[]) => Promise<void>): Promise<void> {
    return this.repository.chunk(chunkSize, callback);
  }

  /**
   * Flush pending changes to database
   *
   * Persists all pending changes to the database.
   *
   * @returns Promise that resolves when flush complete
   * @throws {QueryException} If database query fails
   * @throws {DatabaseException} If database connection fails
   *
   * @example
   * ```typescript
   * // After making changes to multiple entities
   * user.name = 'Updated Name';
   * post.title = 'Updated Title';
   * await service.flush();
   * ```
   */
  async flush(): Promise<void> {
    // Let repository/EM exceptions bubble up
    return await this.em.flush();
  }
}
