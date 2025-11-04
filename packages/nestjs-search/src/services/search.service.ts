import { Injectable, Inject, Logger } from '@nestjs/common';

import { SearchQueryBuilder } from '@/builders/search-query.builder';

import type {
  ISearchProvider,
  SearchDocument,
  SearchOptions,
  SearchResponse,
} from '@/interfaces';
import type { IQueryBuilder } from '@/interfaces/query-builder.interface';

/**
 * Search Provider injection token
 *
 * Used internally by SearchModule to inject the appropriate search provider
 * (ElasticsearchProvider or MeilisearchProvider) based on configuration.
 *
 * @constant
 * @type {string}
 */
export const SEARCH_PROVIDER = 'SEARCH_PROVIDER';

/**
 * Search Service
 *
 * Main service for interacting with search engines in NestJS applications.
 * Provides a unified, provider-agnostic API for search operations regardless of
 * whether you're using Elasticsearch or Meilisearch. This service acts as a
 * facade that delegates all operations to the configured search provider.
 *
 * **Key Features**:
 * - Provider-agnostic API (works with both Elasticsearch and Meilisearch)
 * - Full CRUD operations on documents
 * - Advanced search with filtering, sorting, and pagination
 * - Fluent query builder for complex queries
 * - Index management (create, delete, stats, clear)
 * - Automatic provider selection based on configuration
 * - Type-safe document operations
 *
 * **Usage Pattern**: Inject this service using `@InjectSearchService()` decorator
 * for a clean, type-safe API to work with search functionality.
 *
 * **Architecture**: This service delegates all operations to the underlying
 * ISearchProvider implementation (ElasticsearchProvider or MeilisearchProvider),
 * which is automatically selected by SearchModule based on your configuration.
 *
 * @example
 * ```typescript
 * // Basic search operations
 * @Injectable()
 * export class ProductService {
 *   constructor(
 *     @InjectSearchService()
 *     private readonly searchService: SearchService,
 *   ) {}
 *
 *   async searchProducts(query: string) {
 *     return this.searchService.search('products', query, {
 *       limit: 20,
 *       searchFields: ['name', 'description'],
 *       filters: { status: 'active' },
 *     });
 *   }
 *
 *   async indexProduct(product: Product) {
 *     await this.searchService.indexDocument('products', {
 *       id: product.id,
 *       name: product.name,
 *       description: product.description,
 *       price: product.price,
 *     });
 *   }
 * }
 * ```
 *
 * @example
 * ```typescript
 * // Using the fluent query builder
 * @Injectable()
 * export class ProductService {
 *   constructor(
 *     @InjectSearchService()
 *     private readonly searchService: SearchService,
 *   ) {}
 *
 *   async findActiveProducts() {
 *     // Create a query builder
 *     const query = this.searchService.query<Product>();
 *     
 *     // Build the query with fluent API
 *     return query
 *       .index('products')
 *       .where('status', 'active')
 *       .where('price', '>', 100)
 *       .orderBy('price', 'asc')
 *       .limit(20)
 *       .get();
 *   }
 *
 *   async searchWithPagination(searchTerm: string, page: number) {
 *     const query = this.searchService.query<Product>();
 *     
 *     return query
 *       .index('products')
 *       .search(searchTerm, ['name', 'description'])
 *       .where('status', 'active')
 *       .paginate(20, page);
 *   }
 *
 *   async complexSearch() {
 *     const query = this.searchService.query<Product>();
 *     
 *     return query
 *       .index('products')
 *       .where('status', 'active')
 *       .where((qb) => {
 *         // Nested conditions
 *         qb.where('category', 'Electronics')
 *           .orWhere('category', 'Computers');
 *       })
 *       .whereIn('brand', ['Apple', 'Dell', 'HP'])
 *       .whereBetween('price', [500, 2000])
 *       .orderBy('popularity', 'desc')
 *       .offset(40)
 *       .limit(20)
 *       .get();
 *   }
 * }
 * ```
 *
 * @example
 * ```typescript
 * // Using index() and createSearchQuery() convenience methods
 * @Injectable()
 * export class ProductService {
 *   constructor(
 *     @InjectSearchService()
 *     private readonly searchService: SearchService,
 *   ) {}
 *
 *   async quickSearch(term: string) {
 *     // index() sets the index and returns query builder
 *     return this.searchService
 *       .index<Product>('products')
 *       .where('status', 'active')
 *       .search(term)
 *       .get();
 *   }
 *
 *   async advancedSearch(term: string) {
 *     // createSearchQuery() sets index and search in one call
 *     return this.searchService
 *       .createSearchQuery<Product>('products', term, ['name', 'description'])
 *       .where('inStock', true)
 *       .orderBy('relevance', 'desc')
 *       .paginate(20, 1);
 *   }
 * }
 * ```
 *
 * @author Nesvel
 * @since 1.0.0
 */
