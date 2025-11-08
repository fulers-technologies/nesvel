import type {
  SimplePaginator,
  CursorPaginator,
  PaginationConfig,
  LengthAwarePaginator,
} from '@nesvel/pagination';
import type { Request } from '@nesvel/nestjs-http';
import { EntityData, EntityManager, FilterQuery, FindOptions, Primary } from '@mikro-orm/core';

import { BaseEntity } from '@/entities';
import { BaseRepository } from '@/repositories';

/**
 * Base service interface with complete CRUD operations
 *
 * Provides a comprehensive service layer interface that delegates all data operations
 * to the repository while adding convenience methods for business logic operations.
 *
 * @template T - Entity type extending BaseEntity
 */
export interface IService<T extends BaseEntity> {
  // ============================================================================
  // CORE SERVICE METHODS
  // ============================================================================

  /**
   * Get the underlying repository instance
   *
   * Provides direct access to repository for operations not covered by service methods
   * or when you need repository-specific functionality.
   *
   * @returns Repository instance for the entity
   */
  getRepository(): BaseRepository<T>;

  /**
   * Execute operations within a database transaction
   *
   * Provides automatic transaction management with commit on success
   * and rollback on error. Essential for multi-step operations that
   * need to maintain data consistency.
   *
   * @param callback - Function to execute within transaction context
   * @returns Result of the callback function
   *
   * @example
   * ```typescript
   * await userService.transaction(async (em) => {
   *   const user = await em.findOne(User, userId);
   *   user.balance -= 100;
   *   const order = em.create(Order, { userId, total: 100 });
   *   await em.flush();
   * });
   * ```
   */
  transaction<R>(callback: (em: EntityManager) => Promise<R>): Promise<R>;

  // ============================================================================
  // READ OPERATIONS (delegated to repository)
  // ============================================================================

  /**
   * Find all entities
   *
   * @returns Promise resolving to array of all entities
   */
  findAll(options?: FindOptions<T>): Promise<T[]>;

  /**
   * Find entity by primary key
   *
   * @param id - Primary key value
   * @returns Promise resolving to entity or null
   */
  findById(id: Primary<T>): Promise<T | null>;

  /**
   * Find entity by primary key or throw error
   *
   * @param id - Primary key value
   * @returns Promise resolving to entity
   * @throws EntityNotFoundException if not found
   */
  findByIdOrFail(id: Primary<T>): Promise<T>;

  /**
   * Find single entity by criteria
   *
   * @param where - Filter criteria
   * @param options - Find options
   * @returns Promise resolving to entity or null
   */
  findOne(where: FilterQuery<T>, options?: FindOptions<T>): Promise<T | null>;

  /**
   * Find single entity by criteria or throw error
   *
   * @param where - Filter criteria
   * @param options - Find options
   * @returns Promise resolving to entity
   * @throws EntityNotFoundException if not found
   */
  findOneOrFail(where: FilterQuery<T>, options?: FindOptions<T>): Promise<T>;

  /**
   * Find multiple entities by criteria
   *
   * @param where - Filter criteria
   * @param options - Find options
   * @returns Promise resolving to array of entities
   */
  find(where: FilterQuery<T>, options?: FindOptions<T>): Promise<T[]>;

  /**
   * Find entities by multiple IDs
   *
   * @param ids - Array of primary key values
   * @returns Promise resolving to array of entities
   */
  findByIds(ids: Primary<T>[]): Promise<T[]>;

  /**
   * Get first entity
   *
   * @returns Promise resolving to first entity or null
   */
  first(): Promise<T | null>;

  /**
   * Get all entities (alias for findAll)
   *
   * @returns Promise resolving to array of all entities
   */
  all(): Promise<T[]>;

  // ============================================================================
  // COUNT & EXISTENCE
  // ============================================================================

  /**
   * Count entities matching criteria
   *
   * @param where - Filter criteria (optional)
   * @returns Promise resolving to count
   */
  count(where?: FilterQuery<T>): Promise<number>;

  /**
   * Check if entity exists matching criteria
   *
   * @param where - Filter criteria
   * @returns Promise resolving to boolean
   */
  exists(where: FilterQuery<T>): Promise<boolean>;

  // ============================================================================
  // CREATE OPERATIONS (delegated to repository)
  // ============================================================================

