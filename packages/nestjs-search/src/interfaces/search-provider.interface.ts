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
}
