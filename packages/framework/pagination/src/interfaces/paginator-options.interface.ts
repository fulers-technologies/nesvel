/**
 * Base Paginator Options Interface
 *
 * Configuration options for pagination URL generation and behavior.
 *
 * @interface PaginatorOptions
 *
 * @example
 * ```typescript
 * const options: PaginatorOptions = {
 *   path: '/api/users',
 *   pageName: 'page',
 *   query: { filter: 'active' },
 *   fragment: 'results',
 * };
 * ```
 */
export interface PaginatorOptions {
  /**
   * Base path for pagination URLs
   *
   * The base URL path that will be used when generating pagination links.
   * Typically the current route path.
   *
   * @example '/api/users'
   */
  path?: string;

  /**
   * Query string variable name for page/cursor
   *
   * The name of the query parameter used for pagination.
   * Default is 'page' for offset pagination or 'cursor' for cursor pagination.
   *
   * @default 'page'
   * @example 'page'
   */
  pageName?: string;

  /**
   * Additional query parameters to append to URLs
   *
   * Any extra query parameters that should be preserved in pagination links.
   * Useful for maintaining filters, sorting, or search terms.
   *
   * @example { filter: 'active', sort: 'name' }
   */
  query?: Record<string, any>;

  /**
   * URL fragment/hash
   *
   * The hash/fragment to append to pagination URLs.
   * Useful for scrolling to specific sections.
   *
   * @example 'results'
   */
  fragment?: string;
}
