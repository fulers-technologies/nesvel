import {
  SearchConnectionType,
  IndexNamingStrategy,
  type SearchConfig,
} from '@nesvel/nestjs-search';

/**
 * Search Module Configuration
 *
 * Production-ready search engine integration configuration for NestJS.
 * Provides comprehensive full-text search with Elasticsearch or Meilisearch.
 *
 * Features:
 * - Multi-engine support (Elasticsearch, Meilisearch)
 * - Automatic entity synchronization
 * - Type-safe search operations
 * - Configurable batch processing
 * - Retry mechanisms for reliability
 *
 * All configuration values can be overridden via environment variables.
 *
 * @see {@link https://www.meilisearch.com | Meilisearch}
 * @see {@link https://www.elastic.co/elasticsearch | Elasticsearch}
 *
 * @example
 * ```typescript
 * // Access configuration values
 * const batchSize = searchConfig.batch?.batchSize;
 * const esNode = searchConfig.elasticsearch?.node;
 * const isLoggingEnabled = searchConfig.logging;
 * ```
 */
export const searchConfig: SearchConfig = {
  /**
   * Search engine connection type
   *
   * Determines which search engine to use.
   * Options: ELASTICSEARCH, MEILISEARCH
   *
   * @env SEARCH_CONNECTION
   */
  connection:
    (process.env.SEARCH_CONNECTION as SearchConnectionType) || SearchConnectionType.ELASTICSEARCH,

  /**
   * Default index prefix
   *
   * Used to namespace indices in multi-tenant applications
   * or to separate different environments.
   *
   * @env SEARCH_INDEX_PREFIX
   */
  indexPrefix: process.env.SEARCH_INDEX_PREFIX || 'nesvel',

  /**
   * Index naming strategy
   *
   * Controls how index names are generated:
   * - `IndexNamingStrategy.SIMPLE`: Use index name with prefix (e.g., 'nesvel_products')
   * - `IndexNamingStrategy.TIME_STAMPED`: Append timestamp with alias (e.g., 'nesvel_products_20231104_153422')
   * - `IndexNamingStrategy.VERSIONED`: Append version with alias (e.g., 'nesvel_products_v1')
   *
   * **Recommended**: Use `TIME_STAMPED` for Elasticsearch in production to enable:
   * - Zero-downtime reindexing
   * - Easy rollback capability
   * - Multiple index versions
   *
   * @env SEARCH_INDEX_NAMING_STRATEGY
   * @default IndexNamingStrategy.TIME_STAMPED for Elasticsearch, IndexNamingStrategy.SIMPLE for Meilisearch
   */
  indexNamingStrategy:
    (process.env.SEARCH_INDEX_NAMING_STRATEGY as IndexNamingStrategy) ||
    IndexNamingStrategy.TIME_STAMPED,

  /**
   * Automatic entity synchronization
   *
   * When true, entities with IHasSearchable will automatically
   * sync to the search engine on create/update/delete.
   *
   * @env SEARCH_AUTO_SYNC
   */
  autoSync: process.env.SEARCH_AUTO_SYNC !== 'false',

  /**
   * Search behavior and pagination defaults
   */
  search: {
    /**
     * Default number of results per page
     */
    defaultLimit: 20,

    /**
     * Maximum number of results per page
     * Prevents performance issues from large result sets
     */
    maxLimit: 100,

    /**
     * Default search mode for text queries
     */
    defaultSearchMode: 'partial' as const,
  },

  /**
   * Batch processing configuration
   *
   * Controls how many documents are processed in bulk operations
   */
  batch: {
    /**
     * Number of documents to index in a single bulk operation
     *
     * Higher values improve throughput but use more memory.
     *
     * @env SEARCH_BATCH_SIZE
     */
    batchSize: parseInt(process.env.SEARCH_BATCH_SIZE || '100', 10),

    /**
     * Delay between batch operations (in milliseconds)
     *
     * Prevents overwhelming the search engine with requests.
     *
     * @env SEARCH_BATCH_DELAY
     */
    batchDelay: parseInt(process.env.SEARCH_BATCH_DELAY || '100', 10),
  },

  /**
   * Retry configuration
   *
   * Controls retry behavior for failed search operations
   */
  retry: {
    /**
     * Maximum number of retry attempts
     *
     * @env SEARCH_MAX_RETRIES
     */
    maxRetries: parseInt(process.env.SEARCH_MAX_RETRIES || '3', 10),

    /**
     * Initial delay before first retry (in milliseconds)
     *
     * @env SEARCH_RETRY_DELAY
     */
    retryDelay: parseInt(process.env.SEARCH_RETRY_DELAY || '1000', 10),

    /**
     * Exponential backoff multiplier
     *
     * Each retry will wait retryDelay * (backoffMultiplier ^ attemptNumber)
     *
     * @env SEARCH_BACKOFF_MULTIPLIER
     */
    backoffMultiplier: parseInt(process.env.SEARCH_BACKOFF_MULTIPLIER || '2', 10),
  },

  /**
   * Elasticsearch default configuration
   *
   * Default settings for Elasticsearch connections
   */
  elasticsearch: {
    /**
     * Default node URL
     *
     * @env ELASTICSEARCH_NODE
     */
    node: process.env.ELASTICSEARCH_NODE || 'http://localhost:9200',

    /**
     * Default request timeout (in milliseconds)
     *
     * @env ELASTICSEARCH_TIMEOUT
     */
    requestTimeout: parseInt(process.env.ELASTICSEARCH_TIMEOUT || '30000', 10),

    /**
     * Maximum number of retries for failed requests
     *
     * @env ELASTICSEARCH_MAX_RETRIES
     */
    maxRetries: parseInt(process.env.ELASTICSEARCH_MAX_RETRIES || '3', 10),

    /**
     * Compression for request/response
     *
     * Reduces bandwidth usage but adds CPU overhead.
     *
     * @env ELASTICSEARCH_COMPRESSION
     */
    compression: process.env.ELASTICSEARCH_COMPRESSION !== 'false',
  },

  /**
   * Meilisearch default configuration
   *
   * Default settings for Meilisearch connections
   */
  meilisearch: {
    /**
     * Default host URL
     *
     * @env MEILISEARCH_HOST
     */
    host: process.env.MEILISEARCH_HOST || 'http://localhost:7700',

    /**
     * Default request timeout (in milliseconds)
     *
     * @env MEILISEARCH_TIMEOUT
     */
    timeout: parseInt(process.env.MEILISEARCH_TIMEOUT || '30000', 10),

    /**
     * API Key (optional, for secured instances)
     *
     * @env MEILISEARCH_API_KEY
     */
    apiKey: process.env.MEILISEARCH_API_KEY || 'api-key',
  },

  /**
   * Logging configuration
   *
   * Determines when to log search operations.
   * Enabled in development or when explicitly set.
   *
   * @env SEARCH_LOGGING
   */
  logging: process.env.NODE_ENV === 'development' || process.env.SEARCH_LOGGING === 'true',
};
