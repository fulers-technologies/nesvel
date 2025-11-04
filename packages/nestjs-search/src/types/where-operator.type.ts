/**
 * Where Operator Type
 *
 * Defines all comparison operators supported by the search query builder.
 * These operators are translated to provider-specific query syntax
 * (Elasticsearch DSL or Meilisearch filters).
 *
 * **Operator Categories**:
 * - **Equality**: `=`, `!=`
 * - **Comparison**: `>`, `>=`, `<`, `<=`
 * - **Array**: `in`, `not in`
 * - **Range**: `between`, `not between`
 * - **String**: `like` (fuzzy/partial matching)
 * - **Existence**: `exists`, `not exists`
 *
 * @author Nesvel
 * @since 1.0.0
 *
 * @example
 * ```typescript
 * // Equality operator
 * builder.where('status', '=', 'active');
 *
 * // Comparison operators
 * builder.where('price', '>', 100);
 * builder.where('quantity', '<=', 50);
 *
 * // Array operators (use whereIn/whereNotIn methods instead)
 * builder.whereIn('category', ['Electronics', 'Computers']);
 *
 * // Range operators (use whereBetween methods instead)
 * builder.whereBetween('price', [100, 500]);
 *
 * // String matching (fuzzy search)
 * builder.where('title', 'like', 'laptop');
 *
 * // Existence checks (use whereNull/whereNotNull methods instead)
 * builder.whereNotNull('deletedAt');
 * ```
 */
export type WhereOperator =
  | '=' // Equals - Exact match
  | '!=' // Not equals - Exclude exact match
  | '>' // Greater than - Numeric/date comparison
  | '>=' // Greater than or equal - Numeric/date comparison
  | '<' // Less than - Numeric/date comparison
  | '<=' // Less than or equal - Numeric/date comparison
  | 'in' // In array - Value must be in provided list
  | 'not in' // Not in array - Value must not be in provided list
  | 'between' // Between range - Value within min/max range
  | 'not between' // Not between range - Value outside min/max range
  | 'like' // Like/contains - Fuzzy/partial string matching
  | 'exists' // Field exists - Document has this field
  | 'not exists'; // Field does not exist - Document missing this field
