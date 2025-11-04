/**
 * Searchable Configuration Interface
 *
 * Defines the configuration for searchable entities, including which
 * columns should be searchable and search behavior options.
 *
 * @example
 * ```typescript
 * const config: SearchableConfig = {
 *   searchableColumns: ['title', 'content', 'excerpt'],
 *   searchMode: 'partial',
 *   caseSensitive: false,
 *   minSearchLength: 3,
 * };
 * ```
 *
 * @author Nesvel
 * @since 1.0.0
 */
export interface SearchableConfig {
  /**
   * Columns that should be searchable
   * These columns will be used for full-text search operations
   */
  searchableColumns: string[];

  /**
   * Whether search should be case-sensitive
   * @default false
   */
  caseSensitive?: boolean;

  /**
   * Search mode: 'partial' for LIKE %term%, 'exact' for exact match, 'starts_with' for LIKE term%
   * @default 'partial'
   */
  searchMode?: 'partial' | 'exact' | 'starts_with' | 'ends_with';

  /**
   * Minimum search term length to trigger search
   * @default 1
   */
  minSearchLength?: number;
}
