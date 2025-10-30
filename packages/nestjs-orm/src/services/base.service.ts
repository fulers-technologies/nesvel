import { Injectable, Logger } from '@nestjs/common';
import { EntityManager, FilterQuery, Loaded, QueryOrderMap, FindOptions } from '@mikro-orm/core';
import type { IService } from '@/interfaces/service.interface';
import type { IRepository } from '@/interfaces/repository.interface';
import { BaseEntity } from '@/entities/base.entity';
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
  constructor(repository: IRepository<T>, em: EntityManager, entityName: string) {
    this.em = em;
    this.repository = repository;
    this.entityName = entityName;
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
   * const userRepo = this.getRepository();
   * const customResult = await userRepo.findByCustomCriteria(params);
   *
   * // Get native MikroORM repository for advanced queries
   * const nativeRepo = userRepo.getRepository();
   * const queryBuilder = nativeRepo.createQueryBuilder('u');
   * ```
   *
   * @see {@link repository} For the protected property access
   */
  getRepository(): IRepository<T> {
    return this.repository;
  }

  /**
   * Find all records with comprehensive filtering and query options
   *
   * Provides a flexible interface for retrieving multiple records with support
   * for complex filtering, sorting, pagination, and relationship loading. If no
   * options are provided, returns all records in the table.
   *
   * Performance Considerations:
   * - Use pagination (limit/offset) for large datasets
   * - Be selective with populate to avoid N+1 queries
   * - Consider using indexes for frequently filtered fields
   *
   * @param options - Optional query configuration object
   * @param options.where - Filter conditions using MikroORM FilterQuery syntax
   * @param options.orderBy - Sorting configuration with field names and directions
   * @param options.limit - Maximum number of records to return
   * @param options.offset - Number of records to skip (for pagination)
   * @param options.populate - Array of relationship names to eager load
   * @returns Promise resolving to array of matching entities
   *
   * @example
   * ```typescript
   * // Get all records
   * const allUsers = await userService.findAll();
   *
   * // Filtered and sorted results
   * const activeUsers = await userService.findAll({
   *   where: { isActive: true },
   *   orderBy: { createdAt: 'DESC' },
   *   limit: 50
   * });
   *
   * // With relationships loaded
   * const usersWithPosts = await userService.findAll({
   *   where: { role: 'author' },
   *   populate: ['posts', 'profile'],
   *   limit: 20,
   *   offset: 40 // Page 3 with 20 per page
   * });
   *
   * // Complex filtering
   * const recentActiveUsers = await userService.findAll({
   *   where: {
   *     isActive: true,
   *     createdAt: { $gte: new Date('2023-01-01') },
   *     email: { $like: '%@company.com' }
   *   },
   *   orderBy: { lastName: 'ASC', firstName: 'ASC' }
   * });
   * ```
   *
   * @throws QueryException if database query fails
   * @see {@link paginate} For better pagination with metadata
   * @see {@link findBy} For simpler filtering without query builder
   */
  async findAll(options?: {
    where?: FilterQuery<T>;
    orderBy?: QueryOrderMap<T>;
    limit?: number;
    offset?: number;
    populate?: string[];
  }): Promise<Loaded<T, never>[]> {
    // If no options provided, return all records using repository's optimized method
    if (!options) {
      return await this.repository.all();
    }

    const { where, orderBy, limit, offset, populate } = options;

    const findOptions: FindOptions<T, never> = {} as FindOptions<T, never>;
    if (orderBy) {
      (findOptions as any).orderBy = orderBy as any;
    }
    if (typeof limit === 'number') {
      (findOptions as any).limit = limit;
    }
    if (typeof offset === 'number') {
      (findOptions as any).offset = offset;
    }
    if (populate) {
      (findOptions as any).populate = populate as any;
    }

    return await this.repository
      .getRepository()
      .find((where || ({} as any)) as FilterQuery<T>, findOptions as any);
  }

  /**
   * Find a single entity record by its primary key
   *
   * Retrieves an entity by its primary key with optional relationship loading.
   * Returns null if no entity is found, making this method null-safe for
   * scenarios where the entity might not exist.
   *
   * @param id - The primary key value (string or number)
   * @param populate - Optional array of relationship names to eager load
   * @returns Promise resolving to the entity or null if not found
   *
   * @example
   * ```typescript
   * // Find user by ID
   * const user = await userService.findOne(123);
   * if (user) {
   *   console.log(`Found user: ${user.name}`);
   * } else {
   *   console.log('User not found');
   * }
   *
   * // Find user with relationships loaded
   * const userWithPosts = await userService.findOne(123, ['posts', 'profile']);
   * if (userWithPosts) {
   *   console.log(`User has ${userWithPosts.posts.length} posts`);
   * }
   * ```
   *
   * @see {@link findOneOrFail} For exception-throwing variant
   * @see {@link findBy} For finding by custom criteria
   */
  async findOne(id: string | number, populate?: string[]): Promise<Loaded<T, never> | null> {
    // Build options object with population if provided
    const options: any = populate ? { populate } : {};

    // Use repository to find the entity with optional relationship loading
    return await this.repository.getRepository().findOne(id as any, options as any);
  }

  /**
   * Find a single entity by ID or throw a detailed exception if not found
   *
   * Similar to findOne() but throws a comprehensive exception when the entity
   * is not found. This method includes detailed error handling and logging,
   * making it suitable for scenarios where the entity is expected to exist.
   *
   * Error Handling:
   * - Logs warnings for entity not found scenarios
   * - Logs errors for database query failures
   * - Provides detailed exception context for debugging
   * - Preserves original error stack traces
   *
   * @param id - The entity ID to search for
   * @param populate - Optional relations to populate
   * @returns Promise resolving to the found entity (never null)
   *
   * @example
   * ```typescript
   * try {
   *   // This will throw if user doesn't exist
   *   const user = await userService.findOneOrFail(123, ['posts']);
   *   console.log(`User found: ${user.name}`);
   *
   *   // Safe to access relationships if populated
   *   console.log(`User has ${user.posts.length} posts`);
   * } catch (error: Error | any) {
   *   if (error instanceof ModelNotFoundException) {
   *     console.error('User not found:', error.getApiMessage());
   *   } else {
   *     console.error('Database error:', error.message);
   *   }
   * }
   * ```
   *
   * @throws ModelNotFoundException when entity with given ID is not found
   * @throws QueryException when database query fails
   * @see {@link findOne} For null-safe variant
   */
  async findOneOrFail(id: string | number, populate?: string[]): Promise<Loaded<T, never>> {
    try {
      // Attempt to find the entity using the null-safe method
      const entity = await this.findOne(id, populate);

      // If entity is not found, log warning and throw specific exception
      if (!entity) {
        this.logger.warn(`${this.entityName} with ID ${id} not found`);
        throw ModelNotFoundException.forId(this.entityName, id);
      }

      // Return the found entity
      return entity;
    } catch (error: Error | any) {
      // If it's already a ModelNotFoundException, re-throw it as-is
      if (error instanceof ModelNotFoundException) {
        throw error;
      }

      // Log the database error with full context
      this.logger.error(`Error finding ${this.entityName} with ID ${id}:`, error);

      // Wrap the database error in a QueryException with detailed context
      throw new QueryException(
        'default', // connection name
        `SELECT * FROM ${this.entityName.toLowerCase()} WHERE id = ?`, // SQL query
        [id], // query parameters
        error as Error, // original error
        `Failed to find ${this.entityName} with ID ${id}`, // custom message
      );
    }
  }

  /**
   * Find multiple records matching specified criteria
   *
   * Retrieves all entities that match the given filter conditions with optional
   * relationship loading. This method provides a simpler interface compared to
   * findAll() when you don't need advanced query features like sorting or pagination.
   *
   * @param criteria - Filter conditions using MikroORM FilterQuery syntax
   * @param populate - Optional array of relationship names to eager load
   * @returns Promise resolving to array of matching entities
   *
   * @example
   * ```typescript
   * // Find all active users
   * const activeUsers = await userService.findBy({ isActive: true });
   *
   * // Find users with specific role and load their posts
   * const authorsWithPosts = await userService.findBy(
   *   { role: 'author' },
   *   ['posts', 'profile']
   * );
   *
   * // Complex criteria with operators
   * const recentUsers = await userService.findBy({
   *   createdAt: { $gte: new Date('2023-01-01') },
   *   email: { $like: '%@company.com' },
   *   isActive: true
   * });
   *
   * // Find by related entity properties
   * const usersWithManyPosts = await userService.findBy({
   *   'posts.count': { $gt: 10 }
   * }, ['posts']);
   * ```
   *
   * @see {@link findAll} For advanced querying with sorting and pagination
   * @see {@link findOne} For finding a single record by ID
   */
  async findBy(criteria: FilterQuery<T>, populate?: string[]): Promise<Loaded<T, never>[]> {
    // Build options object with population if provided
    const options: any = populate ? { populate } : {};

    // Execute the query using the repository with criteria and options
    return await this.repository.getRepository().find(criteria, options as any);
  }

  /**
   * Create a new entity record with comprehensive validation
   *
   * Creates and persists a new entity instance with the provided data.
   * The entity is immediately saved to the database with all auto-generated
   * fields populated. This method uses the repository layer for consistent
   * data handling and entity lifecycle management.
   *
   * @param data - Partial entity data for creating the new record
   * @returns Promise resolving to the created and persisted entity
   *
   * @example
   * ```typescript
   * // Create a new user
   * const newUser = await userService.create({
   *   name: 'John Doe',
   *   email: 'john@example.com',
   *   role: 'user'
   * });
   *
   * console.log(`Created user with ID: ${newUser.id}`);
   * console.log(`Created at: ${newUser.createdAt}`);
   * ```
   *
   * @throws ValidationException if data validation fails
   * @throws QueryException if database operation fails
   * @see {@link createMany} For bulk creation
   * @see {@link update} For modifying existing records
   */
  async create(data: Partial<T>): Promise<Loaded<T, never>> {
    // Delegate to repository which handles entity creation and persistence
    return await this.repository.create(data);
  }

  /**
   * Create multiple entity records in batch operations
   *
   * Creates multiple entities efficiently by batching the operations and
   * using a single flush operation. This method is more performant than
   * calling create() multiple times when dealing with many records.
   *
   * Performance Note:
   * - All entities are created in memory first
   * - Single database flush operation for all entities
   * - More efficient than individual create calls
   * - Consider using bulkInsert() for very large datasets
   *
   * @param data - Array of partial entity data for creating records
   * @returns Promise resolving to array of created and persisted entities
   *
   * @example
   * ```typescript
   * // Create multiple users at once
   * const newUsers = await userService.createMany([
   *   { name: 'John Doe', email: 'john@example.com' },
   *   { name: 'Jane Smith', email: 'jane@example.com' },
   *   { name: 'Bob Wilson', email: 'bob@example.com' }
   * ]);
   *
   * console.log(`Created ${newUsers.length} users`);
   * newUsers.forEach(user => console.log(`User ID: ${user.id}`));
   * ```
   *
   * @throws ValidationException if any data validation fails
   * @throws QueryException if database operation fails
   * @see {@link create} For single record creation
   * @see {@link bulkInsert} For very large datasets with batching
   */
  async createMany(data: Partial<T>[]): Promise<Loaded<T, never>[]> {
    // Create entity instances for all provided data
    const entities = data.map((item) => this.repository.getRepository().create(item as any));

    // Persist all entities in a single database operation for efficiency
    await this.em.persistAndFlush(entities);

    // Return the created entities with all generated fields populated
    return entities as Loaded<T, never>[];
  }

  /**
   * Update an existing entity record by ID with change tracking
   *
   * Updates an entity with the provided data using intelligent field merging.
   * Only the specified fields are modified while preserving other properties.
   * Includes automatic timestamp updates if entity supports it.
   *
   * @param id - The primary key of the entity to update
   * @param data - Partial entity data containing fields to update
   * @returns Promise resolving to the updated entity
   *
   * @example
   * ```typescript
   * // Update specific user fields
   * const updatedUser = await userService.update(123, {
   *   name: 'John Smith', // Changed name
   *   isActive: false     // Changed status
   *   // email remains unchanged
   * });
   *
   * console.log(`Updated user: ${updatedUser.name}`);
   * console.log(`Updated at: ${updatedUser.updatedAt}`);
   * ```
   *
   * @throws ModelNotFoundException if entity with given ID is not found
   * @throws ValidationException if data validation fails
   * @throws QueryException if database operation fails
   * @see {@link updateBy} For bulk updates by criteria
   */
  async update(id: string | number, data: Partial<T>): Promise<Loaded<T, never>> {
    // Delegate to repository which handles entity loading, updating, and persistence
    return await this.repository.update(id, data);
  }

  /**
   * Update multiple records matching specified criteria (bulk operation)
   *
   * Performs a bulk update operation on all entities matching the given criteria.
   * This is more efficient than updating records individually but bypasses
   * entity lifecycle hooks. Ideal for updating large numbers of records.
   *
   * @param criteria - Filter conditions to identify records to update
   * @param data - Partial entity data containing fields to update
   * @returns Promise resolving to the number of affected records
   *
   * @example
   * ```typescript
   * // Deactivate all inactive users from last year
   * const updatedCount = await userService.updateBy(
   *   {
   *     lastLoginAt: { $lt: new Date('2023-01-01') },
   *     isActive: true
   *   },
   *   { isActive: false }
   * );
   *
   * console.log(`Deactivated ${updatedCount} inactive users`);
   * ```
   *
   * @note This method bypasses entity lifecycle hooks and events
   * @see {@link update} For single record updates with full lifecycle support
   */
  async updateBy(criteria: FilterQuery<T>, data: Partial<T>): Promise<number> {
    // Delegate to repository's bulk update method
    return await this.repository.updateWhere(criteria, data);
  }

  /**
   * Delete an entity record by ID with existence checking
   *
   * Performs a hard delete operation on the entity identified by its primary key.
   * Returns false if the entity doesn't exist, making it safe to call with
   * non-existent IDs. The deletion is permanent and cannot be undone.
   *
   * @param id - The primary key of the entity to delete
   * @returns Promise resolving to true if deleted, false if entity not found
   *
   * @example
   * ```typescript
   * // Delete a user by ID
   * const wasDeleted = await userService.delete(123);
   * if (wasDeleted) {
   *   console.log('User successfully deleted');
   * } else {
   *   console.log('User not found');
   * }
   * ```
   *
   * @note This is a permanent hard delete. For recoverable deletion, use softDelete()
   * @see {@link deleteBy} For bulk deletion operations
   * @see {@link softDelete} For recoverable soft deletion
   */
  async delete(id: string | number): Promise<boolean> {
    // Delegate to repository which handles existence checking and deletion
    return await this.repository.delete(id);
  }

  /**
   * Delete multiple records matching specified criteria (bulk operation)
   *
   * Performs a bulk hard delete operation on all entities matching the given
   * criteria. More efficient than individual deletions but bypasses entity
   * lifecycle hooks. Use with caution as deletions are permanent.
   *
   * @param criteria - Filter conditions to identify records to delete
   * @returns Promise resolving to the number of deleted records
   *
   * @example
   * ```typescript
   * // Delete all inactive users from over a year ago
   * const deletedCount = await userService.deleteBy({
   *   isActive: false,
   *   lastLoginAt: { $lt: new Date('2022-01-01') }
   * });
   *
   * console.log(`Deleted ${deletedCount} old inactive users`);
   * ```
   *
   * @warning This operation is permanent and cannot be undone
   * @note This method bypasses entity lifecycle hooks and events
   * @see {@link delete} For single record deletion
   * @see {@link softDelete} For recoverable deletion
   */
  async deleteBy(criteria: FilterQuery<T>): Promise<number> {
    // Delegate to repository's bulk delete method
    return await this.repository.deleteWhere(criteria);
  }

  /**
   * Restore a previously soft-deleted record (if supported by the entity)
   *
   * Attempts to load the entity including trashed records and invokes its restore()
   * behavior. Emits structured logs, throws precise exceptions when not found or
   * when the entity does not implement soft-delete semantics.
   *
   * @param id - The entity ID to restore
   * @returns The restored entity
   * @throws ModelNotFoundException when entity is not found
   * @throws ValidationException when entity doesn't support soft deletes
   *
   * @example
   * ```ts
   * const restored = await service.restore(42);
   * ```
   */
  async restore(id: string | number): Promise<Loaded<T, never>> {
    try {
      const entity = await this.repository.getRepository().findOne(id as any, {
        filters: { softDelete: false }, // Include soft deleted
      });

      if (!entity) {
        this.logger.warn(`${this.entityName} with ID ${id} not found for restore`);
        throw ModelNotFoundException.withContext(
          this.entityName,
          `Cannot restore ${this.entityName} with ID ${id} - entity not found`,
          [id],
        );
      }

      if ('restore' in entity && typeof entity.restore === 'function') {
        (entity as any).restore();
        await this.em.flush();
        this.logger.log(`Successfully restored ${this.entityName} with ID ${id}`);
        return entity as Loaded<T, never>;
      }

      throw ValidationException.forInvalidValue('softDelete', 'unsupported', this.entityName);
    } catch (error: Error | any) {
      if (error instanceof ModelNotFoundException || error instanceof ValidationException) {
        throw error;
      }

      this.logger.error(`Error restoring ${this.entityName} with ID ${id}:`, error);
      throw new QueryException(
        'default',
        `UPDATE ${this.entityName.toLowerCase()} SET deleted_at = NULL WHERE id = ?`,
        [id],
        error as Error,
        `Failed to restore ${this.entityName} with ID ${id}`,
      );
    }
  }

  /**
   * Retrieve paginated results with metadata
   *
   * Executes a paginated query returning data and a meta object describing
   * total items, current page, total pages, and navigation flags. Use where,
   * orderBy, and populate to refine results.
   *
   * @param options.page - 1-based page index
   * @param options.limit - Items per page
   * @param options.where - Optional filter criteria
   * @param options.orderBy - Optional sort mapping
   * @param options.populate - Optional relations to eager load
   * @returns Data array and pagination metadata
   *
   * @example
   * ```ts
   * const { data, meta } = await service.paginate({
   *   page: 2, limit: 20, where: { isActive: true }, orderBy: { createdAt: 'DESC' }
   * });
   * ```
   */
  async paginate(options: {
    page: number;
    limit: number;
    where?: FilterQuery<T>;
    orderBy?: QueryOrderMap<T>;
    populate?: string[];
  }): Promise<{
    data: Loaded<T, never>[];
    meta: {
      total: number;
      page: number;
      limit: number;
      totalPages: number;
      hasNext: boolean;
      hasPrev: boolean;
    };
  }> {
    const { page, limit, where, orderBy, populate } = options;
    const offset = (page - 1) * limit;

    const findOptions: any = {
      limit,
      offset,
    };

    if (orderBy) {
      findOptions.orderBy = orderBy;
    }

    if (populate) {
      findOptions.populate = populate;
    }

    const [data, total] = await this.repository
      .getRepository()
      .findAndCount(where || {}, findOptions);

    const totalPages = Math.ceil(total / limit);

    return {
      data: data as Loaded<T, never>[],
      meta: {
        total,
        page,
        limit,
        totalPages,
        hasNext: page < totalPages,
        hasPrev: page > 1,
      },
    };
  }

  /**
   * Count records matching optional criteria
   *
   * Performs an efficient COUNT query without loading entities into memory.
   *
   * @param criteria - Optional filter criteria (counts all when omitted)
   * @returns Number of matching records
   */
  async count(criteria?: FilterQuery<T>): Promise<number> {
    return await this.repository.count(criteria);
  }

  /**
   * Determine whether any records exist for the given criteria
   *
   * More efficient than fetching data; resolves to true upon first match.
   *
   * @param criteria - Filter criteria to test for existence
   * @returns True when at least one record matches
   */
  async exists(criteria: FilterQuery<T>): Promise<boolean> {
    return await this.repository.exists(criteria);
  }

  /**
   * Execute a function within a database transaction
   *
   * Commits on successful resolution and rolls back on error. The callback
   * receives a forked EntityManager bound to the transaction.
   *
   * @param callback - Function executed inside the transaction
   * @returns Result of the callback
   *
   * @example
   * ```ts
   * await service.transaction(async (em) => {
   *   // use em for all operations to stay inside the transaction
   * });
   * ```
   */
  async transaction<R>(callback: (em: EntityManager) => Promise<R>): Promise<R> {
    return await this.em.transactional(callback);
  }

  /**
   * Bulk insert multiple records efficiently
   *
   * Splits the input into batches and persists each batch with a single flush.
   * Prefer this over repeated create() calls for large datasets.
   *
   * @param data - Array of partial entities to insert
   * @param batchSize - Size of each batch (default 1000)
   */
  async bulkInsert(data: Partial<T>[], batchSize: number = 1000): Promise<void> {
    const batches = [];
    for (let i = 0; i < data.length; i += batchSize) {
      batches.push(data.slice(i, i + batchSize));
    }

    for (const batch of batches) {
      const entities = batch.map((item) => this.repository.getRepository().create(item as any));
      await this.em.persistAndFlush(entities);
    }
  }

  /**
   * Bulk update records matching criteria
   *
   * Issues a single native UPDATE statement; lifecycle hooks are not triggered.
   *
   * @param criteria - Filter to select affected rows
   * @param data - Fields to update
   * @returns Number of affected rows
   */
  async bulkUpdate(criteria: FilterQuery<T>, data: Partial<T>): Promise<number> {
    return await this.repository.updateWhere(criteria, data);
  }

  /**
   * Bulk hard delete records matching criteria
   *
   * Issues a single native DELETE statement; irreversible operation.
   *
   * @param criteria - Filter to select rows to delete
   * @returns Number of deleted rows
   */
  async bulkDelete(criteria: FilterQuery<T>): Promise<number> {
    return await this.repository.deleteWhere(criteria);
  }

  /**
   * Soft delete a record (recoverable delete)
   *
   * Attempts to mark the entity as deleted using its softDelete() behavior, if
   * implemented. Logs outcomes, returns false when entity not found.
   *
   * @param id - The entity ID to soft delete
   * @returns True if deletion was successful, false if entity not found
   * @throws ValidationException when entity doesn't support soft deletes
   */
  async softDelete(id: string | number): Promise<boolean> {
    try {
      const entity = await this.findOne(id);
      if (!entity) {
        this.logger.warn(`${this.entityName} with ID ${id} not found for soft delete`);
        return false;
      }

      if ('softDelete' in entity && typeof entity.softDelete === 'function') {
        (entity as any).softDelete();
        await this.em.flush();
        this.logger.log(`Successfully soft deleted ${this.entityName} with ID ${id}`);
        return true;
      }

      throw ValidationException.forInvalidValue('softDelete', 'unsupported', this.entityName);
    } catch (error: Error | any) {
      if (error instanceof ValidationException) {
        throw error;
      }

      this.logger.error(`Error soft deleting ${this.entityName} with ID ${id}:`, error);
      throw new QueryException(
        'default',
        `UPDATE ${this.entityName.toLowerCase()} SET deleted_at = NOW() WHERE id = ?`,
        [id],
        error as Error,
        `Failed to soft delete ${this.entityName} with ID ${id}`,
      );
    }
  }

  /**
   * Retrieve only soft-deleted (trashed) records
   *
   * Returns entities whose deletion marker is set.
   */
  async onlyTrashed(): Promise<Loaded<T, never>[]> {
    return await this.repository
      .getRepository()
      .find({ deletedAt: { $ne: null } } as unknown as FilterQuery<T>);
  }

  /**
   * Retrieve records including soft-deleted ones
   *
   * Disables the soft-delete filter to include trashed entities.
   */
  async withTrashed(): Promise<Loaded<T, never>[]> {
    return await this.repository.getRepository().find(
      {},
      {
        filters: { softDelete: false },
      },
    );
  }

  /**
   * Permanently delete a record (force delete)
   *
   * Irreversibly removes the entity from the database.
   */
  async forceDelete(id: string | number): Promise<boolean> {
    return await this.repository.delete(id);
  }
}
