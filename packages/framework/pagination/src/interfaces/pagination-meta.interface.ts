/**
 * Pagination Metadata Interface
 *
 * Contains metadata information about the current pagination state,
 * including page numbers, item counts, and ranges.
 *
 * @interface PaginationMeta
 *
 * @example
 * ```typescript
 * const meta: PaginationMeta = {
 *   currentPage: 2,
 *   perPage: 15,
 *   from: 16,
 *   to: 30,
 *   lastPage: 10,
 *   total: 150,
 * };
 * ```
 */
export interface PaginationMeta {
  /**
   * Current page number
   *
   * The page number currently being displayed (1-indexed).
   *
   * @example 2
   */
  currentPage: number;

  /**
   * Number of items per page
   *
   * The maximum number of items shown on each page.
   *
   * @example 15
   */
  perPage: number;

  /**
   * Index of first item on current page
   *
   * The 1-indexed position of the first item on the current page
   * in the entire result set. Null if the result set is empty.
   *
   * @example 16
   */
  from: number | null;

  /**
   * Index of last item on current page
   *
   * The 1-indexed position of the last item on the current page
   * in the entire result set. Null if the result set is empty.
   *
   * @example 30
   */
  to: number | null;

  /**
   * Total number of pages
   *
   * The total number of pages available. Only present in
   * LengthAwarePaginator (offset pagination with count).
   *
   * @optional
   * @example 10
   */
  lastPage?: number;

  /**
   * Total number of items
   *
   * The total count of all items across all pages. Only present
   * in LengthAwarePaginator (offset pagination with count).
   *
   * @optional
   * @example 150
   */
  total?: number;
}
