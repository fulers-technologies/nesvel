import type { FilterQuery, FindOptions, Loaded, QueryOrderMap } from '@mikro-orm/core';
import type { PaginateQuery, Paginated } from 'nestjs-paginate';

import type { BaseEntity } from '@/entities/base.entity';
import { SortDirection } from '@/enums/sort-direction.enum';
import type { IRepository } from '@/interfaces/repository.interface';
import { IRepositoryQueryBuilder } from '@/interfaces/repository-query-builder.interface';

/**
 * RepositoryQueryBuilder
 *
 * A fluent, type-safe query builder used by BaseRepository to compose queries
 * with chaining methods similar to Laravel Eloquent. Supports filtering, ordering,
 * pagination, eager loading, and common execution helpers.
 *
 * Usage pattern:
 * - Start with BaseRepository.orderBy/limit/skip/with to get a builder
 * - Chain where/orderBy/limit/skip/with as needed
 * - Execute with get(), first(), count(), exists(), or paginate()
 *
 * This builder does not mutate the repository; it accumulates criteria/options
 * and delegates execution to the underlying MikroORM repository.
 *
 * @template T - Entity type managed by the repository
 * @since 1.0.0
 */
export class RepositoryQueryBuilder<T extends BaseEntity> implements IRepositoryQueryBuilder<T> {
  /**
   * Accumulated filter criteria (merged via shallow assign on successive calls)
   */
  private criteria: FilterQuery<T> = {} as FilterQuery<T>;

  /**
   * Accumulated find options including orderBy, limit, offset, populate, etc.
   */
  private options: FindOptions<T> = {} as FindOptions<T>;

  /**
   * Create a new RepositoryQueryBuilder
   *
   * @param repository - The base repository used to execute queries
   * @param initialOptions - Optional initial options (e.g., orderBy, limit)
   */
  constructor(
    private readonly repository: IRepository<T>,
    initialOptions: Partial<FindOptions<T>> = {},
  ) {
    this.options = { ...(initialOptions || {}) } as FindOptions<T>;
  }

  /**
   * Add/merge filter criteria
   *
   * Successive calls merge criteria with shallow Object.assign semantics.
   *
   * @param criteria - MikroORM FilterQuery conditions
   * @returns this for chaining
   */
  where(criteria: FilterQuery<T>): IRepositoryQueryBuilder<T> {
    this.criteria = Object.assign({}, this.criteria, criteria);
    return this;
  }

  /**
   * Add/merge ORDER BY clause
   *
   * Later calls extend/override previous orderBy keys.
   *
   * @param field - Field to order by
   * @param direction - ASC or DESC (default ASC)
   * @returns this for chaining
   */
  orderBy(
    field: keyof T,
    direction: SortDirection = SortDirection.ASC,
  ): IRepositoryQueryBuilder<T> {
    this.options.orderBy = {
      ...(this.options.orderBy as QueryOrderMap<T>),
      [field]: direction,
    } as QueryOrderMap<T>;
    return this;
  }

  /**
   * Set LIMIT
   *
   * @param count - Maximum number of records to return
   * @returns this for chaining
   */
  limit(count: number): IRepositoryQueryBuilder<T> {
    this.options.limit = count;
    return this;
  }

  /**
   * Set OFFSET (skip)
   *
   * @param count - Number of records to skip
   * @returns this for chaining
   */
  skip(count: number): IRepositoryQueryBuilder<T> {
    this.options.offset = count;
    return this;
  }

  /**
   * Eager load relations
   *
   * @param relations - Relation names to populate
   * @returns this for chaining
   */
  with(relations: string[]): IRepositoryQueryBuilder<T> {
    this.options.populate = relations as any;
    return this;
  }

  /**
   * Execute and return all results
   */
  async get(): Promise<Loaded<T, never>[]> {
    return await this.repository.getRepository().find(this.criteria, this.options);
  }

  /**
   * Execute and return first result (or null)
   */
  async first(): Promise<Loaded<T, never> | null> {
    return await this.repository.getRepository().findOne(this.criteria, this.options);
  }

  /**
   * Execute and return count of matching records
   */
  async count(): Promise<number> {
    return await this.repository.getRepository().count(this.criteria);
  }

  /**
   * Execute and return existence boolean
   */
  async exists(): Promise<boolean> {
    const count = await this.count();
    return count > 0;
  }

  /**
   * Execute a paginated query using the repository paginator
   *
   * @param query - PaginateQuery from @Paginate() decorator
   * @param config - Optional pagination configuration
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
    // Merge query builder criteria and sortBy with the PaginateQuery
    const mergedQuery: PaginateQuery = {
      ...query,
      filter: { ...(query.filter || {}), ...(this.criteria as any) },
    };

    // If query builder has orderBy but query doesn't have sortBy, apply it
    if (!mergedQuery.sortBy && this.options.orderBy) {
      const orderByEntries = Object.entries(this.options.orderBy);
      if (orderByEntries.length > 0) {
        mergedQuery.sortBy = orderByEntries.map(([field, direction]) => [
          field,
          (direction as string).toLowerCase(),
        ]) as any;
      }
    }

    return await this.repository.paginate(mergedQuery, config);
  }
}
