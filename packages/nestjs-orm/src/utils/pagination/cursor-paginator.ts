import type { Request } from 'express';

import { Pagination } from './pagination';
import type { Cursor, PaginatorOptions, CursorPaginatorResponse } from '@interfaces/pagination';

/**
 * Cursor Paginator Class
 *
 * Provides cursor-based pagination for efficient navigation through large datasets.
 * Cursor pagination is more efficient than offset-based pagination for large tables
 * as it uses indexed columns to navigate without expensive OFFSET calculations.
 *
 * Key Benefits:
 * - O(1) performance regardless of page depth
 * - Consistent results even when data changes
 * - Prevents missing/duplicate items during pagination
 * - Ideal for infinite scroll or "Load More" functionality
 *
 * Similar to Laravel's CursorPaginator.
 *
 * @template T - The type of items being paginated
 *
 * @example
 * ```typescript
 * // Basic usage
 * const items = await repository.find({query});
 * const paginator = CursorPaginator.make(items, 15);
 *
 * // From Express request
 * const paginator = CursorPaginator.fromRequest(items, 15, req);
 *
 * // Get JSON response
 * return paginator.toJSON();
 * ```
 *
 * @see https://laravel.com/docs/pagination#cursor-pagination
 */
export class CursorPaginator<T> {
  /**
   * Items for the current page
   *
   * Contains the actual data items for the current page, limited to perPage count.
   * This is sliced from the original items array passed to the constructor.
   *
   * @protected
   */
  protected items: T[];

  /**
   * Number of items per page
   *
   * The maximum number of items to display on each page.
   * Used for slicing the items array and generating pagination metadata.
   *
   * @protected
   */
  protected perPageItems: number;

  /**
   * Paginator configuration options
   *
   * Contains settings for URL generation including path, query parameters,
   * fragment, and cursor parameter name.
   *
   * @protected
   */
  protected options: PaginatorOptions;

  /**
   * Current cursor position
   *
   * The cursor object representing the current position in the dataset.
   * Contains encoded cursor value, direction, and decoded parameters.
   * Null if on the first page.
   *
   * @protected
   */
  protected cursor: Cursor | null;

  /**
   * Next cursor value
   *
   * Cursor object for navigating to the next page.
   * Null if on the last page or no more items available.
   *
   * @protected
   */
  protected nextCursorValue: Cursor | null;

  /**
   * Previous cursor value
   *
   * Cursor object for navigating to the previous page.
   * Null if on the first page.
   *
   * @protected
   */
  protected prevCursorValue: Cursor | null;

  /**
   * Constructor
   *
   * Creates a new CursorPaginator instance with the given items and configuration.
   * The items array should contain perPage + 1 items to determine if more pages exist.
   *
   * @param items - Items for current page (should include perPage + 1 to check for more pages)
   * @param perPage - Number of items per page
   * @param cursor - Current cursor object (null for first page)
   * @param options - Paginator options for URL generation
   *
   * @example
   * ```typescript
   * const paginator = new CursorPaginator(
   *   items,          // Array with 16 items (15 + 1 to check hasMore)
   *   15,             // Show 15 items per page
   *   currentCursor,  // Current cursor or null
   *   { path: '/api/users', query: { filter: 'active' } }
   * );
   * ```
   */
  constructor(items: T[], perPage: number, cursor: Cursor | null, options: PaginatorOptions = {}) {
    // Set the number of items per page
    this.perPageItems = perPage;

    // Store the current cursor position
    this.cursor = cursor;

    // Slice items to only include perPage count (remove the +1 used for hasMore check)
    this.items = items.slice(0, perPage);

    // Initialize pagination options with defaults
    this.options = {
      path: options.path || '',
      pageName: options.pageName || 'cursor', // Default cursor param name
      query: options.query || {},
      fragment: options.fragment,
    };

    // Create next cursor if more items exist (items.length > perPage means more pages)
    this.nextCursorValue =
      items.length > perPage ? this.createCursor(items[perPage - 1], 'next') : null;

    // Create previous cursor based on current cursor direction
    this.prevCursorValue = this.createPreviousCursor();
  }

  /**
   * Create a new paginator instance (factory method)
   *
   * @param items - Items for current page (should include perPage + 1 items)
   * @param perPage - Items per page
   * @param cursor - Current cursor object
   * @param options - Paginator options
   * @returns New CursorPaginator instance
   */
  static make<T>(
    items: T[],
    perPage: number,
    cursor: Cursor | null = null,
    options: PaginatorOptions = {},
  ): CursorPaginator<T> {
    return new CursorPaginator(items, perPage, cursor, options);
  }

