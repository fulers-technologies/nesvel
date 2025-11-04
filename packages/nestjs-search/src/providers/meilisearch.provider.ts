import { MeiliSearch, Index } from 'meilisearch';
import { Injectable, Logger } from '@nestjs/common';

import type {
  ISearchProvider,
  SearchDocument,
  SearchOptions,
  SearchResponse,
  SearchResult,
} from '@/interfaces';

/**
 * Meilisearch Provider
 *
 * Native implementation of ISearchProvider for Meilisearch.
 * Provides lightning-fast, typo-tolerant search with Meilisearch's instant search engine.
 * Meilisearch is optimized for fast queries and user-facing search experiences.
 *
 * **Key Features**:
 * - Ultra-fast search results (typically < 50ms)
 * - Built-in typo tolerance for better user experience
 * - Automatic relevance ranking
 * - Faceted search and filtering
 * - Simple, intuitive API
 * - Lightweight and easy to deploy
 *
 * **Performance Characteristics**:
 * - Optimized for read-heavy workloads
 * - Near-instant search response times
 * - Automatic index optimization
 * - Efficient memory usage
 *
 * **Use Cases**:
 * - E-commerce product search
 * - Documentation search
 * - User-facing search interfaces
 * - Autocomplete and suggestions
 *
 * @implements {ISearchProvider}
 *
 * @example
 * ```typescript
 * // Basic usage
 * @Injectable()
 * export class ProductSearchService {
 *   constructor(private readonly provider: MeilisearchProvider) {}
 *
 *   async searchProducts(query: string) {
 *     return this.provider.search('products', query, {
 *       limit: 20,
 *       searchFields: ['name', 'description'],
 *       filters: { inStock: true },
 *     });
 *   }
 * }
 * ```
 *
 * @author Nesvel
 * @since 1.0.0
 * @see {@link https://www.meilisearch.com/docs} Meilisearch Documentation
 */
@Injectable()
export class MeilisearchProvider implements ISearchProvider {
  /**
   * Logger instance for debugging and error tracking
   *
   * Logs all operations including indexing, searching, and errors.
   * Useful for debugging search issues and monitoring performance.
   *
   * @private
   * @readonly
   */
  private readonly logger = new Logger(MeilisearchProvider.name);

  /**
   * Constructor
   *
   * Initializes the provider with a Meilisearch client instance.
   * The client should be configured with host URL and API key before being passed.
   *
   * @param client - The Meilisearch client instance from 'meilisearch' package
   *
   * @example
   * ```typescript
   * const client = new MeiliSearch({
   *   host: 'http://localhost:7700',
   *   apiKey: 'your-master-key',
   * });
   * const provider = new MeilisearchProvider(client);
   * ```
   */
  constructor(private readonly client: MeiliSearch) {}

  /**
   * Get index instance
   *
   * Internal helper method to retrieve a Meilisearch index instance.
   * Used throughout the provider to access index-specific operations.
   *
   * @param indexName - The name of the index
   *
   * @returns Meilisearch Index instance
   *
   * @private
   */
  private getIndex(indexName: string): Index {
    return this.client.index(indexName);
  }

