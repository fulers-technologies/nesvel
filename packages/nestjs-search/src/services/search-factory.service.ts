import { Injectable, Logger } from '@nestjs/common';
import { Client as ElasticsearchClient } from '@elastic/elasticsearch';
import { MeiliSearch } from 'meilisearch';

import type { SearchModuleOptions } from '@/interfaces';
import { SearchConnectionType } from '@/enums';
import { ElasticsearchProvider, MeilisearchProvider } from '@/providers';

/**
 * Factory service for creating and configuring Search provider instances.
 *
 * This service is responsible for:
 * - Instantiating the appropriate provider based on configuration (Elasticsearch/Meilisearch)
 * - Validating provider options
 * - Providing a centralized point for provider creation
 * - Supporting custom provider implementations
 *
 * The factory pattern allows for flexible provider selection and makes it easy
 * to add new provider implementations without modifying existing code.
 *
 * @author Nesvel
 * @since 1.0.0
 */
@Injectable()
export class SearchFactoryService {
  /**
   * Logger instance for factory operations
   */
  private readonly logger = new Logger(SearchFactoryService.name);

  /**
   * Registry of available provider constructors
   * Maps connection type to their corresponding provider creation functions
   */
  private readonly providerRegistry = new Map<
    SearchConnectionType,
    (options: SearchModuleOptions) => any
  >([
    [SearchConnectionType.ELASTICSEARCH, this.createElasticsearchProvider.bind(this)],
    [SearchConnectionType.MEILISEARCH, this.createMeilisearchProvider.bind(this)],
  ]);

  /**
   * Creates a provider instance based on the provided options
   *
   * This method:
   * - Validates the connection type
   * - Retrieves the appropriate provider factory from the registry
   * - Instantiates the provider with the provided options
   * - Returns the configured provider instance
   *
   * @param options - The Search module configuration options
   * @returns A configured provider instance (ElasticsearchProvider or MeilisearchProvider)
   *
   * @throws {Error} If the connection type is not supported or instantiation fails
   *
   * @example
   * ```typescript
   * const provider = factory.createProvider({
   *   connection: SearchConnectionType.ELASTICSEARCH,
   *   elasticsearch: { node: 'http://localhost:9200' }
   * });
   * ```
   */
  createProvider(options: SearchModuleOptions): ElasticsearchProvider | MeilisearchProvider {
    const connectionType = options.connection;

    // Validate connection type
    if (!this.providerRegistry.has(connectionType)) {
      const availableTypes = Array.from(this.providerRegistry.keys());
      throw new Error(
        `Unsupported search connection type: ${connectionType}. Available types: ${availableTypes.join(', ')}`,
      );
    }

    try {
      // Get provider factory from registry
      const providerFactory = this.providerRegistry.get(connectionType)!;

      // Create provider instance
      const provider = providerFactory(options);

      this.logger.log(`Created ${connectionType} provider instance`);

      return provider;
    } catch (error: Error | any) {
      this.logger.error(`Failed to create ${connectionType} provider:`, error);
      throw error;
    }
  }

  /**
   * Validates Search module options before provider creation
   *
   * This method performs validation checks on the provided options to ensure
   * they meet the minimum requirements for provider creation.
   *
   * @param options - The options to validate
   * @throws {Error} If the options are invalid
   *
   * @example
   * ```typescript
   * try {
   *   factory.validateOptions(options);
   *   const provider = factory.createProvider(options);
   * } catch (error: Error | any) {
   *   console.error('Invalid options:', error);
   * }
   * ```
   */
  validateOptions(options: SearchModuleOptions): void {
    if (!options) {
      throw new Error('Search module options are required');
    }

    if (!options.connection) {
      throw new Error('Connection type is required in Search module options');
    }

    // Validate connection-specific options
    this.validateConnectionOptions(options);
  }

  /**
   * Checks if a connection type is supported
   *
   * This method can be used to verify if a connection type is available
   * before attempting to create it.
   *
   * @param connectionType - The connection type to check
   * @returns true if the connection type is supported, false otherwise
   *
   * @example
   * ```typescript
   * if (factory.hasConnectionType(SearchConnectionType.ELASTICSEARCH)) {
   *   const provider = factory.createProvider({ connection: SearchConnectionType.ELASTICSEARCH, ... });
   * }
   * ```
   */
  hasConnectionType(connectionType: SearchConnectionType): boolean {
    return this.providerRegistry.has(connectionType);
  }

  /**
   * Gets the list of all supported connection types
   *
   * This method returns an array of connection type identifiers that are
   * currently available for use.
   *
   * @returns An array of supported connection types
   *
   * @example
   * ```typescript
   * const types = factory.getAvailableConnectionTypes();
   * console.log('Available connection types:', types);
   * // Output: ['elasticsearch', 'meilisearch']
   * ```
   */
  getAvailableConnectionTypes(): SearchConnectionType[] {
    return Array.from(this.providerRegistry.keys());
  }

  /**
   * Creates an Elasticsearch provider instance
   *
   * Instantiates an Elasticsearch client and wraps it in the provider.
   *
   * @param options - Module configuration options
   * @returns Elasticsearch provider instance
   *
   * @throws {Error} If Elasticsearch configuration is missing
   *
   * @private
   */
  private createElasticsearchProvider(options: SearchModuleOptions): ElasticsearchProvider {
    if (!options.elasticsearch) {
      throw new Error(
        'Elasticsearch configuration is required when using ELASTICSEARCH connection type',
      );
    }

    const client = new ElasticsearchClient(options.elasticsearch);
    return new ElasticsearchProvider(client);
  }

  /**
   * Creates a Meilisearch provider instance
   *
   * Instantiates a Meilisearch client and wraps it in the provider.
   *
   * @param options - Module configuration options
   * @returns Meilisearch provider instance
   *
   * @throws {Error} If Meilisearch configuration is missing
   *
   * @private
   */
  private createMeilisearchProvider(options: SearchModuleOptions): MeilisearchProvider {
    if (!options.meilisearch) {
      throw new Error(
        'Meilisearch configuration is required when using MEILISEARCH connection type',
      );
    }

    const client = new MeiliSearch(options.meilisearch);
    return new MeilisearchProvider(client);
  }

  /**
   * Validates connection-specific options
   *
   * This method performs validation checks specific to each connection type,
   * ensuring that required options are provided and have valid values.
   *
   * @param options - The Search module configuration options
   * @throws {Error} If the connection options are invalid
   *
   * @private
   */
  private validateConnectionOptions(options: SearchModuleOptions): void {
    switch (options.connection) {
      case SearchConnectionType.ELASTICSEARCH:
        if (!options.elasticsearch) {
          throw new Error('Elasticsearch configuration is required');
        }
        if (!options.elasticsearch.node && !options.elasticsearch.nodes) {
          throw new Error('Elasticsearch requires at least one node to be configured');
        }
        break;

      case SearchConnectionType.MEILISEARCH:
        if (!options.meilisearch) {
          throw new Error('Meilisearch configuration is required');
        }
        if (!options.meilisearch.host) {
          throw new Error('Meilisearch requires host to be configured');
        }
        break;

      default:
        throw new Error(`Unsupported connection type: ${options.connection}`);
    }
  }
}
