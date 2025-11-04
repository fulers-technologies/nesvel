import type { OrderDirection } from '@/types/order-direction.type';

/**
 * Order By Clause Interface
 *
 * Defines the structure of an ORDER BY clause for sorting search results.
 * Multiple order by clauses can be chained to create multi-level sorting.
 *
 * **Sorting Behavior**:
 * - Primary sort is by the first order by clause
 * - Secondary sorts break ties from previous sorts
 * - Order is applied in the sequence clauses are added
 *
 * **Default Direction**: If not specified, 'asc' is used.
 *
 * @interface IOrderByClause
 *
 * @author Nesvel
 * @since 1.0.0
 *
 * @example
 * ```typescript
 * // Single sort - by price ascending
 * const priceSort: IOrderByClause = {
 *   field: 'price',
 *   direction: 'asc'
 * };
 *
 * // Single sort - by date descending (newest first)
 * const dateSort: IOrderByClause = {
 *   field: 'createdAt',
 *   direction: 'desc'
 * };
 *
 * // Multi-level sorting
 * const sorts: IOrderByClause[] = [
 *   { field: 'category', direction: 'asc' },  // First: sort by category A-Z
 *   { field: 'price', direction: 'desc' }      // Then: within each category, highest price first
 * ];
 * // Result: Electronics products sorted by price desc, then Computers sorted by price desc, etc.
 *
 * // Text field sorting
 * const nameSort: IOrderByClause = {
 *   field: 'name',
 *   direction: 'asc'
 * };
 * // Result: Apple, Banana, Cherry, ...
 *
 * // Relevance score sorting (Elasticsearch)
 * const relevanceSort: IOrderByClause = {
 *   field: '_score',
 *   direction: 'desc'
 * };
 * // Result: Most relevant results first
 * ```
 */
export interface IOrderByClause {
  /**
   * Field name to sort by
   *
   * The document field used for sorting. Can be any indexed field
   * in your search engine. Special fields like '_score' (relevance)
   * are also supported in Elasticsearch.
   *
   * @type {string}
   *
   * @example
   * 'price'      // Numeric field
   * 'name'       // Text field
   * 'createdAt'  // Date field
   * '_score'     // Relevance score (Elasticsearch)
   */
  field: string;

  /**
   * Sort direction
   *
   * The direction to sort results:
   * - 'asc': Ascending (low to high, A-Z, old to new)
   * - 'desc': Descending (high to low, Z-A, new to old)
   *
   * @type {OrderDirection}
   * @default 'asc'
   *
   * @example
   * 'asc'  // 1, 2, 3, 4, 5
   * 'desc' // 5, 4, 3, 2, 1
   */
  direction: OrderDirection;
}
