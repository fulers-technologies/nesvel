import { Client } from '@elastic/elasticsearch';
import { Injectable, Logger } from '@nestjs/common';

import type {
  SearchResult,
  SearchOptions,
  SearchResponse,
  SearchDocument,
  ISearchProvider,
} from '@/interfaces';

/**
 * Elasticsearch Provider
 *
 * Native implementation of ISearchProvider for Elasticsearch.
 * Provides full-text search, indexing, and management operations using the official
 * Elasticsearch client (@elastic/elasticsearch). This provider handles all low-level
 * interactions with Elasticsearch including bulk operations, complex queries, and index management.
 *
 * **Key Features**:
 * - Full-text search with fuzzy matching and query string support
 * - Multi-field search across specified document fields
 * - Bulk indexing for high-performance batch operations
 * - Advanced filtering, sorting, and pagination
 * - Text highlighting for search results
 * - Aggregations and faceted search
 * - Index management (create, delete, stats, clear)
 * - Automatic document refresh for immediate consistency
 *
 * **Performance Considerations**:
 * - Uses `refresh: 'wait_for'` for write operations to ensure consistency
 * - Bulk operations for efficient batch indexing
 * - Automatic fuzziness ('AUTO') for typo-tolerant search
 * - Query optimization through bool queries with must/filter clauses
 *
 * @implements {ISearchProvider}
 *
 * @example
 * ```typescript
 * // Basic usage in a service
 * @Injectable()
 * export class ProductSearchService {
 *   constructor(private readonly provider: ElasticsearchProvider) {}
 *
 *   async searchProducts(query: string) {
 *     return this.provider.search('products', query, {
 *       limit: 20,
 *       searchFields: ['name', 'description', 'category'],
 *       filters: { status: 'active' },
 *       sort: [{ field: 'price', order: 'asc' }],
 *     });
 *   }
 *
 *   async indexProduct(product: Product) {
 *     await this.provider.indexDocument('products', {
 *       id: product.id,
 *       name: product.name,
 *       description: product.description,
 *       price: product.price,
 *       category: product.category,
 *       status: product.status,
 *     });
 *   }
 * }
 * ```
 *
 * @example
 * ```typescript
 * // Bulk indexing for performance
 * const products = await this.productRepository.findAll();
 * const documents = products.map(p => ({
 *   id: p.id,
 *   name: p.name,
 *   description: p.description,
 * }));
 * await provider.indexDocuments('products', documents);
 * ```
 *
 * @author Nesvel
 * @since 1.0.0
 * @see {@link https://www.elastic.co/guide/en/elasticsearch/client/javascript-api/current/index.html} Elasticsearch JS Client
 */
@Injectable()
export class ElasticsearchProvider implements ISearchProvider {
  /**
   * Logger instance for debugging and error tracking
   *
   * Logs all operations including indexing, searching, and errors.
   * Useful for debugging search issues and monitoring performance.
   *
   * @private
   * @readonly
   */
  private readonly logger = new Logger(ElasticsearchProvider.name);

  /**
   * Constructor
   *
   * Initializes the provider with an Elasticsearch client instance.
   * The client should be configured with connection details, authentication,
   * and any custom options before being passed to this provider.
   *
   * @param client - The Elasticsearch client instance from @elastic/elasticsearch
   * @param logger - Optional logger instance (injected by NestJS)
   *
   * @example
   * ```typescript
   * const client = new Client({
   *   node: 'http://localhost:9200',
   *   auth: { apiKey: 'your-api-key' },
   * });
   * const provider = new ElasticsearchProvider(client);
   * ```
   */
  constructor(private readonly client: Client) {}

