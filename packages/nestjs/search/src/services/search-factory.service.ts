import { MeiliSearch } from 'meilisearch';
import { Injectable } from '@nestjs/common';
import { BaseFactory } from '@nesvel/shared';
import { Client as ElasticsearchClient } from '@elastic/elasticsearch';

import type { SearchModuleOptions } from '@/interfaces';
import { SearchConnectionType } from '@/enums';
import { ElasticsearchProvider, MeilisearchProvider } from '@/providers';

/**
 * Factory service for creating and configuring Search provider instances.
 *
 * This service extends BaseFactory to provide a standardized factory pattern for
 * creating search engine provider instances. It manages the lifecycle and
 * configuration of various search backends including Elasticsearch and Meilisearch.
 *
 * Architecture:
 * - Extends BaseFactory with search-specific configuration handling
 * - Maintains a registry of available search providers
 * - Provides provider-specific validation and instantiation
 * - Creates and configures search engine clients
 * - Supports custom provider registration at runtime
 *
 * Supported Search Engines:
 * - Elasticsearch: Distributed, RESTful search and analytics engine
 *   - Full-text search with powerful query DSL
 *   - Aggregations and analytics capabilities
 *   - Horizontal scalability and high availability
 *   - Real-time indexing and search
 *
 * - Meilisearch: Lightning-fast, typo-tolerant search engine
 *   - Instant search results (< 50ms)
 *   - Typo tolerance and prefix search
 *   - Faceted search and filtering
 *   - Easy to deploy and maintain
 *
 * Key Features:
 * - Automatic provider instantiation with client setup
 * - Connection validation (node/host configuration)
 * - Type-safe operations with full TypeScript support
 * - Comprehensive error handling with configuration validation
 * - Support for both single and multi-node configurations
 *
 * @extends BaseFactory<SearchModuleOptions, ElasticsearchProvider | MeilisearchProvider, any>
 *
 * @example
 * Basic usage with Elasticsearch:
 * ```typescript
 * const provider = searchFactory.createDriver({
 *   connection: SearchConnectionType.ELASTICSEARCH,
 *   elasticsearch: {
 *     node: 'http://localhost:9200',
 *     auth: {
 *       username: 'elastic',
 *       password: 'changeme'
 *     },
 *     maxRetries: 5,
 *     requestTimeout: 60000
 *   }
 * });
 *
 * // Use the provider for search operations
 * const results = await provider.search('users', {
 *   query: { match: { name: 'John' } }
 * });
 * ```
 *
 * @example
 * Using Meilisearch for fast search:
 * ```typescript
 * const provider = searchFactory.createDriver({
 *   connection: SearchConnectionType.MEILISEARCH,
 *   meilisearch: {
 *     host: 'http://localhost:7700',
 *     apiKey: 'masterKey'
 *   }
 * });
 *
 * // Instant search with typo tolerance
 * const results = await provider.search('products', {
 *   q: 'tshrt',  // Will match "t-shirt" despite typo
 *   limit: 20
 * });
 * ```
 *
 * @example
 * Multi-node Elasticsearch configuration:
 * ```typescript
 * const provider = searchFactory.createDriver({
 *   connection: SearchConnectionType.ELASTICSEARCH,
 *   elasticsearch: {
 *     nodes: [
 *       'http://es-node-1:9200',
 *       'http://es-node-2:9200',
 *       'http://es-node-3:9200'
 *     ],
 *     maxRetries: 3,
 *     sniffOnStart: true
 *   }
 * });
 * ```
 *
 * @see {@link BaseFactory} For base factory implementation
 * @see {@link ElasticsearchProvider} For Elasticsearch provider
 * @see {@link MeilisearchProvider} For Meilisearch provider
 * @see {@link SearchModuleOptions} For configuration options
 *
 * @author Nesvel
 * @since 1.0.0
 */
@Injectable()
export class SearchFactoryService extends BaseFactory<
  SearchModuleOptions,
  ElasticsearchProvider | MeilisearchProvider,
  any
