import type { Request } from '@nesvel/nestjs-http';

import { Pagination } from '../pagination';
import type { SimplePaginatorResponse, PaginatorOptions } from '../interfaces';

/**
 * Simple Paginator Class
 *
 * Provides offset-based pagination without total count for improved performance.
 * This paginator is more efficient than LengthAwarePaginator as it avoids the
 * expensive COUNT query, but provides less information to the user.
 *
 * Key Features:
 * - No COUNT query required (better performance on large tables)
 * - Shows "Previous" and "Next" navigation
 * - Indicates if more pages exist without knowing the total
 * - Suitable for cases where exact page count isn't critical
 *
 * Trade-offs:
 * - No last page number or total count available
 * - Cannot jump to specific page numbers beyond immediate next/prev
 * - Better suited for "Previous/Next" UI than numbered pagination
 *
 * Similar to Laravel's SimplePaginator.
 *
 * @template T - The type of items being paginated
 *
 * @example
 * ```typescript
 * // Basic usage (fetch perPage + 1 to detect more pages)
 * const items = await repository.findMany({ limit: 16, offset: 0 });
 * const paginator = SimplePaginator.make(items, 15, 1);
 *
 * // From Express request
 * const paginator = SimplePaginator.fromRequest(items, 15, req);
 *
 * // Get JSON response
 * return paginator.toJSON();
 * // {
 * //   data: [...15 items...],
 * //   meta: { currentPage: 1, perPage: 15, from: 1, to: 15, hasMorePages: true },
 * //   links: { first: '...', prev: null, next: '...' }
 * // }
 * ```
 *
 * @see https://laravel.com/docs/pagination#simple-pagination
 */
export class SimplePaginator<T> {
  /**
   * Items for the current page
   *
   * Contains the actual data items for the current page, limited to perPage count.
   * Original array is sliced to remove the +1 item used for hasMore detection.
   *
   * @protected
   */
  protected items: T[];

  /**
   * Number of items per page
   *
   * The maximum number of items to display on each page.
   * Used for offset calculations and determining page boundaries.
   *
   * @protected
   */
  protected perPageItems: number;

  /**
   * Current page number (1-indexed)
   *
   * The page number currently being displayed.
   * Always starts from 1 (not 0) following Laravel convention.
   *
   * @protected
   */
  protected currentPageNum: number;

  /**
   * Paginator configuration options
   *
   * Contains settings for URL generation including path, query parameters,
   * fragment, and page parameter name.
   *
   * @protected
   */
  protected options: PaginatorOptions;

  /**
   * Whether more pages exist after current
   *
   * Determined by checking if the original items array length exceeded perPage.
   * True indicates there are more pages available beyond the current one.
   *
   * @protected
   */
  protected hasMore: boolean;

  /**
   * Constructor
   *
   * Creates a new SimplePaginator instance with the given items and configuration.
   * The items array should contain perPage + 1 items to determine if more pages exist.
   *
   * @param items - Items for current page (should include perPage + 1 to check for more pages)
   * @param perPage - Number of items per page
   * @param currentPage - Current page number (1-indexed)
   * @param options - Paginator options for URL generation
   *
   * @example
   * ```typescript
   * // Fetch 16 items when perPage is 15
   * const items = await repository.findMany({ limit: 16, offset: 0 });
   * const paginator = SimplePaginator.make(items, 15, 1, {
   *   path: '/api/users',
   *   query: { filter: 'active' }
   * });
   * // paginator.hasMorePages() will be true if items.length > 15
   * ```
   */
  constructor(items: T[], perPage: number, currentPage: number, options: PaginatorOptions = {}) {
    // Set the number of items per page
    this.perPageItems = perPage;

    // Store the current page number
    this.currentPageNum = currentPage;

    // Check if more pages exist (items.length > perPage means more pages available)
    this.hasMore = items.length > perPage;

    // Slice items to only include perPage count (remove the +1 used for hasMore check)
    this.items = items.slice(0, perPage);

    // Initialize pagination options with defaults
    this.options = {
      path: options.path || '',
      pageName: options.pageName || 'page', // Default page param name
      query: options.query || {},
      fragment: options.fragment,
    };
  }

