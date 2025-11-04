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

  // /**
  //  * Find all records with optional filtering and pagination
  //  */
  // findAll(options?: {
  //   where?: FilterQuery<T>;
  //   orderBy?: QueryOrderMap<T>;
  //   limit?: number;
  //   offset?: number;
  //   populate?: string[];
  // }): Promise<Loaded<T, never>[]>;

  // /**
  //  * Find a single record by ID
  //  */
  // findOne(id: string | number, populate?: string[]): Promise<Loaded<T, never> | null>;

  // /**
  //  * Find a single record by ID or throw exception
  //  */
  // findOneOrFail(id: string | number, populate?: string[]): Promise<Loaded<T, never>>;

  // /**
  //  * Find records by criteria
  //  */
  // findBy(criteria: FilterQuery<T>, populate?: string[]): Promise<Loaded<T, never>[]>;

  // /**
  //  * Get count of records
  //  */
  // count(criteria?: FilterQuery<T>): Promise<number>;

  // /**
  //  * Check if records exist
  //  */
  // exists(criteria: FilterQuery<T>): Promise<boolean>;

  // /**
  //  * Create a single record
  //  */
  // create(data: Partial<T>): Promise<Loaded<T, never>>;

  // /**
  //  * Create multiple records (batch operation, returns entities)
  //  */
  // createBy(data: Partial<T>[]): Promise<Loaded<T, never>[]>;

  // /**
  //  * Create many records efficiently (batched processing for huge datasets)
  //  */
  // createMany(data: Partial<T>[], batchSize?: number): Promise<void>;

  // /**
  //  * Update a single record by ID
  //  */
  // update(id: string | number, data: Partial<T>): Promise<Loaded<T, never>>;

  // /**
  //  * Update multiple records by criteria
  //  */
  // updateBy(criteria: FilterQuery<T>, data: Partial<T>): Promise<number>;

  // /**
  //  * Update multiple records by IDs (batch operation with entity loading)
  //  */
  // updateMany(
  //   updates: Array<{ id: string | number; data: Partial<T> }>,
  // ): Promise<Loaded<T, never>[]>;

  // /**
  //  * Delete a single record by ID
  //  */
  // delete(id: string | number): Promise<boolean>;

  // /**
  //  * Delete multiple records by criteria
  //  */
  // deleteBy(criteria: FilterQuery<T>): Promise<number>;

  // /**
  //  * Delete multiple records by IDs (batch operation)
  //  */
  // deleteMany(ids: Array<string | number>): Promise<number>;

  // /**
  //  * Soft delete a single record
  //  */
  // softDelete(id: string | number): Promise<boolean>;

  // /**
  //  * Soft delete multiple records by criteria
  //  */
  // softDeleteBy(criteria: FilterQuery<T>): Promise<number>;

  // /**
  //  * Restore a single soft-deleted record
  //  */
  // restore(id: string | number): Promise<Loaded<T, never>>;

  // /**
  //  * Restore multiple soft-deleted records by criteria
  //  */
  // restoreBy(criteria: FilterQuery<T>): Promise<number>;

  // /**
  //  * Get only soft-deleted records
  //  */
  // onlyTrashed(): Promise<Loaded<T, never>[]>;

  // /**
  //  * Get records including soft-deleted ones
  //  */
  // withTrashed(): Promise<Loaded<T, never>[]>;

  // /**
  //  * Get paginated results
  //  */
  // paginate(options: {
  //   page: number;
  //   limit: number;
  //   where?: FilterQuery<T>;
  //   orderBy?: QueryOrderMap<T>;
  //   populate?: string[];
  // }): Promise<{
  //   data: Loaded<T, never>[];
  //   meta: {
  //     total: number;
  //     page: number;
  //     limit: number;
  //     totalPages: number;
  //     hasNext: boolean;
  //     hasPrev: boolean;
  //   };
  // }>;

  // /**
  //  * Execute a transaction
  //  */
  // transaction<R>(callback: (em: any) => Promise<R>): Promise<R>;
}
