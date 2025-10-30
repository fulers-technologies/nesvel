import { FilterQuery, Loaded, QueryOrderMap } from '@mikro-orm/core';
import type { IRepository } from './repository.interface';

/**
 * Base service interface with business logic methods
 */
export interface IService<T extends object> {
  /**
   * Get the repository instance
   */
  getRepository(): IRepository<T>;

  /**
   * Find all records with optional filtering and pagination
   */
  findAll(options?: {
    where?: FilterQuery<T>;
    orderBy?: QueryOrderMap<T>;
    limit?: number;
    offset?: number;
    populate?: string[];
  }): Promise<Loaded<T, never>[]>;

  /**
   * Find a single record by ID
   */
  findOne(id: string | number, populate?: string[]): Promise<Loaded<T, never> | null>;

  /**
   * Find a single record by ID or throw exception
   */
  findOneOrFail(id: string | number, populate?: string[]): Promise<Loaded<T, never>>;

  /**
   * Find records by criteria
   */
  findBy(criteria: FilterQuery<T>, populate?: string[]): Promise<Loaded<T, never>[]>;

  /**
   * Create a new record
   */
  create(data: Partial<T>): Promise<Loaded<T, never>>;

  /**
   * Create multiple records
   */
  createMany(data: Partial<T>[]): Promise<Loaded<T, never>[]>;

  /**
   * Update a record by ID
   */
  update(id: string | number, data: Partial<T>): Promise<Loaded<T, never>>;

  /**
   * Update records by criteria
   */
  updateBy(criteria: FilterQuery<T>, data: Partial<T>): Promise<number>;

  /**
   * Delete a record by ID
   */
  delete(id: string | number): Promise<boolean>;

  /**
   * Delete records by criteria
   */
  deleteBy(criteria: FilterQuery<T>): Promise<number>;

  /**
   * Restore a soft-deleted record (if applicable)
   */
  restore(id: string | number): Promise<Loaded<T, never>>;

  /**
   * Get paginated results
   */
  paginate(options: {
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
  }>;

  /**
   * Get count of records
   */
  count(criteria?: FilterQuery<T>): Promise<number>;

  /**
   * Check if records exist
   */
  exists(criteria: FilterQuery<T>): Promise<boolean>;

  /**
   * Execute a transaction
   */
  transaction<R>(callback: (em: any) => Promise<R>): Promise<R>;

  /**
   * Bulk insert records
   */
  bulkInsert(data: Partial<T>[], batchSize?: number): Promise<void>;

  /**
   * Bulk update records
   */
  bulkUpdate(criteria: FilterQuery<T>, data: Partial<T>): Promise<number>;

  /**
   * Bulk delete records
   */
  bulkDelete(criteria: FilterQuery<T>): Promise<number>;
}
