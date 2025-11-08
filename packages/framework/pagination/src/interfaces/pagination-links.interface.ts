/**
 * Pagination Links Structure Interface
 *
 * Contains URLs for navigating between pages in a paginated result set.
 *
 * @interface PaginationLinks
 *
 * @example
 * ```typescript
 * const links: PaginationLinks = {
 *   first: '/api/users?page=1',
 *   last: '/api/users?page=10',
 *   prev: '/api/users?page=1',
 *   next: '/api/users?page=3',
 *   pages: [
 *     { url: '/api/users?page=1', label: '1', active: false },
 *     { url: '/api/users?page=2', label: '2', active: true },
 *     { url: '/api/users?page=3', label: '3', active: false },
 *   ],
 * };
 * ```
 */
export interface PaginationLinks {
  /**
   * URL for first page
   *
   * The URL to navigate to the first page of results.
   * Null if already on the first page.
   *
   * @example '/api/users?page=1'
   */
  first: string | null;

  /**
   * URL for last page
   *
   * The URL to navigate to the last page of results.
   * Only present in LengthAwarePaginator (offset pagination with count).
   * Null if already on the last page.
   *
   * @optional
   * @example '/api/users?page=10'
   */
  last?: string | null;

  /**
   * URL for previous page
   *
   * The URL to navigate to the previous page.
   * Null if on the first page.
   *
   * @example '/api/users?page=1'
   */
  prev: string | null;

  /**
   * URL for next page
   *
   * The URL to navigate to the next page.
   * Null if on the last page or no more pages available.
   *
   * @example '/api/users?page=3'
   */
  next: string | null;

  /**
   * Array of page links with labels
   *
   * Detailed page navigation links for rendering pagination UI.
   * Only present in LengthAwarePaginator (offset pagination with count).
   * Each entry contains the URL, display label, and active state.
   *
   * @optional
   * @example
   * ```typescript
   * [
   *   { url: '/api/users?page=1', label: '1', active: false },
   *   { url: '/api/users?page=2', label: '2', active: true },
   *   { url: '/api/users?page=3', label: '3', active: false },
   * ]
   * ```
   */
  pages?: Array<{
    /** URL for this page (null for disabled links like '...') */
    url: string | null;
    /** Display label for the link ('1', '2', 'Next', '...', etc.) */
    label: string;
    /** Whether this is the currently active page */
    active: boolean;
  }>;
}