  /**
   * Create a Meilisearch index
   *
   * Creates a new index in Meilisearch with 'id' as the primary key.
   * Optionally applies custom settings for searchable attributes, filtering, sorting, etc.
   *
   * **Index Settings**: Common settings include:
   * - `searchableAttributes` - Fields to search in
   * - `filterableAttributes` - Fields that can be used for filtering
   * - `sortableAttributes` - Fields that can be used for sorting
   * - `rankingRules` - Custom relevance ranking rules
   * - `stopWords` - Words to ignore in search
   * - `synonyms` - Synonym mappings
   *
   * @param indexName - The name of the index to create
   * @param settings - Optional index settings (searchable attributes, filters, etc.)
   *
   * @throws {Error} If index creation fails
   *
   * @example
   * ```typescript
   * // Create basic index
   * await provider.createIndex('products');
   *
   * // Create index with custom settings
   * await provider.createIndex('products', {
   *   searchableAttributes: ['name', 'description', 'brand'],
   *   filterableAttributes: ['category', 'price', 'inStock'],
   *   sortableAttributes: ['price', 'createdAt'],
   *   rankingRules: ['words', 'typo', 'proximity', 'attribute', 'sort', 'exactness'],
   * });
   * ```
   */
  async createIndex(indexName: string, settings?: Record<string, any>): Promise<void> {
    try {
      // Create index with 'id' as primary key (required by Meilisearch)
      await this.client.createIndex(indexName, { primaryKey: 'id' });

      // Apply custom settings if provided
      if (settings) {
        const index = this.getIndex(indexName);
        await index.updateSettings(settings);
      }

      this.logger.log(`Created index: ${indexName}`);
    } catch (error) {
      this.logger.error(`Failed to create index ${indexName}:`, error);
      throw error;
    }
  }

  /**
   * Delete a Meilisearch index
   *
   * Permanently deletes an index and all its documents from Meilisearch.
   * This operation is irreversible.
   *
   * **Warning**: All documents in the index will be permanently lost.
   *
   * @param indexName - The name of the index to delete
   *
   * @throws {Error} If deletion fails or index doesn't exist
   *
   * @example
   * ```typescript
   * await provider.deleteIndex('old_products');
   * ```
   */
  async deleteIndex(indexName: string): Promise<void> {
    try {
      await this.client.deleteIndex(indexName);
      this.logger.log(`Deleted index: ${indexName}`);
    } catch (error) {
      this.logger.error(`Failed to delete index ${indexName}:`, error);
      throw error;
    }
  }

  /**
   * Check if an index exists
   *
   * Verifies whether an index exists in Meilisearch.
   * Useful before creating or accessing an index to prevent errors.
   *
   * @param indexName - The name of the index to check
   *
   * @returns True if the index exists, false otherwise
   *
   * @example
   * ```typescript
   * if (await provider.indexExists('products')) {
   *   console.log('Index already exists');
   * } else {
   *   await provider.createIndex('products');
   * }
   * ```
   */
  async indexExists(indexName: string): Promise<boolean> {
    try {
      // Attempt to get index info - will throw if index doesn't exist
      await this.getIndex(indexName).getRawInfo();
      return true;
    } catch (error: any) {
      // Return false for index_not_found errors
      if (error.code === 'index_not_found') {
        return false;
      }
      // Re-throw other errors
      throw error;
    }
  }

  /**
   * Index a single document
   *
   * Adds or updates a single document in the specified index.
   * Meilisearch automatically handles indexing asynchronously.
   *
   * **Performance Note**: For bulk operations, use `indexDocuments()` instead.
   *
   * @param indexName - The name of the index
   * @param document - The document to index (must include an 'id' field)
   *
   * @throws {Error} If indexing fails
   *
   * @example
   * ```typescript
   * await provider.indexDocument('products', {
   *   id: '123',
   *   name: 'Laptop',
   *   price: 999.99,
   * });
   * ```
   */
  async indexDocument(indexName: string, document: SearchDocument): Promise<void> {
    try {
      const index = this.getIndex(indexName);
      // Add single document (wrapped in array for API consistency)
      await index.addDocuments([document]);
      this.logger.debug(`Indexed document ${document.id} in ${indexName}`);
    } catch (error) {
      this.logger.error(`Failed to index document in ${indexName}:`, error);
      throw error;
    }
  }

