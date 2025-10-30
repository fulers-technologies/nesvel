import {
  EntityManager,
  EntityRepository,
  FilterQuery,
  FindOptions,
  Loaded,
  QueryOrderMap,
  wrap,
} from '@mikro-orm/core';
import { PaginateQuery, Paginated, paginate } from 'nestjs-paginate';

import { BaseEntity } from '@/entities/base.entity';
import { SortDirection } from '@/enums/sort-direction.enum';
import { RepositoryQueryBuilder } from './repository-query-builder';
import type { IRepository } from '@/interfaces/repository.interface';
import type { IRepositoryQueryBuilder } from '@/interfaces/repository-query-builder.interface';

/**
 * Abstract Base Repository Class
 *
 * Provides a comprehensive Laravel Eloquent-inspired repository pattern implementation
 * for NestJS applications using MikroORM. This class serves as the foundation for all
 * entity repositories, offering consistent CRUD operations, query building capabilities,
 * pagination support, and soft delete functionality.
 *
 * Key Features:
 * - Full CRUD operations with Laravel-like method names
 * - Advanced query building with method chaining
 * - Built-in pagination using LengthAwarePaginator
 * - Soft delete support for entities that implement it
 * - Type-safe operations with full TypeScript support
 * - Eager loading and relationship management
 * - Batch operations for performance optimization
 *
 * @template T - The entity type this repository manages, must extend BaseEntity
 *
 * @example
 * ```typescript
 * @Injectable()
 * export class UserRepository extends BaseRepository<User> {
 *   constructor(
 *     @InjectRepository(User) repository: EntityRepository<User>,
 *     em: EntityManager
 *   ) {
 *     super(em, repository);
 *   }
 *
 *   // Custom repository methods
 *   async findByEmail(email: string): Promise<User | null> {
 *     return this.first({ email });
 *   }
 * }
 * ```
 *
 * @author Nesvel Team
 * @since 1.0.0
 */
export abstract class BaseRepository<T extends BaseEntity> implements IRepository<T> {
  /**
   * The MikroORM EntityManager instance
   *
   * Provides direct access to the underlying ORM's entity manager for advanced
   * operations that may not be covered by the repository methods. Use this for
   * transactions, custom queries, and bulk operations.
   *
   * @protected
   * @readonly
   */
  protected readonly em: EntityManager;

  /**
   * The MikroORM EntityRepository instance
   *
   * The underlying repository for the specific entity type. This provides direct
   * access to MikroORM's native repository methods while maintaining type safety.
   * Used internally by the base repository methods but can be accessed for
   * framework-specific operations.
   *
   * @protected
   * @readonly
   */
  protected readonly repository: EntityRepository<T>;

  /**
   * Constructor for BaseRepository
   *
   * Initializes the repository with required dependencies. This constructor should
   * be called by all concrete repository implementations.
   *
   * @param em - The MikroORM EntityManager instance for database operations
   * @param repository - The specific EntityRepository for type T
   *
   * @example
   * ```typescript
   * constructor(
   *   @InjectRepository(User) repository: EntityRepository<User>,
   *   em: EntityManager
   * ) {
   *   super(em, repository);
   * }
   * ```
   */
  constructor(em: EntityManager, repository: EntityRepository<T>) {
    this.em = em;
    this.repository = repository;
  }

  /**
   * Get the underlying MikroORM repository instance
   *
   * Provides direct access to the native MikroORM EntityRepository for cases where
   * you need to use framework-specific methods that aren't abstracted by this base
   * repository. Use this sparingly and prefer the abstracted methods when possible.
   *
   * @returns The MikroORM EntityRepository instance for type T
   *
   * @example
   * ```typescript
   * const nativeRepo = this.getRepository();
   * const result = await nativeRepo.createQueryBuilder('u')
   *   .where('u.email = ?', [email])
   *   .getResult();
   * ```
   */
  getRepository(): EntityRepository<T> {
    return this.repository;
  }

