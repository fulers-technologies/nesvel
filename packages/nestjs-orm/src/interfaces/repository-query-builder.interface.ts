import { FilterQuery, Loaded } from '@mikro-orm/core';
import { PaginateQuery, Paginated } from 'nestjs-paginate';
import { SortDirection } from '../enums';

/**
 * Repository Query Builder Interface
 *
 * Provides a fluent, chainable interface for building database queries with
 * Laravel Eloquent-inspired method chaining. This interface defines the contract
 * for query builders that accumulate query constraints (where, orderBy, limit, etc.)
 * and provide execution methods (get, first, count, exists, paginate).
 *
 * The query builder follows the builder pattern, allowing you to compose complex
 * queries through method chaining while maintaining type safety throughout.
 *
 * @template T - The entity type being queried, must extend object
 *
 * @example
 * ```typescript
 * const users = await userRepository
 *   .where({ isActive: true })
 *   .orderBy('createdAt', SortDirection.DESC)
 *   .limit(10)
 *   .with(['profile', 'posts'])
 *   .get();
 * ```
 *
 * @since 1.0.0
 */
export interface IRepositoryQueryBuilder<T extends object> {
  /**
   * Add filter criteria to the query
   *
   * Applies WHERE conditions to narrow down the result set. Multiple calls to
   * where() will merge criteria using AND logic. Supports MikroORM's FilterQuery
   * syntax including operators like $eq, $ne, $gt, $gte, $lt, $lte, $like, $in, etc.
   *
   * @param criteria - MikroORM FilterQuery conditions
   * @returns Query builder instance for chaining
   *
   * @example
   * ```typescript
   * // Simple equality
   * builder.where({ isActive: true });
   *
   * // With operators
   * builder.where({
   *   age: { $gte: 18 },
   *   email: { $like: '%@company.com' }
   * });
   * ```
   */
  where(criteria: FilterQuery<T>): IRepositoryQueryBuilder<T>;

  /**
   * Add sorting to the query
   *
   * Specifies the ORDER BY clause for the query. Multiple calls will add
   * additional sort levels (e.g., sort by name, then by date). The last call
   * takes precedence for the same field.
   *
   * @param field - The entity property to sort by
   * @param direction - Sort direction (defaults to ASC)
   * @returns Query builder instance for chaining
   *
   * @example
   * ```typescript
   * // Sort by single field
   * builder.orderBy('createdAt', SortDirection.DESC);
   *
   * // Multi-level sorting
   * builder
   *   .orderBy('lastName', SortDirection.ASC)
   *   .orderBy('firstName', SortDirection.ASC);
   * ```
   */
  orderBy(field: keyof T, direction?: SortDirection): IRepositoryQueryBuilder<T>;

  /**
   * Limit the number of results
   *
   * Sets the maximum number of records to return. This is useful for
   * pagination, "top N" queries, or preventing excessive data loading.
   * Can be combined with skip() for offset-based pagination.
   *
   * @param count - Maximum number of records to return
   * @returns Query builder instance for chaining
   *
   * @example
   * ```typescript
   * // Get top 10 users
   * builder.orderBy('score', SortDirection.DESC).limit(10);
   *
   * // Pagination: page 2, 20 per page
   * builder.skip(20).limit(20);
   * ```
   */
  limit(count: number): IRepositoryQueryBuilder<T>;

  /**
   * Skip a number of results (offset)
   *
   * Skips the specified number of records before returning results. This is
   * primarily used with limit() for offset-based pagination. For large offsets,
   * consider using cursor-based pagination instead for better performance.
   *
   * @param count - Number of records to skip
   * @returns Query builder instance for chaining
   *
   * @example
   * ```typescript
   * // Skip first 20 records
   * builder.skip(20).limit(10);
   *
   * // Pagination helper
   * const page = 3;
   * const perPage = 20;
   * builder.skip((page - 1) * perPage).limit(perPage);
   * ```
   */
  skip(count: number): IRepositoryQueryBuilder<T>;

  /**
   * Eager load relationships
   *
   * Specifies which related entities should be loaded along with the main entity
   * to prevent N+1 query problems. This uses MikroORM's populate feature to
   * efficiently load relationships in a single query or minimal additional queries.
   *
   * @param relations - Array of relation property names to populate
   * @returns Query builder instance for chaining
   *
   * @example
   * ```typescript
   * // Load single relation
   * builder.with(['profile']);
   *
   * // Load multiple relations
   * builder.with(['profile', 'posts', 'comments']);
   *
   * // Load nested relations (dot notation)
   * builder.with(['posts.author', 'posts.comments']);
   * ```
   */
  with(relations: string[]): IRepositoryQueryBuilder<T>;