  /**
   * Index multiple documents in bulk
   *
   * Efficiently indexes multiple documents in a single request.
   * Meilisearch handles bulk indexing asynchronously and optimizes the operation.
   *
   * **Performance**: Recommended for indexing large datasets.
   *
   * @param indexName - The name of the index
   * @param documents - Array of documents to index (each must have an 'id' field)
   *
   * @throws {Error} If bulk indexing fails
   *
   * @example
   * ```typescript
   * const products = [
   *   { id: '1', name: 'Laptop', price: 999 },
   *   { id: '2', name: 'Mouse', price: 29 },
   * ];
   * await provider.indexDocuments('products', products);
   * ```
   */
  async indexDocuments(indexName: string, documents: SearchDocument[]): Promise<void> {
    try {
      // Skip if no documents to index
      if (documents.length === 0) return;

      const index = this.getIndex(indexName);
      // Bulk add documents
      await index.addDocuments(documents);
      this.logger.log(`Bulk indexed ${documents.length} documents in ${indexName}`);
    } catch (error) {
      this.logger.error(`Failed to bulk index documents in ${indexName}:`, error);
      throw error;
    }
  }

  /**
   * Update a document
   *
   * Partially updates an existing document by merging the provided fields.
   * Creates the document if it doesn't exist (upsert behavior).
   *
   * @param indexName - The name of the index
   * @param documentId - The ID of the document to update
   * @param partialDocument - Object containing fields to update
   *
   * @throws {Error} If update fails
   *
   * @example
   * ```typescript
   * await provider.updateDocument('products', '123', {
   *   price: 899.99,
   * });
   * ```
   */
  async updateDocument(
    indexName: string,
    documentId: string | number,
    partialDocument: Partial<any>,
  ): Promise<void> {
    try {
      const index = this.getIndex(indexName);
      // Update document (upsert behavior - creates if doesn't exist)
      await index.updateDocuments([{ id: documentId, ...partialDocument }]);
      this.logger.debug(`Updated document ${documentId} in ${indexName}`);
    } catch (error) {
      this.logger.error(`Failed to update document ${documentId} in ${indexName}:`, error);
      throw error;
    }
  }

  /**
   * Delete a document
   *
   * Removes a document from the index by its ID.
   *
   * @param indexName - The name of the index
   * @param documentId - The ID of the document to delete
   *
   * @throws {Error} If deletion fails
   *
   * @example
   * ```typescript
   * await provider.deleteDocument('products', '123');
   * ```
   */
  async deleteDocument(indexName: string, documentId: string | number): Promise<void> {
    try {
      const index = this.getIndex(indexName);
      await index.deleteDocument(documentId);
      this.logger.debug(`Deleted document ${documentId} from ${indexName}`);
    } catch (error) {
      this.logger.error(`Failed to delete document ${documentId} from ${indexName}:`, error);
      throw error;
    }
  }

  /**
   * Search for documents
   *
   * Performs a full-text search across documents in the specified index.
   * Meilisearch provides fast, typo-tolerant search with automatic relevance ranking.
   *
   * **Query Behavior**:
   * - Built-in typo tolerance (automatically corrects typos)
   * - Prefix matching for instant search
   * - Automatic relevance ranking
   * - Fast results (typically < 50ms)
   *
   * **Performance**: Optimized for user-facing search interfaces.
   *
   * @param indexName - The name of the index to search
   * @param query - The search query string
   * @param options - Optional search configuration
   * @param options.limit - Maximum number of results (default: 20)
   * @param options.offset - Number of results to skip for pagination (default: 0)
   * @param options.searchFields - Specific fields to search in
   * @param options.filters - Field filters as key-value pairs
   * @param options.sort - Array of sort criteria (field and order)
   *
   * @returns SearchResponse with hits, total count, and processing time
   *
   * @throws {Error} If search fails
   *
   * @example
   * ```typescript
   * const results = await provider.search('products', 'lapto', {
   *   limit: 10,
   *   searchFields: ['name', 'description'],
   *   filters: { category: 'Electronics' },
   *   sort: [{ field: 'price', order: 'asc' }],
   * });
   * // Note: 'lapto' will automatically match 'laptop' due to typo tolerance
   * ```
   */
  async search(indexName: string, query: string, options?: SearchOptions): Promise<SearchResponse> {
    try {
      // Extract options with defaults
      const { limit = 20, offset = 0, searchFields, filters, sort } = options || {};

      const index = this.getIndex(indexName);
      
      // Build search options
      const searchOptions: any = {
        limit, // Maximum results to return
        offset, // Pagination offset
      };

      // Specify fields to search in (if provided)
      if (searchFields) {
        searchOptions.attributesToSearchOn = searchFields;
      }

      // Apply filters (exact match filtering)
      if (filters) {
        const filterStrings = Object.entries(filters).map(([key, value]) => `${key} = "${value}"`);
        searchOptions.filter = filterStrings;
      }

      // Apply sorting
      if (sort) {
        searchOptions.sort = sort.map((s) => `${s.field}:${s.order}`);
      }

      // Execute search query
      const result = await index.search(query, searchOptions);

      // Transform results to standardized format
      const hits: SearchResult[] = result.hits.map((hit: any) => ({
        id: hit.id, // Document ID
        document: hit, // Full document data
        score: hit._rankingScore, // Relevance score
      }));

      return {
        hits, // Array of search results
        total: result.estimatedTotalHits || result.hits.length, // Total matching documents (estimated)
        processingTimeMs: result.processingTimeMs, // Query execution time
        query, // Original query string
      };
    } catch (error) {
      this.logger.error(`Failed to search in ${indexName}:`, error);
      throw error;
    }
  }