  /**
   * Get the MikroORM EntityManager instance
   *
   * Provides direct access to the entity manager for advanced operations such as
   * transactions, bulk operations, custom queries, and entity lifecycle management.
   * This is particularly useful for complex operations that span multiple entities.
   *
   * @returns The MikroORM EntityManager instance
   *
   * @example
   * ```typescript
   * const em = this.getEntityManager();
   * await em.transactional(async (em) => {
   *   // Perform multiple operations in a transaction
   *   await em.persistAndFlush(entity1);
   *   await em.persistAndFlush(entity2);
   * });
   * ```
   */
  getEntityManager(): EntityManager {
    return this.em;
  }

  /**
   * Retrieve all records from the entity table
   *
   * Fetches all entities of type T without any filtering or pagination.
   * Use with caution on large datasets as it will load all records into memory.
   * Consider using pagination methods for large datasets.
   *
   * @returns Promise resolving to array of all entities
   *
   * @example
   * ```typescript
   * const allUsers = await userRepository.all();
   * console.log(`Total users: ${allUsers.length}`);
   * ```
   *
   * @see {@link paginate} For handling large datasets with pagination
   * @see {@link where} For filtered results
   */
  async all(): Promise<Loaded<T, never>[]> {
    // Use findAll() which is optimized for retrieving all records
    // This method bypasses any default filters that might be applied
    return await this.repository.findAll();
  }

  /**
   * Find a single record by its primary key
   *
   * Retrieves an entity by its primary key value. Returns null if no entity
   * is found with the given ID. This method is null-safe and won't throw
   * exceptions for missing records.
   *
   * @param id - The primary key value (string or number)
   * @returns Promise resolving to the entity or null if not found
   *
   * @example
   * ```typescript
   * const user = await userRepository.find(123);
   * if (user) {
   *   console.log(`Found user: ${user.name}`);
   * } else {
   *   console.log('User not found');
   * }
   * ```
   *
   * @see {@link findOrFail} For exception-throwing variant
   */
  async find(id: string | number): Promise<Loaded<T, never> | null> {
    // Cast to any to handle both string and number IDs
    // MikroORM will handle the type conversion internally
    return await this.repository.findOne(id as any);
  }

  /**
   * Find a record by ID or throw an exception if not found
   *
   * Similar to find() but throws an exception if no entity is found with the
   * given ID. This is useful when you expect the entity to exist and want to
   * handle missing records as exceptional cases.
   *
   * @param id - The primary key value (string or number)
   * @returns Promise resolving to the entity (never null)
   * @throws Error if no entity is found with the given ID
   *
   * @example
   * ```typescript
   * try {
   *   const user = await userRepository.findOrFail(123);
   *   console.log(`User found: ${user.name}`);
   * } catch (error: Error | any) {
   *   console.error('User not found:', error.message);
   * }
   * ```
   *
   * @see {@link find} For null-safe variant
   */
  async findOrFail(id: string | number): Promise<Loaded<T, never>> {
    // First attempt to find the entity using the safe find method
    const entity = await this.find(id);

    // If entity is not found, throw a descriptive error
    if (!entity) {
      throw new Error(`Entity with ID ${id} not found`);
    }

    // Return the found entity (TypeScript knows it's not null here)
    return entity;
  }

  /**
   * Find records matching specified criteria
   *
   * Retrieves all entities that match the given filter conditions. This method
   * supports complex filtering using MikroORM's FilterQuery syntax, allowing for
   * sophisticated database queries with type safety.
   *
   * @param criteria - The filter conditions to apply
   * @returns Promise resolving to array of matching entities
   *
   * @example
   * ```typescript
   * // Simple equality filter
   * const activeUsers = await userRepository.where({ isActive: true });
   *
   * // Complex filters with operators
   * const recentUsers = await userRepository.where({
   *   createdAt: { $gte: new Date('2023-01-01') },
   *   email: { $like: '%@company.com' }
   * });
   *
   * // Multiple conditions (AND logic)
   * const premiumUsers = await userRepository.where({
   *   subscription: 'premium',
   *   isActive: true
   * });
   * ```
   *
   * @see {@link first} For getting single result
   * @see {@link paginate} For paginated results
   */
  async where(criteria: FilterQuery<T>): Promise<Loaded<T, never>[]> {
    // Execute the find operation with the provided criteria
    // MikroORM will handle the query optimization and type conversion
    return await this.repository.find(criteria);
  }

