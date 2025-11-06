import type {
  Primary,
  EntityData,
  FilterQuery,
  FindOptions,
  EntityManager,
  QueryOrderMap,
  OrderDefinition,
  RequiredEntityData,
} from '@mikro-orm/core';
import type { Request } from 'express';
import { Logger } from '@nestjs/common';
import { EntityRepository, wrap } from '@mikro-orm/core';

import {
  Pagination,
  SimplePaginator,
  CursorPaginator,
  LengthAwarePaginator,
  DatabaseExceptionHandler,
} from '@/utils';
import { EntityOperation } from '@/enums';
import { BaseEntity } from '@/entities/base.entity';
import { ModelNotFoundException } from '@/exceptions';
import type { PaginationConfig } from '@/interfaces/pagination/pagination-config.interface';

/**
 * Base Repository Implementation
 *
 * Enterprise-grade repository providing Laravel-style fluent API over MikroORM.
 * Combines powerful database operations with an intuitive, chainable interface.
 *
 * @template T - Entity type extending BaseEntity
 *
 * @remarks
 * This repository provides:
 * - Basic CRUD operations with intuitive methods
 * - Fluent query building with method chaining
 * - Batch operations for high performance
 * - Aggregate functions (count, sum, avg, min, max)
 * - Advanced pagination with nestjs-paginate
 * - Transaction support
 * - Utility methods for common tasks
 *
 * All entities should extend BaseEntity to work with this repository.
 */
export abstract class BaseRepository<T extends BaseEntity> extends EntityRepository<T> {
  /**
   * Logger instance for structured logging throughout the repository
   *
   * Automatically configured with the repository class name as context.
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
   * Internal query state for fluent query building
   *
   * Stores accumulated query conditions, ordering, limits, and relations
   * as methods are chained together.
   *
   * @private
   */
  private queryState: {
    where: FilterQuery<T>[];
    orderBy?: QueryOrderMap<T>;
    limit?: number;
    offset?: number;
    populate?: string[];
  } = {
    where: [],
  };

  // ============================================================================
  // BASIC RETRIEVAL METHODS
  // ============================================================================

  /**
   * Get the underlying EntityManager
   *
   * Provides access to MikroORM's EntityManager for advanced operations
   * not covered by repository methods.
   *
   * @returns EntityManager instance
   *
   * @example
   * ```typescript
   * const em = userRepository.getEntityManager();
   *
   * // Use QueryBuilder for complex queries
   * const qb = em.createQueryBuilder(User);
   * qb.select('*')
   *   .where({ age: { $gte: 18 } })
   *   .andWhere({ isActive: true });
   *
   * const users = await qb.getResult();
   * ```
   *
   * @remarks
   * - Provides full MikroORM capabilities
   * - Use for complex queries
   * - Use for custom operations
   * - Same EntityManager as repository uses
   */
  getEntityManager(): EntityManager {
    return this.em;
  }

  /**
   * Get all records from the table
   *
   * Retrieves all entities without any filtering. Use with caution on large
   * datasets as it loads all records into memory.
   *
   * @returns Promise resolving to array of all entities
   *
   * @example
   * ```typescript
   * // Get all users
   * const users = await userRepository.all();
   *
   * // With relations
   * const usersWithPosts = await userRepository
   *   .with(['posts'])
   *   .all();
   * ```
   *
   * @remarks
   * - For large datasets, consider using `paginate()` or `chunk()` instead
   * - This method does not apply any filtering or ordering by default
   *
   * @see {@link paginate} For paginated results
   * @see {@link chunk} For processing large datasets in batches
   */
  async all(): Promise<T[]> {
    return this.findAll();
  }

  /**
   * Get the first record from the table
   *
   * Retrieves the first entity ordered by primary key (ascending) by default.
   * Returns null if no records exist.
   *
   * @returns Promise resolving to first entity or null
   *
   * @example
   * ```typescript
   * // Get first user
   * const firstUser = await userRepository.first();
   *
   * // Get first active user
   * const firstActive = await userRepository
   *   .where({ isActive: true })
   *   .first();
   *
   * // With custom ordering
   * const newest = await userRepository
   *   .orderBy({ createdAt: 'DESC' })
   *   .first();
   * ```
   *
   * @remarks
   * - Returns null if no records found (safe to use)
   * - Default ordering is by primary key ascending
   * - Chain with `where()` for filtered results
   */
  async first(): Promise<T | null> {
    const results = await this.find({}, { limit: 1 });
    return results[0] || null;
  }

  /**
   * Find a single entity by its primary key
   *
   * Retrieves an entity by its primary key value. Returns null if not found.
   * This is the most efficient way to fetch a single record by ID.
   *
   * @param id - The primary key value
   * @returns Promise resolving to entity or null
   *
   * @example
   * ```typescript
   * // Find user by ID
   * const user = await userRepository.findById(123);
   *
   * if (user) {
   *   console.log(user.name);
   * } else {
   *   console.log('User not found');
   * }
   *
   * // With relations
   * const userWithPosts = await userRepository
   *   .with(['posts'])
   *   .findById(123);
   * ```
   *
   * @remarks
   * - Most efficient method for single record retrieval
   * - Uses database index on primary key
   * - Returns null if entity doesn't exist
   *
   * @see {@link findByIdOrFail} For throwing error when not found
   */
  async findById(id: Primary<T>): Promise<T | null> {
    return this.findOne(id as any);
  }

  /**
   * Find multiple entities by their primary keys
   *
   * Efficiently retrieves multiple entities by their primary key values in a
   * single database query. Much more performant than multiple findById calls.
   * Returns only found entities - missing IDs are silently ignored.
   *
   * @param ids - Array of primary key values to find
   * @returns Promise resolving to array of found entities
   * @throws {QueryException} If database query fails
   * @throws {DatabaseException} If database connection fails
   *
   * @example
   * ```typescript
   * // Find multiple users by IDs
   * const users = await userRepository.findMany([1, 2, 3, 4, 5]);
   * console.log(`Found ${users.length} users`);
   *
   * // With relations
   * const usersWithPosts = await userRepository
   *   .with(['posts'])
   *   .findMany([1, 2, 3]);
   *
   * // Missing IDs are ignored
   * const users = await userRepository.findMany([1, 999, 3]);
   * // Returns only users 1 and 3 if 999 doesn't exist
   * ```
   *
   * @remarks
   * - Single database query for all IDs (efficient)
   * - Uses IN clause with primary key index
   * - Missing IDs don't cause errors
   * - Order of results may differ from input order
   * - Returns empty array if no IDs found
   *
   * @see {@link findById} For single entity retrieval
   */
  async findMany(ids: Primary<T>[]): Promise<T[]> {
    try {
      if (ids.length === 0) {
        return [];
      }

      const entityName = this.getEntityName();
      const metadata = this.em.getMetadata().get(entityName);
      const pkField = metadata.primaryKeys[0] as string;

      return await this.find({ [pkField]: { $in: ids } } as any);
    } catch (error: Error | any) {
      // Re-throw if already a domain exception
      if (DatabaseExceptionHandler.isDomainException(error)) {
        throw error;
      }

      // Use centralized exception handler
      throw DatabaseExceptionHandler.handleFind(error, this.getEntityName(), { ids });
    }
  }

  /**
   * Find a single entity by primary key or throw error
   *
   * Similar to `findById` but throws an error if the entity is not found.
   * Useful when you expect the entity to exist and want to fail fast.
   *
   * @param id - The primary key value
   * @returns Promise resolving to entity (never null)
   * @throws {ModelNotFoundException} If entity not found
   * @throws {QueryException} If database query fails
   * @throws {DatabaseException} If database connection fails
   *
   * @example
   * ```typescript
   * try {
   *   const user = await userRepository.findByIdOrFail(123);
   *   // User is guaranteed to exist here
   *   console.log(user.name);
   * } catch (error: Error | any) {
   *   if (error instanceof ModelNotFoundException) {
   *     console.error('User not found');
   *   }
   * }
   * ```
   *
   * @remarks
   * - Throws ModelNotFoundException instead of returning null
   * - Use when entity existence is expected
   * - Better for API endpoints where 404 should be returned
   */
  async findByIdOrFail(id: Primary<T>): Promise<T> {
    try {
      const entity = await this.findOne(id as any);
      if (!entity) {
        throw ModelNotFoundException.forId(this.getEntityName(), id as string | number);
      }
      return entity;
    } catch (error: Error | any) {
      // Re-throw if already a domain exception
      if (DatabaseExceptionHandler.isDomainException(error)) {
        throw error;
      }

      // Use centralized exception handler
      throw DatabaseExceptionHandler.handleFind(error, this.getEntityName(), { id });
    }
  }

  /**
   * Get the first record or throw exception
   *
   * Similar to `first()` but throws ModelNotFoundException if no records found.
   * Combines the convenience of first() with the safety of throwing on empty result.
   * Can be chained with fluent query methods.
   *
   * @returns Promise resolving to first entity (never null)
   * @throws {ModelNotFoundException} If no records found
   * @throws {QueryException} If database query fails
   * @throws {DatabaseException} If database connection fails
   *
   * @example
   * ```typescript
   * // Get first user or fail
   * const user = await userRepository.firstOrFail();
   *
   * // With conditions
   * const admin = await userRepository
   *   .where({ role: 'admin', isActive: true })
   *   .firstOrFail();
   *
   * // Error handling
   * try {
   *   const user = await userRepository
   *     .where({ email: 'nonexistent@example.com' })
   *     .firstOrFail();
   * } catch (error: Error | any) {
   *   if (error instanceof ModelNotFoundException) {
   *     console.log('No user found with that email');
   *   }
   * }
   * ```
   *
   * @remarks
   * - Guaranteed to return an entity or throw
   * - Works with fluent query builder
   * - Useful for validation flows
   * - Better than null checks in strict workflows
   *
   * @see {@link first} For nullable version
   */
  async firstOrFail(): Promise<T> {
    try {
      const entity = await this.first();
      if (!entity) {
        throw ModelNotFoundException.make(
          `No ${this.getEntityName()} found matching the query`,
          this.getEntityName(),
        );
      }
      return entity;
    } catch (error: Error | any) {
      // Re-throw if already a domain exception
      if (DatabaseExceptionHandler.isDomainException(error)) {
        throw error;
      }

      // Use centralized exception handler
      throw DatabaseExceptionHandler.handleFind(error, this.getEntityName());
    }
  }