@Injectable()
export class SearchService {
  /**
   * Logger instance for debugging and monitoring
   *
   * Logs operations and errors at the service level.
   * Useful for debugging and tracking search operations.
   *
   * @private
   * @readonly
   */
  private readonly logger = new Logger(SearchService.name);

  /**
   * Constructor
   *
   * Injects the configured search provider (Elasticsearch or Meilisearch)
   * and the query builder for fluent API queries.
   *
   * @param provider - The search provider implementation (injected automatically)
   * @param queryBuilder - The query builder service for fluent queries
   */
  constructor(
    @Inject(SEARCH_PROVIDER)
    private readonly provider: ISearchProvider,
    private readonly queryBuilder: SearchQueryBuilder,
  ) {}

  /**
   * Create a new search index
   *
   * Creates a new index in the search engine with optional configuration settings.
   * The behavior depends on the provider (Elasticsearch vs Meilisearch).
   *
   * @param indexName - The name of the index to create
   * @param settings - Optional provider-specific index settings
   *
   * @throws {Error} If index creation fails
   *
   * @example
   * ```typescript
   * // Create basic index
   * await searchService.createIndex('products');
   *
   * // Create with settings (Elasticsearch)
   * await searchService.createIndex('products', {
   *   mappings: { properties: { name: { type: 'text' } } }
   * });
   * ```
   */
  async createIndex(indexName: string, settings?: Record<string, any>): Promise<void> {
    return this.provider.createIndex(indexName, settings);
  }

  /**
   * Delete a search index
   *
   * Permanently deletes an index and all its documents.
   *
   * @param indexName - The name of the index to delete
   *
   * @throws {Error} If deletion fails
   *
   * @example
   * ```typescript
   * await searchService.deleteIndex('old_products');
   * ```
   */
  async deleteIndex(indexName: string): Promise<void> {
    return this.provider.deleteIndex(indexName);
  }

  /**
   * Check if an index exists
   *
   * Verifies whether an index exists in the search engine.
   *
   * @param indexName - The name of the index to check
   *
   * @returns True if the index exists, false otherwise
   *
   * @example
   * ```typescript
   * if (await searchService.indexExists('products')) {
   *   console.log('Products index exists');
   * }
   * ```
   */
  async indexExists(indexName: string): Promise<boolean> {
    return this.provider.indexExists(indexName);
  }

  /**
   * Index a single document
   *
   * Adds or updates a document in the search index.
   * For bulk operations, use `indexDocuments()` instead.
   *
   * @param indexName - The name of the index
   * @param document - The document to index (must include 'id' field)
   *
   * @throws {Error} If indexing fails
   *
   * @example
   * ```typescript
   * await searchService.indexDocument('products', {
   *   id: '123',
   *   name: 'Laptop',
   *   price: 999.99,
   * });
   * ```
   */
  async indexDocument(indexName: string, document: SearchDocument): Promise<void> {
    return this.provider.indexDocument(indexName, document);
  }

  /**
   * Index multiple documents in bulk
   *
   * Efficiently indexes multiple documents at once.
   * This is the recommended method for indexing large datasets.
   *
   * @param indexName - The name of the index
   * @param documents - Array of documents to index
   *
   * @throws {Error} If bulk indexing fails
   *
   * @example
   * ```typescript
   * const products = [
   *   { id: '1', name: 'Laptop', price: 999 },
   *   { id: '2', name: 'Mouse', price: 29 },
   * ];
   * await searchService.indexDocuments('products', products);
   * ```
   */
  async indexDocuments(indexName: string, documents: SearchDocument[]): Promise<void> {
    return this.provider.indexDocuments(indexName, documents);
  }

  /**
   * Update a document partially
   *
   * Updates specific fields of an existing document.
   * Only the provided fields are updated; others remain unchanged.
   *
   * @param indexName - The name of the index
   * @param documentId - The ID of the document to update
   * @param partialDocument - Object containing fields to update
   *
   * @throws {Error} If update fails
   *
   * @example
   * ```typescript
   * await searchService.updateDocument('products', '123', {
   *   price: 899.99,
   *   inStock: false,
   * });
   * ```
   */
  async updateDocument(
    indexName: string,
    documentId: string | number,
    partialDocument: Partial<any>,
  ): Promise<void> {
    return this.provider.updateDocument(indexName, documentId, partialDocument);
  }

  /**
   * Delete a document from the index
   *
   * Removes a document by its ID.
   *
   * @param indexName - The name of the index
   * @param documentId - The ID of the document to delete
   *
   * @throws {Error} If deletion fails
   *
   * @example
   * ```typescript
   * await searchService.deleteDocument('products', '123');
   * ```
   */
  async deleteDocument(indexName: string, documentId: string | number): Promise<void> {
    return this.provider.deleteDocument(indexName, documentId);
  }

