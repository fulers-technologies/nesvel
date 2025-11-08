/**
 * Search Result Interface
 *
 * Represents a single search result returned from the search engine.
 * Includes the document data, relevance score, and optional highlighting.
 *
 * @template T - The type of the document
 *
 * @example
 * ```typescript
 * const result: SearchResult<Post> = {
 *   id: 1,
 *   document: {
 *     id: 1,
 *     title: 'TypeScript Guide',
 *     content: '...',
 *   },
 *   score: 0.95,
 *   highlights: {
 *     title: ['<em>TypeScript</em> Guide'],
 *   },
 * };
 * ```
 *
 * @author Nesvel
 * @since 1.0.0
 */
export interface SearchResult<T = any> {
  /**
   * The document ID
   */
  id: string | number;

  /**
   * The document data
   */
  document: T;

  /**
   * Search relevance score
   * Higher scores indicate better matches
   */
  score?: number;

  /**
   * Highlighted fields (if available)
   * Keys are field names, values are arrays of highlighted snippets
   */
  highlights?: Record<string, string[]>;
}
