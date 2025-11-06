/**
 * Cursor Paginator Response Interface
 *
 * Response format for cursor-based pagination. This is the most
 * efficient pagination method for large datasets and real-time data,
 * as it uses indexed columns to navigate without offset calculations.
 *
 * Similar to Laravel's CursorPaginator.
 *
 * @template T - The type of items in the data array
 *
 * @interface CursorPaginatorResponse
 *
 * @example
 * ```typescript
 * const response: CursorPaginatorResponse<User> = {
 *   data: [
 *     { id: 101, name: 'John' },
 *     { id: 102, name: 'Jane' },
 *   ],
 *   meta: {
 *     perPage: 15,
 *     nextCursor: 'eyJpZCI6MTAyLCJjcmVhdGVkQXQiOiIyMDIzLTAxLTAxIn0=',
 *     prevCursor: 'eyJpZCI6MTAwLCJjcmVhdGVkQXQiOiIyMDIzLTAxLTAxIn0=',
 *     hasMorePages: true,
 *   },
 *   links: {
 *     prev: '/api/users?cursor=eyJpZCI6MTAwfQ==',
 *     next: '/api/users?cursor=eyJpZCI6MTAyfQ==',
 *   },
 * };
 * ```
 */
export interface CursorPaginatorResponse<T> {
  /**
   * Current page items
   *
   * Array of items for the current page.
   *
   * @example [{ id: 101, name: 'John' }, { id: 102, name: 'Jane' }]
   */
  data: T[];

  /**
   * Cursor pagination metadata
   *
   * Contains information about the page size, cursor values,
   * and whether more pages are available.
   *
   * @example
   * ```typescript
   * {
   *   perPage: 15,
   *   nextCursor: 'eyJpZCI6MTAyLCJjcmVhdGVkQXQiOiIyMDIzLTAxLTAxIn0=',
   *   prevCursor: 'eyJpZCI6MTAwLCJjcmVhdGVkQXQiOiIyMDIzLTAxLTAxIn0=',
   *   hasMorePages: true,
   * }
   * ```
   */
  meta: {
    /**
     * Number of items per page
     *
     * The maximum number of items shown on each page.
     *
     * @example 15
     */
    perPage: number;

    /**
     * Next cursor value
     *
     * Encoded cursor string to fetch the next page of results.
     * Null if on the last page or no more pages available.
     *
     * @example 'eyJpZCI6MTAyLCJjcmVhdGVkQXQiOiIyMDIzLTAxLTAxIn0='
     */
    nextCursor: string | null;

    /**
     * Previous cursor value
     *
     * Encoded cursor string to fetch the previous page of results.
     * Null if on the first page.
     *
     * @example 'eyJpZCI6MTAwLCJjcmVhdGVkQXQiOiIyMDIzLTAxLTAxIn0='
     */
    prevCursor: string | null;

    /**
     * Whether there are more pages available
     *
     * Indicates if there are additional pages after the current one.
     * Useful for conditionally displaying "Load More" buttons.
     *
     * @example true
     */
    hasMorePages: boolean;
  };

  /**
   * Cursor pagination links
   *
   * URLs for navigating to previous and next pages using cursors.
   * Does not include page numbers or last page links since
   * cursor pagination doesn't support random page access.
   *
   * @example
   * ```typescript
   * {
   *   prev: '/api/users?cursor=eyJpZCI6MTAwfQ==',
   *   next: '/api/users?cursor=eyJpZCI6MTAyfQ==',
   * }
   * ```
   */
  links: {
    /**
     * URL for previous page
     *
     * The URL to navigate to the previous page using the prev cursor.
     * Null if on the first page.
     *
     * @example '/api/users?cursor=eyJpZCI6MTAwfQ=='
     */
    prev: string | null;

    /**
     * URL for next page
     *
     * The URL to navigate to the next page using the next cursor.
     * Null if on the last page or no more pages available.
     *
     * @example '/api/users?cursor=eyJpZCI6MTAyfQ=='
     */
    next: string | null;
  };
}
