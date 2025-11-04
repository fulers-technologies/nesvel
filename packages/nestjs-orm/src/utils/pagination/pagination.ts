import { PaginateQuery } from 'nestjs-paginate';

import { BaseEntity } from '@/entities/base.entity';
import { PaginationBuilder } from './pagination.builder';
import { IRepository } from '@/interfaces/repository.interface';

/**
 * Create a new pagination builder
 *
 * Factory function that creates a PaginationBuilder instance.
 * Provides a clean entry point for using the builder pattern.
 *
 * @template T - The entity type being paginated
 * @param repository - The repository to paginate
 * @param query - The pagination query from the request
 * @returns A new PaginationBuilder instance
 *
 * @example
 * ```typescript
 * // In a service or controller
 * const result = await paginate(this.userRepository, query)
 *   .withSortables(['id', 'name', 'email'])
 *   .withSearchables(['name', 'email'])
 *   .withDefaultLimit(20)
 *   .execute();
 * ```
 *
 * @example
 * ```typescript
 * // With default sorting
 * const result = await paginate(this.orderRepository, query)
 *   .withSortables(['id', 'total', 'status', 'createdAt'])
 *   .withSearchables(['customerName', 'orderNumber'])
 *   .withDefaultSort('createdAt', SortDirection.DESC)
 *   .withMaxLimit(100)
 *   .execute();
 * ```
 */
export function paginate<T extends BaseEntity>(
  repository: IRepository<T>,
  query: PaginateQuery,
): PaginationBuilder<T> {
  return new PaginationBuilder(repository, query);
}
