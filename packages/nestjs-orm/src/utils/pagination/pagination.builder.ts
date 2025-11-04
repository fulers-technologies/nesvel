import { Loaded } from '@mikro-orm/core';
import { Paginated, PaginateQuery, paginate as nestjsPaginate } from 'nestjs-paginate';

import { BaseEntity } from '@/entities/base.entity';
import { SortDirection } from '@/enums/sort-direction.enum';
import { IRepository } from '@/interfaces/repository.interface';

/**
 * Pagination Builder
 *
 * Provides a fluent, chainable API for configuring pagination options
 * before executing the paginate query. This builder pattern makes it
 * easy to incrementally build complex pagination configurations.
 *
 * @template T - The entity type being paginated
 *
 * @example
 * ```typescript
 * // Using the builder pattern
 * const result = await new PaginationBuilder(userRepository, query)
 *   .withSortables(['id', 'name', 'createdAt'])
 *   .withSearchables(['name', 'email'])
 *   .withDefaultLimit(20)
 *   .withMaxLimit(100)
 *   .execute();
 * ```
 *
 * @example
 * ```typescript
 * // Chaining multiple configurations
 * const result = await new PaginationBuilder(orderRepository, query)
 *   .withSortables(['id', 'total', 'createdAt'])
 *   .withSearchables(['customerName', 'orderNumber'])
 *   .withDefaultSort('createdAt', SortDirection.DESC)
 *   .withMaxLimit(50)
 *   .execute();
 * ```
 */
export class PaginationBuilder<T extends BaseEntity> {
  /**
   * List of entity properties that can be used for sorting
   *
   * Defines which fields clients are allowed to sort by in the query.
   * Only fields listed here will be accepted in the sortBy parameter.
   *
   * @private
   */
  private sortables?: (keyof T)[];

  /**
   * List of entity properties that can be searched
   *
   * Defines which fields will be included in text search operations.
   * The search query will look for matches across all specified fields.
   *
   * @private
   */
  private searchables?: (keyof T)[];

  /**
   * Default sort configuration
   *
   * Specifies the default sort order when no sort is provided by the client.
   * Format: [[field, direction]] where direction is ASC or DESC.
   *
   * @private
   */
  private sortBy?: [[keyof T, SortDirection]];

  /**
   * Maximum number of items per page
   *
   * Sets an upper limit on how many items can be requested per page.
   * Prevents clients from requesting excessive amounts of data.
   *
   * @private
   */
  private maxLimit?: number;

  /**
   * Default number of items per page
   *
   * Sets the default page size when the client doesn't specify a limit.
   * Should be a reasonable value for typical use cases.
   *
   * @private
   */
  private defaultLimit?: number;

  /**
   * Creates a new PaginationBuilder instance
   *
   * @param repository - The repository to paginate
   * @param query - The pagination query from the request
   */
  constructor(
    private readonly repository: IRepository<T>,
    private readonly query: PaginateQuery,
  ) {}

  /**
   * Configure which fields can be used for sorting
   *
   * Defines the allowed fields that clients can use in the sortBy
   * query parameter. Only fields listed here will be accepted for sorting.
   *
   * @param fields - Array of entity property names that can be sorted
   * @returns The builder instance for chaining
   *
   * @example
   * ```typescript
   * builder.withSortables(['id', 'name', 'createdAt', 'updatedAt'])
   * ```
   */
  withSortables(fields: (keyof T)[]): this {
    this.sortables = fields;
    return this;
  }

  /**
   * Configure which fields can be searched
   *
   * Defines the fields that will be included in text search queries.
   * The search query parameter will search across all specified fields.
   *
   * @param fields - Array of entity property names to search in
   * @returns The builder instance for chaining
   *
   * @example
   * ```typescript
   * builder.withSearchables(['name', 'email', 'description'])
   * ```
   */
  withSearchables(fields: (keyof T)[]): this {
    this.searchables = fields;
    return this;
  }

  /**
   * Configure default sort order
   *
   * Sets the default sorting behavior when no sort is specified in the query.
   * Can be overridden by client-provided sortBy query parameters.
   *
   * @param field - The field to sort by
   * @param direction - The sort direction (ASC or DESC)
   * @returns The builder instance for chaining
   *
   * @example
   * ```typescript
   * // Sort by creation date descending by default
   * builder.withDefaultSort('createdAt', SortDirection.DESC)
   * ```
   */
  withDefaultSort(field: keyof T, direction: SortDirection = SortDirection.ASC): this {
    this.sortBy = [[field, direction]];
    return this;
  }

  /**
   * Configure multiple default sort orders
   *
   * Sets multiple default sort criteria when no sort is specified in the query.
   * Sort criteria are applied in the order they appear in the array.
   *
   * @param sortBy - Array of [field, direction] tuples
   * @returns The builder instance for chaining
   *
   * @example
   * ```typescript
   * builder.withDefaultSorts([
   *   ['priority', SortDirection.DESC],
   *   ['createdAt', SortDirection.ASC]
   * ])
   * ```
   */
  withDefaultSorts(sortBy: [[keyof T, SortDirection]]): this {
    this.sortBy = sortBy;
    return this;
  }

  /**
   * Configure maximum number of items per page
   *
   * Sets an upper limit on how many items can be requested per page.
   * Prevents clients from requesting excessive amounts of data.
   *
   * @param limit - Maximum number of items per page
   * @returns The builder instance for chaining
   *
   * @example
   * ```typescript
   * builder.withMaxLimit(100) // Cap at 100 items per page
   * ```
   */
  withMaxLimit(limit: number): this {
    this.maxLimit = limit;
    return this;
  }

  /**
   * Configure default number of items per page
   *
   * Sets the default page size when the client doesn't specify a limit.
   * Should be a reasonable value for typical use cases.
   *
   * @param limit - Default number of items per page
   * @returns The builder instance for chaining
   *
   * @example
   * ```typescript
   * builder.withDefaultLimit(20) // Default to 20 items per page
   * ```
   */
  withDefaultLimit(limit: number): this {
    this.defaultLimit = limit;
    return this;
  }

  /**
   * Execute the pagination query
   *
   * Builds the final configuration and executes the paginate query
   * against the repository. Returns the paginated result set with
   * metadata and navigation links.
   *
   * @returns Promise resolving to paginated results
   *
   * @example
   * ```typescript
   * const result = await builder
   *   .withSortables(['id', 'name'])
   *   .withSearchables(['name'])
   *   .execute();
   *
   * // Result includes:
   * // - data: Array of entities
   * // - meta: Pagination metadata (page, limit, total, etc.)
   * // - links: Navigation links (first, prev, next, last)
   * ```
   */
  async execute(): Promise<Paginated<Loaded<T, never>>> {
    const config: any = {
      sortableColumns: this.sortables?.map(String),
      searchableColumns: this.searchables?.map(String),
      maxLimit: this.maxLimit,
      defaultLimit: this.defaultLimit,
    };

    if (this.sortBy) {
      config.defaultSortBy = this.sortBy.map(([field, direction]) => [String(field), direction]);
    }

    // Call nestjs-paginate's paginate function with query, repository, and config
    return await nestjsPaginate(this.query, this.repository as any, config);
  }

  /**
   * Get the current configuration
   *
   * Returns the current builder configuration as a plain object.
   * Useful for debugging or logging pagination settings.
   *
   * @returns The current pagination configuration
   */
  getConfig() {
    return {
      sortables: this.sortables,
      searchables: this.searchables,
      sortBy: this.sortBy,
      maxLimit: this.maxLimit,
      defaultLimit: this.defaultLimit,
    };
  }
}