  /**
   * Create a new entity
   *
   * @param data - Entity data
   * @returns Promise resolving to created entity
   */
  create(data: EntityData<T>): Promise<T>;

  /**
   * Create multiple entities
   *
   * @param data - Array of entity data
   * @returns Promise resolving to array of created entities
   */
  createMany(data: EntityData<T>[]): Promise<T[]>;

  // ============================================================================
  // UPDATE OPERATIONS (delegated to repository)
  // ============================================================================

  /**
   * Update entity by ID
   *
   * @param id - Primary key value
   * @param data - Update data
   * @returns Promise resolving to updated entity
   */
  update(id: Primary<T>, data: EntityData<T>): Promise<T>;

  /**
   * Update multiple entities by criteria
   *
   * @param where - Filter criteria
   * @param data - Update data
   * @returns Promise resolving to number of updated entities
   */
  updateMany(where: FilterQuery<T>, data: EntityData<T>): Promise<number>;

  /**
   * Upsert (insert or update) entity
   *
   * @param where - Criteria to find existing entity
   * @param data - Entity data to insert or update
   * @returns Promise resolving to upserted entity
   */
  upsert(where: FilterQuery<T>, data: EntityData<T>): Promise<T>;

  // ============================================================================
  // DELETE OPERATIONS (delegated to repository)
  // ============================================================================

  /**
   * Delete entity by ID
   *
   * @param id - Primary key value
   * @returns Promise resolving to boolean (true if deleted)
   */
  delete(id: Primary<T>): Promise<boolean>;

  /**
   * Delete multiple entities by criteria
   *
   * @param where - Filter criteria
   * @returns Promise resolving to number of deleted entities
   */
  deleteMany(where: FilterQuery<T>): Promise<number>;

  // ============================================================================
  // AGGREGATIONS (delegated to repository)
  // ============================================================================

  /**
   * Calculate sum of numeric field
   *
   * @param field - Field name
   * @param where - Filter criteria (optional)
   * @returns Promise resolving to sum
   */
  sum(field: keyof T, where?: FilterQuery<T>): Promise<number>;

  /**
   * Calculate average of numeric field
   *
   * @param field - Field name
   * @param where - Filter criteria (optional)
   * @returns Promise resolving to average
   */
  avg(field: keyof T, where?: FilterQuery<T>): Promise<number>;

  /**
   * Find minimum value of field
   *
   * @param field - Field name
   * @param where - Filter criteria (optional)
   * @returns Promise resolving to minimum value
   */
  min(field: keyof T, where?: FilterQuery<T>): Promise<number>;

  /**
   * Find maximum value of field
   *
   * @param field - Field name
   * @param where - Filter criteria (optional)
   * @returns Promise resolving to maximum value
   */
  max(field: keyof T, where?: FilterQuery<T>): Promise<number>;

  // ============================================================================
  // PAGINATION (delegated to repository)
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
   */
  paginate(
    perPage?: number,
    request?: Request,
    config?: Partial<PaginationConfig>,
  ): Promise<LengthAwarePaginator<T>>;

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
   */
  simplePaginate(
    perPage?: number,
    request?: Request,
    config?: Partial<PaginationConfig>,
  ): Promise<SimplePaginator<T>>;

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
   */
  cursorPaginate(
    perPage?: number,
    request?: Request,
    config?: Partial<PaginationConfig>,
  ): Promise<CursorPaginator<T>>;

  // ============================================================================
  // UTILITY METHODS (delegated to repository)
  // ============================================================================

  /**
   * Get fresh copy of entity from database
   *
   * @param entity - Entity to refresh
   * @returns Promise resolving to fresh entity or null
   */
  fresh(entity: T): Promise<T | null>;

  /**
   * Refresh entity in place from database
   *
   * @param entity - Entity to refresh
   * @returns Promise resolving to refreshed entity
   */
  refresh(entity: T): Promise<T>;

  /**
   * Process entities in chunks
   *
   * @param chunkSize - Number of entities per chunk
   * @param callback - Function to process each chunk
   * @returns Promise that resolves when all chunks processed
   */
  chunk(chunkSize: number, callback: (entities: T[]) => Promise<void>): Promise<void>;

  /**
   * Flush pending changes to database
   *
   * @returns Promise that resolves when flush complete
   */
  flush(): Promise<void>;
}