  /**
   * Get a document by ID
   *
   * Retrieves a single document from the index by its ID.
   * Returns null if the document doesn't exist.
   *
   * @param indexName - The name of the index
   * @param documentId - The ID of the document to retrieve
   *
   * @returns The document data or null if not found
   *
   * @throws {Error} If retrieval fails (except for document_not_found)
   *
   * @example
   * ```typescript
   * const product = await provider.getDocument('products', '123');
   * if (product) {
   *   console.log('Product:', product.name);
   * }
   * ```
   */
  async getDocument(indexName: string, documentId: string | number): Promise<any | null> {
    try {
      const index = this.getIndex(indexName);
      return await index.getDocument(documentId);
    } catch (error: any) {
      // Return null for document not found errors
      if (error.code === 'document_not_found') {
        return null;
      }
      // Re-throw other errors
      this.logger.error(`Failed to get document ${documentId} from ${indexName}:`, error);
      throw error;
    }
  }

  /**
   * Get index statistics
   *
   * Retrieves comprehensive statistics about an index including document count
   * and other Meilisearch-specific metrics.
   *
   * @param indexName - The name of the index
   *
   * @returns Object containing index statistics
   *
   * @throws {Error} If stats retrieval fails
   *
   * @example
   * ```typescript
   * const stats = await provider.getIndexStats('products');
   * console.log(`Index has ${stats.documentCount} documents`);
   * ```
   */
  async getIndexStats(indexName: string): Promise<Record<string, any>> {
    try {
      const index = this.getIndex(indexName);
      const stats = await index.getStats();
      return {
        documentCount: stats.numberOfDocuments, // Total documents in index
        ...stats, // Include all Meilisearch stats
      };
    } catch (error) {
      this.logger.error(`Failed to get stats for index ${indexName}:`, error);
      throw error;
    }
  }

  /**
   * Clear all documents from an index
   *
   * Removes all documents from the index while keeping the index itself
   * and its settings intact.
   *
   * **Warning**: This operation is irreversible. All documents will be deleted.
   *
   * @param indexName - The name of the index to clear
   *
   * @throws {Error} If clearing fails
   *
   * @example
   * ```typescript
   * // Clear test data
   * await provider.clearIndex('test_products');
   * ```
   */
  async clearIndex(indexName: string): Promise<void> {
    try {
      const index = this.getIndex(indexName);
      // Delete all documents from the index
      await index.deleteAllDocuments();
      this.logger.log(`Cleared all documents from index: ${indexName}`);
    } catch (error) {
      this.logger.error(`Failed to clear index ${indexName}:`, error);
      throw error;
    }
  }
}