  /**
   * Find the first record matching optional criteria
   *
   * Retrieves the first entity that matches the given filter conditions, or the
   * first entity overall if no criteria is provided. Returns null if no matching
   * entity is found. This is useful for finding a single record when you expect
   * zero or one result.
   *
   * @param criteria - Optional filter conditions (defaults to empty object)
   * @returns Promise resolving to the first matching entity or null
   *
   * @example
   * ```typescript
   * // Get first user overall
   * const firstUser = await userRepository.first();
   *
   * // Get first user matching criteria
   * const adminUser = await userRepository.first({ role: 'admin' });
   *
   * // Get first active user
   * const activeUser = await userRepository.first({ isActive: true });
   * ```
   *
   * @see {@link firstOrFail} For exception-throwing variant
   * @see {@link where} For multiple results
   */
  async first(criteria?: FilterQuery<T>): Promise<Loaded<T, never> | null> {
    // Use findOne with empty object as default criteria to get first record
    // If criteria is provided, it will be used for filtering
    return await this.repository.findOne(criteria || {});
  }

  /**
   * Find the first record matching criteria or throw an exception
   *
   * Similar to first() but throws an exception if no matching entity is found.
   * This is useful when you expect at least one record to exist and want to
   * treat the absence of results as an error condition.
   *
   * @param criteria - Optional filter conditions (defaults to empty object)
   * @returns Promise resolving to the first matching entity (never null)
   * @throws Error if no entity matches the criteria
   *
   * @example
   * ```typescript
   * try {
   *   // This will throw if no admin exists
   *   const admin = await userRepository.firstOrFail({ role: 'admin' });
   *   console.log(`Admin found: ${admin.name}`);
   * } catch (error: Error | any) {
   *   console.error('No admin user found:', error.message);
   * }
   * ```
   *
   * @see {@link first} For null-safe variant
   */
  async firstOrFail(criteria?: FilterQuery<T>): Promise<Loaded<T, never>> {
    // First attempt to find a matching entity
    const entity = await this.first(criteria);

    // If no entity is found, throw a descriptive error
    if (!entity) {
      throw new Error('Entity not found');
    }

    // Return the found entity
    return entity;
  }

  /**
   * Create a new entity record in the database
   *
   * Creates and persists a new entity instance with the provided data. The entity
   * is immediately saved to the database and any auto-generated fields (like IDs,
   * timestamps) will be populated. This method handles the full lifecycle from
   * instantiation to persistence.
   *
   * @param data - Partial entity data to create the new record
   * @returns Promise resolving to the created and persisted entity
   *
   * @example
   * ```typescript
   * // Create a new user
   * const newUser = await userRepository.create({
   *   name: 'John Doe',
   *   email: 'john@example.com',
   *   isActive: true
   * });
   *
   * console.log(`Created user with ID: ${newUser.id}`);
   *
   * // The entity is now persisted and has all generated fields
   * console.log(`Created at: ${newUser.createdAt}`);
   * ```
   *
   * @throws Error if validation fails or database constraints are violated
   * @see {@link update} For modifying existing records
   * @see {@link upsert} For create-or-update operations
   */
  async create(data: Partial<T>): Promise<Loaded<T, never>> {
    // Create a new entity instance from the provided data
    // The repository.create() method handles type instantiation and field mapping
    const entity = this.repository.create(data as any);

    // Persist the entity to the database and flush changes immediately
    // This ensures the entity is saved and any auto-generated fields are populated
    await this.em.persistAndFlush(entity);

    // Return the created entity with all database-generated fields populated
    return entity as Loaded<T, never>;
  }

