import { Inject, Injectable } from '@nestjs/common';

import { SearchService } from '@/services/search.service';
import { MeilisearchQueryBuilder } from '@/builders/meilisearch';
import { ElasticsearchQueryBuilder } from '@/builders/elasticsearch';
import { SEARCH_OPTIONS } from '@/constants/search-options.constant';
import { SearchConnectionType } from '@/enums/search-connection-type.enum';

import type { SearchConfig } from '@/interfaces';
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
@Injectable()
export class SearchQueryBuilder {
  /**
   * Cached search service instance
   *
   * Static instance used for static method calls. This is set when
   * the module is initialized and reused across all static queries.
   *
   * @private
   * @static
   */
  private static searchServiceInstance: SearchService;

  /**
   * Cached search options
   *
   * Module configuration used to determine which provider to use.
   *
   * @private
   * @static
   */
  private static searchOptionsInstance: SearchConfig;

  /**
   * Constructor
   *
   * Injectable constructor for use in services via dependency injection.
   * The search service and options are automatically injected by NestJS.
   *
   * @param searchService - The search service instance
   * @param searchOptions - The search module configuration
   */
  constructor(
    private readonly searchService: SearchService,
    @Inject(SEARCH_OPTIONS)
    private readonly searchOptions: SearchConfig,
  ) {
    // Cache instances for static method usage
    SearchQueryBuilder.searchServiceInstance = searchService;
    SearchQueryBuilder.searchOptionsInstance = searchOptions;
  }

  /**
   * Create a new query builder with type parameter
   *
   * Type-safe method for creating a query builder for a specific document type.
   * Provides full TypeScript intellisense and type checking.
   *
   * **Usage**: Primarily used for type safety in TypeScript projects.
   *
   * @template T - The document type
   * @returns Query builder instance for the specified type
   *
   * @example
   * ```typescript
   * interface Product {
   *   id: string;
   *   name: string;
   *   price: number;
   *   category: string;
   * }
   *
   * const products = await SearchQueryBuilder
   *   .for<Product>()
   *   .index('products')
   *   .where('price', '>', 100)
   *   .get();
   *
   * // products is typed as SearchResponse<Product>
   * products.hits.forEach(hit => {
   *   console.log(hit.document.name); // TypeScript knows about 'name'
   * });
   * ```
   */
  public static for<T = any>(): IQueryBuilder<T> {
    if (!this.searchServiceInstance) {
      throw new Error(
        'SearchQueryBuilder not initialized. Make sure SearchModule is imported in your module.',
      );
    }

    return this.createQueryBuilder<T>(this.searchServiceInstance, this.searchOptionsInstance);
  }

  /**
   * Create a new query builder (instance method)
   *
   * Instance method for creating query builders when using dependency injection.
   *
   * @template T - The document type
   * @returns Query builder instance for the specified type
   *
   * @example
   * ```typescript
   * @Injectable()
   * export class ProductService {
   *   constructor(private readonly queryBuilder: SearchQueryBuilder) {}
   *
   *   async findProducts() {
   *     return this.queryBuilder
   *       .newQuery<Product>()
   *       .index('products')
   *       .get();
   *   }
   * }
   * ```
   */
  public newQuery<T = any>(): IQueryBuilder<T> {
    return SearchQueryBuilder.createQueryBuilder<T>(this.searchService, this.searchOptions);
  }

  /**
   * Create a query builder for a specific index
   *
   * Convenience method that creates a query builder and immediately sets the index.
   *
   * @template T - The document type
   * @param indexName - The name of the index to search
   * @returns Query builder instance with index already set
   *
   * @example
   * ```typescript
   * const products = await SearchQueryBuilder
   *   .index<Product>('products')
   *   .where('status', 'active')
   *   .get();
   * ```
   */
  public static index<T = any>(indexName: string): IQueryBuilder<T> {
    return this.for<T>().index(indexName);
  }

  /**
   * Create a query builder with search query
   *
   * Convenience method that creates a query builder and immediately sets the search query.
   *
   * @template T - The document type
   * @param query - The search query string
   * @param fields - Optional array of fields to search in
   * @returns Query builder instance with search already configured
   *
   * @example
   * ```typescript
   * const results = await SearchQueryBuilder
   *   .search<Product>('laptop', ['name', 'description'])
   *   .index('products')
   *   .get();
   * ```
   */
  public static search<T = any>(query: string, fields?: string[]): IQueryBuilder<T> {
    return this.for<T>().search(query, fields);
  }

  /**
   * Create the appropriate query builder based on configuration
   *
   * Internal factory method that instantiates the correct provider-specific
   * query builder (Elasticsearch or Meilisearch) based on module configuration.
   *
   * @template T - The document type
   * @param searchService - The search service instance
   * @param searchOptions - The search module configuration
   * @returns Provider-specific query builder instance
   * @private
   * @static
   */
  private static createQueryBuilder<T = any>(
    searchService: SearchService,
    searchOptions: SearchConfig,
  ): IQueryBuilder<T> {
    // Determine which provider to use based on configuration
    switch (searchOptions.connection) {
      case SearchConnectionType.ELASTICSEARCH:
        return new ElasticsearchQueryBuilder<T>(searchService);

      case SearchConnectionType.MEILISEARCH:
        return new MeilisearchQueryBuilder<T>(searchService);

      default:
        throw new Error(
          `Unsupported search connection type: ${searchOptions.connection}. ` +
            `Supported types: ELASTICSEARCH, MEILISEARCH`,
        );
    }
  }

  /**
   * Get the current search provider type
   *
   * Returns the configured search engine type (Elasticsearch or Meilisearch).
   * Useful for conditional logic based on provider capabilities.
   *
   * @returns The search connection type
   *
   * @example
   * ```typescript
   * const provider = SearchQueryBuilder.getProvider();
   *
   * if (provider === SearchConnectionType.ELASTICSEARCH) {
   *   // Use Elasticsearch-specific features like aggregations
   *   builder.aggregate('categories', 'category', 'terms');
   * }
   * ```
   */
  public static getProvider(): SearchConnectionType {
    if (!this.searchOptionsInstance) {
      throw new Error(
        'SearchQueryBuilder not initialized. Make sure SearchModule is imported in your module.',
      );
    }

    return this.searchOptionsInstance.connection;
  }

  /**
   * Check if a specific provider is being used
   *
   * Convenience method to check the active search provider.
   *
   * @param provider - The provider type to check
   * @returns True if the specified provider is active
   *
   * @example
   * ```typescript
   * if (SearchQueryBuilder.isProvider(SearchConnectionType.ELASTICSEARCH)) {
   *   // Elasticsearch-specific logic
   * }
   * ```
   */
  public static isProvider(provider: SearchConnectionType): boolean {
    return this.getProvider() === provider;
  }
}
