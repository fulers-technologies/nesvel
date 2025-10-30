import { PaginateQuery, Paginated } from 'nestjs-paginate';
import { EntityManager, EntityRepository, FilterQuery, Loaded } from '@mikro-orm/core';
import { SortDirection } from '../enums';
import type { IRepositoryQueryBuilder } from './repository-query-builder.interface';

export type { IRepositoryQueryBuilder };

/**
 * Base repository interface with Laravel Eloquent-like methods
 */
export interface IRepository<T extends object> {
  /**
   * Get the underlying MikroORM repository
   */
  getRepository(): EntityRepository<T>;

  /**
   * Get the entity manager
   */
  getEntityManager(): EntityManager;

  // Laravel Eloquent-like methods

  /**
   * Find all records
   */
  all(): Promise<Loaded<T, never>[]>;

  /**
   * Find a record by ID
   */
  find(id: string | number): Promise<Loaded<T, never> | null>;

  /**
   * Find a record by ID or throw an exception
   */
  findOrFail(id: string | number): Promise<Loaded<T, never>>;

  /**
   * Find records by criteria
   */
  where(criteria: FilterQuery<T>): Promise<Loaded<T, never>[]>;

  /**
   * Find the first record matching criteria
   */
  first(criteria?: FilterQuery<T>): Promise<Loaded<T, never> | null>;

  /**
   * Find the first record or throw an exception
   */
  firstOrFail(criteria?: FilterQuery<T>): Promise<Loaded<T, never>>;

  /**
   * Create a new record
   */
  create(data: Partial<T>): Promise<Loaded<T, never>>;

  /**
   * Update a record by ID
   */
  update(id: string | number, data: Partial<T>): Promise<Loaded<T, never>>;

  /**
   * Update records by criteria
   */
  updateWhere(criteria: FilterQuery<T>, data: Partial<T>): Promise<number>;

  /**
   * Delete a record by ID
   */
  delete(id: string | number): Promise<boolean>;

  /**
   * Delete records by criteria
   */
  deleteWhere(criteria: FilterQuery<T>): Promise<number>;

  /**
   * Create or update a record
   */
  upsert(criteria: FilterQuery<T>, data: Partial<T>): Promise<Loaded<T, never>>;

  /**
   * Get count of records
   */
  count(criteria?: FilterQuery<T>): Promise<number>;

  /**
   * Check if any records exist
   */
  exists(criteria: FilterQuery<T>): Promise<boolean>;

  /**
   * Get paginated results
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

  /**
   * Order records
   */
  orderBy(field: keyof T, direction?: SortDirection): IRepositoryQueryBuilder<T>;

  /**
   * Limit records
   */
  limit(count: number): IRepositoryQueryBuilder<T>;

  /**
   * Skip records
   */
  skip(count: number): IRepositoryQueryBuilder<T>;

  /**
   * Get records with relations
   */
  with(relations: string[]): IRepositoryQueryBuilder<T>;
}