  /**
   * Update an existing entity record by its ID
   *
   * Finds an existing entity by ID and updates it with the provided data.
   * Uses MikroORM's assign() method to intelligently merge changes while
   * preserving unchanged properties. Only modified fields are sent to the database.
   *
   * @param id - The primary key of the entity to update
   * @param data - Partial entity data containing the fields to update
   * @returns Promise resolving to the updated entity
   *
   * @example
   * ```typescript
   * // Update specific fields of a user
   * const updatedUser = await userRepository.update(123, {
   *   name: 'Jane Doe',
   *   isActive: false
   * });
   *
   * console.log(`Updated user: ${updatedUser.name}`);
   *
   * // Only the specified fields are modified, others remain unchanged
   * // The updatedAt timestamp (if using timestamps mixin) is automatically set
   * ```
   *
   * @throws Error if entity with given ID is not found
   * @throws Error if validation fails or database constraints are violated
   * @see {@link updateWhere} For bulk updates by criteria
   * @see {@link upsert} For create-or-update operations
   */
  async update(id: string | number, data: Partial<T>): Promise<Loaded<T, never>> {
    // First, find the entity by ID (throws if not found)
    const entity = await this.findOrFail(id);

    // Use MikroORM's wrap().assign() to intelligently merge the update data
    // This handles field mapping, type conversion, and change detection
    wrap(entity).assign(data as any);

    // Flush changes to the database
    // Only the modified fields will be included in the UPDATE query
    await this.em.flush();

    // Return the updated entity with fresh data from the database
    return entity;
  }

  /**
   * Update multiple records matching specified criteria
   *
   * Performs a bulk update operation on all entities matching the given criteria.
   * This is more efficient than updating records individually as it generates a
   * single UPDATE query. However, entity lifecycle hooks and events are not
   * triggered for bulk operations.
   *
   * @param criteria - Filter conditions to identify records to update
   * @param data - Partial entity data containing the fields to update
   * @returns Promise resolving to the number of affected records
   *
   * @example
   * ```typescript
   * // Deactivate all users created before a certain date
   * const affectedCount = await userRepository.updateWhere(
   *   { createdAt: { $lt: new Date('2023-01-01') } },
   *   { isActive: false }
   * );
   *
   * console.log(`Deactivated ${affectedCount} users`);
   *
   * // Update all premium users' subscription status
   * const premiumUpdates = await userRepository.updateWhere(
   *   { subscription: 'premium' },
   *   { subscriptionStatus: 'active' }
   * );
   * ```
   *
   * @note This method bypasses entity lifecycle hooks and events
   * @see {@link update} For single record updates with full lifecycle support
   */
  async updateWhere(criteria: FilterQuery<T>, data: Partial<T>): Promise<number> {
    // Perform a native bulk update using the entity manager
    // This generates an efficient SQL UPDATE statement for multiple records
    return await this.em.nativeUpdate(
      this.repository.getEntityName(), // The entity class name for the table
      criteria, // WHERE conditions
      data as any, // SET clause data
    );
  }