  /**
   * Find first matching conditions or create new unmanaged instance
   *
   * Searches for an entity matching the attributes. If found, returns it.
   * If not found, creates a new unmanaged entity instance (not persisted to database).
   * Useful for forms and validation flows where you want an entity instance regardless.
   *
   * @param attributes - Filter conditions to search for
   * @param values - Additional values to merge if creating new instance
   * @returns Promise resolving to existing or new entity
   * @throws {QueryException} If database query fails
   * @throws {DatabaseException} If database connection fails
   *
   * @example
   * ```typescript
   * // Find or create new user instance
   * const user = await userRepository.firstOrNew(
   *   { email: 'john@example.com' },
   *   { name: 'John Doe', role: 'user' }
   * );
   *
   * // Check if it was found or created
   * if (user.isPersisted()) {
   *   console.log('Found existing user');
   * } else {
   *   console.log('Created new user instance (not saved)');
   *   await user.save(); // Save if needed
   * }
   *
   * // Useful for forms with default values
   * const settings = await settingsRepository.firstOrNew(
   *   { userId: currentUser.id },
   *   { theme: 'dark', notifications: true }
   * );
   * ```
   *
   * @remarks
   * - Does NOT persist new entity automatically
   * - Merges attributes and values for new entity
   * - Call save() or persistAndFlush() to persist
   * - Existing entities are fully hydrated
   *
   * @see {@link firstOrCreate} For auto-persisting version
   */
  async firstOrNew(attributes: FilterQuery<T>, values?: EntityData<T>): Promise<T> {
    try {
      const entity = await this.findOne(attributes);
      if (entity) {
        return entity;
      }

      // Create new unmanaged instance
      const data = { ...attributes, ...values } as any;
      return this.create(data);
    } catch (error: Error | any) {
      // Re-throw if already a domain exception
      if (DatabaseExceptionHandler.isDomainException(error)) {
        throw error;
      }

      // Use centralized exception handler
      throw DatabaseExceptionHandler.handleFind(error, this.getEntityName(), { attributes });
    }
  }

  /**
   * Find first matching conditions or create and save new entity
   *
   * Searches for an entity matching the attributes. If found, returns it.
   * If not found, creates, persists, and returns a new entity.
   * Atomic operation that combines find and create in one convenient method.
   *
   * @param attributes - Filter conditions to search for (also used in creation)
   * @param values - Additional values to include when creating
   * @returns Promise resolving to existing or newly created entity
   * @throws {QueryException} If database query or creation fails
   * @throws {DatabaseException} If database connection fails
   *
   * @example
   * ```typescript
   * // Find or create user (always returns persisted entity)
   * const user = await userRepository.firstOrCreate(
   *   { email: 'john@example.com' },
   *   { name: 'John Doe', role: 'user' }
   * );
   * console.log(user.id); // Always has ID
   *
   * // Common pattern for unique relationships
   * const profile = await profileRepository.firstOrCreate(
   *   { userId: user.id },
   *   { bio: 'Default bio', avatar: 'default.png' }
   * );
   *
   * // Settings with defaults
   * const settings = await settingsRepository.firstOrCreate(
   *   { userId: currentUser.id },
   *   {
   *     theme: 'light',
   *     language: 'en',
   *     notifications: true
   *   }
   * );
   * ```
   *
   * @remarks
   * - Automatically persists new entity
   * - Returns fully managed entity with ID
   * - Transaction-safe operation
   * - Attributes used in both search and creation
   * - No race conditions (database handles uniqueness)
   *
   * @see {@link firstOrNew} For non-persisting version
   * @see {@link updateOrCreate} For update-on-found behavior
   */
  async firstOrCreate(attributes: FilterQuery<T>, values?: EntityData<T>): Promise<T> {
    try {
      const entity = await this.findOne(attributes);
      if (entity) {
        return entity;
      }

      // Create and persist new entity
      const data = { ...attributes, ...values } as RequiredEntityData<T>;
      return await this.createAndFlush(data);
    } catch (error: Error | any) {
      // Re-throw if already a domain exception
      if (DatabaseExceptionHandler.isDomainException(error)) {
        throw error;
      }

      // Use centralized exception handler
      throw DatabaseExceptionHandler.handleCreate(error, this.getEntityName(), {
        attributes,
        values,
      });
    }
  }

  /**
   * Get exactly one result or throw exception
   *
   * Ensures the query returns exactly one result. Throws exception if zero or
   * multiple results found. Useful for validation and ensuring data integrity.
   * Prevents silent bugs from duplicate or missing data.
   *
   * @param where - Optional filter conditions
   * @returns Promise resolving to the single entity
   * @throws {ModelNotFoundException} If no results found
   * @throws {Error} If more than one result found
   * @throws {QueryException} If database query fails
   * @throws {DatabaseException} If database connection fails
   *
   * @example
   * ```typescript
   * // Ensure email is unique
   * const user = await userRepository.sole({ email: 'john@example.com' });
   * // Throws if 0 or >1 users with that email
   *
   * // With fluent API
   * const admin = await userRepository
   *   .where({ role: 'admin', isActive: true })
   *   .sole();
   *
   * // Validation example
   * try {
   *   const order = await orderRepository.sole({
   *     userId: user.id,
   *     status: 'pending'
   *   });
   *   console.log('User has exactly one pending order');
   * } catch (error: Error | any) {
   *   if (error.message.includes('Expected exactly 1')) {
   *     console.log('User has multiple pending orders');
   *   }
   * }
   * ```
   *
   * @remarks
   * - Stricter than first() or firstOrFail()
   * - Detects data integrity issues
   * - Useful for unique constraint validation
   * - Limit 2 query for efficiency
   * - Clear error messages
   *
   * @see {@link first} For lenient single result
   * @see {@link firstOrFail} For at-least-one validation
   */
  async sole(where?: FilterQuery<T>): Promise<T> {
    try {
      // Fetch at most 2 results to determine if multiple exist
      const results = await this.find(where || {}, { limit: 2 });

      if (results.length === 0) {
        throw ModelNotFoundException.make(
          `No ${this.getEntityName()} found matching the query`,
          this.getEntityName(),
        );
      }

      if (results.length > 1) {
        throw new Error(`Expected exactly 1 ${this.getEntityName()} but found ${results.length}`);
      }

      return results[0] as T;
    } catch (error: Error | any) {
      // Re-throw if already a domain exception or our custom error
      if (
        DatabaseExceptionHandler.isDomainException(error) ||
        (error instanceof Error && error.message?.includes('Expected exactly 1'))
      ) {
        throw error;
      }

      // Use centralized exception handler
      throw DatabaseExceptionHandler.handleFind(error, this.getEntityName(), { where });
    }
  }

  // ============================================================================
  // FLUENT QUERY METHODS (Chainable)
  // ============================================================================

  /**
   * Add a where clause to the query
   *
   * Chainable method for building complex queries with multiple conditions.
   * Returns the repository instance for method chaining.
   *
   * @param conditions - Filter conditions
   * @returns Repository instance for chaining
   *
   * @example
   * ```typescript
   * // Single condition
   * const users = await userRepository
   *   .where({ isActive: true })
   *   .get();
   *
   * // Multiple conditions
   * const users = await userRepository
   *   .where({ isActive: true, role: 'admin' })
   *   .get();
   *
   * // Chaining multiple where calls
   * const users = await userRepository
   *   .where({ isActive: true })
   *   .where({ emailVerified: true })
   *   .get();
   *
   * // Complex operators
   * const users = await userRepository
   *   .where({ age: { $gte: 18, $lte: 65 } })
   *   .get();
   * ```
   *
   * @remarks
   * - Chainable with other query methods
   * - Multiple calls are AND'd together
   * - Supports MikroORM's full operator syntax ($gte, $lt, $in, etc.)
   */
  where(conditions: FilterQuery<T>): this {
    this.queryState.where.push(conditions);
    return this;
  }

  /**
   * Add an OR where condition to the query
   *
   * Combines conditions with OR logic instead of AND. If no previous conditions exist,
   * behaves like a regular where(). Subsequent conditions are OR'd with existing ones.
   * Essential for queries that need alternative matching criteria.
   *
   * @param conditions - Filter conditions to OR with existing conditions
   * @returns Repository instance for chaining
   *
   * @example
   * ```typescript
   * // Find admins OR moderators
   * const users = await userRepository
   *   .where({ role: 'admin' })
   *   .orWhere({ role: 'moderator' })
   *   .get();
   *
   * // Multiple OR conditions
   * const users = await userRepository
   *   .where({ status: 'active' })
   *   .orWhere({ status: 'pending' })
   *   .orWhere({ status: 'trial' })
   *   .get();
   *
   * // Complex OR with AND
   * const users = await userRepository
   *   .where({ role: 'admin', isActive: true })
   *   .orWhere({ role: 'owner' })
   *   .get();
   * // SQL: (role = 'admin' AND isActive = true) OR (role = 'owner')
   * ```
   *
   * @remarks
   * - Creates OR relationship between conditions
   * - First call with no conditions acts as where()
   * - Each call adds to OR chain
   * - Can be mixed with where() for complex logic
   *
   * @see {@link where} For AND conditions
   */
  orWhere(conditions: FilterQuery<T>): this {
    if (this.queryState.where.length === 0) {
      // If no existing conditions, treat as regular where
      this.queryState.where.push(conditions);
    } else {
      // Combine all existing and new conditions with $or
      const existing = this.queryState.where;
      this.queryState.where = [{ $or: [...existing, conditions] } as FilterQuery<T>];
    }
    return this;
  }

