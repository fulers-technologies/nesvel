/**
 * Paginated Response Interface
 *
 * Represents a paginated search result with metadata.
 * Compatible with standard pagination formats used in REST APIs.
 *
 * @template T - The type of documents in the results
 *
 * @example
 * ```typescript
 * const page: PaginatedResponse<Product> = {
 *   data: [...],
 *   total: 150,
 *   perPage: 20,
 *   currentPage: 1,
 *   lastPage: 8,
 *   from: 1,
 *   to: 20,
 * };
 *
 * console.log(`Showing ${page.from}-${page.to} of ${page.total}`);
 * console.log(`Page ${page.currentPage} of ${page.lastPage}`);
 * ```
 *
 * @author Nesvel
 * @since 1.0.0
 */
export interface PaginatedResponse<T = any> {
  /**
   * Array of documents in the current page
   */
  data: T[];

  /**
   * Total number of documents across all pages
   */
  total: number;

  /**
   * Number of documents per page
   */
  perPage: number;

  /**
   * Current page number (1-indexed)
   */
  currentPage: number;

  /**
   * Last page number
   */
  lastPage: number;

  /**
   * Index of first document in current page (1-indexed)
   */
  from: number;

  /**
   * Index of last document in current page (1-indexed)
   */
  to: number;
}
