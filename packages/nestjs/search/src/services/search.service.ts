import { Injectable, Inject, Logger } from '@nestjs/common';

import { SEARCH_PROVIDER } from '@/constants';
import { IndexNamingService } from './index-naming.service';
import type { ISearchProvider, SearchDocument, SearchOptions, SearchResponse } from '@/interfaces';

/**
 * Search Service
 *
 * Main service for executing search operations with Elasticsearch or Meilisearch.
 * This service delegates all operations to the configured search provider.
 *
 * **New Query Pattern** (v2.0):
 * Query builders are now stateless and only build query objects.
 * Use SearchQueryBuilder to create queries, then pass them to this service for execution.
 *
 * **Key Features**:
 * - Provider-agnostic API (works with both Elasticsearch and Meilisearch)
 * - Full CRUD operations on documents
 * - Executes queries built by SearchQueryBuilder
 * - Index management (create, delete, stats, clear)
 * - Type-safe document operations
 *
 * @example
 * ```typescript
 * // New pattern: Build query, then execute
 * @Injectable()
 * export class ProductService {
 *   constructor(
 *     @InjectSearchService()
 *     private readonly searchService: SearchService,
 *   ) {}
 *
 *   async findActiveProducts() {
 *     // 1. Build the query (stateless, no execution)
 *     const query = SearchQueryBuilder
 *       .elasticsearch<Product>()
 *       .index('products')
 *       .where('status', 'active')
 *       .where('price', '>', 100)
 *       .orderBy('price', 'asc')
 *       .limit(20)
 *       .build(); // Returns Elasticsearch DSL
 *
 *     // 2. Execute the query
 *     return this.searchService.search('products', '', query);
 *   }
 *
 *   async searchProducts(searchTerm: string) {
 *     // Build query with search
 *     const query = SearchQueryBuilder
 *       .elasticsearch<Product>()
 *       .index('products')
 *       .search(searchTerm, ['name', 'description'])
 *       .where('status', 'active')
 *       .toQuery(); // Alias for build()
 *
 *     // Execute
 *     return this.searchService.search('products', searchTerm, query);
 *   }
 * }
 * ```
 *
 * @example
 * ```typescript
 * // For debugging: inspect query before execution
 * @Injectable()
 * export class ProductService {
 *   constructor(
 *     @InjectSearchService()
 *     private readonly searchService: SearchService,
 *     private readonly logger: Logger,
 *   ) {}
 *
 *   async searchWithDebug(term: string) {
 *     const builder = SearchQueryBuilder
 *       .elasticsearch<Product>()
 *       .where('status', 'active')
 *       .where('price', '>', 100);
 *
 *     // Inspect before executing
 *     this.logger.debug('Query:', builder.toJson(true));
 *     console.log('Index:', builder.getIndex());
 *     console.log('Options:', builder.getOptions());
 *
 *     // Execute
 *     const query = builder.build();
 *     return this.searchService.search('products', term, query);
 *   }
 * }
 * ```
 *
 * @example
 * ```typescript
 * // Direct indexing operations
 * @Injectable()
 * export class ProductService {
 *   constructor(
 *     @InjectSearchService()
 *     private readonly searchService: SearchService,
 *   ) {}
 *
 *   async indexProduct(product: Product) {
 *     await this.searchService.indexDocument('products', {
 *       id: product.id,
 *       name: product.name,
 *       description: product.description,
 *       price: product.price,
 *     });
 *   }
 *
 *   async updateProduct(id: string, updates: Partial<Product>) {
 *     await this.searchService.updateDocument('products', id, updates);
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
   * and the search options for configuration access.
   *
   * @param provider - The search provider implementation
   */
  constructor(
    @Inject(SEARCH_PROVIDER)
    private readonly provider: ISearchProvider,
    private readonly namingService: IndexNamingService,
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
    // Generate physical index name (includes prefix and timestamp/version if needed)
    const physicalName = this.namingService.generatePhysicalIndexName(indexName);
    await this.provider.createIndex(physicalName, settings);

    // Create alias for timestamped/versioned strategies
    if (this.namingService.shouldUseAliases()) {
      const aliasName = this.namingService.getAliasName(indexName);
      await this.provider.createAlias(physicalName, aliasName);
    }
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
    const operationalName = this.namingService.getOperationalName(indexName);
    return this.provider.deleteIndex(operationalName);
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
    const operationalName = this.namingService.getOperationalName(indexName);
    return this.provider.indexExists(operationalName);
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
    const operationalName = this.namingService.getOperationalName(indexName);
    return this.provider.indexDocument(operationalName, document);
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
    const operationalName = this.namingService.getOperationalName(indexName);
    return this.provider.indexDocuments(operationalName, documents);
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
    const operationalName = this.namingService.getOperationalName(indexName);
    return this.provider.updateDocument(operationalName, documentId, partialDocument);
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
    const operationalName = this.namingService.getOperationalName(indexName);
    return this.provider.deleteDocument(operationalName, documentId);
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
  async search(indexName: string, query: string, options?: SearchOptions): Promise<SearchResponse> {
    const operationalName = this.namingService.getOperationalName(indexName);
    return this.provider.search(operationalName, query, options);
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
    const operationalName = this.namingService.getOperationalName(indexName);
    return this.provider.getDocument(operationalName, documentId);
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
    const operationalName = this.namingService.getOperationalName(indexName);
    return this.provider.getIndexStats(operationalName);
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
    const operationalName = this.namingService.getOperationalName(indexName);
    return this.provider.clearIndex(operationalName);
  }

  /**
   * Delete all documents from an index (alias for clearIndex)
   *
   * Removes all documents while keeping the index structure intact.
   * This is an alias for clearIndex() for API consistency.
   *
   * **Warning**: This operation is irreversible.
   *
   * @param indexName - The name of the index to clear
   *
   * @throws {Error} If clearing fails
   *
   * @example
   * ```typescript
   * await searchService.deleteAllDocuments('test_products');
   * ```
   */
  async deleteAllDocuments(indexName: string): Promise<void> {
    return this.clearIndex(indexName);
  }

  /**
   * Count documents in an index
   *
   * Returns the total number of documents in the specified index.
   *
   * @param indexName - The name of the index
   *
   * @returns Total number of documents
   *
   * @throws {Error} If count fails
   *
   * @example
   * ```typescript
   * const count = await searchService.count('products');
   * console.log(`Total products: ${count}`);
   * ```
   */
  async count(indexName: string): Promise<number> {
    const operationalName = this.namingService.getOperationalName(indexName);
    const stats = await this.getIndexStats(operationalName);
    return stats.documentCount || stats.docsCount || 0;
  }

  /**
   * List all indices
   *
   * Returns a list of all indices in the search engine.
   * The structure depends on the provider.
   *
   * @returns Array of index information objects
   *
   * @throws {Error} If listing fails
   *
   * @example
   * ```typescript
   * const indices = await searchService.listIndices();
   * indices.forEach(index => {
   *   console.log(`Index: ${index.name}, Docs: ${index.docsCount}`);
   * });
   * ```
   */
  async listIndices(): Promise<Array<Record<string, any>>> {
    return this.provider.listIndices();
  }

  /**
   * Update index settings
   *
   * Updates the configuration of an existing index.
   * The structure of settings depends on the provider (Elasticsearch vs Meilisearch).
   *
   * @param indexName - The name of the index
   * @param settings - Provider-specific settings to update
   *
   * @throws {Error} If update fails
   *
   * @example
   * ```typescript
   * // Meilisearch
   * await searchService.updateSettings('products', {
   *   searchableAttributes: ['name', 'description'],
   *   filterableAttributes: ['category', 'price'],
   * });
   *
   * // Elasticsearch
   * await searchService.updateSettings('products', {
   *   number_of_replicas: 2,
   *   refresh_interval: '5s',
   * });
   * ```
   */
  async updateSettings(indexName: string, settings: Record<string, any>): Promise<void> {
    const operationalName = this.namingService.getOperationalName(indexName);
    return this.provider.updateSettings(operationalName, settings);
  }

  /**
   * Create an alias for an index
   *
   * Creates an alias that points to the specified index.
   * This is useful for zero-downtime reindexing and managing index versions.
   * Note: Only supported by Elasticsearch. Meilisearch will log a warning.
   *
   * @param indexName - The physical index name
   * @param aliasName - The alias name to create
   *
   * @throws {Error} If alias creation fails
   *
   * @example
   * ```typescript
   * await searchService.createAlias('products_20231104_153422', 'products');
   * // Now you can use 'products' to query 'products_20231104_153422'
   * ```
   */
  async createAlias(indexName: string, aliasName: string): Promise<void> {
    return this.provider.createAlias(indexName, aliasName);
  }

  /**
   * Delete an alias
   *
   * Removes an alias from the search engine.
   * The underlying index remains intact.
   * Note: Only supported by Elasticsearch. Meilisearch will log a warning.
   *
   * @param aliasName - The alias name to delete
   *
   * @throws {Error} If alias deletion fails
   *
   * @example
   * ```typescript
   * await searchService.deleteAlias('products');
   * ```
   */
  async deleteAlias(aliasName: string): Promise<void> {
    return this.provider.deleteAlias(aliasName);
  }

  /**
   * Update an alias to point to a different index
   *
   * Atomically switches an alias from one index to another.
   * This is the recommended way to perform zero-downtime reindexing.
   * Note: Only supported by Elasticsearch. Meilisearch will log a warning.
   *
   * @param aliasName - The alias name to update
   * @param newIndexName - The new index to point to
   * @param oldIndexName - The old index to remove (optional)
   *
   * @throws {Error} If alias update fails
   *
   * @example
   * ```typescript
   * // Reindex flow:
   * // 1. Create new index with timestamp
   * await searchService.createIndex('products_20231104_160000', { ... });
   * // 2. Index data into new index
   * await searchService.indexDocuments('products_20231104_160000', documents);
   * // 3. Atomically switch alias
   * await searchService.updateAlias(
   *   'products',
   *   'products_20231104_160000',
   *   'products_20231104_153422'
   * );
   * // 4. Delete old index
   * await searchService.deleteIndex('products_20231104_153422');
   * ```
   */
  async updateAlias(aliasName: string, newIndexName: string, oldIndexName?: string): Promise<void> {
    return this.provider.updateAlias(aliasName, newIndexName, oldIndexName);
  }

  /**
   * Get all aliases for an index
   *
   * Returns a list of alias names that point to the specified index.
   * Note: Only supported by Elasticsearch. Meilisearch will return an empty array.
   *
   * @param indexName - The physical index name
   *
   * @returns Array of alias names
   *
   * @throws {Error} If retrieval fails
   *
   * @example
   * ```typescript
   * const aliases = await searchService.getAliases('products_20231104_153422');
   * console.log(`Aliases: ${aliases.join(', ')}`);
   * // Output: Aliases: products, products_latest
   * ```
   */
  async getAliases(indexName: string): Promise<string[]> {
    return this.provider.getAliases(indexName);
  }

  /**
   * Reindex documents from a data source
   *
   * Performs zero-downtime reindexing by creating a temporary index,
   * fetching data from the provided data source, indexing it in batches,
   * and then atomically switching to the new index.
   *
   * The process works as follows:
   * 1. Creates a temporary index with optional new settings
   * 2. Fetches data from the data source function/generator
   * 3. Indexes data to the temporary index in batches
   * 4. Verifies the indexing succeeded
   * 5. For Elasticsearch with aliases: switches alias atomically
   * 6. For simple naming: deletes old index and renames temp index
   * 7. Optionally deletes the old index
   *
   * @param indexName - The name of the index to reindex (or alias name for ES)
   * @param options - Reindex options
   * @param options.batchSize - Number of documents to process per batch (default: 100)
   * @param options.dataSource - Function that returns documents to index
   * @param options.newSettings - Optional new index settings for the temp index
   * @param options.deleteOldIndex - Whether to delete old index after reindex (default: true)
   *
   * @returns Reindex result with detailed statistics
   *
   * @throws {Error} If reindexing fails or data source is not provided
   *
   * @example
   * ```typescript
   * // Example 1: Reindex from database
   * const result = await searchService.reindex('products', {
   *   batchSize: 500,
   *   dataSource: async () => {
   *     const products = await this.productRepository.findAll();
   *     return products.map(p => ({
   *       id: p.id,
   *       name: p.name,
   *       description: p.description,
   *       price: p.price,
   *       category: p.category,
   *     }));
   *   },
   *   newSettings: {
   *     // Elasticsearch settings
   *     mappings: {
   *       properties: {
   *         name: { type: 'text', analyzer: 'standard' },
   *         price: { type: 'float' },
   *       },
   *     },
   *   },
   * });
   *
   * console.log(`Reindexed ${result.indexedDocuments} documents in ${result.duration}ms`);
   *
   * // Example 2: Reindex with generator (for large datasets)
   * const result = await searchService.reindex('products', {
   *   batchSize: 100,
   *   dataSource: async function* () {
   *     let offset = 0;
   *     const limit = 1000;
   *
   *     while (true) {
   *       const batch = await productRepository.findMany({ offset, limit });
   *       if (batch.length === 0) break;
   *
   *       for (const product of batch) {
   *         yield {
   *           id: product.id,
   *           name: product.name,
   *           price: product.price,
   *         };
   *       }
   *
   *       offset += limit;
   *     }
   *   },
   * });
   * ```
   */
  async reindex(
    indexName: string,
    options: {
      batchSize?: number;
      dataSource: () => Promise<SearchDocument[]> | AsyncGenerator<SearchDocument, void, unknown>;
      newSettings?: Record<string, any>;
      deleteOldIndex?: boolean;
    },
  ): Promise<{
    success: boolean;
    totalDocuments: number;
    indexedDocuments: number;
    failedDocuments: number;
    oldIndexName?: string;
    newIndexName: string;
    duration: number;
  }> {
    const operationalName = this.namingService.getOperationalName(indexName);
    return this.provider.reindex(operationalName, options);
  }
}
