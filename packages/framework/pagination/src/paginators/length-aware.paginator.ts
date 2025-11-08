import type { Request } from '@nesvel/nestjs-http';

import type {
  PaginationMeta,
  PaginationLinks,
  PaginatorOptions,
  LengthAwarePaginatorResponse,
} from '../interfaces';
import { Pagination } from '../pagination';

/**
 * Length-Aware Paginator Class
 *
 * Provides complete offset-based pagination with total count functionality.
 * This is the most feature-rich paginator, offering complete information about
 * the dataset including total pages, item counts, and comprehensive navigation.
 *
 * Key Features:
 * - Total item count and last page calculation
 * - Complete pagination metadata (from/to indices)
 * - Full navigation links (first, previous, next, last)
 * - Page range generation for UI pagination controls
 * - Compatible with Laravel's LengthAwarePaginator
 *
 * Trade-offs:
 * - Requires additional COUNT query (performance impact on large tables)
 * - Provides stable page numbers but can show duplicate/missing items if data changes
 * - Better for traditional pagination UI with numbered pages
 *
 * @template T - The type of items being paginated
 *
 * @example
 * ```typescript
 * // Basic usage
 * const total = await repository.count();
 * const items = await repository.findMany({ limit: 15, offset: 0 });
 * const paginator = LengthAwarePaginator.make(items, total, 15, 1);
 *
 * // From Express request
 * const paginator = LengthAwarePaginator.fromRequest(items, total, 15, req);
 *
 * // Get complete pagination response
 * return paginator.toJSON();
 * ```
 *
 * @see https://laravel.com/docs/pagination#paginating-eloquent-results
 */
export class LengthAwarePaginator<T> {
  /**
   * Items for the current page
   *
   * Contains the actual data items for the current page.
   * This should be exactly the number of items for this page
   * (unlike cursor pagination which needs +1 for hasMore detection).
   *
   * @protected
   */
  protected items: T[];

  /**
   * Total number of items across all pages
   *
   * The complete count of items in the dataset, used for calculating
   * last page number and generating accurate pagination metadata.
   *
   * @protected
   */
  protected totalItems: number;