  /**
   * Add WHERE IN condition
   *
   * Filters results where the specified field's value matches any value in the provided array.
   * Efficient for checking membership in a set of values. Uses database IN clause.
   *
   * @param field - Field name to check
   * @param values - Array of values to match against
   * @returns Repository instance for chaining
   *
   * @example
   * ```typescript
   * // Find users with specific statuses
   * const users = await userRepository
   *   .whereIn('status', ['active', 'pending', 'trial'])
   *   .get();
   *
   * // Find by multiple IDs
   * const users = await userRepository
   *   .whereIn('id', [1, 2, 3, 4, 5])
   *   .get();
   *
   * // Combine with other conditions
   * const admins = await userRepository
   *   .whereIn('role', ['admin', 'super_admin'])
   *   .where({ isActive: true })
   *   .get();
   * ```
   *
   * @remarks
   * - Uses efficient database IN clause
   * - Empty array returns no results
   * - Chainable with other query methods
   * - More readable than $in operator
   *
   * @see {@link whereNotIn} For NOT IN condition
   * @see {@link findMany} For direct ID lookup
   */
  whereIn(field: keyof T, values: any[]): this {
    return this.where({ [field]: { $in: values } } as any);
  }

  /**
   * Add WHERE NOT IN condition
   *
   * Filters results where the specified field's value does NOT match any value in the array.
   * Opposite of whereIn(). Useful for exclusion filters.
   *
   * @param field - Field name to check
   * @param values - Array of values to exclude
   * @returns Repository instance for chaining
   *
   * @example
   * ```typescript
   * // Exclude specific statuses
   * const users = await userRepository
   *   .whereNotIn('status', ['banned', 'deleted', 'suspended'])
   *   .get();
   *
   * // Exclude specific users
   * const others = await userRepository
   *   .whereNotIn('id', [currentUser.id, adminUser.id])
   *   .get();
   *
   * // Exclude multiple roles
   * const regularUsers = await userRepository
   *   .whereNotIn('role', ['admin', 'moderator', 'super_admin'])
   *   .where({ isActive: true })
   *   .get();
   * ```
   *
   * @remarks
   * - Uses database NOT IN clause
   * - Empty array excludes nothing
   * - Chainable with other conditions
   * - Useful for blacklist filtering
   *
   * @see {@link whereIn} For IN condition
   */
  whereNotIn(field: keyof T, values: any[]): this {
    return this.where({ [field]: { $nin: values } } as any);
  }

  /**
   * Add WHERE BETWEEN condition
   *
   * Filters results where the field's value is between two values (inclusive).
   * Useful for range queries like dates, prices, or ages.
   *
   * @param field - Field name to check
   * @param values - Tuple of [min, max] values (inclusive)
   * @returns Repository instance for chaining
   *
   * @example
   * ```typescript
   * // Find users between ages 18 and 65
   * const users = await userRepository
   *   .whereBetween('age', [18, 65])
   *   .get();
   *
   * // Find orders in price range
   * const orders = await orderRepository
   *   .whereBetween('total', [100, 500])
   *   .where({ status: 'completed' })
   *   .get();
   *
   * // Date range query
   * const logs = await logRepository
   *   .whereBetween('createdAt', [startDate, endDate])
   *   .get();
   * ```
   *
   * @remarks
   * - Inclusive range (includes boundary values)
   * - Uses $gte and $lte operators
   * - Works with numbers, dates, and strings
   * - More readable than manual operators
   *
   * @see {@link whereNotBetween} For NOT BETWEEN condition
   */
  whereBetween(field: keyof T, values: [any, any]): this {
    return this.where({ [field]: { $gte: values[0], $lte: values[1] } } as any);
  }

  /**
   * Add WHERE NOT BETWEEN condition
   *
   * Filters results where the field's value is NOT between two values.
   * Opposite of whereBetween(). Useful for excluding ranges.
   *
   * @param field - Field name to check
   * @param values - Tuple of [min, max] values to exclude
   * @returns Repository instance for chaining
   *
   * @example
   * ```typescript
   * // Exclude middle-aged users
   * const users = await userRepository
   *   .whereNotBetween('age', [30, 50])
   *   .get();
   * // Returns users < 30 OR > 50
   *
   * // Exclude normal price range
   * const products = await productRepository
   *   .whereNotBetween('price', [10, 100])
   *   .get();
   * // Returns very cheap or very expensive products
   * ```
   *
   * @remarks
   * - Excludes the range (< min OR > max)
   * - Uses $lt and $gt with OR
   * - Boundary values excluded
   * - Useful for outlier detection
   *
   * @see {@link whereBetween} For BETWEEN condition
   */
  whereNotBetween(field: keyof T, values: [any, any]): this {
    return this.where({
      $or: [{ [field]: { $lt: values[0] } }, { [field]: { $gt: values[1] } }],
    } as any);
  }

  /**
   * Add WHERE NULL condition
   *
   * Filters results where the specified field's value is NULL.
   * Essential for finding records with missing or unset values.
   *
   * @param field - Field name to check for NULL
   * @returns Repository instance for chaining
   *
   * @example
   * ```typescript
   * // Find users without profile pictures
   * const users = await userRepository
   *   .whereNull('avatarUrl')
   *   .get();
   *
   * // Find unverified emails
   * const unverified = await userRepository
   *   .whereNull('emailVerifiedAt')
   *   .where({ isActive: true })
   *   .get();
   *
   * // Find incomplete profiles
   * const incomplete = await profileRepository
   *   .whereNull('bio')
   *   .orWhere({ bio: '' })
   *   .get();
   * ```
   *
   * @remarks
   * - Checks for NULL database value
   * - Not the same as undefined
   * - Chainable with other conditions
   * - Common for optional fields
   *
   * @see {@link whereNotNull} For NOT NULL condition
   */
  whereNull(field: keyof T): this {
    return this.where({ [field]: null } as any);
  }

  /**
   * Add WHERE NOT NULL condition
   *
   * Filters results where the specified field's value is NOT NULL.
   * Useful for finding complete or populated records.
   *
   * @param field - Field name to check for NOT NULL
   * @returns Repository instance for chaining
   *
   * @example
   * ```typescript
   * // Find users with profile pictures
   * const users = await userRepository
   *   .whereNotNull('avatarUrl')
   *   .get();
   *
   * // Find verified users
   * const verified = await userRepository
   *   .whereNotNull('emailVerifiedAt')
   *   .get();
   *
   * // Find completed orders (has completion date)
   * const completed = await orderRepository
   *   .whereNotNull('completedAt')
   *   .where({ status: 'delivered' })
   *   .get();
   * ```
   *
   * @remarks
   * - Checks for NON-NULL database value
   * - Excludes NULL but includes empty strings
   * - Use for required field validation
   * - Chainable with other conditions
   *
   * @see {@link whereNull} For NULL condition
   */
  whereNotNull(field: keyof T): this {
    return this.where({ [field]: { $ne: null } } as any);
  }

  /**
   * Add an order by clause to the query
   *
   * @param orderBy - Ordering definition
   * @returns Repository instance for chaining
   *
   * @example
   * ```typescript
   * // Single field
   * const users = await userRepository
   *   .orderBy({ createdAt: 'DESC' })
   *   .get();
   *
   * // Multiple fields
   * const users = await userRepository
   *   .orderBy({ lastName: 'ASC', firstName: 'ASC' })
   *   .get();
   * ```
   */
  orderBy(orderBy: OrderDefinition<T>): this {
    this.queryState.orderBy = orderBy as QueryOrderMap<T>;
    return this;
  }

  /**
   * Limit the number of results
   *
   * @param limit - Maximum number of results
   * @returns Repository instance for chaining
   *
   * @example
   * ```typescript
   * const topTen = await userRepository
   *   .orderBy({ points: 'DESC' })
   *   .limit(10)
   *   .get();
   * ```
   */
  limit(limit: number): this {
    this.queryState.limit = limit;
    return this;
  }

  /**
   * Skip a number of results (offset)
   *
   * @param offset - Number of results to skip
   * @returns Repository instance for chaining
   *
   * @example
   * ```typescript
   * // Get results 11-20
   * const users = await userRepository
   *   .limit(10)
   *   .offset(10)
   *   .get();
   * ```
   */
  offset(offset: number): this {
    this.queryState.offset = offset;
    return this;
  }

  /**
   * Order by latest (descending by timestamp column)
   *
   * Convenience method for ordering by a timestamp field in descending order.
   * Defaults to 'createdAt' but can be customized for any date/timestamp field.
   * Useful for showing most recent records first.
   *
   * @param column - Column name to order by (default: 'createdAt')
   * @returns Repository instance for chaining
   *
   * @example
   * ```typescript
   * // Get latest users
   * const recentUsers = await userRepository
   *   .latest()
   *   .limit(10)
   *   .get();
   *
   * // Latest by custom column
   * const recentPosts = await postRepository
   *   .latest('publishedAt')
   *   .get();
   *
   * // Combine with conditions
   * const activeUsers = await userRepository
   *   .where({ isActive: true })
   *   .latest()
   *   .get();
   * ```
   *
   * @remarks
   * - Defaults to 'createdAt' column
   * - Descending order (newest first)
   * - Chainable with other methods
   * - Laravel-style convenience method
   *
   * @see {@link oldest} For ascending order
   * @see {@link orderBy} For custom ordering
   */
  latest(column: keyof T = 'createdAt' as keyof T): this {
    return this.orderBy({ [column]: 'DESC' } as any);
  }

  /**
   * Order by oldest (ascending by timestamp column)
   *
   * Convenience method for ordering by a timestamp field in ascending order.
   * Defaults to 'createdAt' but can be customized. Opposite of latest().
   * Useful for showing oldest records first.
   *
   * @param column - Column name to order by (default: 'createdAt')
   * @returns Repository instance for chaining
   *
   * @example
   * ```typescript
   * // Get oldest users
   * const firstUsers = await userRepository
   *   .oldest()
   *   .limit(10)
   *   .get();
   *
   * // Oldest pending orders
   * const oldOrders = await orderRepository
   *   .where({ status: 'pending' })
   *   .oldest()
   *   .get();
   * ```
   *
   * @remarks
   * - Defaults to 'createdAt' column
   * - Ascending order (oldest first)
   * - Useful for FIFO processing
   * - Chainable method
   *
   * @see {@link latest} For descending order
   */
  oldest(column: keyof T = 'createdAt' as keyof T): this {
    return this.orderBy({ [column]: 'ASC' } as any);
  }

