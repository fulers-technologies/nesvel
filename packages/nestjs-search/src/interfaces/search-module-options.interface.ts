import { Config as MeilisearchOptions } from 'meilisearch';
import { ClientOptions as ESOptions } from '@elastic/elasticsearch';

import type { SearchConnectionType } from '@/enums/search-connection-type.enum';
import type { IndexNamingStrategy } from '@/enums/index-naming-strategy.enum';

/**
 * Search Module Options Interface
 *
 * Complete configuration options for the Search Module.
 * Defines search engine connection, index settings, provider-specific options,
 * and additional operational configurations.
 *
 * @example
 * ```typescript
 * const options: SearchModuleOptions = {
 *   connection: SearchConnectionType.ELASTICSEARCH,
 *   indexPrefix: 'myapp',
 *   autoSync: true,
 *   elasticsearch: {
 *     node: 'http://localhost:9200',
 *     auth: { username: 'elastic', password: 'changeme' },
 *   },
 *   search: {
 *     defaultLimit: 20,
 *     maxLimit: 100,
 *   },
 * };
 * ```
 *
 * @author Nesvel
 * @since 1.0.0
 */
export interface SearchModuleOptions {
  /**
   * Search engine connection type
   */
  connection: SearchConnectionType;

  /**
   * Default index name prefix
   * @default 'nesvel'
   */
  indexPrefix?: string;

  /**
   * Index naming strategy
   *
   * Controls how index names are generated:
   * - `IndexNamingStrategy.SIMPLE`: Use index name as-is with prefix (e.g., 'nesvel_products')
   * - `IndexNamingStrategy.TIME_STAMPED`: Append timestamp (e.g., 'nesvel_products_20231104_153422')
   * - `IndexNamingStrategy.VERSIONED`: Append version (e.g., 'nesvel_products_v1')
   *
   * When using `TIME_STAMPED` or `VERSIONED`, an alias matching the prefixed base name is automatically created.
   * This enables zero-downtime reindexing by creating new indexes and switching aliases atomically.
   *
   * @default IndexNamingStrategy.SIMPLE
   *
   * @example
   * ```typescript
   * // With TIME_STAMPED strategy:
   * // Physical index: 'nesvel_products_20231104_153422'
   * // Alias: 'nesvel_products'
   * // Access via: 'nesvel_products' (uses alias)
   * ```
   */
  indexNamingStrategy?: IndexNamingStrategy;

  /**
   * Automatically sync entities with IHasSearchable on create/update/delete
   * @default true
   */
  autoSync?: boolean;

  /**
   * Search behavior and pagination defaults
   */
  search?: {
    /**
     * Default number of results per page
     * @default 20
     */
    defaultLimit?: number;

    /**
     * Maximum number of results per page
     * @default 100
     */
    maxLimit?: number;

    /**
     * Default search mode for text queries
     * @default 'partial'
     */
    defaultSearchMode?: 'partial' | 'exact' | 'starts_with' | 'ends_with';
  };

  /**
   * Batch processing configuration
   */
  batch?: {
    /**
     * Number of documents to index in a single bulk operation
     * @default 100
     */
    batchSize?: number;

    /**
     * Delay between batch operations (in milliseconds)
     * @default 100
     */
    batchDelay?: number;
  };

  /**
   * Retry configuration for failed operations
   */
  retry?: {
    /**
     * Maximum number of retry attempts
     * @default 3
     */
    maxRetries?: number;

    /**
     * Initial delay before first retry (in milliseconds)
     * @default 1000
     */
    retryDelay?: number;

    /**
     * Exponential backoff multiplier
     * @default 2
     */
    backoffMultiplier?: number;
  };

  /**
   * Elasticsearch-specific configuration
   * Only used when connection is ELASTICSEARCH
   */
  elasticsearch?: ESOptions;

  /**
   * Meilisearch-specific configuration
   * Only used when connection is MEILISEARCH
   */
  meilisearch?: MeilisearchOptions;

  /**
   * Enable logging for search operations
   * @default false (true in development)
   */
  logging?: boolean;
}