  /**
   * Search for documents
   *
   * Performs a full-text search with support for filtering, sorting, pagination,
   * and other advanced features. The exact capabilities depend on the provider.
   *
   * @param indexName - The name of the index to search
   * @param query - The search query string
   * @param options - Optional search configuration
   * @param options.limit - Maximum results to return (default: 20)
   * @param options.offset - Results to skip for pagination (default: 0)
   * @param options.searchFields - Specific fields to search in
   * @param options.filters - Field filters as key-value pairs
   * @param options.sort - Sort criteria
   * @param options.highlightFields - Fields to highlight (Elasticsearch only)
   * @param options.facets - Facet fields for aggregation (Elasticsearch only)
   *
   * @returns SearchResponse with results, total count, and processing time
   *
   * @throws {Error} If search fails
   *
   * @example
   * ```typescript
   * const results = await searchService.search('products', 'laptop', {
   *   limit: 20,
   *   searchFields: ['name', 'description'],
   *   filters: { category: 'Electronics' },
   *   sort: [{ field: 'price', order: 'asc' }],
   * });
   *
   * console.log(`Found ${results.total} products`);
   * results.hits.forEach(hit => {
   *   console.log(hit.document.name, '- Score:', hit.score);
   * });
   * ```
   */
  async search(
    indexName: string,
    query: string,
    options?: SearchOptions,
  ): Promise<SearchResponse> {
    return this.provider.search(indexName, query, options);
  }

  /**
   * Get a single document by ID
   *
   * Retrieves a document from the index by its ID.
   * Returns null if the document doesn't exist.
   *
   * @param indexName - The name of the index
   * @param documentId - The ID of the document to retrieve
   *
   * @returns The document data or null if not found
   *
   * @throws {Error} If retrieval fails (except for not found)
   *
   * @example
   * ```typescript
   * const product = await searchService.getDocument('products', '123');
   * if (product) {
   *   console.log('Product:', product.name);
   * }
   * ```
   */
  async getDocument(indexName: string, documentId: string | number): Promise<any | null> {
    return this.provider.getDocument(indexName, documentId);
  }

  /**
   * Get index statistics
   *
   * Retrieves comprehensive statistics about an index including
   * document count, size, and other provider-specific metrics.
   *
   * @param indexName - The name of the index
   *
   * @returns Object containing index statistics
   *
   * @throws {Error} If stats retrieval fails
   *
   * @example
   * ```typescript
   * const stats = await searchService.getIndexStats('products');
   * console.log(`Documents: ${stats.documentCount}`);
   * ```
   */
  async getIndexStats(indexName: string): Promise<Record<string, any>> {
    return this.provider.getIndexStats(indexName);
  }

  /**
   * Clear all documents from an index
   *
   * Removes all documents while keeping the index structure intact.
   * Useful for reindexing or clearing test data.
   *
   * **Warning**: This operation is irreversible.
   *
   * @param indexName - The name of the index to clear
   *
   * @throws {Error} If clearing fails
   *
   * @example
   * ```typescript
   * await searchService.clearIndex('test_products');
   * ```
   */
  async clearIndex(indexName: string): Promise<void> {
    return this.provider.clearIndex(indexName);
  }

  /**
   * Create a new query builder
   *
   * Returns a fluent query builder instance for building complex search queries
   * with a chainable API. This is the recommended way to build advanced queries.
   *
   * @template T - The document type
   * @returns Query builder instance
   *
   * @example
   * ```typescript
   * const results = await searchService
   *   .query<Product>()
   *   .index('products')
   *   .where('status', 'active')
   *   .where('price', '>', 100)
   *   .orderBy('price', 'asc')
   *   .get();
   * ```
   */
  query<T = any>(): IQueryBuilder<T> {
    return this.queryBuilder.newQuery<T>();
  }

  /**
   * Create a query builder for a specific index
   *
   * Convenience method that creates a query builder and immediately sets the index.
   * Equivalent to `query<T>().index(indexName)`.
   *
   * @template T - The document type
   * @param indexName - The name of the index
   * @returns Query builder with index set
   *
   * @example
   * ```typescript
   * const activeProducts = await searchService
   *   .index<Product>('products')
   *   .where('status', 'active')
   *   .get();
   * ```
   */
  index<T = any>(indexName: string): IQueryBuilder<T> {
    return this.queryBuilder.newQuery<T>().index(indexName);
  }

  /**
   * Create a search query builder
   *
   * Convenience method for starting a full-text search query.
   * Sets the index and search query in one call.
   *
   * @template T - The document type
   * @param indexName - The name of the index
   * @param searchQuery - The search query string
   * @param fields - Optional array of fields to search in
   * @returns Query builder with search configured
   *
   * @example
   * ```typescript
   * const results = await searchService
   *   .createSearchQuery<Product>('products', 'laptop', ['name', 'description'])
   *   .where('status', 'active')
   *   .get();
   * ```
   */
  createSearchQuery<T = any>(
    indexName: string,
    searchQuery: string,
    fields?: string[],
  ): IQueryBuilder<T> {
    return this.queryBuilder.newQuery<T>().index(indexName).search(searchQuery, fields);
  }
}