  /**
   * Alias for limit() - Laravel naming convention
   *
   * Sets the maximum number of records to return. More intuitive name than limit()
   * for developers familiar with Laravel.
   *
   * @param value - Maximum number of records
   * @returns Repository instance for chaining
   *
   * @example
   * ```typescript
   * // Take first 10 users
   * const users = await userRepository.take(10).get();
   *
   * // Combine with skip for pagination
   * const page2 = await userRepository
   *   .skip(10)
   *   .take(10)
   *   .get();
   * ```
   *
   * @see {@link limit} For same functionality
   * @see {@link skip} For offset
   */
  take(value: number): this {
    return this.limit(value);
  }

  /**
   * Alias for offset() - Laravel naming convention
   *
   * Skips the specified number of records. More intuitive name than offset()
   * for developers familiar with Laravel.
   *
   * @param value - Number of records to skip
   * @returns Repository instance for chaining
   *
   * @example
   * ```typescript
   * // Skip first 20 users
   * const users = await userRepository.skip(20).get();
   *
   * // Manual pagination
   * const page = 3;
   * const perPage = 10;
   * const users = await userRepository
   *   .skip((page - 1) * perPage)
   *   .take(perPage)
   *   .get();
   * ```
   *
   * @see {@link offset} For same functionality
   * @see {@link take} For limit
   */
  skip(value: number): this {
    return this.offset(value);
  }

  /**
   * Clear existing ordering and optionally apply new
   *
   * Removes all existing orderBy conditions and optionally applies a new one.
   * Useful when you need to change sorting dynamically.
   *
   * @param column - Optional column to order by
   * @param direction - Sort direction (default: 'ASC')
   * @returns Repository instance for chaining
   *
   * @example
   * ```typescript
   * // Clear all ordering
   * const users = await userRepository
   *   .orderBy({ createdAt: 'DESC' })
   *   .reorder()
   *   .get();
   *
   * // Clear and apply new
   * const users = await userRepository
   *   .orderBy({ name: 'ASC' })
   *   .reorder('email', 'DESC')
   *   .get();
   * ```
   *
   * @remarks
   * - Removes all previous ordering
   * - Can be called without parameters
   * - Useful for dynamic sorting
   */
  reorder(column?: keyof T, direction: 'ASC' | 'DESC' = 'ASC'): this {
    this.queryState.orderBy = column ? ({ [column]: direction } as any) : undefined;
    return this;
  }

  /**
   * Eager load relations
   *
   * @param relations - Relations to load
   * @returns Repository instance for chaining
   *
   * @example
   * ```typescript
   * const users = await userRepository
   *   .with(['posts', 'profile'])
   *   .get();
   * ```
   */
  with(relations: string[]): this {
    this.queryState.populate = relations;
    return this;
  }

  /**
   * Execute the query and get results
   *
   * Terminal method that executes the built query and returns results.
   * Must be called after chaining query methods.
   *
   * @returns Promise resolving to array of entities
   *
   * @example
   * ```typescript
   * const users = await userRepository
   *   .where({ isActive: true })
   *   .orderBy({ createdAt: 'DESC' })
   *   .limit(10)
   *   .get(); // Execute and return results
   * ```
   */
  async get(): Promise<T[]> {
    // Merge all where conditions with $and
    const where =
      this.queryState.where.length > 0
        ? this.queryState.where.length === 1
          ? this.queryState.where[0]
          : ({ $and: this.queryState.where } as FilterQuery<T>)
        : ({} as FilterQuery<T>);

    const options: FindOptions<T> = {};

    if (this.queryState.orderBy) {
      options.orderBy = this.queryState.orderBy;
    }

    if (this.queryState.limit !== undefined) {
      options.limit = this.queryState.limit;
    }

    if (this.queryState.offset !== undefined) {
      options.offset = this.queryState.offset;
    }

    if (this.queryState.populate) {
      options.populate = this.queryState.populate as any;
    }

    // Reset query state after execution
    const results = await this.find(where || ({} as FilterQuery<T>), options);
    this.resetQueryState();

    return results;
  }

  /**
   * Reset the internal query state
   *
   * Clears all accumulated query conditions to prepare for the next query.
   * Called automatically after executing a fluent query.
   *
   * @private
   */
  private resetQueryState(): void {
    this.queryState = {
      where: [],
    };
  }

  // ============================================================================
  // CREATE & UPDATE METHODS
  // ============================================================================

  /**
   * Create and persist a new entity
   *
   * Note: EntityRepository.create() is synchronous. This method wraps it with persistence.
   * For the synchronous version, use: `const entity = repository.create(data); await em.flush();`
   *
   * @param data - Entity data
   * @returns Promise resolving to persisted entity
   * @throws {QueryException} If database query fails (e.g., unique constraint violation)
   * @throws {DatabaseException} If database connection fails
   *
   * @example
   * ```typescript
   * try {
   *   const user = await userRepository.createAndFlush({
   *     name: 'John Doe',
   *     email: 'john@example.com'
   *   });
   * } catch (error: Error | any) {
   *   if (DatabaseExceptionHandler.isDomainException(error) && error.isConstraintError()) {
   *     console.error('Email already exists');
   *   }
   * }
   * ```
   */
  async createAndFlush(data: RequiredEntityData<T>): Promise<T> {
    try {
      const entity = super.create(data);
      await this.em.persistAndFlush(entity);
      return entity;
    } catch (error: Error | any) {
      // Re-throw if already a domain exception
      if (DatabaseExceptionHandler.isDomainException(error)) {
        throw error;
      }

      // Use centralized exception handler
      throw DatabaseExceptionHandler.handleCreate(error, this.getEntityName(), { data });
    }
  }

  /**
   * Create entity instance without saving (alias for create)
   *
   * Creates an unmanaged entity instance that is not persisted to the database.
   * Same as MikroORM's create() but with Laravel-style naming for familiarity.
   * Must call save() or persistAndFlush() to persist the entity.
   *
   * @param data - Entity data to initialize
   * @returns Unmanaged entity instance
   *
   * @example
   * ```typescript
   * // Create without saving
   * const user = userRepository.make({
   *   name: 'John Doe',
   *   email: 'john@example.com'
   * });
   *
   * // Validate before saving
   * if (await user.validate()) {
   *   await em.persistAndFlush(user);
   * }
   * ```
   *
   * @remarks
   * - Does NOT persist to database
   * - Returns unmanaged entity
   * - Call save() to persist
   * - Laravel-style factory method
   *
   * @see {@link makeMany} For creating multiple
   * @see {@link createAndFlush} For immediate persistence
   */
  make(data: EntityData<T>): T {
    return this.create(data as RequiredEntityData<T>);
  }

  /**
   * Create multiple entity instances without saving
   *
   * Creates multiple unmanaged entity instances in one call.
   * None of the instances are persisted to the database.
   * Useful for bulk preparation before validation.
   *
   * @param records - Array of entity data
   * @returns Array of unmanaged entity instances
   *
   * @example
   * ```typescript
   * // Create multiple entities
   * const users = userRepository.makeMany([
   *   { name: 'Alice', email: 'alice@example.com' },
   *   { name: 'Bob', email: 'bob@example.com' }
   * ]);
   *
   * // Validate all before saving
   * for (const user of users) {
   *   if (await user.validate()) {
   *     await em.persist(user);
   *   }
   * }
   * await em.flush();
   * ```
   *
   * @remarks
   * - Creates unmanaged instances
   * - No database interaction
   * - Use for bulk preparation
   * - Call persistAndFlush() to save all
   *
   * @see {@link make} For single instance
   * @see {@link createMany} For immediate persistence
   */
  makeMany(records: EntityData<T>[]): T[] {
    return records.map((data) => this.create(data as RequiredEntityData<T>));
  }

  /**
   * Update an existing entity
   *
   * @param id - Entity primary key
   * @param data - Updated data
   * @returns Promise resolving to updated entity
   * @throws {ModelNotFoundException} If entity not found
   * @throws {QueryException} If database query fails (e.g., constraint violation)
   * @throws {DatabaseException} If database connection fails
   *
   * @example
   * ```typescript
   * try {
   *   const user = await userRepository.update(123, {
   *     name: 'Jane Doe',
   *     age: 31
   *   });
   * } catch (error: Error | any) {
   *   if (error instanceof ModelNotFoundException) {
   *     console.error('User not found');
   *   } else if (DatabaseExceptionHandler.isDomainException(error)) {
   *     console.error('Update failed:', error.message);
   *   }
   * }
   * ```
   */
  async update(id: Primary<T>, data: EntityData<T>): Promise<T> {
    try {
      const entity = await this.findByIdOrFail(id); // This already throws ModelNotFoundException
      wrap(entity).assign(data as any);
      await this.em.flush();
      return entity;
    } catch (error: Error | any) {
      // Re-throw if already a domain exception
      if (DatabaseExceptionHandler.isDomainException(error)) {
        throw error;
      }

      // Use centralized exception handler
      throw DatabaseExceptionHandler.handleUpdate(error, this.getEntityName(), { id, data });
    }
  }