  // ========================================================================
  // Execution Methods
  // ========================================================================

  /**
   * Execute query and return all matching results
   *
   * Executes the query with all accumulated constraints and returns an array
   * of all matching entities. Use with caution on large datasets - consider
   * using limit() or paginate() to prevent loading too much data into memory.
   *
   * @returns Promise resolving to array of matching entities
   *
   * @example
   * ```typescript
   * const activeUsers = await userRepository
   *   .where({ isActive: true })
   *   .orderBy('createdAt', SortDirection.DESC)
   *   .get();
   * ```
   */
  get(): Promise<Loaded<T, never>[]>;

  /**
   * Execute query and return first result or null
   *
   * Executes the query and returns only the first matching entity, or null if
   * no entities match. This is equivalent to adding limit(1) and taking the
   * first element, but more efficient and expressive.
   *
   * @returns Promise resolving to first matching entity or null
   *
   * @example
   * ```typescript
   * const latestUser = await userRepository
   *   .orderBy('createdAt', SortDirection.DESC)
   *   .first();
   *
   * if (latestUser) {
   *   console.log('Latest user:', latestUser.name);
   * }
   * ```
   */
  first(): Promise<Loaded<T, never> | null>;

  /**
   * Execute query and return count of matching records
   *
   * Performs a COUNT query without loading actual entity data. This is more
   * efficient than loading entities and checking array length when you only
   * need the count. Note that limit/offset are typically ignored in count queries.
   *
   * @returns Promise resolving to number of matching records
   *
   * @example
   * ```typescript
   * const activeUserCount = await userRepository
   *   .where({ isActive: true })
   *   .count();
   *
   * console.log(`Found ${activeUserCount} active users`);
   * ```
   */
  count(): Promise<number>;

  /**
   * Check if any matching records exist
   *
   * Efficiently determines whether any entities match the query without loading
   * the actual data. More efficient than count() > 0 as it can stop at the first
   * match. Returns true if at least one matching record exists.
   *
   * @returns Promise resolving to boolean indicating existence
   *
   * @example
   * ```typescript
   * const hasAdmins = await userRepository
   *   .where({ role: 'admin' })
   *   .exists();
   *
   * if (!hasAdmins) {
   *   throw new Error('No admin users found');
   * }
   * ```
   */
  exists(): Promise<boolean>;

  /**
   * Execute query with pagination
   *
   * Executes the query with pagination support, returning a paginated result set
   * with metadata (page numbers, total count, links, etc.). The query builder's
   * where/orderBy constraints are merged with the PaginateQuery parameters.
   *
   * @param query - PaginateQuery from @Paginate() decorator (page, limit, sortBy, search, filter)
   * @param config - Optional pagination configuration
   * @param config.sortables - Columns that can be sorted by the client
   * @param config.searchables - Columns to search when ?search= is provided
   * @param config.sortBy - Default sort order if none specified in query
   * @param config.maxLimit - Maximum allowed limit to prevent excessive data fetching
   * @param config.defaultLimit - Default limit if none specified in query
   * @returns Promise resolving to paginated result with data, meta, and links
   *
   * @example
   * ```typescript
   * // In a controller
   * const result = await userRepository
   *   .where({ isActive: true })
   *   .paginate(query, {
   *     sortables: ['name', 'createdAt'],
   *     searchables: ['name', 'email'],
   *     sortBy: [['createdAt', SortDirection.DESC]],
   *     maxLimit: 100,
   *     defaultLimit: 20
   *   });
   *
   * // Result structure:
   * // {
   * //   data: [...entities],
   * //   meta: { currentPage, totalPages, totalItems, ... },
   * //   links: { first, previous, current, next, last }
   * // }
   * ```
   */
  paginate(
    query: PaginateQuery,
    config?: {
      sortables?: (keyof T)[];
      searchables?: (keyof T)[];
      sortBy?: [[keyof T, SortDirection]];
      maxLimit?: number;
      defaultLimit?: number;
    },
  ): Promise<Paginated<Loaded<T, never>>>;
}
