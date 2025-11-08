/**
 * Boolean Operator Type
 *
 * Defines logical operators for combining multiple where clauses in a query.
 * Used to create complex conditional logic when filtering search results.
 *
 * **Operators**:
 * - `and` - ALL conditions must be true (intersection)
 * - `or` - ANY condition can be true (union)
 *
 * **Usage**: The first where clause in a query always uses 'and'. Subsequent
 * clauses use 'and' by default, but can be changed to 'or' using `orWhere()` methods.
 *
 * @author Nesvel
 * @since 1.0.0
 *
 * @example
 * ```typescript
 * // AND logic (all conditions must match)
 * builder
 *   .where('status', 'active')        // Implicit 'and'
 *   .where('price', '>', 100)         // AND price > 100
 *   .where('inStock', true);          // AND inStock = true
 * // Result: status='active' AND price>100 AND inStock=true
 *
 * // OR logic (any condition can match)
 * builder
 *   .where('category', 'Electronics')  // First clause
 *   .orWhere('category', 'Computers'); // OR category = 'Computers'
 * // Result: category='Electronics' OR category='Computers'
 *
 * // Mixed AND/OR logic with grouping
 * builder
 *   .where('status', 'active')
 *   .where((qb) => {
 *     qb.where('category', 'Electronics')
 *       .orWhere('category', 'Computers');
 *   })
 *   .where('price', '>', 100);
 * // Result: status='active' AND (category='Electronics' OR category='Computers') AND price>100
 * ```
 */
export type BooleanOperator = 'and' | 'or';
