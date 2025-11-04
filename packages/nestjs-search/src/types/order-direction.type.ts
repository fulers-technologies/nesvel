/**
 * Order Direction Type
 *
 * Defines the direction for sorting search results.
 * Used with `orderBy()` method to control result ordering.
 *
 * **Directions**:
 * - `asc` - Ascending order (A-Z, 0-9, oldest to newest)
 * - `desc` - Descending order (Z-A, 9-0, newest to oldest)
 *
 * **Default**: When not specified, `asc` is used as the default direction.
 *
 * @author Nesvel
 * @since 1.0.0
 *
 * @example
 * ```typescript
 * // Ascending order (default)
 * builder.orderBy('price', 'asc');
 * // Results sorted: 10, 20, 30, 40, 50
 *
 * // Descending order
 * builder.orderBy('createdAt', 'desc');
 * // Results sorted: newest first, oldest last
 *
 * // Multiple sort criteria
 * builder
 *   .orderBy('category', 'asc')   // First sort by category A-Z
 *   .orderBy('price', 'desc');    // Then by price high to low within each category
 *
 * // Sorting text fields
 * builder.orderBy('name', 'asc');
 * // Results sorted: Apple, Banana, Cherry, ...
 *
 * // Sorting numeric fields
 * builder.orderBy('quantity', 'desc');
 * // Results sorted: 1000, 500, 100, 50, 10
 *
 * // Sorting date fields
 * builder.orderBy('publishedAt', 'desc');
 * // Results sorted: 2024-01-10, 2024-01-05, 2024-01-01, ...
 * ```
 */
export type OrderDirection = 'asc' | 'desc';