  /**
   * Create paginator from Express request
   *
   * Factory method that automatically extracts cursor and query parameters
   * from an Express request object. Simplifies pagination setup in controllers.
   *
   * @param items - Items for current page (should include perPage + 1)
   * @param perPage - Number of items per page
   * @param request - Express request object
   * @param options - Optional paginator configuration (overrides request values)
   * @returns New CursorPaginator instance
   *
   * @example
   * ```typescript
   * // In a NestJS/Express controller
   * @Get('users')
   * async getUsers(@Req() request: Request) {
   *   const items = await this.userRepo.findWithCursor(...);
   *   const paginator = CursorPaginator.fromRequest(items, 15, request);
   *   return paginator.toJSON();
   * }
   * ```
   */
  static fromRequest<T>(
    items: T[],
    perPage: number,
    request: Request,
    options: Partial<PaginatorOptions> = {},
  ): CursorPaginator<T> {
    // Determine cursor parameter name
    const cursorName = options.pageName || 'cursor';

    // Extract cursor from request query parameters
    const cursor = Pagination.resolveCurrentCursor(request, cursorName);

    // Get current path from request
    const path = options.path || Pagination.resolveCurrentPath(request);

    // Extract all query parameters except cursor
    const query = options.query || Pagination.getQueryParameters(request, [cursorName]);

    // Create paginator with extracted values
    return CursorPaginator.make(items, perPage, cursor, {
      ...options,
      path,
      pageName: cursorName,
      query,
    });
  }

  /**
   * Create cursor object from item
   *
   * Generates a cursor from the last item on the current page.
   * The cursor encodes the item's position using id and createdAt fields.
   *
   * @param item - The item to create cursor from (typically last item on page)
   * @param direction - Cursor direction ('next' or 'prev')
   * @returns Cursor object or null if item is invalid
   *
   * @protected
   *
   * @example
   * ```typescript
   * const cursor = this.createCursor(items[items.length - 1], 'next');
   * // cursor.value: 'eyJpZCI6MTAwLCJjcmVhdGVkQXQiOi4uLn0='
   * // cursor.parameters: { id: 100, createdAt: '2023-01-01T00:00:00.000Z' }
   * ```
   */
  protected createCursor(item: any, direction: 'next' | 'prev' = 'next'): Cursor | null {
    // Return null if no item provided
    if (!item) return null;

    // Extract cursor parameters from item
    const parameters: Record<string, any> = {};
    if (item.id !== undefined) parameters.id = item.id;
    if (item.createdAt !== undefined) parameters.createdAt = item.createdAt;

    // Return cursor object with encoded value
    return {
      value: Pagination.encodeCursor(parameters),
      direction,
      parameters,
    };
  }

  /**
   * Create previous cursor from current cursor
   *
   * Generates a previous cursor by reversing the direction of the current cursor.
   * Only creates a previous cursor if currently moving forward ('next' direction).
   *
   * @returns Previous cursor object or null if not applicable
   *
   * @protected
   *
   * @example
   * ```typescript
   * // If current cursor has direction 'next'
   * const prevCursor = this.createPreviousCursor();
   * // prevCursor has same value but direction 'prev'
   * ```
   */
  protected createPreviousCursor(): Cursor | null {
    // Only create previous cursor if currently moving forward
    if (!this.cursor || this.cursor.direction !== 'next') return null;

    // Return cursor with reversed direction
    return { ...this.cursor, direction: 'prev' };
  }

  /**
   * Get count of items on current page
   *
   * @returns Number of items on the current page
   *
   * @example
   * ```typescript
   * const itemCount = paginator.count(); // 15
   * ```
   */
  count(): number {
    return this.items.length;
  }

  /**
   * Get the current cursor
   *
   * @returns Current cursor object or null if on first page
   *
   * @example
   * ```typescript
   * const cursor = paginator.getCursor();
   * console.log(cursor?.parameters); // { id: 100, createdAt: '...' }
   * ```
   */
  getCursor(): Cursor | null {
    return this.cursor;
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
   * Returns true if there are multiple pages (either has previous or next pages).
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
    return this.cursor !== null || this.hasMorePages();
  }

  /**
   * Check if there are more pages after current
   *
   * @returns True if more pages exist
   *
   * @example
   * ```typescript
   * if (paginator.hasMorePages()) {
   *   // Show "Load More" button
   * }
   * ```
   */
  hasMorePages(): boolean {
    return this.nextCursorValue !== null;
  }

  /**
   * Get cursor parameter name
   *
   * Returns the query parameter name used for cursor values in URLs.
   *
   * @returns Cursor parameter name (default: 'cursor')
   *
   * @example
   * ```typescript
   * const cursorName = paginator.getCursorName(); // 'cursor'
   * // URL will be: /api/users?cursor=eyJpZCI6MTAwfQ==
   * ```
   */
  getCursorName(): string {
    return this.options.pageName || 'cursor';
  }