  /**
   * Create an Elasticsearch index
   *
   * Creates a new index in Elasticsearch with optional settings for mappings,
   * analyzers, and other index configuration. If the index already exists,
   * logs a warning and returns without error.
   *
   * **Index Settings**: You can provide custom settings including:
   * - Mappings (field types, analyzers)
   * - Number of shards and replicas
   * - Custom analyzers and tokenizers
   * - Index aliases
   *
   * @param indexName - The name of the index to create
   * @param settings - Optional index settings (mappings, analysis, etc.)
   *
   * @throws {Error} If index creation fails (network error, invalid settings, etc.)
   *
   * @example
   * ```typescript
   * // Create basic index
   * await provider.createIndex('products');
   *
   * // Create index with custom mappings
   * await provider.createIndex('products', {
   *   mappings: {
   *     properties: {
   *       name: { type: 'text', analyzer: 'standard' },
   *       price: { type: 'float' },
   *       category: { type: 'keyword' },
   *       description: { type: 'text' },
   *     },
   *   },
   *   settings: {
   *     number_of_shards: 1,
   *     number_of_replicas: 1,
   *   },
   * });
   * ```
   */
  async createIndex(indexName: string, settings?: Record<string, any>): Promise<void> {
    try {
      // Accept index name as-is (caller should handle naming strategy)
      // Check if index already exists
      const exists = await this.indexExists(indexName);
      if (exists) {
        this.logger.warn(`Index ${indexName} already exists`);
        return;
      }

      // Create the index
      await this.client.indices.create({
        index: indexName,
        body: settings,
      });

      this.logger.log(`Created index: ${indexName}`);
    } catch (error: Error | any) {
      this.logger.error(`Failed to create index ${indexName}:`, error);
      throw error;
    }
  }

  /**
   * Delete an Elasticsearch index
   *
   * Permanently deletes an index and all its documents from Elasticsearch.
   * This operation is irreversible and should be used with caution.
   *
   * **Warning**: All documents in the index will be permanently lost.
   *
   * @param indexName - The name of the index to delete
   *
   * @throws {Error} If deletion fails or index doesn't exist
   *
   * @example
   * ```typescript
   * // Delete an index
   * await provider.deleteIndex('old_products');
   * ```
   */
  async deleteIndex(indexName: string): Promise<void> {
    try {
      // Try to get indices behind the alias (if it's an alias)
      let indicesToDelete = [indexName];
      try {
        const aliasResponse = await this.client.indices.getAlias({
          name: indexName,
        });
        // If it's an alias, delete the concrete indices
        indicesToDelete = Object.keys(aliasResponse);
      } catch (error: any) {
        // Not an alias or doesn't exist, try deleting directly
      }

      // Delete all indices (either the direct index or indices behind alias)
      for (const index of indicesToDelete) {
        await this.client.indices.delete({
          index,
        });
        this.logger.log(`Deleted index: ${index}`);
      }
    } catch (error: Error | any) {
      this.logger.error(`Failed to delete index ${indexName}:`, error);
      throw error;
    }
  }

  /**
   * Check if an index exists
   *
   * Verifies whether an index exists in Elasticsearch.
   * Useful before creating or accessing an index to prevent errors.
   *
   * @param indexName - The name of the index to check
   *
   * @returns True if the index exists, false otherwise
   *
   * @example
   * ```typescript
   * // Check before creating
   * if (await provider.indexExists('products')) {
   *   console.log('Index already exists');
   * } else {
   *   await provider.createIndex('products');
   * }
   * ```
   */
  async indexExists(indexName: string): Promise<boolean> {
    try {
      const result = await this.client.indices.exists({
        index: indexName,
      });

      return result === true;
    } catch (error: any) {
      // Return false for index not found errors
      if (
        error.meta?.statusCode === 404 ||
        (error.name === 'ResponseError' && error.message?.includes('index_not_found')) ||
        error.message?.includes('no such index')
      ) {
        return false;
      }
      // Re-throw other errors (network issues, auth errors, etc.)
      this.logger.error(`Failed to check index existence ${indexName}:`, error);
      throw error;
    }
  }

  /**
   * List all indices
   *
   * Retrieves information about all indices in Elasticsearch.
   * Returns an array of index metadata including name, document count, and size.
   *
   * @returns Array of index information objects
   *
   * @throws {Error} If listing indices fails
   *
   * @example
   * ```typescript
   * const indices = await provider.listIndices();
   * indices.forEach(index => {
   *   console.log(`${index.name}: ${index.docsCount} documents`);
   * });
   * ```
   */
  async listIndices(): Promise<any[]> {
    try {
      // Get cat indices API for comprehensive index information
      const response = await this.client.cat.indices({
        format: 'json',
        bytes: 'b', // Get size in bytes for consistency
      });

      // Map to a consistent format
      const indices = response.map((indexInfo: any) => ({
        name: indexInfo.index,
        uuid: indexInfo.uuid,
        health: indexInfo.health,
        status: indexInfo.status,
        docsCount: parseInt(indexInfo['docs.count'] || '0', 10),
        docsDeleted: parseInt(indexInfo['docs.deleted'] || '0', 10),
        storeSize: parseInt(indexInfo['store.size'] || '0', 10),
        primaryStoreSize: parseInt(indexInfo['pri.store.size'] || '0', 10),
        primaryShards: parseInt(indexInfo.pri || '0', 10),
        replicaShards: parseInt(indexInfo.rep || '0', 10),
      }));

      this.logger.debug(`Listed ${indices.length} indices`);
      return indices;
    } catch (error: Error | any) {
      this.logger.error('Failed to list indices:', error);
      throw error;
    }
  }

