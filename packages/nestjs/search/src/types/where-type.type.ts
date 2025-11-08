/**
 * Where Type Type
 *
 * Identifies the type of where clause being used in a query.
 * Each type corresponds to a different kind of filtering operation
 * and determines how the clause is translated to provider-specific syntax.
 *
 * **Clause Types**:
 * - `basic` - Standard field-operator-value comparison
 * - `in` - Field value must be in an array of values
 * - `not_in` - Field value must not be in an array of values
 * - `between` - Field value must be within a range (min, max)
 * - `not_between` - Field value must be outside a range
 * - `null` - Field must be null/undefined
 * - `not_null` - Field must have a value (not null)
 * - `nested` - Grouped where clauses with their own boolean logic
 *
 * @author Nesvel
 * @since 1.0.0
 *
 * @example
 * ```typescript
 * // Basic where clause (type: 'basic')
 * builder.where('status', '=', 'active');
 * // → { type: 'basic', field: 'status', operator: '=', value: 'active' }
 *
 * // WHERE IN clause (type: 'in')
 * builder.whereIn('category', ['Electronics', 'Computers']);
 * // → { type: 'in', field: 'category', values: ['Electronics', 'Computers'] }
 *
 * // WHERE NOT IN clause (type: 'not_in')
 * builder.whereNotIn('status', ['archived', 'deleted']);
 * // → { type: 'not_in', field: 'status', values: ['archived', 'deleted'] }
 *
 * // WHERE BETWEEN clause (type: 'between')
 * builder.whereBetween('price', [100, 500]);
 * // → { type: 'between', field: 'price', values: [100, 500] }
 *
 * // WHERE NOT BETWEEN clause (type: 'not_between')
 * builder.whereNotBetween('quantity', [0, 10]);
 * // → { type: 'not_between', field: 'quantity', values: [0, 10] }
 *
 * // WHERE NULL clause (type: 'null')
 * builder.whereNull('deletedAt');
 * // → { type: 'null', field: 'deletedAt' }
 *
 * // WHERE NOT NULL clause (type: 'not_null')
 * builder.whereNotNull('publishedAt');
 * // → { type: 'not_null', field: 'publishedAt' }
 *
 * // Nested where clause (type: 'nested')
 * builder.where((qb) => {
 *   qb.where('category', 'Electronics')
 *     .orWhere('category', 'Computers');
 * });
 * // → { type: 'nested', nested: [clause1, clause2] }
 * ```
 */
export type WhereType =
  | 'basic' // Basic where clause: field operator value
  | 'in' // WHERE IN: field IN (value1, value2, ...)
  | 'not_in' // WHERE NOT IN: field NOT IN (value1, value2, ...)
  | 'between' // WHERE BETWEEN: field BETWEEN min AND max
  | 'not_between' // WHERE NOT BETWEEN: field NOT BETWEEN min AND max
  | 'null' // WHERE NULL: field IS NULL
  | 'not_null' // WHERE NOT NULL: field IS NOT NULL
  | 'nested'; // Nested where group: (condition1 OR condition2)