  /**
   * Get all items on current page
   *
   * Returns the complete array of items for the current page.
   * This is the actual data that should be displayed.
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
   * Get next page cursor
   *
   * Returns the cursor object for navigating to the next page.
   * Use this to construct next page queries manually.
   *
   * @returns Next cursor object or null if on last page
   *
   * @example
   * ```typescript
   * const nextCursor = paginator.nextCursor();
   * if (nextCursor) {
   *   // Fetch next page using: ?cursor=nextCursor.value
   *   console.log(nextCursor.value); // 'eyJpZCI6MTAwfQ=='
   *   console.log(nextCursor.parameters); // { id: 100 }
   * }
   * ```
   */
  nextCursor(): Cursor | null {
    return this.nextCursorValue;
  }

  /**
   * Get URL for next page
   *
   * Generates a complete URL for navigating to the next page,
   * including all query parameters, path, and fragment.
   *
   * @returns Complete URL string for next page, or null if on last page
   *
   * @example
   * ```typescript
   * const nextUrl = paginator.nextPageUrl();
   * // '/api/users?cursor=eyJpZCI6MTAwfQ==&filter=active#results'
   * ```
   */
  nextPageUrl(): string | null {
    return Pagination.cursorUrl(this.nextCursorValue, this.options);
  }

  /**
   * Check if on first page
   *
   * Returns true if the current page is the first page (no cursor provided).
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
    return this.cursor === null;
  }

  /**
   * Check if on last page
   *
   * Returns true if the current page is the last page (no more pages available).
   *
   * @returns True if on the last page
   *
   * @example
   * ```typescript
   * if (paginator.onLastPage()) {
   *   // Hide "Next" or "Load More" button
   * }
   * ```
   */
  onLastPage(): boolean {
    return !this.hasMorePages();
  }

  /**
   * Get items per page count
   *
   * Returns the configured number of items per page.
   *
   * @returns Number of items per page
   *
   * @example
   * ```typescript
   * const perPage = paginator.perPage(); // 15
   * console.log(`Showing ${paginator.count()} of ${perPage} items`);
   * ```
   */
  perPage(): number {
    return this.perPageItems;
  }

  /**
   * Get previous page cursor
   *
   * Returns the cursor object for navigating to the previous page.
   * Use this to construct previous page queries manually.
   *
   * @returns Previous cursor object or null if on first page
   *
   * @example
   * ```typescript
   * const prevCursor = paginator.previousCursor();
   * if (prevCursor) {
   *   console.log(prevCursor.value); // Encoded cursor string
   *   console.log(prevCursor.direction); // 'prev'
   * }
   * ```
   */
  previousCursor(): Cursor | null {
    return this.prevCursorValue;
  }

  /**
   * Get URL for previous page
   *
   * Generates a complete URL for navigating to the previous page,
   * including all query parameters, path, and fragment.
   *
   * @returns Complete URL string for previous page, or null if on first page
   *
   * @example
   * ```typescript
   * const prevUrl = paginator.previousPageUrl();
   * // '/api/users?cursor=eyJpZCI6NTB9&filter=active'
   * ```
   */
  previousPageUrl(): string | null {
    return Pagination.cursorUrl(this.prevCursorValue, this.options);
  }

  /**
   * Set custom cursor parameter name
   *
   * Changes the query parameter name used for cursor values in URLs.
   * Useful for API consistency or avoiding conflicts with other parameters.
   *
   * @param name - New cursor parameter name
   * @returns This paginator instance for method chaining
   *
   * @example
   * ```typescript
   * paginator.setCursorName('token');
   * // URLs will now use: /api/users?token=eyJpZCI6MTAwfQ==
   * ```
   */
  setCursorName(name: string): this {
    this.options.pageName = name;
    return this;
  }

  /**
   * Generate URL for a specific cursor
   *
   * Creates a complete URL string for the given cursor,
   * including all configured query parameters and fragments.
   *
   * @param cursor - Cursor object to generate URL for
   * @returns Complete URL string or null if cursor is null
   *
   * @example
   * ```typescript
   * const cursor = { value: 'eyJpZCI6MTAwfQ==', parameters: { id: 100 } };
   * const url = paginator.url(cursor);
   * // '/api/users?cursor=eyJpZCI6MTAwfQ==&filter=active'
   * ```
   */
  url(cursor: Cursor | null): string | null {
    return Pagination.cursorUrl(cursor, this.options);
  }