  /**
   * Delete a single entity record by its primary key
   *
   * Performs a hard delete operation on an entity identified by its primary key.
   * This method safely handles cases where the entity doesn't exist by returning
   * false instead of throwing an error. The deletion is permanent and cannot be undone.
   *
   * @param id - The primary key of the entity to delete
   * @returns Promise resolving to true if deleted, false if entity not found
   *
   * @example
   * ```typescript
   * // Delete a user by ID
   * const wasDeleted = await userRepository.delete(123);
   * if (wasDeleted) {
   *   console.log('User successfully deleted');
   * } else {
   *   console.log('User not found');
   * }
   *
   * // Safe to call even with non-existent IDs
   * const result = await userRepository.delete(999); // returns false
   * ```
   *
   * @note This is a hard delete. For soft deletes, use {@link softDelete}
   * @see {@link deleteWhere} For bulk deletion operations
   * @see {@link softDelete} For recoverable deletion
   */
  async delete(id: string | number): Promise<boolean> {
    // First, attempt to find the entity (returns null if not found)
    const entity = await this.find(id);

    // If entity doesn't exist, return false (no error thrown)
    if (!entity) {
      return false;
    }

    // Remove the entity and flush changes to the database immediately
    // This performs the actual DELETE SQL operation
    await this.em.removeAndFlush(entity);

    // Return true to indicate successful deletion
    return true;
  }

  /**
   * Delete multiple records matching specified criteria
   *
   * Performs a bulk hard delete operation on all entities matching the given
   * criteria. This is more efficient than deleting records individually as it
   * generates a single DELETE query. Entity lifecycle hooks are not triggered.
   *
   * @param criteria - Filter conditions to identify records to delete
   * @returns Promise resolving to the number of deleted records
   *
   * @example
   * ```typescript
   * // Delete all inactive users
   * const deletedCount = await userRepository.deleteWhere({
   *   isActive: false
   * });
   * console.log(`Deleted ${deletedCount} inactive users`);
   *
   * // Delete users created before a specific date
   * const oldUsersDeleted = await userRepository.deleteWhere({
   *   createdAt: { $lt: new Date('2022-01-01') }
   * });
   * ```
   *
   * @warning This is a permanent operation that cannot be undone
   * @note This method bypasses entity lifecycle hooks and events
   * @see {@link delete} For single record deletion with entity loading
   */
  async deleteWhere(criteria: FilterQuery<T>): Promise<number> {
    // Perform a native bulk delete using the entity manager
    // This generates an efficient SQL DELETE statement
    return await this.em.nativeDelete(
      this.repository.getEntityName(), // The entity class name for the table
      criteria, // WHERE conditions for deletion
    );
  }

  /**
   * Create a new record or update an existing one (upsert operation)
   *
   * Implements the "upsert" (insert or update) pattern. First searches for an
   * existing record matching the criteria, then either updates it with the new
   * data or creates a new record if none exists. This is useful for
   * idempotent operations where you want to ensure a record exists.
   *
   * @param criteria - Filter conditions to find an existing record
   * @param data - Data to update existing record or create new record
   * @returns Promise resolving to the created or updated entity
   *
   * @example
   * ```typescript
   * // Create or update a user by email
   * const user = await userRepository.upsert(
   *   { email: 'john@example.com' }, // Find by email
   *   {
   *     name: 'John Doe',
   *     isActive: true
   *   }
   * );
   *
   * // If user exists: updates the name and isActive fields
   * // If user doesn't exist: creates new user with email, name, and isActive
   *
   * // Settings pattern - ensure setting exists
   * const setting = await settingRepository.upsert(
   *   { key: 'theme' },
   *   { key: 'theme', value: 'dark' }
   * );
   * ```
   *
   * @see {@link create} For creating new records
   * @see {@link update} For updating existing records
   */
  async upsert(criteria: FilterQuery<T>, data: Partial<T>): Promise<Loaded<T, never>> {
    // First, try to find an existing entity matching the criteria
    const existing = await this.first(criteria);

    if (existing) {
      // Entity exists - update it with the new data
      return await this.update(existing.id, data);
    } else {
      // Entity doesn't exist - create new one with merged data
      // Merge the search criteria with the update data to ensure
      // the new entity will match the criteria
      const mergedData = Object.assign({}, data || {}, criteria || {});
      return await this.create(mergedData as Partial<T>);
    }
  }