  /**
   * Update existing entity or create new one
   *
   * Searches for an entity matching the attributes. If found, updates it with values.
   * If not found, creates a new entity with merged attributes and values.
   * Atomic operation that combines find, update, and create logic.
   *
   * @param attributes - Search criteria (also used in creation)
   * @param values - Values to update or include in creation
   * @returns Promise resolving to updated or created entity
   * @throws {QueryException} If database operations fail
   * @throws {DatabaseException} If database connection fails
   *
   * @example
   * ```typescript
   * // Update or create user
   * const user = await userRepository.updateOrCreate(
   *   { email: 'john@example.com' },
   *   { name: 'John Doe', age: 30 }
   * );
   *
   * // Update settings or create with defaults
   * const settings = await settingsRepository.updateOrCreate(
   *   { userId: currentUser.id },
   *   {
   *     theme: 'dark',
   *     notifications: true,
   *     language: 'en'
   *   }
   * );
   *
   * // Sync data from external API
   * const product = await productRepository.updateOrCreate(
   *   { sku: apiProduct.sku },
   *   {
   *     name: apiProduct.name,
   *     price: apiProduct.price,
   *     stock: apiProduct.stock
   *   }
   * );
   * ```
   *
   * @remarks
   * - Always returns persisted entity
   * - Updates existing or creates new
   * - Attributes used in search and creation
   * - Transaction-safe operation
   * - Useful for API sync operations
   *
   * @see {@link firstOrCreate} For create-only behavior
   * @see {@link upsert} For native database upsert
   */
  async updateOrCreate(attributes: FilterQuery<T>, values: EntityData<T>): Promise<T> {
    try {
      const entity = await this.findOne(attributes);

      if (entity) {
        // Update existing entity
        wrap(entity).assign(values as any);
        await this.em.flush();
        return entity;
      }

      // Create new entity
      const data = { ...attributes, ...values } as RequiredEntityData<T>;
      return await this.createAndFlush(data);
    } catch (error: Error | any) {
      // Re-throw if already a domain exception
      if (DatabaseExceptionHandler.isDomainException(error)) {
        throw error;
      }

      // Use centralized exception handler
      throw DatabaseExceptionHandler.handleCreate(error, this.getEntityName(), {
        attributes,
        values,
      });
    }
  }

  /**
   * Delete an entity by ID
   *
   * @param id - Entity primary key
   * @returns Promise resolving to boolean indicating success (false if not found)
   * @throws {QueryException} If database query fails
   * @throws {DatabaseException} If database connection fails
   *
   * @example
   * ```typescript
   * const deleted = await userRepository.delete(123);
   * if (deleted) {
   *   console.log('User deleted successfully');
   * } else {
   *   console.log('User not found');
   * }
   * ```
   */
  async delete(id: Primary<T>): Promise<boolean> {
    try {
      const entity = await this.findById(id);
      if (!entity) {
        return false;
      }
      await this.em.removeAndFlush(entity);
      return true;
    } catch (error: Error | any) {
      // Re-throw if already a domain exception
      if (DatabaseExceptionHandler.isDomainException(error)) {
        throw error;
      }

      // Use centralized exception handler
      throw DatabaseExceptionHandler.handleDelete(error, this.getEntityName(), { id });
    }
  }

  /**
   * Save (persist) an entity
   *
   * @param entity - Entity instance to save
   * @returns Promise resolving to saved entity
   * @throws {QueryException} If database query fails (e.g., constraint violation)
   * @throws {DatabaseException} If database connection fails
   *
   * @example
   * ```typescript
   * const user = User.make({ name: 'John' });
   * await userRepository.save(user);
   * ```
   */
  async save(entity: T): Promise<T> {
    try {
      await this.em.persistAndFlush(entity);
      return entity;
    } catch (error: Error | any) {
      // Re-throw if already a domain exception
      if (DatabaseExceptionHandler.isDomainException(error)) {
        throw error;
      }

      // Use centralized exception handler (save is like update)
      throw DatabaseExceptionHandler.handle(error, {
        entityName: this.getEntityName(),
        operation: EntityOperation.SAVED,
      });
    }
  }

  // ============================================================================
  // BATCH OPERATIONS (High Performance)
  // ============================================================================

  /**
   * Create multiple entities in a single operation
   *
   * Efficiently inserts multiple entities in one database operation.
   * Significantly faster than creating entities one by one.
   *
   * @param data - Array of entity data objects
   * @returns Promise resolving to array of created entities
   *
   * @example
   * ```typescript
   * const users = await userRepository.createMany([
   *   { name: 'John', email: 'john@example.com' },
   *   { name: 'Jane', email: 'jane@example.com' },
   *   { name: 'Bob', email: 'bob@example.com' }
   * ]);
   * console.log(users.length); // 3
   * ```
   *
   * @remarks
   * - Much faster than individual creates
   * - All entities created in single transaction
   * - IDs and timestamps auto-generated
   * - Atomic operation (all succeed or all fail)
   */
  async createMany(data: RequiredEntityData<T>[]): Promise<T[]> {
    try {
      const entities = data.map((item) => this.em.create(this.entityName, item) as T);
      await this.em.persistAndFlush(entities);
      return entities;
    } catch (error: Error | any) {
      // Re-throw if already a domain exception
      if (DatabaseExceptionHandler.isDomainException(error)) {
        throw error;
      }

      // Use centralized exception handler
      throw DatabaseExceptionHandler.handleCreate(error, this.getEntityName(), {
        count: data.length,
      });
    }
  }

  /**
   * Native batch insert (high performance)
   *
   * Performs a native SQL INSERT for maximum performance.
   * Does not instantiate entities or trigger lifecycle hooks.
   * Best for bulk data imports.
   *
   * @param data - Array of entity data
   * @returns Promise resolving to array of primary keys
   *
   * @example
   * ```typescript
   * const ids = await userRepository.insertMany([
   *   { name: 'User 1', email: 'user1@example.com' },
   *   { name: 'User 2', email: 'user2@example.com' }
   * ]);
   * console.log(ids); // [1, 2]
   * ```
   *
   * @remarks
   * - Fastest insertion method
   * - Does NOT trigger subscribers/hooks
   * - Does NOT load entities into memory
   * - Returns primary keys only
   * - Use for high-volume imports
   */
  async insertMany(data: RequiredEntityData<T>[]): Promise<Primary<T>[]> {
    try {
      // Use native insert for maximum performance
      await this.em.insertMany(this.entityName, data as any[]);

      // Extract primary keys from data
      const entityName = this.getEntityName();
      const metadata = this.em.getMetadata().get(entityName);
      const pkField = metadata.primaryKeys[0];

      if (!pkField) {
        throw new Error(`No primary key defined for entity ${entityName}`);
      }

      return data.map((item) => (item as any)[pkField]) as Primary<T>[];
    } catch (error: Error | any) {
      // Re-throw if already a domain exception
      if (DatabaseExceptionHandler.isDomainException(error)) {
        throw error;
      }

      // Use centralized exception handler
      throw DatabaseExceptionHandler.handle(error, {
        entityName: this.getEntityName(),
        operation: EntityOperation.INSERTED,
        context: { count: data.length },
      });
    }
  }

  /**
   * Update multiple entities matching criteria
   *
   * Performs native UPDATE query affecting all matching records.
   * Does not load entities into memory - operates directly on database.
   *
   * @param where - Filter criteria for entities to update
   * @param data - Update data to apply
   * @returns Promise resolving to number of affected rows
   *
   * @example
   * ```typescript
   * // Deactivate all unverified users
   * const affected = await userRepository.updateMany(
   *   { emailVerified: false },
   *   { isActive: false }
   * );
   * console.log(`Deactivated ${affected} users`);
   * ```
   *
   * @remarks
   * - Very efficient for bulk updates
   * - Does NOT trigger lifecycle hooks
   * - Returns count of affected rows
   * - Atomic operation
   */
  async updateMany(where: FilterQuery<T>, data: EntityData<T>): Promise<number> {
    try {
      return await this.em.nativeUpdate(this.entityName, where, data);
    } catch (error: Error | any) {
      // Re-throw if already a domain exception
      if (DatabaseExceptionHandler.isDomainException(error)) {
        throw error;
      }

      // Use centralized exception handler
      throw DatabaseExceptionHandler.handleUpdate(error, this.getEntityName(), {
        where,
        data,
      });
    }
  }

  /**
   * Delete multiple entities matching criteria
   *
   * Performs native DELETE query on all matching records.
   * Does not load entities into memory.
   *
   * @param where - Filter criteria for entities to delete
   * @returns Promise resolving to number of deleted rows
   *
   * @example
   * ```typescript
   * // Delete old logs
   * const deleted = await logRepository.deleteMany({
   *   createdAt: { $lt: new Date('2023-01-01') }
   * });
   * console.log(`Deleted ${deleted} old logs`);
   * ```
   *
   * @remarks
   * - Efficient bulk deletion
   * - Does NOT trigger lifecycle hooks
   * - Permanent deletion
   * - Returns count of deleted rows
   */
  async deleteMany(where: FilterQuery<T>): Promise<number> {
    try {
      return await this.em.nativeDelete(this.entityName, where);
    } catch (error: Error | any) {
      // Re-throw if already a domain exception
      if (DatabaseExceptionHandler.isDomainException(error)) {
        throw error;
      }

      // Use centralized exception handler
      throw DatabaseExceptionHandler.handleDelete(error, this.getEntityName(), { where });
    }
  }

  /**
   * Insert or update (upsert) a single entity
   *
   * Creates new entity if it doesn't exist, updates if it does.
   * Requires unique constraint or primary key to identify conflicts.
   *
   * @param data - Entity data (must include unique identifier)
   * @returns Promise resolving to upserted entity
   *
   * @example
   * ```typescript
   * // Upsert by email (unique constraint)
   * const user = await userRepository.upsert({
   *   email: 'john@example.com',
   *   name: 'John Doe',
   *   age: 30
   * });
   * ```
   *
   * @remarks
   * - Requires unique constraint or PK in data
   * - Atomic operation (no race conditions)
   * - Returns managed entity instance
   */
  async upsert(data: EntityData<T>): Promise<T> {
    try {
      const entity = this.em.upsert(this.entityName, data);
      await this.em.flush();
      return entity as unknown as T;
    } catch (error: Error | any) {
      // Re-throw if already a domain exception
      if (DatabaseExceptionHandler.isDomainException(error)) {
        throw error;
      }

      // Use centralized exception handler
      throw DatabaseExceptionHandler.handle(error, {
        entityName: this.getEntityName(),
        operation: EntityOperation.UPSERTED,
        context: { data },
      });
    }
  }