  /**
   * Create a new paginator instance (factory method)
   *
   * Static factory method for creating SimplePaginator instances without
   * using the `new` keyword. Provides a cleaner, more Laravel-like API.
   *
   * @param items - Items for current page (should include perPage + 1 items)
   * @param perPage - Items per page
   * @param currentPage - Current page number (default: 1)
   * @param options - Paginator options
   * @returns New SimplePaginator instance
   *
   * @example
   * ```typescript
   * const paginator = SimplePaginator.make(items, 15, 2);
   * ```
   */
  static make<T>(
    items: T[],
    perPage: number,
    currentPage: number = 1,
    options: PaginatorOptions = {}
  ): SimplePaginator<T> {
    return SimplePaginator.make(items, perPage, currentPage, options);
  }

  /**
   * Create paginator from request
   *
   * Factory method that automatically extracts page number and query parameters
   * from a request object. Simplifies pagination setup in controllers.
   *
   * @param items - Items for current page (should include perPage + 1)
   * @param perPage - Number of items per page
   * @param request - Enhanced request object
   * @param options - Optional paginator configuration (overrides request values)
   * @returns New SimplePaginator instance
   *
   * @example
   * ```typescript
   * @Get('users')
   * async getUsers(@Req() request: Request) {
   *   const items = await this.userRepo.find({ limit: 16, offset: 0 });
   *   const paginator = SimplePaginator.fromRequest(items, 15, request);
   *   return paginator.toJSON();
   * }
   * ```
   */
  static fromRequest<T>(
    items: T[],
    perPage: number,
    request: Request,
    options: Partial<PaginatorOptions> = {}
  ): SimplePaginator<T> {
    // Determine page parameter name
    const pageName = options.pageName || 'page';

    // Extract current page from request
    const currentPage = Pagination.resolveCurrentPage(request, pageName);

    // Get current path from request
    const path = options.path || Pagination.resolveCurrentPath(request);

    // Extract all query parameters except page
    const query = options.query || Pagination.getQueryParameters(request, [pageName]);

    // Create paginator with extracted values
    return SimplePaginator.make(items, perPage, currentPage, {
      ...options,
      path,
      pageName,
      query,
    });
  }

  /**
   * Get count of items on current page
   *
   * @returns Number of items on the current page
   *
   * @example
   * ```typescript
   * const count = paginator.count(); // 15
   * ```
   */
  count(): number {
    return this.items.length;
  }

  /**
   * Get current page number
   *
   * @returns Current page number (1-indexed)
   *
   * @example
   * ```typescript
   * const page = paginator.currentPage(); // 2
   * ```
   */
  currentPage(): number {
    return this.currentPageNum;
  }

  /**
   * Get index of first item on current page
   *
   * Returns the 1-indexed position of the first item on the current page
   * in the entire result set. Returns null if the page is empty.
   *
   * @returns First item index or null if empty
   *
   * @example
   * ```typescript
   * // On page 2 with 15 items per page
   * const firstItem = paginator.firstItem(); // 16
   * ```
   */
  firstItem(): number | null {
    return this.count() > 0 ? (this.currentPageNum - 1) * this.perPageItems + 1 : null;
  }

  /**
   * Get index of last item on current page
   *
   * Returns the 1-indexed position of the last item on the current page
   * in the entire result set. Returns null if the page is empty.
   *
   * @returns Last item index or null if empty
   *
   * @example
   * ```typescript
   * // On page 2 with 15 items per page
   * const lastItem = paginator.lastItem(); // 30
   * ```
   */
  lastItem(): number | null {
    const firstItem = this.firstItem();
    return firstItem !== null ? firstItem + this.count() - 1 : null;
  }