  /**
   * Number of items per page
   *
   * The maximum number of items to display on each page.
   * Used for calculating offsets and page numbers.
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
   * Constructor
   *
   * Creates a new LengthAwarePaginator instance with complete pagination metadata.
   * Unlike SimplePaginator, this requires an exact total count of all items.
   *
   * @param items - Items for current page (exact count, not +1)
   * @param total - Total number of items across all pages
   * @param perPage - Number of items per page
   * @param currentPage - Current page number (1-indexed)
   * @param options - Paginator options for URL generation
   *
   * @example
   * ```typescript
   * // Requires separate COUNT query
   * const total = await repository.count();
   * const items = await repository.find({ limit: 15, offset: 0 });
   * const paginator = new LengthAwarePaginator(items, total, 15, 1, {
   *   path: '/api/users',
   *   query: { filter: 'active' }
   * });
   * ```
   */
  constructor(
    items: T[],
    total: number,
    perPage: number,
    currentPage: number,
    options: PaginatorOptions = {}
  ) {
    // Store the current page items
    this.items = items;

    // Store total item count for calculating last page
    this.totalItems = total;

    // Set the number of items per page
    this.perPageItems = perPage;

    // Store the current page number
    this.currentPageNum = currentPage;

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
   * Static factory method for creating LengthAwarePaginator instances without
   * using the `new` keyword. Requires total count for full pagination features.
   *
   * @param items - Items for current page (exact count, not +1)
   * @param total - Total number of items across all pages
   * @param perPage - Items per page
   * @param currentPage - Current page number (default: 1)
   * @param options - Paginator options
   * @returns New LengthAwarePaginator instance
   *
   * @example
   * ```typescript
   * const total = await repository.count();
   * const items = await repository.find({ limit: 15 });
   * const paginator = LengthAwarePaginator.make(items, total, 15, 1);
   * ```
   */
  static make<T>(
    items: T[],
    total: number,
    perPage: number,
    currentPage: number = 1,
    options: PaginatorOptions = {}
  ): LengthAwarePaginator<T> {
    return new LengthAwarePaginator(items, total, perPage, currentPage, options);
  }

  /**
   * Create paginator from request
   *
   * Factory method that automatically extracts page number and query parameters
   * from a request object. Simplifies pagination setup in controllers.
   *
   * @param items - Items for current page (exact count, not +1)
   * @param total - Total number of items across all pages
   * @param perPage - Number of items per page
   * @param request - Enhanced request object
   * @param options - Optional paginator configuration (overrides request values)
   * @returns New LengthAwarePaginator instance
   *
   * @example
   * ```typescript
   * @Get('users')
   * async getUsers(@Req() request: Request) {
   *   const total = await this.userRepo.count();
   *   const items = await this.userRepo.find({ limit: 15, offset: 0 });
   *   const paginator = LengthAwarePaginator.fromRequest(items, total, 15, request);
   *   return paginator.toJSON();
   * }
   * ```
   */
  static fromRequest<T>(
    items: T[],
    total: number,
    perPage: number,
    request: Request,
    options: Partial<PaginatorOptions> = {}
  ): LengthAwarePaginator<T> {
    // Determine page parameter name
    const pageName = options.pageName || 'page';

    // Extract current page from request
    const currentPage = Pagination.resolveCurrentPage(request, pageName);

    // Get current path from request
    const path = options.path || Pagination.resolveCurrentPath(request);

    // Extract all query parameters except page
    const query = options.query || Pagination.getQueryParameters(request, [pageName]);

    // Create paginator with extracted values
    return LengthAwarePaginator.make(items, total, perPage, currentPage, {
      ...options,
      path,
      pageName,
      query,
    });
  }

  /**
   * Get count of items on current page
   *
   * Returns the number of items actually present on the current page.
   * This may be less than perPage on the last page.
   *
   * @returns Number of items on the current page
   *
   * @example
   * ```typescript
   * const count = paginator.count(); // 15 (or less on last page)
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
   * console.log(`Showing items ${firstItem} to ${paginator.lastItem()}`);
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
   * Generate URL range for multiple pages
   *
   * Creates a map of page numbers to their corresponding URLs.
   * Useful for building custom pagination UI components.
   *
   * @param start - Starting page number
   * @param end - Ending page number
   * @returns Object mapping page numbers to URLs
   *
   * @example
   * ```typescript
   * // Generate URLs for pages 1-5
   * const urls = paginator.getUrlRange(1, 5);
   * // {
   * //   1: '/api/users?page=1',
   * //   2: '/api/users?page=2',
   * //   3: '/api/users?page=3',
   * //   4: '/api/users?page=4',
   * //   5: '/api/users?page=5'
   * // }
   *
   * // Use in template
   * Object.entries(urls).forEach(([page, url]) => {
   *   console.log(`Page ${page}: ${url}`);
   * });
   * ```
   */
  getUrlRange(start: number, end: number): Record<number, string | null> {
    const urls: Record<number, string | null> = {};

    // Generate URL for each page in the range
    for (let page = start; page <= end; page++) {
      urls[page] = this.url(page);
    }

    return urls;
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
   * Compares current page with calculated last page number.
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
    return this.currentPageNum < this.lastPage();
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
   * items.forEach(item => console.log(item));
   * ```
   */
  getItems(): T[] {
    return this.items;
  }

  /**
   * Get last page number
   *
   * Calculates the total number of pages based on total items and perPage.
   * This is a key feature of LengthAwarePaginator not available in SimplePaginator.
   *
   * @returns Last page number
   *
   * @example
   * ```typescript
   * const lastPage = paginator.lastPage(); // 10
   * console.log(`Page ${paginator.currentPage()} of ${lastPage}`);
   * ```
   */
  lastPage(): number {
    return Pagination.calculateLastPage(this.totalItems, this.perPageItems);
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
   * Check if on last page
   *
   * Compares current page with the calculated last page number.
   *
   * @returns True if on the last page
   *
   * @example
   * ```typescript
   * if (paginator.onLastPage()) {
   *   // Hide "Next" button
   * }
   * ```
   */
  onLastPage(): boolean {
    return this.currentPageNum >= this.lastPage();
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
   * Get total number of items
   *
   * Returns the complete count of items across all pages.
   * This is a key feature unique to LengthAwarePaginator.
   *
   * @returns Total item count
   *
   * @example
   * ```typescript
   * const total = paginator.total(); // 150
   * console.log(`Showing ${paginator.count()} of ${total} items`);
   * ```
   */
  total(): number {
    return this.totalItems;
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
   * const url = paginator.url(5);
   * // '/api/users?page=5&filter=active'
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
   * // All pagination URLs will now start with /api/v2/users
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
   * paginator with transformed items. Preserves all pagination state including total count.
   *
   * @template U - The type of transformed items
   * @param callback - Transformation function applied to each item
   * @returns New LengthAwarePaginator instance with transformed items
   *
   * @example
   * ```typescript
   * // Transform database entities to DTOs
   * const dtoPaginator = paginator.through((user, index) => ({
   *   id: user.id,
   *   fullName: `${user.firstName} ${user.lastName}`,
   *   email: user.email,
   *   position: index + 1,
   * }));
   * ```
   */
  through<U>(callback: (item: T, index: number) => U): LengthAwarePaginator<U> {
    // Transform all items using the callback
    const transformedItems = this.items.map(callback);

    // Create new paginator with transformed items, preserving total count
    return new LengthAwarePaginator(
      transformedItems,
      this.totalItems,
      this.perPageItems,
      this.currentPageNum,
      this.options
    );
  }

  /**
   * Convert paginator to JSON response format
   *
   * Serializes the paginator into a standardized JSON structure suitable
   * for API responses. Includes data, complete metadata with total count,
   * and all navigation links including page ranges.
   *
   * @returns Length-aware pagination response object
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
   * //     lastPage: 10,
   * //     total: 150
   * //   },
   * //   links: {
   * //     first: '/api/users?page=1',
   * //     last: '/api/users?page=10',
   * //     prev: '/api/users?page=1',
   * //     next: '/api/users?page=3',
   * //     pages: [
   * //       { url: '/api/users?page=1', label: '1', active: false },
   * //       { url: '/api/users?page=2', label: '2', active: true },
   * //       { url: '/api/users?page=3', label: '3', active: false },
   * //       { url: null, label: '...', active: false },
   * //       { url: '/api/users?page=10', label: '10', active: false }
   * //     ]
   * //   }
   * // }
   * ```
   */
  toJSON(): LengthAwarePaginatorResponse<T> {
    // Calculate from/to indices for current page
    const { from, to } = Pagination.calculateFromTo(
      this.currentPageNum,
      this.perPageItems,
      this.count(),
      this.totalItems
    );

    // Build pagination metadata with complete information
    const meta: PaginationMeta = {
      currentPage: this.currentPageNum,
      perPage: this.perPageItems,
      from,
      to,
      lastPage: this.lastPage(),
      total: this.totalItems,
    };

    // Build navigation links with full page range
    const links: PaginationLinks = {
      first: this.url(1),
      last: this.url(this.lastPage()),
      prev: this.previousPageUrl(),
      next: this.nextPageUrl(),
      pages: this.generatePageLinks(),
    };

    return { data: this.items, meta, links };
  }

  /**
   * Generate page links for pagination UI
   *
   * Creates an array of page link objects with URLs, labels, and active state.
   * Implements smart ellipsis (...) for large page ranges to avoid overwhelming UIs.
   *
   * @param onEachSide - Number of pages to show on each side of current (default: 3)
   * @returns Array of page link objects
   *
   * @protected
   *
   * @example
   * ```typescript
   * // For page 5 of 20 with onEachSide=3
   * // Returns: [1, ..., 2, 3, 4, 5, 6, 7, 8, ..., 20]
   * const links = this.generatePageLinks(3);
   * // [
   * //   { url: '/api/users?page=1', label: '1', active: false },
   * //   { url: null, label: '...', active: false },
   * //   { url: '/api/users?page=2', label: '2', active: false },
   * //   ...
   * //   { url: '/api/users?page=5', label: '5', active: true },
   * //   ...
   * //   { url: '/api/users?page=20', label: '20', active: false }
   * // ]
   * ```
   */
  protected generatePageLinks(onEachSide: number = 3): Array<{
    url: string | null;
    label: string;
    active: boolean;
  }> {
    // Get the last page number
    const lastPage = this.lastPage();

    // Calculate smart page range with ellipsis
    const pageRange = Pagination.getPageRange(this.currentPageNum, lastPage, onEachSide);

    // Map page numbers to link objects
    return pageRange.map((page) => {
      // -1 represents ellipsis
      if (page === -1) {
        return { url: null, label: '...', active: false };
      }

      // Regular page link
      return {
        url: this.url(page),
        label: String(page),
        active: page === this.currentPageNum,
      };
    });
  }
}
