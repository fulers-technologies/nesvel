import { MeilisearchQueryBuilder } from '@/builders/meilisearch';
import { ElasticsearchQueryBuilder } from '@/builders/elasticsearch';
import { SearchConnectionType } from '@/enums/search-connection-type.enum';

import type { IQueryBuilder } from '@/interfaces/query-builder.interface';

/**
 * Search Query Builder Factory
 *
 * Main entry point for building search queries using the fluent API.
 * Automatically selects the appropriate provider-specific query builder
 * (Elasticsearch or Meilisearch) based on module configuration.
 *
 * **Usage Pattern**: This class provides static methods for creating
 * query builders. It's designed to be used directly without instantiation
 * for simple queries, or can be injected as a service for more complex scenarios.
 *
 * **Provider Selection**: The builder automatically detects which search
 * engine is configured and returns the appropriate query builder implementation.
 *
 * @author Nesvel
 * @since 1.0.0
 *
 * @example
 * ```typescript
 * // Static usage (simple queries)
 * const products = await SearchQueryBuilder
 *   .for(Product)
 *   .index('products')
 *   .where('status', 'active')
 *   .where('price', '>', 100)
 *   .orderBy('price', 'asc')
 *   .get();
 *
 * // Injectable usage (in services)
 * @Injectable()
 * export class ProductService {
 *   constructor(private readonly queryBuilder: SearchQueryBuilder) {}
 *
 *   async searchProducts(criteria: SearchCriteria) {
 *     return this.queryBuilder
 *       .newQuery<Product>()
 *       .index('products')
 *       .where('category', criteria.category)
 *       .get();
 *   }
 * }
 * ```
 *
 * @example
 * ```typescript
 * // Complex nested queries
 * const results = await SearchQueryBuilder
 *   .for(Product)
 *   .index('products')
 *   .where('status', 'active')
 *   .where((qb) => {
 *     qb.where('category', 'Electronics')
 *       .orWhere('category', 'Computers');
 *   })
 *   .whereIn('brand', ['Apple', 'Dell', 'HP'])
 *   .whereBetween('price', [500, 2000])
 *   .orderBy('relevance')
 *   .paginate(20, 1);
 * ```
 *
 * @example
 * ```typescript
 * // Aggregations (Elasticsearch only)
 * const stats = await SearchQueryBuilder
 *   .for(Product)
 *   .index('products')
 *   .aggregate('categories', 'category', 'terms')
 *   .aggregate('avgPrice', 'price', 'avg')
 *   .aggregate('priceRange', 'price', 'stats')
 *   .get();
 *
 * console.log(stats.facets); // Aggregation results
 * ```
 */
/**
 * Pure factory class for creating query builders
 * No dependencies, no execution logic
 */
export class SearchQueryBuilder {

  /**
   * Create Elasticsearch query builder
   *
   * @template T - The document type
   * @returns Elasticsearch query builder instance
   */
  public static elasticsearch<T = any>(): IQueryBuilder<T> {
    return new ElasticsearchQueryBuilder<T>();
  }

  /**
   * Create Meilisearch query builder
   *
   * @template T - The document type
   * @returns Meilisearch query builder instance
   */
  public static meilisearch<T = any>(): IQueryBuilder<T> {
    return new MeilisearchQueryBuilder<T>();
  }

  /**
   * Create query builder for a specific connection type
   *
   * @template T - The document type
   * @param connectionType - The search engine type
   * @returns Query builder instance
   */
  public static for<T = any>(connectionType: SearchConnectionType): IQueryBuilder<T> {
    switch (connectionType) {
      case SearchConnectionType.ELASTICSEARCH:
        return new ElasticsearchQueryBuilder<T>();

      case SearchConnectionType.MEILISEARCH:
        return new MeilisearchQueryBuilder<T>();

      default:
        throw new Error(
          `Unsupported search connection type: ${connectionType}. ` +
            `Supported types: ELASTICSEARCH, MEILISEARCH`,
        );
    }
  }
}