  /**
   * Index a single document
   *
   * Adds or updates a single document in the specified index.
   * Uses `refresh: 'wait_for'` to ensure the document is immediately searchable.
   * If a document with the same ID exists, it will be replaced.
   *
   * **Performance Note**: For bulk operations, use `indexDocuments()` instead
   * as it's significantly more efficient for multiple documents.
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
   *   category: 'Electronics',
   * });
   * ```
   */
  async indexDocument(indexName: string, document: SearchDocument): Promise<void> {
    try {
      const { id, ...body } = document;

      await this.client.index({
        index: indexName,
        id: String(id),
        body,
        refresh: 'wait_for',
      });

      this.logger.debug(`Indexed document ${id} in ${indexName}`);
    } catch (error: Error | any) {
      this.logger.error(`Failed to index document in ${indexName}:`, error);
      throw error;
    }
  }

  /**
   * Index multiple documents in bulk
   *
   * Efficiently indexes multiple documents in a single request using Elasticsearch's
   * bulk API. This is the recommended way to index large numbers of documents as it
   * significantly reduces network overhead and improves throughput.
   *
   * **Performance**: Can handle thousands of documents in a single call.
   * Uses `refresh: 'wait_for'` to ensure documents are immediately searchable.
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
   *   { id: '3', name: 'Keyboard', price: 79 },
   * ];
   * await provider.indexDocuments('products', products);
   * ```
   */
  async indexDocuments(indexName: string, documents: SearchDocument[]): Promise<void> {
    try {
      if (documents.length === 0) return;

      const operations = documents.flatMap((doc) => {
        const { id, ...body } = doc;
        return [{ index: { _index: indexName, _id: String(id) } }, body];
      });

      const result = await this.client.bulk({
        body: operations,
        refresh: 'wait_for',
      });

      if (result.errors) {
        this.logger.warn(`Bulk indexing had errors for index ${indexName}`);
      }

      this.logger.log(`Bulk indexed ${documents.length} documents in ${indexName}`);
    } catch (error: Error | any) {
      this.logger.error(`Failed to bulk index documents in ${indexName}:`, error);
      throw error;
    }
  }

