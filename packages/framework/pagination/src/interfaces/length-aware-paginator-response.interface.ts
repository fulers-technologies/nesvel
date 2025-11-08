import { PaginationMeta } from './pagination-meta.interface';
import { PaginationLinks } from './pagination-links.interface';

/**
 * Length-Aware Paginator Response Interface
 *
 * Response format for offset-based pagination with total count.
 * This is the most feature-rich pagination type, providing complete
 * information about the dataset including total pages and item count.
 *
 * Similar to Laravel's LengthAwarePaginator.
 *
 * @template T - The type of items in the data array
 *
 * @interface LengthAwarePaginatorResponse
 *
 * @example
 * ```typescript
 * const response: LengthAwarePaginatorResponse<User> = {
 *   data: [
 *     { id: 1, name: 'John' },
 *     { id: 2, name: 'Jane' },
 *   ],
 *   meta: {
 *     currentPage: 1,
 *     perPage: 15,
 *     from: 1,
 *     to: 2,
 *     lastPage: 5,
 *     total: 75,
 *   },
 *   links: {
 *     first: '/api/users?page=1',
 *     last: '/api/users?page=5',
 *     prev: null,
 *     next: '/api/users?page=2',
 *     pages: [
 *       { url: '/api/users?page=1', label: '1', active: true },
 *       { url: '/api/users?page=2', label: '2', active: false },
 *     ],
 *   },
 * };
 * ```
 */
export interface LengthAwarePaginatorResponse<T> {
  /**
   * Current page items
   *
   * Array of items for the current page.
   *
   * @example [{ id: 1, name: 'John' }, { id: 2, name: 'Jane' }]
   */
  data: T[];

  /**
   * Pagination metadata
   *
   * Contains information about page numbers, item counts, and ranges.
   * Includes total count and last page number.
   *
   * @example
   * ```typescript
   * {
   *   currentPage: 1,
   *   perPage: 15,
   *   from: 1,
   *   to: 15,
   *   lastPage: 10,
   *   total: 150,
   * }
   * ```
   */
  meta: PaginationMeta;

  /**
   * Pagination links
   *
   * URLs for navigating between pages, including first, last, prev, next,
   * and detailed page links for rendering pagination UI.
   *
   * @example
   * ```typescript
   * {
   *   first: '/api/users?page=1',
   *   last: '/api/users?page=10',
   *   prev: null,
   *   next: '/api/users?page=2',
   *   pages: [...],
   * }
   * ```
   */
  links: PaginationLinks;
}
