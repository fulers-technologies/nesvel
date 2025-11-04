/**
 * Aggregation Type Type
 *
 * Defines the types of aggregations available for Elasticsearch queries.
 * Aggregations allow you to extract analytics and statistics from your search results.
 *
 * **Note**: Aggregations are primarily supported by Elasticsearch. Meilisearch
 * has limited aggregation capabilities.
 *
 * **Aggregation Categories**:
 *
 * **Bucket Aggregations** (Group documents):
 * - `terms` - Group by unique field values (e.g., count by category)
 * - `date_histogram` - Group by date/time buckets (e.g., daily, monthly)
 *
 * **Metric Aggregations** (Calculate values):
 * - `sum` - Sum of numeric field values
 * - `avg` - Average of numeric field values
 * - `min` - Minimum value in field
 * - `max` - Maximum value in field
 * - `count` - Count of documents
 * - `stats` - Complete statistics (count, min, max, avg, sum)
 *
 * @author Nesvel
 * @since 1.0.0
 *
 * @example
 * ```typescript
 * // Terms aggregation - Count documents by category
 * builder.aggregate('categories', 'category', 'terms');
 * // Result: { categories: { buckets: [
 * //   { key: 'Electronics', doc_count: 150 },
 * //   { key: 'Computers', doc_count: 89 }
 * // ]}}
 *
 * // Sum aggregation - Total revenue
 * builder.aggregate('totalRevenue', 'price', 'sum');
 * // Result: { totalRevenue: { value: 125000 } }
 *
 * // Average aggregation - Average product price
 * builder.aggregate('avgPrice', 'price', 'avg');
 * // Result: { avgPrice: { value: 249.99 } }
 *
 * // Min/Max aggregations - Price range
 * builder
 *   .aggregate('minPrice', 'price', 'min')
 *   .aggregate('maxPrice', 'price', 'max');
 * // Result: {
 * //   minPrice: { value: 9.99 },
 * //   maxPrice: { value: 1999.99 }
 * // }
 *
 * // Stats aggregation - Complete statistics
 * builder.aggregate('priceStats', 'price', 'stats');
 * // Result: { priceStats: {
 * //   count: 1000,
 * //   min: 9.99,
 * //   max: 1999.99,
 * //   avg: 249.99,
 * //   sum: 249990
 * // }}
 *
 * // Date histogram - Documents by month
 * builder.aggregate('monthly', 'createdAt', 'date_histogram');
 * // Result: { monthly: { buckets: [
 * //   { key_as_string: '2024-01', doc_count: 145 },
 * //   { key_as_string: '2024-02', doc_count: 167 }
 * // ]}}
 *
 * // Multiple aggregations
 * builder
 *   .aggregate('brands', 'brand', 'terms')
 *   .aggregate('avgPrice', 'price', 'avg')
 *   .aggregate('totalSales', 'sales', 'sum')
 *   .get();
 * ```
 */
export type AggregationType =
  | 'terms' // Term aggregation - Bucket by unique values
  | 'sum' // Sum aggregation - Total sum of field values
  | 'avg' // Average aggregation - Mean of field values
  | 'min' // Minimum aggregation - Lowest field value
  | 'max' // Maximum aggregation - Highest field value
  | 'count' // Count aggregation - Number of documents
  | 'stats' // Statistics aggregation - Complete stats (count, min, max, avg, sum)
  | 'date_histogram'; // Date histogram - Time-based buckets