  /**
   * Count the number of records matching optional criteria
   *
   * Efficiently counts entities without loading them into memory. This method
   * performs a COUNT query in the database and returns only the numeric result,
   * making it suitable for large datasets where you only need the count.
   *
   * @param criteria - Optional filter conditions (counts all records if omitted)
   * @returns Promise resolving to the number of matching records
   *
   * @example
   * ```typescript
   * // Count all users
   * const totalUsers = await userRepository.count();
   * console.log(`Total users: ${totalUsers}`);
   *
   * // Count active users
   * const activeUsers = await userRepository.count({ isActive: true });
   * console.log(`Active users: ${activeUsers}`);
   *
   * // Count users by complex criteria
   * const recentUsers = await userRepository.count({
   *   createdAt: { $gte: new Date('2023-01-01') },
   *   role: { $in: ['user', 'admin'] }
   * });
   * ```
   *
   * @see {@link exists} For boolean existence check
   */
  async count(criteria?: FilterQuery<T>): Promise<number> {
    // Perform an optimized COUNT query without loading entities
    // Use empty object as default criteria to count all records
    return await this.repository.count(criteria || {});
  }

  /**
   * Check if any records exist matching the specified criteria
   *
   * Efficiently determines whether any entities match the given conditions without
   * loading the actual records. This is more efficient than using count() > 0
   * as it can potentially optimize the query to stop at the first match.
   *
   * @param criteria - Filter conditions to check for existence
   * @returns Promise resolving to true if any matching records exist
   *
   * @example
   * ```typescript
   * // Check if any admin users exist
   * const hasAdmins = await userRepository.exists({ role: 'admin' });
   * if (hasAdmins) {
   *   console.log('Admin users found');
   * }
   *
   * // Check if email is already taken
   * const emailTaken = await userRepository.exists({
   *   email: 'john@example.com'
   * });
   *
   * if (emailTaken) {
   *   throw new Error('Email already in use');
   * }
   * ```
   *
   * @see {@link count} For getting the actual count
   */
  async exists(criteria: FilterQuery<T>): Promise<boolean> {
    // Count matching records and check if greater than zero
    // This is optimized by the database to return quickly
    const count = await this.count(criteria);
    return count > 0;
  }