> {
  /**
   * Registry of available search engine providers.
   *
   * Maps connection type identifiers to their corresponding provider classes.
   * This registry is used by BaseFactory to instantiate the appropriate
   * search provider based on configuration.
   *
   * Available providers:
   * - ELASTICSEARCH: Distributed, RESTful search and analytics engine
   * - MEILISEARCH: Lightning-fast, typo-tolerant search engine
   *
   * @protected
   * @readonly
   */
  protected readonly driverRegistry = new Map<string, any>([
    [SearchConnectionType.ELASTICSEARCH, ElasticsearchProvider],
    [SearchConnectionType.MEILISEARCH, MeilisearchProvider],
  ]);

  /**
   * Extracts the search engine connection type from configuration.
   *
   * Determines which search engine provider should be used based on the
   * provided configuration. The connection type determines whether to use
   * Elasticsearch or Meilisearch as the search backend.
   *
   * @param options - The search module configuration containing connection type selection
   * @returns The connection type identifier ('elasticsearch' or 'meilisearch')
   *
   * @protected
   * @override Implementation of BaseFactory abstract method
   *
   * @example
   * ```typescript
   * const type = this.getDriverType({ connection: SearchConnectionType.ELASTICSEARCH });
   * // Returns: 'elasticsearch'
   *
   * const meiliType = this.getDriverType({ connection: SearchConnectionType.MEILISEARCH });
   * // Returns: 'meilisearch'
   * ```
   */
  protected getDriverType(options: SearchModuleOptions): string {
    return options.connection;
  }

  /**
   * Gets connection-specific configuration options.
   *
   * Extracts and returns the configuration options specific to the selected
   * search engine. Each provider has its own set of configurable parameters:
   *
   * - Elasticsearch:
   *   - node/nodes: Single or multiple Elasticsearch nodes
   *   - auth: Authentication credentials (username/password or API key)
   *   - maxRetries, requestTimeout, sniffOnStart, etc.
   *
   * - Meilisearch:
   *   - host: Meilisearch server URL
   *   - apiKey: Authentication API key
   *   - timeout, headers, etc.
   *
   * @param options - The search module configuration containing provider-specific options
   * @returns Provider-specific configuration options, or undefined for unsupported types
   *
   * @protected
   * @override Implementation of BaseFactory abstract method
   *
   * @example
   * ```typescript
   * const esOpts = this.getDriverOptions({
   *   connection: SearchConnectionType.ELASTICSEARCH,
   *   elasticsearch: { node: 'http://localhost:9200' }
   * });
   * // Returns: { node: 'http://localhost:9200' }
   *
   * const meiliOpts = this.getDriverOptions({
   *   connection: SearchConnectionType.MEILISEARCH,
   *   meilisearch: { host: 'http://localhost:7700', apiKey: 'key' }
   * });
   * // Returns: { host: 'http://localhost:7700', apiKey: 'key' }
   * ```
   */
  protected getDriverOptions(options: SearchModuleOptions): any {
    switch (options.connection) {
      case SearchConnectionType.ELASTICSEARCH:
        return options.elasticsearch;
      case SearchConnectionType.MEILISEARCH:
        return options.meilisearch;
      default:
        return undefined;
    }
  }

  /**
   * Instantiates a search provider with the provided options.
   *
   * Creates a new instance of the specified search provider class, first
   * instantiating the appropriate search engine client (Elasticsearch or
   * Meilisearch) and then wrapping it in the provider implementation.
   *
   * The provider pattern abstracts the underlying search engine client,
   * providing a consistent interface for search operations across different
   * search backends.
   *
   * Process:
   * 1. Validates that required configuration is present
   * 2. Creates the native search engine client (ElasticsearchClient or MeiliSearch)
   * 3. Wraps the client in the provider implementation
   * 4. Returns the fully configured provider
   *
   * @param ProviderClass - The provider class constructor (ElasticsearchProvider or MeilisearchProvider)
   * @param options - Provider-specific configuration (node URLs, API keys, etc.)
   * @param config - Full search module configuration containing connection type
   * @returns A fully configured search provider instance
   *
   * @throws {Error} If required configuration is missing
   * @throws {Error} If connection type is not supported
   *
   * @protected
   * @override Implementation of BaseFactory abstract method
   *
   * @example
   * ```typescript
   * const provider = this.instantiateDriver(
   *   ElasticsearchProvider,
   *   { node: 'http://localhost:9200', auth: { username: 'elastic', password: 'pass' } },
   *   { connection: SearchConnectionType.ELASTICSEARCH, elasticsearch: {...} }
   * );
   * // Returns: ElasticsearchProvider with configured client
   *
   * const meiliProvider = this.instantiateDriver(
   *   MeilisearchProvider,
   *   { host: 'http://localhost:7700', apiKey: 'masterKey' },
   *   { connection: SearchConnectionType.MEILISEARCH, meilisearch: {...} }
   * );
   * // Returns: MeilisearchProvider with configured client
   * ```
   */
  protected instantiateDriver(
    ProviderClass: any,
    options: any,
    config: SearchModuleOptions,
  ): ElasticsearchProvider | MeilisearchProvider {
    /**
     * Extract the connection type from configuration to determine which
     * search engine client to instantiate.
     */
    const connectionType = this.getDriverType(config);

    /**
     * Elasticsearch provider instantiation.
     *
     * Creates an Elasticsearch client with the provided connection options
     * (node URLs, authentication, retry settings, etc.) and wraps it in
     * the ElasticsearchProvider implementation.
     */
    if (connectionType === SearchConnectionType.ELASTICSEARCH) {
      if (!options) {
        throw new Error(
          'Elasticsearch configuration is required when using ELASTICSEARCH connection type',
        );
      }
      /** Create native Elasticsearch client with connection options */
      const client = ElasticsearchClient.make(options);
      /** Wrap client in provider for consistent interface */
      return ElasticsearchProvider.make(client);
    }

    /**
     * Meilisearch provider instantiation.
     *
     * Creates a Meilisearch client with the provided connection options
     * (host URL, API key, etc.) and wraps it in the MeilisearchProvider
     * implementation.
     */
    if (connectionType === SearchConnectionType.MEILISEARCH) {
      if (!options) {
        throw new Error(
          'Meilisearch configuration is required when using MEILISEARCH connection type',
        );
      }
      /** Create native Meilisearch client with connection options */
      const client = MeiliSearch.make(options);
      /** Wrap client in provider for consistent interface */
      return MeilisearchProvider.make(client);
    }

    /**
     * Throw error for unsupported connection types.
     * This should never be reached as validation occurs earlier,
     * but serves as a safeguard.
     */
    throw new Error(`Unsupported connection type: ${connectionType}`);
  }

  /**
   * Creates the appropriate error for unsupported connection type.
   *
   * Generates a descriptive error when a requested search connection type
   * is not found in the provider registry. This error provides helpful
   * information about the invalid connection type and lists all available types.
   *
   * @param connectionType - The requested connection type that wasn't found in the registry
   * @param availableTypes - List of all available connection types for helpful error message
   * @returns An Error instance with descriptive message about available connection types
   *
   * @protected
   * @override Implementation of BaseFactory abstract method
   *
   * @example
   * ```typescript
   * const error = this.getNotFoundError('unknown-search', ['elasticsearch', 'meilisearch']);
   * // Returns: Error with message:
   * // "Unsupported search connection type: unknown-search. Available types: elasticsearch, meilisearch"
   * ```
   */
  protected getNotFoundError(connectionType: string, availableTypes: string[]): Error {
    return new Error(
      `Unsupported search connection type: ${connectionType}. Available types: ${availableTypes.join(', ')}`,
    );
  }

  /**
   * Validates connection-specific configuration options.
   *
   * Performs validation of connection-specific parameters to ensure they meet
   * the requirements of each search provider. This validation occurs before
   * client instantiation to provide early error detection.
   *
   * Validation rules by connection type:
   * - Elasticsearch:
   *   - Configuration object: Required (elasticsearch property must exist)
   *   - Node configuration: At least one of 'node' or 'nodes' must be specified
   *   - Example: { node: 'http://localhost:9200' } OR { nodes: ['http://es1:9200', 'http://es2:9200'] }
   *
   * - Meilisearch:
   *   - Configuration object: Required (meilisearch property must exist)
   *   - Host: Required string (Meilisearch server URL)
   *   - Example: { host: 'http://localhost:7700' }
   *
   * @param connectionType - The connection type identifier to validate options for
   * @param options - The connection-specific configuration options (not used, config param contains all)
   * @param config - Full search module configuration containing connection-specific settings
   *
   * @throws {Error} If required configuration is missing or invalid
   *
   * @protected
   * @override Optional template method from BaseFactory
   *
   * @example
   * ```typescript
   * // Valid Elasticsearch configuration
   * this.validateDriverOptions(
   *   'elasticsearch',
   *   undefined,
   *   {
   *     connection: SearchConnectionType.ELASTICSEARCH,
   *     elasticsearch: { node: 'http://localhost:9200' }
   *   }
   * );
   * // No error thrown
   *
   * // Invalid Elasticsearch (no node specified)
   * this.validateDriverOptions(
   *   'elasticsearch',
   *   undefined,
   *   { connection: SearchConnectionType.ELASTICSEARCH, elasticsearch: {} }
   * );
   * // Throws: Error: Elasticsearch requires at least one node to be configured
   *
   * // Invalid Meilisearch (no host)
   * this.validateDriverOptions(
   *   'meilisearch',
   *   undefined,
   *   { connection: SearchConnectionType.MEILISEARCH, meilisearch: {} }
   * );
   * // Throws: Error: Meilisearch requires host to be configured
   * ```
   */
  protected validateDriverOptions(
    connectionType: string,
    options?: any,
    config?: SearchModuleOptions,
  ): void {
    /** Skip validation if no configuration is provided */
    if (!config) return;

    /** Reference configuration for easier access */
    const opts = config;

    switch (connectionType) {
      case SearchConnectionType.ELASTICSEARCH:
        /**
         * Elasticsearch validation:
         * - Requires elasticsearch configuration object
         * - Must have at least one node (single node or multi-node array)
         */
        if (!opts.elasticsearch) {
          throw new Error('Elasticsearch configuration is required');
        }
        if (!opts.elasticsearch.node && !opts.elasticsearch.nodes) {
          throw new Error('Elasticsearch requires at least one node to be configured');
        }
        break;

      case SearchConnectionType.MEILISEARCH:
        /**
         * Meilisearch validation:
         * - Requires meilisearch configuration object
         * - Must have host URL specified
         */
        if (!opts.meilisearch) {
          throw new Error('Meilisearch configuration is required');
        }
        if (!opts.meilisearch.host) {
          throw new Error('Meilisearch requires host to be configured');
        }
        break;

      default:
        /**
         * Unsupported connection types should be caught earlier,
         * but this provides a final safety check.
         */
        throw new Error(`Unsupported connection type: ${connectionType}`);
    }
  }
}
