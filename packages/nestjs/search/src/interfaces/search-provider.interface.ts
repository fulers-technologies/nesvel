import type { SearchOptions } from './search-options.interface';
import type { SearchDocument } from './search-document.interface';
import type { SearchResponse } from './search-response.interface';

/**
 * Search Provider Interface
 *
 * Defines the contract that all search engine providers must implement.
 * This interface ensures consistent behavior across different search engines
 * (Elasticsearch, Meilisearch, etc.).
 *
 * @template T - The type of documents being indexed
 *
 * @author Nesvel
 * @since 1.0.0
 */
export interface ISearchProvider<T = any> {
  /**
   * Create an index for storing documents
   *
   * @param indexName - Name of the index to create
   * @param settings - Optional index settings (schema, analyzers, etc.)
   */
  createIndex(indexName: string, settings?: Record<string, any>): Promise<void>;

  /**
   * Delete an index
   *
   * @param indexName - Name of the index to delete
   */
  deleteIndex(indexName: string): Promise<void>;

  /**
   * Check if an index exists
   *
   * @param indexName - Name of the index to check
   * @returns True if the index exists
   */
  indexExists(indexName: string): Promise<boolean>;

  /**
   * List all indices
   *
   * Retrieves information about all indices.
   * Returns an array of index metadata.
   *
   * @returns Array of index information objects
   */
  listIndices(): Promise<any[]>;

  /**
   * Index a single document
   *
   * @param indexName - Name of the index
   * @param document - Document to index
   */
  indexDocument(indexName: string, document: SearchDocument): Promise<void>;

  /**
   * Index multiple documents in bulk
   *
   * @param indexName - Name of the index
   * @param documents - Array of documents to index
   */
  indexDocuments(indexName: string, documents: SearchDocument[]): Promise<void>;

  /**
   * Update a document
   *
   * @param indexName - Name of the index
   * @param documentId - ID of the document to update
   * @param partialDocument - Partial document data to update
   */
  updateDocument(
    indexName: string,
    documentId: string | number,
    partialDocument: Partial<T>,
  ): Promise<void>;

  /**
   * Delete a document
   *
   * @param indexName - Name of the index
   * @param documentId - ID of the document to delete
   */
  deleteDocument(indexName: string, documentId: string | number): Promise<void>;

  /**
   * Search for documents
   *
   * @param indexName - Name of the index to search
   * @param query - Search query string
   * @param options - Search options (filters, pagination, etc.)
   * @returns Search results
   */
  search(indexName: string, query: string, options?: SearchOptions): Promise<SearchResponse<T>>;

  /**
   * Get a document by ID
   *
   * @param indexName - Name of the index
   * @param documentId - ID of the document
   * @returns The document or null if not found
   */
  getDocument(indexName: string, documentId: string | number): Promise<T | null>;

  /**
   * Get statistics about an index
   *
   * @param indexName - Name of the index
   * @returns Index statistics (document count, size, etc.)
   */
  getIndexStats(indexName: string): Promise<Record<string, any>>;

  /**
   * Clear all documents from an index (without deleting the index)
   *
   * @param indexName - Name of the index to clear
   */
  clearIndex(indexName: string): Promise<void>;

  /**
   * Update index settings
   *
   * Updates the configuration of an existing index.
   * The structure of settings depends on the provider (Elasticsearch vs Meilisearch).
   *
   * @param indexName - Name of the index
   * @param settings - Provider-specific settings to update
   */
  updateSettings(indexName: string, settings: Record<string, any>): Promise<void>;

  /**
   * Create an alias for an index
   *
   * Creates an alias that points to a physical index.
   * Note: Meilisearch doesn't support aliases (no-op).
   *
   * @param indexName - Physical index name
   * @param aliasName - Alias name
   */
  createAlias(indexName: string, aliasName: string): Promise<void>;

  /**
   * Delete an alias
   *
   * Removes an alias without deleting the underlying index.
   * Note: Meilisearch doesn't support aliases (no-op).
   *
   * @param aliasName - Alias name to delete
   */
  deleteAlias(aliasName: string): Promise<void>;

  /**
   * Update an alias to point to a different index
   *
   * Atomically switches an alias from one index to another.
   * Enables zero-downtime reindexing.
   * Note: Meilisearch doesn't support aliases (no-op).
   *
   * @param aliasName - Alias name
   * @param newIndexName - New physical index name
   * @param oldIndexName - Optional old index name (for atomic swap)
   */
  updateAlias(aliasName: string, newIndexName: string, oldIndexName?: string): Promise<void>;

  /**
   * Get all aliases for an index
   *
   * Returns list of aliases pointing to the specified index.
   * Note: Meilisearch always returns empty array.
   *
   * @param indexName - Physical index name
   * @returns Array of alias names
   */
  getAliases(indexName: string): Promise<string[]>;

  /**
   * Reindex data from a source into the target index
   *
   * Performs zero-downtime reindexing by:
   * 1. Creating a temporary index with new settings
   * 2. Fetching data from the source (callback function)
   * 3. Indexing data to the temporary index in batches
   * 4. Verifying the indexing succeeded
   * 5. Switching to the index.make(alias swap for ES, or index swap for Meilisearch)
   * 6. Deleting the old index
   *
   * @param indexName - Target index name (or alias name for Elasticsearch)
   * @param options - Reindex options
   * @param options.batchSize - Number of documents per batch (default: 100)
   * @param options.dataSource - Async function that yields documents to index
   * @param options.newSettings - Optional new index settings for the temp index
   * @param options.deleteOldIndex - Whether to delete old index after successful reindex (default: true)
   * @returns Reindex statistics
   */
  reindex(
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
  }>;
}