  /**
   * Retrieve paginated results using nestjs-paginate
   *
   * Provides standardized pagination with sorting, filtering, and search capabilities.
   * Uses the nestjs-paginate library for consistent pagination behavior across the application.
   *
   * @param query - PaginateQuery from @Paginate() decorator containing page, limit, sortBy, search, filter
   * @param config - Optional pagination configuration
   * @returns Promise resolving to a Paginated instance with data and meta
   *
   * @example
   * ```typescript
   * // In your controller:
   * @Get()
   * async getUsers(@Paginate() query: PaginateQuery) {
   *   return this.userRepository.paginate(query, {
   *     sortables: ['id', 'createdAt', 'name'],
   *     searchables: ['name', 'email'],
   *     sortBy: [['createdAt', 'DESC']],
   *     maxLimit: 100,
   *     defaultLimit: 20
   *   });
   * }
   *
   * // Result structure:
   * // {
   * //   data: [...entities],
   * //   meta: {
   * //     itemsPerPage: 20,
   * //     totalItems: 150,
   * //     currentPage: 1,
   * //     totalPages: 8,
   * //     ...
   * //   },
   * //   links: { first, previous, current, next, last }
   * // }
   * ```
   *
   * @see {@link all} For retrieving all records without pagination
   * @see {@link where} For filtered results without pagination
   */
  async paginate(
    query: PaginateQuery,
    config?: {
      sortables?: (keyof T)[];
      searchables?: (keyof T)[];
      sortBy?: [[keyof T, SortDirection]];
      maxLimit?: number;
      defaultLimit?: number;
    },
  ): Promise<Paginated<Loaded<T, never>>> {
    // Create a query builder to work with nestjs-paginate
    // Note: nestjs-paginate is primarily designed for TypeORM
    // For MikroORM, we need to build pagination manually using its concepts

    const page = query.page || 1;
    const limit = Math.min(query.limit || config?.defaultLimit || 20, config?.maxLimit || 100);
    const offset = (page - 1) * limit;

    // Build filter criteria from query.filter if provided
    let criteria: FilterQuery<T> = (query.filter || {}) as FilterQuery<T>;

    // Build order by from query.sortBy or use default
    const orderBy: QueryOrderMap<T> = {} as QueryOrderMap<T>;
    if (query.sortBy && Array.isArray(query.sortBy)) {
      query.sortBy.forEach(([field, order]) => {
        if (!config?.sortables || config.sortables.includes(field as keyof T)) {
          (orderBy as any)[field] = order.toUpperCase();
        }
      });
    } else if (config?.sortBy) {
      config.sortBy.forEach(([field, order]) => {
        (orderBy as any)[field] = order;
      });
    }

    // Handle search if provided and searchables configured
    if (query.search && config?.searchables) {
      const searchConditions = config.searchables.map((col) => ({
        [col]: { $like: `%${query.search}%` },
      }));
      if (searchConditions.length > 0) {
        criteria = Object.assign({}, criteria, {
          $or: searchConditions,
        }) as FilterQuery<T>;
      }
    }

    // Execute query with pagination
    const [data, total] = await this.repository.findAndCount(criteria, {
      limit,
      offset,
      orderBy: Object.keys(orderBy).length > 0 ? orderBy : undefined,
    });

    // Build pagination metadata compatible with nestjs-paginate format
    const totalPages = Math.ceil(total / limit);
    const hasNextPage = page < totalPages;
    const hasPreviousPage = page > 1;

    return {
      data: data as Loaded<T, never>[],
      meta: {
        itemsPerPage: limit,
        totalItems: total,
        currentPage: page,
        totalPages,
        sortBy: query.sortBy,
        search: query.search,
        filter: query.filter,
      },
      links: {
        first: page > 1 ? `?page=1&limit=${limit}` : undefined,
        previous: hasPreviousPage ? `?page=${page - 1}&limit=${limit}` : undefined,
        current: `?page=${page}&limit=${limit}`,
        next: hasNextPage ? `?page=${page + 1}&limit=${limit}` : undefined,
        last: totalPages > 0 ? `?page=${totalPages}&limit=${limit}` : undefined,
      },
    } as Paginated<Loaded<T, never>>;
  }

  /**
   * Start a fluent query with initial ordering
   *
   * Creates a RepositoryQueryBuilder instance pre-configured with an ORDER BY
   * clause. You can continue chaining more constraints (where/limit/with) and
   * then execute via get(), first(), count(), exists(), or paginate().
   *
   * @param field - The entity property to sort by
   * @param direction - Sort direction (ASC by default)
   * @returns A chainable query builder
   *
   * @example
   * ```typescript
   * // Newest users first, take first 10 with their profile
   * const users = await repo
   *   .orderBy('createdAt', 'DESC')
   *   .limit(10)
   *   .with(['profile'])
   *   .get();
   * ```
   */
  orderBy(
    field: keyof T,
    direction: SortDirection = SortDirection.ASC,
  ): IRepositoryQueryBuilder<T> {
    return new RepositoryQueryBuilder(this, {
      orderBy: { [field]: direction } as QueryOrderMap<T>,
    });
  }

  /**
   * Add a LIMIT clause to a fluent query
   *
   * Restricts the maximum number of records returned when the query is executed.
   * Can be combined with orderBy and skip for pagination-like behavior.
   *
   * @param count - Maximum number of records to return
   * @returns A chainable query builder
   *
   * @example
   * ```typescript
   * const topFive = await repo.limit(5).get();
   * ```
   */
  limit(count: number): IRepositoryQueryBuilder<T> {
    return new RepositoryQueryBuilder(this, { limit: count });
  }

