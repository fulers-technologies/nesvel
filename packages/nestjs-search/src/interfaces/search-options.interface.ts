/**
 * Search Options Interface
 *
 * Configuration options for search queries.
 * Controls pagination, filtering, sorting, highlighting, and facets.
 *
 * @example
 * ```typescript
 * const options: SearchOptions = {
 *   limit: 20,
 *   offset: 0,
 *   searchFields: ['title', 'content'],
 *   filters: { status: 'published', category: 'tech' },
 *   sort: [
 *     { field: 'score', order: 'desc' },
 *     { field: 'createdAt', order: 'desc' },
 *   ],
 *   highlightFields: ['title', 'content'],
 *   facets: ['category', 'author'],
 * };
 * ```
 *
 * @author Nesvel
 * @since 1.0.0
 */
export interface SearchOptions {
  /**
   * Maximum number of results to return
   * @default 20
   */
  limit?: number;

  /**
   * Number of results to skip (for pagination)
   * @default 0
   */
  offset?: number;

  /**
   * Fields to search in
   * If not specified, searches all fields
   */
  searchFields?: string[];

  /**
   * Filters to apply to the search
   * Keys are field names, values are filter criteria
   */
  filters?: Record<string, any>;

  /**
   * Fields to sort by
   * Applied in the order specified
   */
  sort?: Array<{ field: string; order: 'asc' | 'desc' }>;

  /**
   * Fields to highlight in results
   * Matched terms will be wrapped in highlight tags
   */
  highlightFields?: string[];

  /**
   * Facets/aggregations to compute
   * Returns counts or statistics for specified fields
   */
  facets?: string[];
}
