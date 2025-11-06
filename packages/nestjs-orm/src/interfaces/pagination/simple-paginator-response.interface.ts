import { PaginationMeta } from './pagination-meta.interface';
import { PaginationLinks } from './pagination-links.interface';

/**
 * Simple Paginator Response Interface
 *
 * Response format for offset-based pagination without total count.
 * This is more efficient than LengthAwarePaginator as it doesn't
 * require a COUNT query, but provides less information.
 *
 * Similar to Laravel's Paginator (simple pagination).
 *
 * @template T - The type of items in the data array
 *
 * @interface SimplePaginatorResponse
 *
 * @example
 * ```typescript
 * const response: SimplePaginatorResponse<User> = {
 *   data: [
 *     { id: 1, name: 'John' },
 *     { id: 2, name: 'Jane' },
 *   ],
 *   meta: {
 *     currentPage: 2,
 *     perPage: 15,
 *     from: 16,
 *     to: 30,
 *     hasMorePages: true,
 *   },
 *   links: {
 *     first: '/api/users?page=1',
 *     prev: '/api/users?page=1',
 *     next: '/api/users?page=3',
 *   },
 * };
 * ```
 */
export interface SimplePaginatorResponse<T> {
  /**
   * Current page items
   *
   * Array of items for the current page.
   *
   * @example [{ id: 1, name: 'John' }, { id: 2, name: 'Jane' }]
   */
  data: T[];

  /**
   * Pagination metadata (without total/lastPage)
   *
   * Contains information about the current page and whether
   * more pages are available. Does not include total count
   * or last page number for performance reasons.
   *
   * @example
   * ```typescript
   * {
   *   currentPage: 2,
   *   perPage: 15,
   *   from: 16,
   *   to: 30,
   *   hasMorePages: true,
   * }
   * ```
   */
  meta: Omit<PaginationMeta, 'total' | 'lastPage'> & {
    /**
     * Whether there are more pages available
     *
     * Indicates if there are additional pages after the current one.
     * Determined by fetching perPage + 1 items and checking if
     * more results exist.
     *
     * @example true
     */
    hasMorePages: boolean;
  };

  /**
   * Pagination links (without last/pages)
   *
   * URLs for navigating between pages. Does not include 'last'
   * or detailed 'pages' array since total page count is unknown.
   *
   * @example
   * ```typescript
   * {
   *   first: '/api/users?page=1',
   *   prev: '/api/users?page=1',
   *   next: '/api/users?page=3',
   * }
   * ```
   */
  links: Omit<PaginationLinks, 'last' | 'pages'>;
}