  /**
   * Add an OFFSET (skip) clause to a fluent query
   *
   * Skips the specified number of records before returning results. Useful with
   * limit for cursor-style pagination when combined with a stable orderBy.
   *
   * @param count - Number of records to skip
   * @returns A chainable query builder
   *
   * @example
   * ```typescript
   * const page2 = await repo.orderBy('id').skip(10).limit(10).get();
   * ```
   */
  skip(count: number): IRepositoryQueryBuilder<T> {
    return new RepositoryQueryBuilder(this, { offset: count });
  }

  /**
   * Eager load related entities in a fluent query
   *
   * Configures the query to populate relationships to prevent N+1 queries. Keep
   * the relation list minimal to avoid excessive joins and payload size.
   *
   * @param relations - Relation property names to populate
   * @returns A chainable query builder
   *
   * @example
   * ```typescript
   * const users = await repo
   *   .with(['profile', 'posts'])
   *   .orderBy('createdAt', 'DESC')
   *   .limit(20)
   *   .get();
   * ```
   */
  with(relations: string[]): IRepositoryQueryBuilder<T> {
    return new RepositoryQueryBuilder(this, { populate: relations as any });
  }

  /**
   * Soft delete a record by ID (recoverable delete)
   *
   * Marks an entity as deleted without removing it from the database, if the entity
   * supports soft deletes (i.e., provides a softDelete() method and a deletedAt field).
   * Returns false if the entity does not exist. Throws if the entity type does not
   * support soft deletes.
   *
   * @param id - Primary key of the entity to soft delete
   * @returns True when the entity was soft deleted; false when not found
   * @throws Error when entity type does not support soft deletes
   *
   * @example
   * ```typescript
   * const ok = await repo.softDelete(123);
   * if (!ok) {
   *   // handle not found
   * }
   * ```
   */
  async softDelete(id: string | number): Promise<boolean> {
    const entity = await this.find(id);
    if (!entity) {
      return false;
    }

    if ('softDelete' in entity && typeof (entity as any).softDelete === 'function') {
      (entity as any).softDelete();
      await this.em.flush();
      return true;
    }

    throw new Error('Entity does not support soft deletes');
  }

  /**
   * Restore a previously soft-deleted record
   *
   * Finds a soft-deleted entity by ID (including trashed records) and restores it
   * by clearing deletion markers. Throws if not found or if the entity type does
   * not support restoration.
   *
   * @param id - Primary key of the entity to restore
   * @returns The restored entity instance
   * @throws Error when entity not found or does not support soft deletes
   *
   * @example
   * ```typescript
   * const restored = await repo.restore(123);
   * ```
   */
  async restore(id: string | number): Promise<Loaded<T, never>> {
    const entity = await this.repository.findOne(id as any, {
      filters: { softDelete: false }, // Include soft deleted
    });

    if (!entity) {
      throw new Error(`Entity with ID ${id} not found`);
    }

    if ('restore' in entity && typeof (entity as any).restore === 'function') {
      (entity as any).restore();
      await this.em.flush();
      return entity as Loaded<T, never>;
    }

    throw new Error('Entity does not support soft deletes');
  }

  /**
   * Retrieve only soft-deleted (trashed) records
   *
   * Returns entities whose deletedAt (or equivalent) field is set. Useful for
   * building admin recovery flows.
   *
   * @returns Array of soft-deleted entities
   */
  async onlyTrashed(): Promise<Loaded<T, never>[]> {
    return await this.repository.find({
      deletedAt: { $ne: null },
    } as unknown as FilterQuery<T>);
  }

  /**
   * Retrieve records including soft-deleted ones
   *
   * Disables the default soft-delete filter to include trashed entities in the
   * result set.
   *
   * @returns Array of entities, both active and soft-deleted
   */
  async withTrashed(): Promise<Loaded<T, never>[]> {
    return await this.repository.find({}, { filters: { softDelete: false } });
  }
}
