import type { Request } from '@nesvel/nestjs-http';

import type { Cursor, PaginatorOptions } from './interfaces';

/**
 * Pagination Helper Class
 *
 * Provides utility methods for pagination URL generation, page resolution,
 * and cursor encoding/decoding
 */
export class Pagination {
  /**
   * Resolve current page number from request
   *
   * @param request - Enhanced request object
   * @param pageName - Query parameter name for page (default: 'page')
   * @returns Current page number (minimum 1)
   */
  static resolveCurrentPage(request?: Request, pageName: string = 'page'): number {
    if (!request) return 1;

    const page = request.query<string>(pageName);
    const pageNum = page ? parseInt(page, 10) : 1;

    return pageNum > 0 ? pageNum : 1;
  }

  /**
   * Resolve cursor from request
   *
   * @param request - Enhanced request object
   * @param cursorName - Query parameter name for cursor (default: 'cursor')
   * @returns Decoded cursor object or null
   */
  static resolveCurrentCursor(request?: Request, cursorName: string = 'cursor'): Cursor | null {
    if (!request) return null;

    const cursorValue = request.query<string>(cursorName);
    if (!cursorValue || typeof cursorValue !== 'string') return null;

    return this.decodeCursor(cursorValue);
  }

  /**
   * Resolve current path from request
   *
   * @param request - Enhanced request object
   * @returns Current URL path
   */
  static resolveCurrentPath(request?: Request): string {
    if (!request) return '';
    return request.path();
  }

  /**
   * Build URL with query parameters
   *
   * @param path - Base path
   * @param query - Query parameters
   * @param fragment - URL fragment/hash
   * @returns Complete URL string
   */
  static buildUrl(path: string, query: Record<string, any> = {}, fragment?: string): string {
    const queryString = this.buildQueryString(query);
    let url = path;

    if (queryString) {
      url += (path.includes('?') ? '&' : '?') + queryString;
    }

    if (fragment) {
      url += '#' + fragment;
    }

    return url;
  }

  /**
   * Build query string from object
   *
   * @param params - Query parameters
   * @returns URL-encoded query string
   */
  static buildQueryString(params: Record<string, any>): string {
    const entries = Object.entries(params)
      .filter(([_, value]) => value !== null && value !== undefined)
      .map(([key, value]) => {
        if (Array.isArray(value)) {
          return value
            .map((v) => `${encodeURIComponent(key)}[]=${encodeURIComponent(String(v))}`)
            .join('&');
        }
        return `${encodeURIComponent(key)}=${encodeURIComponent(String(value))}`;
      });

    return entries.join('&');
  }

  /**
   * Create pagination URL for specific page
   *
   * @param page - Page number
   * @param options - Paginator options
   * @returns Complete URL or null if page invalid
   */
  static pageUrl(page: number, options: PaginatorOptions): string | null {
    if (page < 1) return null;

    const query = {
      ...options.query,
      [options.pageName || 'page']: page,
    };

    return this.buildUrl(options.path || '', query, options.fragment);
  }

  /**
   * Create pagination URL for cursor
   *
   * @param cursor - Cursor object or null
   * @param options - Paginator options
   * @returns Complete URL or null if cursor invalid
   */
  static cursorUrl(cursor: Cursor | null, options: PaginatorOptions): string | null {
    if (!cursor) return null;

    const query = {
      ...options.query,
      [options.pageName || 'cursor']: cursor.value,
    };

    return this.buildUrl(options.path || '', query, options.fragment);
  }

  /**
   * Encode cursor from parameters
   *
   * @param parameters - Cursor parameters (e.g., { id: 123, created_at: timestamp })
   * @returns Base64-encoded cursor string
   */
  static encodeCursor(parameters: Record<string, any>): string {
    const json = JSON.stringify(parameters);
    return Buffer.from(json).toString('base64url');
  }

  /**
   * Decode cursor string
   *
   * @param encodedCursor - Base64-encoded cursor string
   * @returns Cursor object with decoded parameters
   */
  static decodeCursor(encodedCursor: string): Cursor | null {
    try {
      const json = Buffer.from(encodedCursor, 'base64url').toString('utf-8');
      const parameters = JSON.parse(json);

      return {
        value: encodedCursor,
        parameters,
      };
    } catch (error: Error | any) {
      return null;
    }
  }

  /**
   * Calculate from/to indices for current page
   *
   * @param currentPage - Current page number
   * @param perPage - Items per page
   * @param count - Number of items on current page
   * @param total - Total number of items (optional)
   * @returns Object with from and to indices
   */
  static calculateFromTo(
    currentPage: number,
    perPage: number,
    count: number,
    total?: number
  ): { from: number | null; to: number | null } {
    if (count === 0) {
      return { from: null, to: null };
    }

    const from = (currentPage - 1) * perPage + 1;
    const to = from + count - 1;

    // Ensure 'to' doesn't exceed total if provided
    const finalTo = total !== undefined ? Math.min(to, total) : to;

    return { from, to: finalTo };
  }

  /**
   * Calculate last page number
   *
   * @param total - Total number of items
   * @param perPage - Items per page
   * @returns Last page number
   */
  static calculateLastPage(total: number, perPage: number): number {
    return Math.max(Math.ceil(total / perPage), 1);
  }

  /**
   * Generate range of page numbers for pagination UI
   *
   * @param currentPage - Current page number
   * @param lastPage - Last page number
   * @param onEachSide - Number of pages to show on each side (default: 3)
   * @returns Array of page numbers
   */
  static getPageRange(currentPage: number, lastPage: number, onEachSide: number = 3): number[] {
    if (lastPage <= 1) {
      return [1];
    }

    // If total pages is small, show all pages
    if (lastPage <= onEachSide * 2 + 1) {
      return Array.from({ length: lastPage }, (_, i) => i + 1);
    }

    // Calculate range around current page
    let start = Math.max(1, currentPage - onEachSide);
    let end = Math.min(lastPage, currentPage + onEachSide);

    // Adjust if at edges
    if (currentPage <= onEachSide) {
      end = Math.min(lastPage, onEachSide * 2 + 1);
    } else if (currentPage >= lastPage - onEachSide) {
      start = Math.max(1, lastPage - onEachSide * 2);
    }

    const pages: number[] = [];

    // Add first page if not in range
    if (start > 1) {
      pages.push(1);
      if (start > 2) pages.push(-1); // -1 represents ellipsis
    }

    // Add range pages
    for (let i = start; i <= end; i++) {
      pages.push(i);
    }

    // Add last page if not in range
    if (end < lastPage) {
      if (end < lastPage - 1) pages.push(-1); // -1 represents ellipsis
      pages.push(lastPage);
    }

    return pages;
  }

  /**
   * Get URL query parameters from request
   *
   * @param request - Enhanced request object
   * @param exclude - Parameters to exclude
   * @returns Query parameters object
   */
  static getQueryParameters(request?: Request, exclude: string[] = []): Record<string, any> {
    if (!request) return {};

    const allQuery = request.query();
    if (!allQuery) return {};

    const params: Record<string, any> = {};
    for (const [key, value] of Object.entries(allQuery)) {
      if (!exclude.includes(key)) {
        params[key] = value;
      }
    }

    return params;
  }
}