  /**
   * Get paginator options
   *
   * @returns Paginator configuration options
   *
   * @example
   * ```typescript
   * const options = paginator.getOptions();
   * console.log(options.path); // '/api/users'
   * ```
   */
  getOptions(): PaginatorOptions {
    return this.options;
  }

  /**
   * Check if pagination exists
   *
   * Returns true if there are multiple pages (not on first page or more pages exist).
   *
   * @returns True if pagination exists
   *
   * @example
   * ```typescript
   * if (paginator.hasPages()) {
   *   // Show pagination controls
   * }
   * ```
   */
  hasPages(): boolean {
    return this.currentPageNum !== 1 || this.hasMorePages();
  }

  /**
   * Check if there are more pages after current
   *
   * @returns True if more pages exist
   *
   * @example
   * ```typescript
   * if (paginator.hasMorePages()) {
   *   // Show "Next" button
   * }
   * ```
   */
  hasMorePages(): boolean {
    return this.hasMore;
  }

  /**
   * Get all items on current page
   *
   * Returns the complete array of items for the current page.
   *
   * @returns Array of items on current page
   *
   * @example
   * ```typescript
   * const items = paginator.getItems();
   * ```
   */
  getItems(): T[] {
    return this.items;
  }

  /**
   * Get URL for next page
   *
   * Generates a complete URL for navigating to the next page.
   *
   * @returns Complete URL string for next page, or null if on last page
   *
   * @example
   * ```typescript
   * const nextUrl = paginator.nextPageUrl();
   * // '/api/users?page=3&filter=active'
   * ```
   */
  nextPageUrl(): string | null {
    return this.hasMorePages() ? this.url(this.currentPageNum + 1) : null;
  }

  /**
   * Check if on first page
   *
   * @returns True if on the first page
   *
   * @example
   * ```typescript
   * if (paginator.onFirstPage()) {
   *   // Hide "Previous" button
   * }
   * ```
   */
  onFirstPage(): boolean {
    return this.currentPageNum <= 1;
  }

  /**
   * Get items per page count
   *
   * @returns Number of items per page
   *
   * @example
   * ```typescript
   * const perPage = paginator.perPage(); // 15
   * ```
   */
  perPage(): number {
    return this.perPageItems;
  }

  /**
   * Get URL for previous page
   *
   * Generates a complete URL for navigating to the previous page.
   *
   * @returns Complete URL string for previous page, or null if on first page
   *
   * @example
   * ```typescript
   * const prevUrl = paginator.previousPageUrl();
   * // '/api/users?page=1&filter=active'
   * ```
   */
  previousPageUrl(): string | null {
    return this.currentPageNum > 1 ? this.url(this.currentPageNum - 1) : null;
  }

  /**
   * Generate URL for a specific page number
   *
   * Creates a complete URL string for the given page number,
   * including all configured query parameters and fragments.
   *
   * @param page - Page number to generate URL for
   * @returns Complete URL string or null if page invalid
   *
   * @example
   * ```typescript
   * const url = paginator.url(3);
   * // '/api/users?page=3&filter=active'
   * ```
   */
  url(page: number): string | null {
    return Pagination.pageUrl(page, this.options);
  }

  /**
   * Get page parameter name
   *
   * Returns the query parameter name used for page numbers in URLs.
   *
   * @returns Page parameter name (default: 'page')
   *
   * @example
   * ```typescript
   * const pageName = paginator.getPageName(); // 'page'
   * ```
   */
  getPageName(): string {
    return this.options.pageName || 'page';
  }

  /**
   * Set custom page parameter name
   *
   * Changes the query parameter name used for page numbers in URLs.
   *
   * @param name - New page parameter name
   * @returns This paginator instance for method chaining
   *
   * @example
   * ```typescript
   * paginator.setPageName('p');
   * // URLs will now use: /api/users?p=2
   * ```
   */
  setPageName(name: string): this {
    this.options.pageName = name;
    return this;
  }