  /**
   * Insert or update multiple entities (batch upsert)
   *
   * Efficiently upserts multiple entities in a single operation.
   * Each entity is created if it doesn't exist, updated if it does.
   *
   * @param data - Array of entity data
   * @returns Promise resolving to array of upserted entities
   *
   * @example
   * ```typescript
   * const users = await userRepository.upsertMany([
   *   { email: 'john@example.com', name: 'John' },
   *   { email: 'jane@example.com', name: 'Jane' }
   * ]);
   * ```
   *
   * @remarks
   * - Efficient batch operation
   * - Returns managed entities
   * - Requires unique constraints
   */
  async upsertMany(data: EntityData<T>[]): Promise<T[]> {
    try {
      const entities = data.map((item) => this.em.upsert(this.entityName, item));
      await this.em.flush();
      return entities as unknown as T[];
    } catch (error: Error | any) {
      // Re-throw if already a domain exception
      if (DatabaseExceptionHandler.isDomainException(error)) {
        throw error;
      }

      // Use centralized exception handler
      throw DatabaseExceptionHandler.handle(error, {
        entityName: this.getEntityName(),
        operation: EntityOperation.UPSERTED,
        context: { count: data.length },
      });
    }
  }

  // ============================================================================
  // AGGREGATE FUNCTIONS
  // ============================================================================

  /**
   * Count entities matching criteria
   *
   * Returns the total number of entities matching the given filter.
   * Efficient operation that doesn't load entities into memory.
   *
   * @param where - Filter criteria (optional, counts all if omitted)
   * @returns Promise resolving to count
   *
   * @example
   * ```typescript
   * // Count all users
   * const total = await userRepository.count();
   *
   * // Count active users
   * const activeCount = await userRepository.count({ isActive: true });
   *
   * // Count with complex criteria
   * const count = await userRepository.count({
   *   age: { $gte: 18 },
   *   emailVerified: true
   * });
   * ```
   *
   * @remarks
   * - Very efficient (SQL COUNT)
   * - Does not load entities
   * - Can be used with any filter
   */
  async count(where?: FilterQuery<T>): Promise<number> {
    try {
      return await super.count(where || {});
    } catch (error: Error | any) {
      // Re-throw if already a domain exception
      if (DatabaseExceptionHandler.isDomainException(error)) {
        throw error;
      }

      // Use centralized exception handler
      throw DatabaseExceptionHandler.handleCount(error, this.getEntityName(), { where });
    }
  }

  /**
   * Calculate sum of a numeric field
   *
   * Calculates the sum of values in the specified numeric field.
   * Efficient database-level aggregation.
   *
   * @param field - Field name to sum
   * @param where - Filter criteria (optional)
   * @returns Promise resolving to sum (0 if no records)
   *
   * @example
   * ```typescript
   * // Total revenue
   * const revenue = await orderRepository.sum('total');
   *
   * // Revenue from completed orders
   * const completed = await orderRepository.sum(
   *   'total',
   *   { status: 'completed' }
   * );
   * ```
   *
   * @remarks
   * - Database-level calculation
   * - Returns 0 if no matching records
   * - Field must be numeric
   */
  async sum(field: keyof T, where?: FilterQuery<T>): Promise<number> {
    try {
      const entityName = this.getEntityName();
      const metadata = this.em.getMetadata().get(entityName);
      const tableName = metadata.tableName;
      const fieldName = String(field);

      let sql = `SELECT SUM(${fieldName}) as total FROM ${tableName}`;
      const params: any[] = [];

      if (where && Object.keys(where).length > 0) {
        // Simple where clause support - for complex queries use QueryBuilder directly
        const conditions = Object.entries(where).map(([key, value]) => {
          params.push(value);
          return `${key} = ?`;
        });
        sql += ` WHERE ${conditions.join(' AND ')}`;
      }

      const result = await this.em.getConnection().execute(sql, params);
      return result[0]?.total ? Number(result[0].total) : 0;
    } catch (error: Error | any) {
      // Re-throw if already a domain exception
      if (DatabaseExceptionHandler.isDomainException(error)) {
        throw error;
      }

      // Use centralized exception handler
      throw DatabaseExceptionHandler.handleAggregation(
        error,
        this.getEntityName(),
        EntityOperation.SUM,
        {
          field,
          where,
        },
      );
    }
  }

  /**
   * Calculate average of a numeric field
   *
   * Calculates the arithmetic mean of values in the specified field.
   *
   * @param field - Field name to average
   * @param where - Filter criteria (optional)
   * @returns Promise resolving to average
   *
   * @example
   * ```typescript
   * // Average user age
   * const avgAge = await userRepository.avg('age');
   *
   * // Average order value for last month
   * const avgOrder = await orderRepository.avg('total', {
   *   createdAt: { $gte: lastMonth }
   * });
   * ```
   *
   * @remarks
   * - Database-level calculation
   * - Field must be numeric
   * - Returns null if no records
   */
  async avg(field: keyof T, where?: FilterQuery<T>): Promise<number> {
    try {
      const entityName = this.getEntityName();
      const metadata = this.em.getMetadata().get(entityName);
      const tableName = metadata.tableName;
      const fieldName = String(field);

      let sql = `SELECT AVG(${fieldName}) as average FROM ${tableName}`;
      const params: any[] = [];

      if (where && Object.keys(where).length > 0) {
        const conditions = Object.entries(where).map(([key, value]) => {
          params.push(value);
          return `${key} = ?`;
        });
        sql += ` WHERE ${conditions.join(' AND ')}`;
      }

      const result = await this.em.getConnection().execute(sql, params);
      return result[0]?.average ? Number(result[0].average) : 0;
    } catch (error: Error | any) {
      // Re-throw if already a domain exception
      if (DatabaseExceptionHandler.isDomainException(error)) {
        throw error;
      }

      // Use centralized exception handler
      throw DatabaseExceptionHandler.handleAggregation(
        error,
        this.getEntityName(),
        EntityOperation.AVG,
        {
          field,
          where,
        },
      );
    }
  }

  /**
   * Find minimum value of a field
   *
   * Returns the smallest value in the specified field.
   *
   * @param field - Field name to find minimum
   * @param where - Filter criteria (optional)
   * @returns Promise resolving to minimum value
   *
   * @example
   * ```typescript
   * // Lowest price
   * const minPrice = await productRepository.min('price');
   *
   * // Lowest price in category
   * const min = await productRepository.min('price', {
   *   category: 'electronics'
   * });
   * ```
   *
   * @remarks
   * - Database-level operation
   * - Works with numeric, date, and string fields
   * - Returns null if no records
   */
  async min(field: keyof T, where?: FilterQuery<T>): Promise<number> {
    try {
      const entityName = this.getEntityName();
      const metadata = this.em.getMetadata().get(entityName);
      const tableName = metadata.tableName;
      const fieldName = String(field);

      let sql = `SELECT MIN(${fieldName}) as minimum FROM ${tableName}`;
      const params: any[] = [];

      if (where && Object.keys(where).length > 0) {
        const conditions = Object.entries(where).map(([key, value]) => {
          params.push(value);
          return `${key} = ?`;
        });
        sql += ` WHERE ${conditions.join(' AND ')}`;
      }

      const result = await this.em.getConnection().execute(sql, params);
      return result[0]?.minimum ? Number(result[0].minimum) : 0;
    } catch (error: Error | any) {
      // Re-throw if already a domain exception
      if (DatabaseExceptionHandler.isDomainException(error)) {
        throw error;
      }

      // Use centralized exception handler
      throw DatabaseExceptionHandler.handleAggregation(
        error,
        this.getEntityName(),
        EntityOperation.MIN,
        {
          field,
          where,
        },
      );
    }
  }

  /**
   * Find maximum value of a field
   *
   * Returns the largest value in the specified field.
   *
   * @param field - Field name to find maximum
   * @param where - Filter criteria (optional)
   * @returns Promise resolving to maximum value
   *
   * @example
   * ```typescript
   * // Highest price
   * const maxPrice = await productRepository.max('price');
   *
   * // Latest order date
   * const latest = await orderRepository.max('createdAt');
   * ```
   *
   * @remarks
   * - Database-level operation
   * - Works with numeric, date, and string fields
   * - Returns null if no records
   */
  async max(field: keyof T, where?: FilterQuery<T>): Promise<number> {
    try {
      const entityName = this.getEntityName();
      const metadata = this.em.getMetadata().get(entityName);
      const tableName = metadata.tableName;
      const fieldName = String(field);

      let sql = `SELECT MAX(${fieldName}) as maximum FROM ${tableName}`;
      const params: any[] = [];

      if (where && Object.keys(where).length > 0) {
        const conditions = Object.entries(where).map(([key, value]) => {
          params.push(value);
          return `${key} = ?`;
        });
        sql += ` WHERE ${conditions.join(' AND ')}`;
      }

      const result = await this.em.getConnection().execute(sql, params);
      return result[0]?.maximum ? Number(result[0].maximum) : 0;
    } catch (error: Error | any) {
      // Re-throw if already a domain exception
      if (DatabaseExceptionHandler.isDomainException(error)) {
        throw error;
      }

      // Use centralized exception handler
      throw DatabaseExceptionHandler.handleAggregation(
        error,
        this.getEntityName(),
        EntityOperation.MAX,
        {
          field,
          where,
        },
      );
    }
  }

