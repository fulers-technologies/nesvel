import type { AggregationType } from '@/types/aggregation-type.type';

/**
 * Aggregation Clause Interface
 *
 * Defines the structure of an aggregation clause for Elasticsearch queries.
 * Aggregations allow you to compute analytics and statistics from search results.
 *
 * **Primary Use**: Elasticsearch (Meilisearch has limited aggregation support)
 *
 * **Common Patterns**:
 * - Count by category/brand (terms aggregation)
 * - Calculate averages, sums, min/max (metric aggregations)
 * - Time-series analysis (date histogram)
 * - Multiple aggregations in a single query
 *
 * @interface IAggregationClause
 *
 * @author Nesvel
 * @since 1.0.0
 *
 * @example
 * ```typescript
 * // Terms aggregation - Count products by category
 * const categoryAgg: IAggregationClause = {
 *   name: 'by_category',
 *   type: 'terms',
 *   field: 'category'
 * };
 * // Result: { by_category: { buckets: [
 * //   { key: 'Electronics', doc_count: 150 },
 * //   { key: 'Computers', doc_count: 89 }
 * // ]}}
 *
 * // Sum aggregation - Total revenue
 * const revenueAgg: IAggregationClause = {
 *   name: 'total_revenue',
 *   type: 'sum',
 *   field: 'price'
 * };
 * // Result: { total_revenue: { value: 125000 } }
 *
 * // Average aggregation - Average product price
 * const avgPriceAgg: IAggregationClause = {
 *   name: 'avg_price',
 *   type: 'avg',
 *   field: 'price'
 * };
 * // Result: { avg_price: { value: 249.99 } }
 *
 * // Stats aggregation - Complete statistics
 * const priceStatsAgg: IAggregationClause = {
 *   name: 'price_stats',
 *   type: 'stats',
 *   field: 'price'
 * };
 * // Result: { price_stats: {
 * //   count: 1000,
 * //   min: 9.99,
 * //   max: 1999.99,
 * //   avg: 249.99,
 * //   sum: 249990
 * // }}
 *
 * // Date histogram - Monthly sales
 * const monthlyAgg: IAggregationClause = {
 *   name: 'sales_by_month',
 *   type: 'date_histogram',
 *   field: 'createdAt',
 *   options: {
 *     interval: 'month',
 *     format: 'yyyy-MM'
 *   }
 * };
 * // Result: { sales_by_month: { buckets: [
 * //   { key_as_string: '2024-01', doc_count: 145 },
 * //   { key_as_string: '2024-02', doc_count: 167 }
 * // ]}}
 *
 * // Terms aggregation with size option
 * const topBrandsAgg: IAggregationClause = {
 *   name: 'top_brands',
 *   type: 'terms',
 *   field: 'brand',
 *   options: {
 *     size: 10,  // Top 10 brands only
 *     order: { _count: 'desc' }
 *   }
 * };
 * ```
 */
export interface IAggregationClause {
  /**
   * Aggregation name/key
   *
   * Unique identifier for this aggregation in the results.
   * Used as the key in the response object to access aggregation results.
   *
   * **Naming Convention**: Use descriptive names like 'by_category',
   * 'total_sales', 'avg_price', etc.
   *
   * @type {string}
   *
   * @example
   * 'by_category'      // For terms aggregation
   * 'total_revenue'    // For sum aggregation
   * 'avg_price'        // For average aggregation
   * 'sales_by_month'   // For date histogram
   */
  name: string;

  /**
   * Aggregation type
   *
   * The type of aggregation to perform. Different types provide
   * different kinds of analytics:
   * - Bucket aggregations: Group documents (terms, date_histogram)
   * - Metric aggregations: Calculate values (sum, avg, min, max, stats)
   *
   * @type {AggregationType}
   *
   * @example
   * 'terms'          // Count by unique values
   * 'sum'            // Sum of field values
   * 'avg'            // Average of field values
   * 'stats'          // Complete statistics
   * 'date_histogram' // Time-based buckets
   */
  type: AggregationType;

  /**
   * Field to aggregate on
   *
   * The document field to use for the aggregation.
   * Must be an indexed field in your search engine.
   *
   * **Field Types**:
   * - Keyword fields: For terms aggregations
   * - Numeric fields: For metric aggregations (sum, avg, etc.)
   * - Date fields: For date histograms
   *
   * @type {string}
   *
   * @example
   * 'category'   // Keyword field for terms aggregation
   * 'price'      // Numeric field for metrics
   * 'createdAt'  // Date field for date histogram
   * 'brand'      // Keyword field for terms aggregation
   */
  field: string;

  /**
   * Additional options for the aggregation
   *
   * Provider-specific options to customize aggregation behavior.
   * Options vary by aggregation type and search engine.
   *
   * **Common Options**:
   * - `size`: Number of buckets to return (terms aggregation)
   * - `order`: Sort order for buckets
   * - `interval`: Time interval (date histogram)
   * - `format`: Date format for results
   * - `missing`: Value for documents missing the field
   *
   * @type {Record<string, any>}
   * @optional
   *
   * @example
   * // Terms aggregation options
   * {
   *   size: 10,
   *   order: { _count: 'desc' },
   *   missing: 'Unknown'
   * }
   *
   * // Date histogram options
   * {
   *   interval: 'month',
   *   format: 'yyyy-MM',
   *   min_doc_count: 0
   * }
   *
   * // Stats aggregation options
   * {
   *   missing: 0
   * }
   */
  options?: Record<string, any>;
}
