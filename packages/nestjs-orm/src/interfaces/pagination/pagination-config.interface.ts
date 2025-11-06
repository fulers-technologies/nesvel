/**
 * Pagination Configuration Interface
 *
 * Configuration options for setting up pagination builders.
 * Used to customize pagination behavior including page size,
 * query parameter names, and URL generation.
 *
 * @interface PaginationConfig
 *
 * @example
 * ```typescript
 * const config: PaginationConfig = {
 *   perPage: 20,
 *   pageName: 'page',
 *   cursorName: 'cursor',
 *   path: '/api/users',
 *   columns: ['id', 'name', 'email'],
 *   query: { filter: 'active', sort: 'name' },
 *   fragment: 'results',
 * };
 * ```
 */
export interface PaginationConfig {
  /**
   * Items per page
   *
   * The number of items to display on each page.
   *
   * @default 15
   * @example 20
   */
  perPage?: number;

  /**
   * Page name in query string
   *
   * The name of the query parameter used for page numbers
   * in offset-based pagination.
   *
   * @default 'page'
   * @example 'page'
   */
  pageName?: string;

  /**
   * Cursor name in query string
   *
   * The name of the query parameter used for cursor values
   * in cursor-based pagination.
   *
   * @default 'cursor'
   * @example 'cursor'
   */
  cursorName?: string;

  /**
   * Base path for URLs
   *
   * The base URL path that will be used when generating
   * pagination links. Typically the current route path.
   *
   * @example '/api/users'
   */
  path?: string;

  /**
   * Columns to select
   *
   * Array of column names to select from the database.
   * Useful for limiting the data returned in paginated results.
   *
   * @default ['*']
   * @example ['id', 'name', 'email', 'createdAt']
   */
  columns?: string[];

  /**
   * Additional query parameters
   *
   * Extra query parameters to include in pagination URLs.
   * These are preserved across page navigation to maintain
   * filters, sorting, search terms, etc.
   *
   * @example { filter: 'active', sort: 'name', search: 'john' }
   */
  query?: Record<string, any>;

  /**
   * URL fragment
   *
   * The hash/fragment to append to pagination URLs.
   * Useful for scrolling to specific sections of the page.
   *
   * @example 'results'
   */
  fragment?: string;
}