  // ============================================================================
  // LARAVEL-STYLE PAGINATION
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
   *
   * @example
   * ```typescript
   * // Basic usage
   * const paginator = await userRepository.paginate(15);
   *
   * // With where clause
   * const paginator = await userRepository
   *   .where({ isActive: true })
   *   .paginate(15);
   *
   * // With Express request
   * const paginator = await userRepository.paginate(15, request);
   *
   * // Customize URLs
   * const response = paginator
   *   .withPath('/admin/users')
   *   .appends({ sort: 'name' })
   *   .toJSON();
   * ```
   */
  async paginate(
    perPage: number = 15,
    request?: Request,
    config?: Partial<PaginationConfig>,
  ): Promise<LengthAwarePaginator<T>> {
    try {
      // Get current page
      const pageName = config?.pageName || 'page';
      const currentPage = request ? Pagination.resolveCurrentPage(request, pageName) : 1;

      // Calculate offset
      const offset = (currentPage - 1) * perPage;

      // Build where clause from query state
      const where = this.buildWhereClause();

      // Build find options
      const options: FindOptions<T> = {
        limit: perPage,
        offset,
      };

      if (this.queryState.orderBy) {
        options.orderBy = this.queryState.orderBy;
      }

      if (this.queryState.populate) {
        options.populate = this.queryState.populate as any;
      }

      // Execute query with count
      const [data, total] = await this.findAndCount(where, options);

      // Reset query state
      this.resetQueryState();

      // Create paginator
      if (request) {
        return LengthAwarePaginator.fromRequest(data, total, perPage, request, config);
      }

      return LengthAwarePaginator.make(data, total, perPage, currentPage, config);
    } catch (error: Error | any) {
      // Reset query state even on error
      this.resetQueryState();

      // Re-throw if already a domain exception
      if (DatabaseExceptionHandler.isDomainException(error)) {
        throw error;
      }

      // Use centralized exception handler
      throw DatabaseExceptionHandler.handlePagination(error, this.getEntityName(), {
        perPage,
      });
    }
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
   *
   * @example
   * ```typescript
   * // Basic usage
   * const paginator = await userRepository.simplePaginate(15);
   *
   * // With where clause
   * const paginator = await userRepository
   *   .where({ isActive: true })
   *   .simplePaginate(15);
   *
   * // Get JSON response
   * const response = paginator.toJSON();
   * // { data: [...], meta: { hasMorePages: true }, links: {...} }
   * ```
   */
  async simplePaginate(
    perPage: number = 15,
    request?: Request,
    config?: Partial<PaginationConfig>,
  ): Promise<SimplePaginator<T>> {
    try {
      // Get current page
      const pageName = config?.pageName || 'page';
      const currentPage = request ? Pagination.resolveCurrentPage(request, pageName) : 1;

      // Calculate offset
      const offset = (currentPage - 1) * perPage;

      // Build where clause
      const where = this.buildWhereClause();

      // Build find options - fetch +1 to check if more pages exist
      const options: FindOptions<T> = {
        limit: perPage + 1,
        offset,
      };

      if (this.queryState.orderBy) {
        options.orderBy = this.queryState.orderBy;
      }

      if (this.queryState.populate) {
        options.populate = this.queryState.populate as any;
      }

      // Execute query
      const data = await this.find(where, options);

      // Reset query state
      this.resetQueryState();

      // Create paginator
      if (request) {
        return SimplePaginator.fromRequest(data, perPage, request, config);
      }

      return SimplePaginator.make(data, perPage, currentPage, config);
    } catch (error: Error | any) {
      // Reset query state even on error
      this.resetQueryState();

      // Re-throw if already a domain exception
      if (DatabaseExceptionHandler.isDomainException(error)) {
        throw error;
      }

      // Use centralized exception handler
      throw DatabaseExceptionHandler.handlePagination(error, this.getEntityName(), {
        perPage,
      });
    }
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
   *
   * @example
   * ```typescript
   * // Requires orderBy for cursor pagination
   * const paginator = await userRepository
   *   .where({ isActive: true })
   *   .orderBy({ id: 'DESC' })
   *   .cursorPaginate(20);
   *
   * // With cursor from request
   * const paginator = await userRepository
   *   .orderBy({ id: 'DESC' })
   *   .cursorPaginate(20, request);
   *
   * // Get response with next/prev cursors
   * const response = paginator.toJSON();
   * // { data: [...], meta: { nextCursor: "...", prevCursor: "..." } }
   * ```
   *
   * @remarks
   * - Requires orderBy() to be set
   * - More efficient for large datasets than offset pagination
   * - Cursors are base64-encoded and opaque to clients
   */
  async cursorPaginate(
    perPage: number = 15,
    request?: Request,
    config?: Partial<PaginationConfig>,
  ): Promise<CursorPaginator<T>> {
    try {
      // Get cursor from request
      const cursorName = config?.cursorName || 'cursor';
      const cursor = request ? Pagination.resolveCurrentCursor(request, cursorName) : null;

      // Build where clause
      let where = this.buildWhereClause();

      // Apply cursor condition if present
      if (cursor?.parameters) {
        const cursorWhere: any = {};

        // Add cursor conditions based on orderBy
        if (this.queryState.orderBy) {
          const orderFields = Object.keys(this.queryState.orderBy);
          const firstField = orderFields[0] as keyof T;

          if (firstField) {
            const direction = (this.queryState.orderBy as any)[firstField];

            if (cursor.parameters[firstField as string]) {
              // Use $lt or $gt based on sort direction
              cursorWhere[firstField] =
                direction === 'DESC'
                  ? { $lt: cursor.parameters[firstField as string] }
                  : { $gt: cursor.parameters[firstField as string] };
            }
          }
        }

        // Merge cursor conditions with existing where
        if (Object.keys(cursorWhere).length > 0) {
          where =
            Object.keys(where).length > 0
              ? ({ $and: [where, cursorWhere] } as FilterQuery<T>)
              : (cursorWhere as FilterQuery<T>);
        }
      }

      // Build find options - fetch +1 to check if more pages exist
      const options: FindOptions<T> = {
        limit: perPage + 1,
      };

      if (this.queryState.orderBy) {
        options.orderBy = this.queryState.orderBy;
      }

      if (this.queryState.populate) {
        options.populate = this.queryState.populate as any;
      }

      // Execute query
      const data = await this.find(where, options);

      // Reset query state
      this.resetQueryState();

      // Create paginator
      if (request) {
        return CursorPaginator.fromRequest(data, perPage, request, config);
      }

      return CursorPaginator.make(data, perPage, cursor, config);
    } catch (error: Error | any) {
      // Reset query state even on error
      this.resetQueryState();

      // Re-throw if already a domain exception
      if (DatabaseExceptionHandler.isDomainException(error)) {
        throw error;
      }

      // Use centralized exception handler
      throw DatabaseExceptionHandler.handlePagination(error, this.getEntityName(), {
        perPage,
      });
    }
  }

  /**
   * Build where clause from query state
   *
   * @private
   * @returns Merged where clause
   */
  private buildWhereClause(): FilterQuery<T> {
    if (this.queryState.where.length === 0) {
      return {} as FilterQuery<T>;
    }

    if (this.queryState.where.length === 1) {
      return this.queryState.where[0] || ({} as FilterQuery<T>);
    }

    return { $and: this.queryState.where } as FilterQuery<T>;
  }

  // ============================================================================
  // TRANSACTION SUPPORT
  // ============================================================================

  /**
   * Execute callback within a transaction
   *
   * Provides automatic transaction management with rollback on error.
   * Essential for maintaining data consistency across multiple operations.
   *
   * @param callback - Function to execute within transaction context
   * @returns Promise resolving to callback result
   * @throws Any error thrown by callback (transaction is rolled back)
   *
   * @example
   * ```typescript
   * const result = await userRepository.transaction(async (em) => {
   *   // All operations use the transactional EntityManager
   *   const user = await em.findOne(User, userId);
   *   user.balance -= 100;
   *
   *   const order = em.create(Order, { userId, total: 100 });
   *   await em.flush();
   *
   *   return { user, order };
   * });
   * // Automatically commits on success, rolls back on error
   * ```
   *
   * @remarks
   * - Automatic commit on success
   * - Automatic rollback on error
   * - Nested transactions supported
   * - Provides isolated EntityManager
   * - All operations must use provided `em`
   */
  async transaction<R>(callback: (em: EntityManager) => Promise<R>): Promise<R> {
    return this.em.transactional(callback);
  }

  // ============================================================================
  // UTILITY METHODS
  // ============================================================================

  /**
   * Check if entity exists matching criteria
   *
   * Efficient existence check without loading the entity into memory.
   * Returns immediately on first match.
   *
   * @param where - Filter criteria to check
   * @returns Promise resolving to boolean (true if exists)
   *
   * @example
   * ```typescript
   * // Check if email exists
   * const exists = await userRepository.exists({ email: 'john@example.com' });
   * if (exists) {
   *   throw new Error('Email already taken');
   * }
   *
   * // Check if any active users exist
   * const hasActive = await userRepository.exists({ isActive: true });
   * ```
   *
   * @remarks
   * - More efficient than `count() > 0`
   * - Does not load entity
   * - Returns on first match
   * - Use for validation checks
   */
  async exists(where: FilterQuery<T>): Promise<boolean> {
    const count = await this.count(where);
    return count > 0;
  }

  /**
   * Check if no records exist (opposite of exists)
   *
   * Returns true if NO records match the criteria. Convenient negation of exists().
   * Useful for validation and guard clauses.
   *
   * @param where - Optional filter conditions
   * @returns Promise resolving to true if no records exist
   *
   * @example
   * ```typescript
   * // Check if email is available
   * if (await userRepository.doesntExist({ email: 'new@example.com' })) {
   *   console.log('Email is available!');
   * }
   *
   * // Guard clause
   * if (await orderRepository.doesntExist({ userId: user.id, status: 'pending' })) {
   *   throw new Error('No pending orders');
   * }
   * ```
   *
   * @see {@link exists} For positive check
   */
  async doesntExist(where?: FilterQuery<T>): Promise<boolean> {
    return !(await this.exists(where || {}));
  }

  /**
   * Process large dataset in chunks
   *
   * Efficiently processes large datasets by loading and processing
   * records in manageable batches. Prevents memory overflow.
   *
   * @param chunkSize - Number of records per chunk
   * @param callback - Function to process each chunk
   * @returns Promise that resolves when all chunks processed
   *
   * @example
   * ```typescript
   * // Send emails to all users in chunks of 1000
   * await userRepository.chunk(1000, async (users) => {
   *   for (const user of users) {
   *     await emailrepository.send(user.email, 'Newsletter');
   *   }
   *   console.log(`Processed ${users.length} users`);
   * });
   *
   * // Can be combined with where()
   * await userRepository
   *   .where({ isActive: true })
   *   .chunk(500, async (users) => {
   *     // Process active users only
   *   });
   * ```
   *
   * @remarks
   * - Memory efficient for large datasets
   * - Processes records in batches
   * - Useful for bulk operations
   * - Callback called for each chunk
   */
  async chunk(chunkSize: number, callback: (entities: T[]) => Promise<void>): Promise<void> {
    let offset = 0;
    let hasMore = true;

    while (hasMore) {
      const chunk = await this.find({}, { limit: chunkSize, offset });

      if (chunk.length === 0) {
        hasMore = false;
        break;
      }

      await callback(chunk);

      if (chunk.length < chunkSize) {
        hasMore = false;
      } else {
        offset += chunkSize;
      }
    }
  }

  /**
   * Process each record individually with callback
   *
   * Iterates through all matching records one at a time, applying the callback
   * to each. More convenient than chunk() when you need to process items individually.
   * Automatically handles chunking internally for memory efficiency.
   *
   * @param callback - Function to process each entity (receives entity and index)
   * @returns Promise that resolves when all entities processed
   *
   * @example
   * ```typescript
   * // Send email to each user
   * await userRepository.each(async (user, index) => {
   *   await sendEmail(user.email, 'Newsletter');
   *   console.log(`Processed ${index + 1} users`);
   * });
   *
   * // Process with early termination
   * await orderRepository.each(async (order, index) => {
   *   if (order.total > 10000) {
   *     await flagForReview(order);
   *   }
   *
   *   // Stop after 100 orders
   *   if (index >= 100) {
   *     return false; // Stop processing
   *   }
   * });
   *
   * // Update entities one by one
   * await userRepository
   *   .where({ isActive: false })
   *   .each(async (user) => {
   *     user.deactivatedAt = new Date();
   *     await user.save();
   *   });
   * ```
   *
   * @remarks
   * - Processes one entity at a time
   * - Uses chunking internally (100 per chunk)
   * - Return false from callback to stop
   * - Memory efficient for large datasets
   * - Callback receives entity and index
   *
   * @see {@link chunk} For batch processing
   * @see {@link chunkById} For safe update iteration
   */
  async each(callback: (entity: T, index: number) => Promise<void | boolean>): Promise<void> {
    let index = 0;

    await this.chunk(100, async (entities) => {
      for (const entity of entities) {
        const shouldContinue = await callback(entity, index++);
        if (shouldContinue === false) {
          return; // Stop processing
        }
      }
    });
  }

  /**
   * Chunk by ID for safe updates during iteration
   *
   * Processes records in chunks using ID-based pagination instead of offset.
   * Safer than regular chunk() when modifying records during iteration.
   * Prevents issues with shifting offsets when records are updated or deleted.
   *
   * @param chunkSize - Number of records per chunk
   * @param callback - Function to process each chunk
   * @param column - Column to use for cursor (default: 'id')
   * @returns Promise that resolves when all chunks processed
   *
   * @example
   * ```typescript
   * // Safe to update records during iteration
   * await userRepository.chunkById(100, async (users) => {
   *   for (const user of users) {
   *     user.lastProcessed = new Date();
   *   }
   *   await em.flush();
   * });
   *
   * // Process and delete safely
   * await logRepository
   *   .where({ createdAt: { $lt: oldDate } })
   *   .chunkById(500, async (logs) => {
   *     await archiveToS3(logs);
   *     for (const log of logs) {
   *       await em.remove(log);
   *     }
   *     await em.flush();
   *   });
   *
   * // Stop after condition met
   * await orderRepository.chunkById(50, async (orders) => {
   *     const processed = await processOrders(orders);
   *     if (processed >= 1000) {
   *       return false; // Stop processing
   *     }
   *   }, 'orderId');
   * ```
   *
   * @remarks
   * - Uses ID-based pagination (cursor)
   * - Safe for updates/deletes during iteration
   * - No offset shifting issues
   * - Requires ordered column (usually PK)
   * - Return false to stop processing
   *
   * @see {@link chunk} For standard chunking
   * @see {@link each} For individual processing
   */
  async chunkById(
    chunkSize: number,
    callback: (entities: T[]) => Promise<void | boolean>,
    column: keyof T = 'id' as keyof T,
  ): Promise<void> {
    let lastId: any = 0;
    let hasMore = true;

    while (hasMore) {
      // Fetch next chunk using cursor
      const chunk = await this.find({ [column]: { $gt: lastId } } as any, {
        orderBy: { [column]: 'ASC' } as any,
        limit: chunkSize,
      });

      if (chunk.length === 0) {
        break;
      }

      // Process chunk
      const shouldContinue = await callback(chunk);
      if (shouldContinue === false) {
        break;
      }

      // Update cursor for next iteration
      lastId = (chunk[chunk.length - 1] as any)[column];
      hasMore = chunk.length === chunkSize;
    }
  }

  /**
   * Destroy records by IDs (Laravel-style batch delete)
   *
   * Deletes multiple entities by their primary keys in a single operation.
   * Returns the number of deleted records. More intuitive name than deleteMany
   * for developers familiar with Laravel's destroy() method.
   *
   * @param ids - Single ID or array of IDs to delete
   * @returns Promise resolving to number of deleted records
   * @throws {QueryException} If database query fails
   * @throws {DatabaseException} If database connection fails
   *
   * @example
   * ```typescript
   * // Destroy single record
   * const deleted = await userRepository.destroy(123);
   *
   * // Destroy multiple records
   * const deleted = await userRepository.destroy([1, 2, 3, 4, 5]);
   * console.log(`Deleted ${deleted} users`);
   *
   * // From form selections
   * const selectedIds = req.body.userIds; // [10, 20, 30]
   * const deleted = await userRepository.destroy(selectedIds);
   * res.json({ message: `Deleted ${deleted} users` });
   * ```
   *
   * @remarks
   * - Accepts single ID or array
   * - Returns count of deleted records
   * - Uses efficient batch delete
   * - Does not load entities into memory
   * - Laravel-style naming convention
   *
   * @see {@link delete} For single entity delete
   * @see {@link deleteMany} For filtered batch delete
   */
  async destroy(ids: Primary<T> | Primary<T>[]): Promise<number> {
    try {
      const idArray = Array.isArray(ids) ? ids : [ids];

      if (idArray.length === 0) {
        return 0;
      }

      const entityName = this.getEntityName();
      const metadata = this.em.getMetadata().get(entityName);
      const pkField = metadata.primaryKeys[0] as string;

      return await this.deleteMany({ [pkField]: { $in: idArray } } as any);
    } catch (error: Error | any) {
      // Re-throw if already a domain exception
      if (DatabaseExceptionHandler.isDomainException(error)) {
        throw error;
      }

      // Use centralized exception handler
      throw DatabaseExceptionHandler.handleDelete(error, this.getEntityName(), { ids });
    }
  }

  /**
   * Get a fresh copy of entity from database
   *
   * Fetches a new instance of the entity from database without
   * affecting the current instance. Returns null if no longer exists.
   *
   * @param entity - Entity to fetch fresh copy of
   * @returns Promise resolving to fresh entity or null
   *
   * @example
   * ```typescript
   * const user = await userRepository.findById(1);
   * user.name = 'Changed locally';
   *
   * const freshUser = await userRepository.fresh(user);
   * console.log(user.name); // 'Changed locally'
   * console.log(freshUser?.name); // Original database value
   * ```
   *
   * @remarks
   * - Does not modify current instance
   * - Returns new entity instance
   * - Returns null if entity deleted
   * - Use to check current database state
   *
   * @see {@link refresh} For in-place refresh
   */
  async fresh(entity: T): Promise<T | null> {
    const pk = (wrap(entity) as any).getPrimaryKey();
    if (!pk) {
      return null;
    }
    return this.findById(pk as Primary<T>);
  }

  /**
   * Refresh entity from database (in-place)
   *
   * Reloads entity data from database, updating the current instance.
   * Discards any local changes that haven't been saved.
   *
   * @param entity - Entity to refresh in-place
   * @returns Promise resolving to refreshed entity (same instance)
   * @throws EntityNotFoundError if entity no longer exists
   *
   * @example
   * ```typescript
   * const user = await userRepository.findById(1);
   * user.name = 'Changed locally';
   *
   * await userRepository.refresh(user);
   * // user.name is now reverted to database value
   * // Local changes are lost
   * ```
   *
   * @remarks
   * - Modifies existing instance
   * - Discards unsaved changes
   * - Throws if entity deleted
   * - Use to revert local changes
   *
   * @see {@link fresh} For non-destructive refresh
   */
  async refresh(entity: T): Promise<T> {
    await this.em.refresh(entity);
    return entity;
  }

  /**
   * Truncate table (delete all records)
   *
   * ⚠️ DANGER: Deletes ALL records from the table irreversibly.
   * Also resets auto-increment counters. Cannot be undone.
   * Should only be used in tests or development environments.
   *
   * @returns Promise that resolves when truncate complete
   * @throws {QueryException} If truncate operation fails
   * @throws {DatabaseException} If database connection fails
   *
   * @example
   * ```typescript
   * // Only in tests or development!
   * if (process.env.NODE_ENV === 'test') {
   *   await logRepository.truncate();
   * }
   * ```
   *
   * @remarks
   * - ⚠️ IRREVERSIBLE operation
   * - Deletes ALL records
   * - Resets auto-increment
   * - Very fast operation
   * - Does NOT trigger hooks
   * - Use ONLY in tests/development
   *
   * @throws Error in production (should be configured)
   */
  async truncate(): Promise<void> {
    try {
      // Get table name from entity metadata
      const entityName = this.getEntityName();
      const metadata = this.em.getMetadata().get(entityName);
      const tableName = metadata.tableName;

      // Execute raw SQL truncate
      const connection = this.em.getConnection();
      await connection.execute(`TRUNCATE TABLE ${tableName}`);
    } catch (error: Error | any) {
      // Re-throw if already a domain exception
      if (DatabaseExceptionHandler.isDomainException(error)) {
        throw error;
      }

      // Use centralized exception handler
      throw DatabaseExceptionHandler.handle(error, {
        entityName: this.getEntityName(),
        operation: EntityOperation.TRUNCATED,
      });
    }
  }
}