  /**
   * Update a document
   *
   * Partially updates an existing document by merging the provided fields.
   * Only the specified fields will be updated; other fields remain unchanged.
   * Uses `refresh: 'wait_for'` to ensure changes are immediately visible.
   *
   * **Note**: If the document doesn't exist, this will throw an error.
   * Use `indexDocument()` if you want upsert behavior.
   *
   * @param indexName - The name of the index
   * @param documentId - The ID of the document to update
   * @param partialDocument - Object containing fields to update
   *
   * @throws {Error} If update fails or document doesn't exist
   *
   * @example
   * ```typescript
   * // Update only the price field
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
      await this.client.update({
        index: indexName,
        id: String(documentId),
        doc: partialDocument,
        refresh: 'wait_for',
      });

      this.logger.debug(`Updated document ${documentId} in ${indexName}`);
    } catch (error: Error | any) {
      this.logger.error(`Failed to update document ${documentId} in ${indexName}:`, error);
      throw error;
    }
  }

  /**
   * Delete a document
   *
   * Removes a document from the index by its ID.
   * Uses `refresh: 'wait_for'` to ensure deletion is immediately reflected.
   *
   * **Note**: If the document doesn't exist, Elasticsearch will still return success.
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
      await this.client.delete({
        index: indexName,
        id: String(documentId),
        refresh: 'wait_for',
      });

      this.logger.debug(`Deleted document ${documentId} from ${indexName}`);
    } catch (error: Error | any) {
      this.logger.error(`Failed to delete document ${documentId} from ${indexName}:`, error);
      throw error;
    }
  }

  /**
   * Search for documents
   *
   * Performs a full-text search across documents in the specified index.
   * Supports advanced features including multi-field search, filtering, sorting,
   * pagination, highlighting, and faceted search.
   *
   * **Query Behavior**:
   * - If `searchFields` is specified: Uses multi_match with fuzzy matching
   * - Otherwise: Uses query_string for wildcard search across all fields
   * - Automatic fuzziness ('AUTO') for typo tolerance
   *
   * **Performance**: Results include execution time in milliseconds for monitoring.
   *
   * @param indexName - The name of the index to search
   * @param query - The search query string
   * @param options - Optional search configuration
   * @param options.limit - Maximum number of results (default: 20)
   * @param options.offset - Number of results to skip for pagination (default: 0)
   * @param options.searchFields - Specific fields to search in (e.g., ['title', 'content'])
   * @param options.filters - Field filters as key-value pairs (exact match)
   * @param options.sort - Array of sort criteria (field and order)
   * @param options.highlightFields - Fields to highlight in results
   * @param options.facets - Fields to aggregate/facet on
   *
   * @returns SearchResponse with hits, total count, processing time, and facets
   *
   * @throws {Error} If search fails
   *
   * @example
   * ```typescript
   * // Simple search
   * const results = await provider.search('products', 'laptop');
   *
   * // Advanced search with all options
   * const results = await provider.search('products', 'gaming laptop', {
   *   limit: 20,
   *   offset: 0,
   *   searchFields: ['name', 'description', 'brand'],
   *   filters: { category: 'Electronics', inStock: true },
   *   sort: [{ field: 'price', order: 'asc' }],
   *   highlightFields: ['name', 'description'],
   *   facets: ['brand', 'category'],
   * });
   *
   * console.log(`Found ${results.total} products in ${results.processingTimeMs}ms`);
   * results.hits.forEach(hit => {
   *   console.log(`${hit.document.name} - Score: ${hit.score}`);
   *   if (hit.highlights) {
   *     console.log('Highlighted:', hit.highlights);
   *   }
   * });
   * ```
   */
  async search(indexName: string, query: string, options?: SearchOptions): Promise<SearchResponse> {
    try {
      const {
        limit = 20,
        offset = 0,
        searchFields,
        filters,
        sort,
        highlightFields,
        facets,
      } = options || {};

      // Build query
      // Initialize base query structure with bool query for combining clauses
      const body: any = {
        query: {
          bool: {
            must: [], // Required conditions (score affecting)
            filter: [], // Required conditions (non-scoring, faster)
          },
        },
        from: offset, // Pagination offset
        size: limit, // Maximum results to return
      };

      // Add search query to bool.must clause
      if (query) {
        if (searchFields && searchFields.length > 0) {
          // Multi-field search with fuzzy matching for typo tolerance
          body.query.bool.must.push({
            multi_match: {
              query,
              fields: searchFields,
              fuzziness: 'AUTO', // Automatic edit distance based on term length
            },
          });
        } else {
          // Wildcard search across all fields when no specific fields provided
          body.query.bool.must.push({
            query_string: {
              query: `*${query}*`, // Wrap query with wildcards for partial matching
            },
          });
        }
      }

      // Add term filters for exact matching (non-scoring, faster than must clauses)
      if (filters) {
        Object.entries(filters).forEach(([field, value]) => {
          body.query.bool.filter.push({
            term: { [field]: value }, // Exact term match (case-sensitive)
          });
        });
      }

      // Add sorting criteria (overrides relevance score sorting)
      if (sort && sort.length > 0) {
        body.sort = sort.map((s) => ({
          [s.field]: { order: s.order }, // asc or desc
        }));
      }

      // Configure text highlighting for matched terms
      if (highlightFields && highlightFields.length > 0) {
        body.highlight = {
          fields: highlightFields.reduce(
            (acc, field) => {
              acc[field] = {}; // Use default highlight settings
              return acc;
            },
            {} as Record<string, any>,
          ),
        };
      }

      // Add aggregations for faceted search (category counts, etc.)
      if (facets && facets.length > 0) {
        body.aggs = facets.reduce(
          (acc, facet) => {
            acc[facet] = {
              terms: { field: facet }, // Count unique values for this field
            };
            return acc;
          },
          {} as Record<string, any>,
        );
      }

      // Execute search query
      const result = await this.client.search({
        index: indexName,
        body,
      });

      // Transform Elasticsearch response to SearchResult format
      const hits: SearchResult[] = result.hits.hits.map((hit: any) => ({
        id: hit._id, // Document ID
        document: hit._source, // Original document data
        score: hit._score, // Relevance score (higher = more relevant)
        highlights: hit.highlight, // Highlighted text snippets (if requested)
      }));

      // Build standardized response object
      const response: SearchResponse = {
        hits, // Array of search results
        total:
          typeof result.hits.total === 'object'
            ? Number(result.hits.total.value)
            : Number(result.hits.total), // Total matching documents
        processingTimeMs: result.took, // Query execution time in milliseconds
        query, // Original query string
        facets: result.aggregations, // Aggregation results (if requested)
      };

      return response;
    } catch (error: Error | any) {
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
   * @throws {Error} If retrieval fails (except for 404 not found)
   *
   * @example
   * ```typescript
   * const product = await provider.getDocument('products', '123');
   * if (product) {
   *   console.log('Product:', product.name);
   * } else {
   *   console.log('Product not found');
   * }
   * ```
   */
  async getDocument(indexName: string, documentId: string | number): Promise<any | null> {
    try {
      const result = await this.client.get({
        index: indexName,
        id: String(documentId),
      });

      return result._source || null;
    } catch (error: any) {
      if (error.statusCode === 404) {
        return null;
      }
      this.logger.error(`Failed to get document ${documentId} from ${indexName}:`, error);
      throw error;
    }
  }

  /**
   * Get index statistics
   *
   * Retrieves comprehensive statistics about an index including document count,
   * storage size, and other metrics.
   *
   * **Returned Metrics**:
   * - `documentCount` - Total number of documents in the index
   * - `size` - Index size in bytes
   * - Additional Elasticsearch-specific stats
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
   * console.log(`Size: ${stats.size} bytes`);
   * ```
   */
  async getIndexStats(indexName: string): Promise<Record<string, any>> {
    try {
      const stats = await this.client.indices.stats({
        index: indexName,
      });

      return {
        documentCount: stats._all?.primaries?.docs?.count || 0,
        size: stats._all?.primaries?.store?.size_in_bytes || 0,
        ...stats,
      };
    } catch (error: Error | any) {
      this.logger.error(`Failed to get stats for index ${indexName}:`, error);
      throw error;
    }
  }

  /**
   * Clear all documents from an index
   *
   * Removes all documents from the index while keeping the index itself
   * and its settings intact. Useful for reindexing or clearing test data.
   *
   * **Warning**: This operation is irreversible. All documents will be deleted.
   * The index structure and settings remain, but all data is lost.
   *
   * @param indexName - The name of the index to clear
   *
   * @throws {Error} If clearing fails
   *
   * @example
   * ```typescript
   * // Clear test data
   * await provider.clearIndex('test_products');
   *
   * // Reindex from scratch
   * await provider.clearIndex('products');
   * await provider.indexDocuments('products', newDocuments);
   * ```
   */
  async clearIndex(indexName: string): Promise<void> {
    try {
      await this.client.deleteByQuery({
        index: indexName,
        query: {
          match_all: {},
        },
        refresh: true,
      });

      this.logger.log(`Cleared all documents from index: ${indexName}`);
    } catch (error: Error | any) {
      this.logger.error(`Failed to clear index ${indexName}:`, error);
      throw error;
    }
  }

  /**
   * Update index settings
   *
   * Updates the configuration of an existing Elasticsearch index.
   * Some settings require the index to be closed before updating.
   *
   * **Updatable Settings**:
   * - Dynamic settings (without closing): `number_of_replicas`, `refresh_interval`
   * - Static settings (requires closing): `number_of_shards`, analysis configuration
   *
   * **Note**: This method does NOT close/reopen the index automatically to avoid
   * disruption. For static settings, you must close the index manually first.
   *
   * @param indexName - The name of the index
   * @param settings - Elasticsearch settings to update
   *
   * @throws {Error} If update fails
   *
   * @example
   * ```typescript
   * // Update dynamic settings (no close needed)
   * await provider.updateSettings('products', {
   *   number_of_replicas: 2,
   *   refresh_interval: '5s',
   * });
   *
   * // Update static settings (requires manual close/reopen)
   * // await provider.client.indices.close({ index: 'products' });
   * // await provider.updateSettings('products', { ... });
   * // await provider.client.indices.open({ index: 'products' });
   * ```
   */
  async updateSettings(indexName: string, settings: Record<string, any>): Promise<void> {
    try {
      await this.client.indices.putSettings({
        index: indexName,
        body: settings,
      });
      this.logger.log(`Updated settings for index: ${indexName}`);
    } catch (error: Error | any) {
      this.logger.error(`Failed to update settings for index ${indexName}:`, error);
      throw error;
    }
  }

  /**
   * Create an alias for an index
   *
   * Creates an alias that points to a physical index.
   * Aliases enable zero-downtime reindexing by allowing atomic switches.
   *
   * @param indexName - Physical index name
   * @param aliasName - Alias name
   *
   * @throws {Error} If alias creation fails
   *
   * @example
   * ```typescript
   * // Create alias 'products' -> 'products_20231104_153422'
   * await provider.createAlias('products_20231104_153422', 'products');
   * ```
   */
  async createAlias(indexName: string, aliasName: string): Promise<void> {
    try {
      await this.client.indices.putAlias({
        index: indexName,
        name: aliasName,
      });
      this.logger.log(`Created alias: ${aliasName} -> ${indexName}`);
    } catch (error: Error | any) {
      this.logger.error(`Failed to create alias ${aliasName} for index ${indexName}:`, error);
      throw error;
    }
  }

  /**
   * Delete an alias
   *
   * Removes an alias without deleting the underlying index.
   *
   * @param aliasName - Alias name to delete
   *
   * @throws {Error} If alias deletion fails
   *
   * @example
   * ```typescript
   * await provider.deleteAlias('products_old');
   * ```
   */
  async deleteAlias(aliasName: string): Promise<void> {
    try {
      // Get all indices that have this alias
      const aliasesResponse = await this.client.indices.getAlias({
        name: aliasName,
      });

      const indices = Object.keys(aliasesResponse);
      if (indices.length === 0) {
        this.logger.debug(`Alias ${aliasName} does not exist`);
        return;
      }

      // Delete alias from all indices
      await this.client.indices.deleteAlias({
        index: indices,
        name: aliasName,
      });

      this.logger.log(`Deleted alias: ${aliasName}`);
    } catch (error: any) {
      // Ignore 404 errors (alias doesn't exist)
      if (error.meta?.statusCode === 404) {
        this.logger.debug(`Alias ${aliasName} does not exist`);
        return;
      }
      this.logger.error(`Failed to delete alias ${aliasName}:`, error);
      throw error;
    }
  }

  /**
   * Update an alias to point to a different index
   *
   * Atomically switches an alias from one index to another.
   * This is the key operation for zero-downtime reindexing.
   *
   * @param aliasName - Alias name
   * @param newIndexName - New physical index name
   * @param oldIndexName - Optional old index name (for atomic swap)
   *
   * @throws {Error} If alias update fails
   *
   * @example
   * ```typescript
   * // Atomic swap: products -> products_20231104_160000
   * await provider.updateAlias(
   *   'products',
   *   'products_20231104_160000',
   *   'products_20231104_153422'
   * );
   * ```
   */
  async updateAlias(aliasName: string, newIndexName: string, oldIndexName?: string): Promise<void> {
    try {
      const actions: any[] = [];

      // Remove alias from old index if specified
      if (oldIndexName) {
        actions.push({
          remove: {
            index: oldIndexName,
            alias: aliasName,
          },
        });
      }

      // Add alias to new index
      actions.push({
        add: {
          index: newIndexName,
          alias: aliasName,
        },
      });

      // Execute atomically
      await this.client.indices.updateAliases({
        actions,
      });

      this.logger.log(`Updated alias: ${aliasName} -> ${newIndexName}`);
    } catch (error: Error | any) {
      this.logger.error(
        `Failed to update alias ${aliasName} from ${oldIndexName || 'N/A'} to ${newIndexName}:`,
        error,
      );
      throw error;
    }
  }

  /**
   * Get all aliases for an index
   *
   * Returns list of aliases pointing to the specified index.
   *
   * @param indexName - Physical index name
   *
   * @returns Array of alias names
   *
   * @throws {Error} If retrieval fails
   *
   * @example
   * ```typescript
   * const aliases = await provider.getAliases('products_20231104_153422');
   * // => ['products', 'products_latest']
   * ```
   */
  async getAliases(indexName: string): Promise<string[]> {
    try {
      const response = await this.client.indices.getAlias({
        index: indexName,
      });

      const indexData = response[indexName];
      if (!indexData || !indexData.aliases) {
        return [];
      }

      return Object.keys(indexData.aliases);
    } catch (error: any) {
      // Return empty array for 404 (index doesn't exist)
      if (error.meta?.statusCode === 404) {
        return [];
      }
      this.logger.error(`Failed to get aliases for index ${indexName}:`, error);
      throw error;
    }
  }

  /**
   * Reindex data from a source into a target index with zero downtime
   *
   * Performs the following steps:
   * 1. Determines if indexName is an alias (for ES with aliases) or direct index
   * 2. Creates a temporary index with timestamped name
   * 3. Fetches data from the data source
   * 4. Indexes data to temporary index in batches
   * 5. Verifies document count
   * 6. If indexName is an alias: atomically switches alias to new index
   * 7. If indexName is direct: deletes old index (if deleteOldIndex=true)
   * 8. Optionally deletes the old physical index
   *
   * @param indexName - Target index name or alias name
   * @param options - Reindex options
   *
   * @returns Reindex statistics
   *
   * @throws {Error} If reindexing fails at any step
   *
   * @example
   * ```typescript
   * const result = await provider.reindex('products', {
   *   batchSize: 500,
   *   dataSource: async () => {
   *     const products = await productRepository.findAll();
   *     return products.map(p => ({ id: p.id, name: p.name, price: p.price }));
   *   },
   *   newSettings: {
   *     mappings: {
   *       properties: {
   *         name: { type: 'text' },
   *         price: { type: 'float' },
   *       },
   *     },
   *   },
   *   deleteOldIndex: true,
   * });
   *
   * console.log(`Reindexed ${result.indexedDocuments} documents in ${result.duration}ms`);
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
    const startTime = Date.now();
    const batchSize = options.batchSize || 100;
    const deleteOldIndex = options.deleteOldIndex !== false; // Default to true

    this.logger.log(`Starting reindex for "${indexName}"...`);

    let isAlias = false;
    let oldPhysicalIndexName: string | undefined;

    try {
      // Step 1: Determine if indexName is an alias
      try {
        const aliasResponse = await this.client.indices.getAlias({
          name: indexName,
        });
        // If we get a response, indexName is an alias
        const indices = Object.keys(aliasResponse);
        if (indices.length > 0) {
          isAlias = true;
          oldPhysicalIndexName = indices[0]; // Get the first (and usually only) index
          this.logger.debug(`"${indexName}" is an alias pointing to "${oldPhysicalIndexName}"`);
        }
      } catch (error: any) {
        // Not an alias, check if it's a direct index
        if (error.meta?.statusCode === 404) {
          const exists = await this.indexExists(indexName);
          if (exists) {
            isAlias = false;
            oldPhysicalIndexName = indexName;
            this.logger.debug(`"${indexName}" is a direct index (not an alias)`);
          } else {
            throw new Error(`Index or alias "${indexName}" does not exist`);
          }
        } else {
          throw error;
        }
      }

      // Step 2: Create temporary index with timestamp
      const timestamp = new Date()
        .toISOString()
        .replace(/[-:]/g, '')
        .replace(/T/, '_')
        .split('.')[0];
      const tempIndexName = `${isAlias ? indexName : oldPhysicalIndexName}_${timestamp}_temp`;

      this.logger.log(`Creating temporary index: ${tempIndexName}`);
      await this.createIndex(tempIndexName, options.newSettings);

      // Step 3: Fetch and index data
      let totalDocuments = 0;
      let indexedDocuments = 0;
      let failedDocuments = 0;

      this.logger.log('Fetching data from source...');
      const dataSourceResult = options.dataSource();

      // Check if result is a generator by checking for Symbol.asyncIterator
      const isGenerator =
        dataSourceResult &&
        typeof dataSourceResult === 'object' &&
        Symbol.asyncIterator in dataSourceResult;

      if (isGenerator) {
        // AsyncGenerator - yields individual documents
        const generator = dataSourceResult as AsyncGenerator<SearchDocument, void, unknown>;
        let batch: SearchDocument[] = [];

        for await (const document of generator) {
          batch.push(document);
          totalDocuments++;

          if (batch.length >= batchSize) {
            try {
              await this.indexDocuments(tempIndexName, batch);
              indexedDocuments += batch.length;
              this.logger.debug(`Indexed batch: ${indexedDocuments}/${totalDocuments}`);
            } catch (error: Error | any) {
              failedDocuments += batch.length;
              this.logger.error(`Failed to index batch:`, error);
            }
            batch = [];
          }
        }

        // Index remaining documents
        if (batch.length > 0) {
          try {
            await this.indexDocuments(tempIndexName, batch);
            indexedDocuments += batch.length;
          } catch (error: Error | any) {
            failedDocuments += batch.length;
            this.logger.error(`Failed to index final batch:`, error);
          }
        }
      } else {
        // Promise<SearchDocument[]>
        const documents = (await dataSourceResult) as SearchDocument[];
        totalDocuments = documents.length;

        this.logger.log(`Indexing ${totalDocuments} documents in batches of ${batchSize}...`);

        for (let i = 0; i < documents.length; i += batchSize) {
          const batch = documents.slice(i, i + batchSize);
          try {
            await this.indexDocuments(tempIndexName, batch);
            indexedDocuments += batch.length;
            this.logger.debug(`Indexed ${indexedDocuments}/${totalDocuments} documents`);
          } catch (error: Error | any) {
            failedDocuments += batch.length;
            this.logger.error(`Failed to index batch ${i}-${i + batch.length}:`, error);
          }
        }
      }

      // Step 4: Verify document count
      await new Promise((resolve) => setTimeout(resolve, 1000)); // Wait for ES to refresh
      const tempStats = await this.getIndexStats(tempIndexName);
      const tempDocCount = tempStats.documentCount || tempStats._all?.primaries?.docs?.count || 0;

      this.logger.log(
        `Indexed ${indexedDocuments} documents (${failedDocuments} failed, ${tempDocCount} in temp index)`,
      );

      if (tempDocCount === 0 && indexedDocuments > 0) {
        this.logger.warn('Document count verification mismatch - proceeding with caution');
      }

      // Step 5: Switch to new index
      if (isAlias) {
        // Atomically switch alias
        this.logger.log(
          `Switching alias "${indexName}" from "${oldPhysicalIndexName}" to "${tempIndexName}"`,
        );
        await this.updateAlias(indexName, tempIndexName, oldPhysicalIndexName);

        // Optionally delete old physical index
        if (deleteOldIndex && oldPhysicalIndexName) {
          this.logger.log(`Deleting old index: ${oldPhysicalIndexName}`);
          await this.deleteIndex(oldPhysicalIndexName);
        }
      } else {
        // Direct index: delete old and keep temp
        if (deleteOldIndex && oldPhysicalIndexName) {
          this.logger.log(`Deleting old index: ${oldPhysicalIndexName}`);
          await this.deleteIndex(oldPhysicalIndexName);
        }

        this.logger.log(`New index "${tempIndexName}" is now active`);
      }

      const duration = Date.now() - startTime;

      this.logger.log(
        `Reindex completed successfully in ${duration}ms: ${indexedDocuments}/${totalDocuments} documents indexed`,
      );

      return {
        success: true,
        totalDocuments,
        indexedDocuments,
        failedDocuments,
        oldIndexName: oldPhysicalIndexName,
        newIndexName: tempIndexName,
        duration,
      };
    } catch (error: Error | any) {
      const duration = Date.now() - startTime;
      this.logger.error(`Reindex failed after ${duration}ms:`, error);

      // Attempt cleanup of temp index if it was created
      try {
        const timestamp = new Date()
          .toISOString()
          .replace(/[-:]/g, '')
          .replace(/T/, '_')
          .split('.')[0];
        const possibleTempName = `${indexName}_${timestamp}_temp`;
        if (await this.indexExists(possibleTempName)) {
          this.logger.log(`Cleaning up temp index: ${possibleTempName}`);
          await this.deleteIndex(possibleTempName);
        }
      } catch (cleanupError) {
        this.logger.warn('Failed to cleanup temp index:', cleanupError);
      }

      throw error;
    }
  }
}