  /**
   * Set custom base path for pagination URLs
   *
   * Overrides the base path used when generating pagination URLs.
   *
   * @param path - New base path
   * @returns This paginator instance for method chaining
   *
   * @example
   * ```typescript
   * paginator.withPath('/api/v2/users');
   * ```
   */
  withPath(path: string): this {
    this.options.path = path;
    return this;
  }

  /**
   * Append additional query parameters to pagination URLs
   *
   * Adds or overwrites query parameters that will be included in all pagination URLs.
   *
   * @param params - Object containing query parameters to append
   * @returns This paginator instance for method chaining
   *
   * @example
   * ```typescript
   * paginator.appends({ filter: 'active', sort: 'name' });
   * // URLs: /api/users?page=2&filter=active&sort=name
   * ```
   */
  appends(params: Record<string, any>): this {
    // Merge new params with existing query parameters
    this.options.query = { ...this.options.query, ...params };
    return this;
  }

  /**
   * Include current query string in pagination URLs
   *
   * Laravel compatibility method (no-op in this implementation).
   *
   * @returns This paginator instance for method chaining
   */
  withQueryString(): this {
    // No-op: Query string preservation is handled automatically
    return this;
  }

  /**
   * Set URL fragment (hash) for pagination URLs
   *
   * Adds a URL fragment/hash to all pagination URLs.
   *
   * @param fragment - Fragment identifier (without # prefix)
   * @returns This paginator instance for method chaining
   *
   * @example
   * ```typescript
   * paginator.fragment('results');
   * // URLs: /api/users?page=2#results
   * ```
   */
  fragment(fragment: string): this {
    this.options.fragment = fragment;
    return this;
  }

  /**
   * Transform paginated items
   *
   * Maps each item through a transformation callback to create a new
   * paginator with transformed items. Preserves all pagination state.
   *
   * @template U - The type of transformed items
   * @param callback - Transformation function applied to each item
   * @returns New SimplePaginator instance with transformed items
   *
   * @example
   * ```typescript
   * const dtoPaginator = paginator.through((user, index) => ({
   *   id: user.id,
   *   fullName: `${user.firstName} ${user.lastName}`,
   *   position: index + 1,
   * }));
   * ```
   */
  through<U>(callback: (item: T, index: number) => U): SimplePaginator<U> {
    // Transform all items using the callback
    const transformedItems = this.items.map(callback);

    // Create new paginator with transformed items
    return SimplePaginator.make(
      transformedItems,
      this.perPageItems,
      this.currentPageNum,
      this.options
    );
  }

  /**
   * Convert paginator to JSON response format
   *
   * Serializes the paginator into a standardized JSON structure suitable
   * for API responses. Includes data, metadata, and navigation links.
   *
   * @returns Simple pagination response object
   *
   * @example
   * ```typescript
   * return paginator.toJSON();
   * // {
   * //   data: [...],
   * //   meta: {
   * //     currentPage: 2,
   * //     perPage: 15,
   * //     from: 16,
   * //     to: 30,
   * //     hasMorePages: true
   * //   },
   * //   links: {
   * //     first: '/api/users?page=1',
   * //     prev: '/api/users?page=1',
   * //     next: '/api/users?page=3'
   * //   }
   * // }
   * ```
   */
  toJSON(): SimplePaginatorResponse<T> {
    // Calculate from/to indices for current page
    const { from, to } = Pagination.calculateFromTo(
      this.currentPageNum,
      this.perPageItems,
      this.count()
    );

    return {
      // Current page items
      data: this.items,

      // Pagination metadata
      meta: {
        currentPage: this.currentPageNum,
        perPage: this.perPageItems,
        from,
        to,
        hasMorePages: this.hasMorePages(),
      },

      // Navigation links
      links: {
        first: this.url(1),
        prev: this.previousPageUrl(),
        next: this.nextPageUrl(),
      },
    };
  }
}