  /**
   * Set custom base path for pagination URLs
   *
   * Overrides the base path used when generating pagination URLs.
   * Useful when the paginator needs to generate URLs for a different route.
   *
   * @param path - New base path (e.g., '/api/v2/users')
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
   * Adds or overwrites query parameters that will be included in all
   * pagination URLs. Useful for maintaining filters, sorting, or search terms.
   *
   * @param params - Object containing query parameters to append
   * @returns This paginator instance for method chaining
   *
   * @example
   * ```typescript
   * paginator.appends({ filter: 'active', sort: 'name' });
   * // URLs: /api/users?cursor=...&filter=active&sort=name
   *
   * // Chain multiple calls
   * paginator
   *   .appends({ filter: 'active' })
   *   .appends({ sort: 'name' });
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
   * This method is provided for Laravel compatibility but doesn't perform
   * any action in this implementation, as query parameters are preserved
   * by default when using `fromRequest()` or manual `appends()`.
   *
   * @returns This paginator instance for method chaining
   *
   * @example
   * ```typescript
   * // Laravel-style chaining (no-op in this implementation)
   * paginator.withQueryString();
   * ```
   */
  withQueryString(): this {
    // No-op: Query string preservation is handled automatically
    return this;
  }

  /**
   * Set URL fragment (hash) for pagination URLs
   *
   * Adds a URL fragment/hash to all pagination URLs.
   * Useful for scrolling to specific sections when navigating pages.
   *
   * @param fragment - Fragment identifier (without # prefix)
   * @returns This paginator instance for method chaining
   *
   * @example
   * ```typescript
   * paginator.fragment('results');
   * // URLs: /api/users?cursor=...#results
   *
   * paginator.fragment('top');
   * // URLs: /api/users?cursor=...#top
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
   * paginator with transformed items. Useful for formatting data or
   * converting between types without re-querying the database.
   *
   * Preserves all cursor values and pagination state.
   *
   * @template U - The type of transformed items
   * @param callback - Transformation function applied to each item
   * @returns New CursorPaginator instance with transformed items
   *
   * @example
   * ```typescript
   * // Transform database entities to DTOs
   * const userPaginator = CursorPaginator.make(users, 15);
   * const dtoPaginator = userPaginator.through((user, index) => ({
   *   id: user.id,
   *   fullName: `${user.firstName} ${user.lastName}`,
   *   email: user.email,
   *   position: index + 1,
   * }));
   *
   * // Add computed properties
   * const enrichedPaginator = paginator.through((item, index) => ({
   *   ...item,
   *   displayIndex: index + 1,
   *   isEven: index % 2 === 0,
   * }));
   * ```
   */
  through<U>(callback: (item: T, index: number) => U): CursorPaginator<U> {
    // Transform all items using the callback
    const transformedItems = this.items.map(callback);

    // Create new paginator with transformed items
    const cursorPaginator = new CursorPaginator(
      transformedItems,
      this.perPageItems,
      this.cursor,
      this.options,
    );

    // Preserve cursor values from the original paginator
    cursorPaginator.nextCursorValue = this.nextCursorValue;
    cursorPaginator.prevCursorValue = this.prevCursorValue;

    return cursorPaginator;
  }

  /**
   * Convert paginator to JSON response format
   *
   * Serializes the paginator into a standardized JSON structure suitable
   * for API responses. Includes data, metadata, and navigation links.
   *
   * This is the standard format returned by REST APIs and matches
   * Laravel's cursor pagination response structure.
   *
   * @returns Cursor pagination response object
   *
   * @example
   * ```typescript
   * // In a controller
   * @Get('users')
   * async getUsers(@Req() request: Request) {
   *   const items = await this.userRepo.findWithCursor();
   *   const paginator = CursorPaginator.fromRequest(items, 15, request);
   *   return paginator.toJSON();
   * }
   *
   * // Response format:
   * // {
   * //   data: [...],
   * //   meta: {
   * //     perPage: 15,
   * //     nextCursor: 'eyJpZCI6MTAwfQ==',
   * //     prevCursor: null,
   * //     hasMorePages: true
   * //   },
   * //   links: {
   * //     prev: null,
   * //     next: '/api/users?cursor=eyJpZCI6MTAwfQ=='
   * //   }
   * // }
   * ```
   */
  toJSON(): CursorPaginatorResponse<T> {
    return {
      // Current page items
      data: this.items,

      // Pagination metadata
      meta: {
        perPage: this.perPageItems,
        nextCursor: this.nextCursor()?.value || null,
        prevCursor: this.previousCursor()?.value || null,
        hasMorePages: this.hasMorePages(),
      },

      // Navigation links
      links: {
        prev: this.previousPageUrl(),
        next: this.nextPageUrl(),
      },
    };
  }
}
