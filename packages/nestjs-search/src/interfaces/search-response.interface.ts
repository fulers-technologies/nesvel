import type { SearchResult } from './search-result.interface';

/**
 * Search Response Interface
 *
 * Represents the complete search response with results and metadata.
 * Includes hits, total count, processing time, and optional facets.
 *
 * @template T - The type of documents in the results
 *
 * @example
 * ```typescript
 * const response: SearchResponse<Post> = {
 *   hits: [
 *     { id: 1, document: {...}, score: 0.95 },
 *     { id: 2, document: {...}, score: 0.89 },
 *   ],
 *   total: 42,
 *   processingTimeMs: 12,
 *   query: 'typescript tutorial',
 *   facets: {
 *     category: { 'programming': 25, 'tutorial': 17 },
 *   },
 * };
 * ```
 *
 * @author Nesvel
 * @since 1.0.0
 */
export interface SearchResponse<T = any> {
  /**
   * Array of search results
   */
  hits: SearchResult<T>[];

  /**
   * Total number of results found (across all pages)
   */
  total: number;

  /**
   * Time taken to execute the search (in milliseconds)
   */
  processingTimeMs?: number;

  /**
   * Search query that was executed
   */
  query?: string;

  /**
   * Facets/aggregations (if requested)
   * Keys are facet names, values are aggregation results
   */
  facets?: Record<string, any>;
}
