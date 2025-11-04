import { Provider } from '@nestjs/common';
import { MeiliSearch } from 'meilisearch';
import { Client as ElasticsearchClient } from '@elastic/elasticsearch';

import type {
  SearchModuleOptions,
  SearchModuleAsyncOptions,
  SearchModuleOptionsFactory,
} from '@/interfaces';

import {
  IndexListCommand,
  IndexStatusCommand,
  IndexCreateCommand,
  IndexDeleteCommand,
  IndexClearCommand,
  IndexReindexCommand,
} from '@/console/commands';
import { SEARCH_OPTIONS } from '@/constants';
import { SearchConnectionType } from '@/enums';
import { SearchableSubscriber } from '@/subscribers';
import { SEARCH_PROVIDER, SEARCH_SERVICE } from '@/constants';
import { ElasticsearchProvider, MeilisearchProvider } from '@/providers';
import { SearchService, IndexRegistryService, IndexNamingService } from '@/services';

/**
 * Search Module Factory
 *
 * Factory class responsible for creating providers for the SearchModule.
 * Handles both synchronous and asynchronous module configuration,
 * provider instantiation, and dependency management.
 *
 * **Responsibilities**:
 * - Create search providers (Elasticsearch/Meilisearch)
 * - Generate provider arrays for module registration
 * - Handle async configuration options
 *
 * **Note**: CLI commands are registered in the static @Module() decorator,
 * not through this factory.
 *
 * @author Nesvel
 * @since 1.0.0
 */
export class SearchModuleFactory {
  /**
   * Create providers for synchronous configuration
   *
   * Generates all required providers including:
   * - Search options
   * - Search provider (Elasticsearch/Meilisearch)
   * - Search service
   * - Registry and naming services
   * - Subscriber
   *
   * @param options - Module configuration options
   * @returns Array of providers
   */
  static createProviders(options: SearchModuleOptions): Provider[] {
    return [
      {
        provide: SEARCH_OPTIONS,
        useValue: options,
      },
      IndexNamingService,
      {
        provide: SEARCH_PROVIDER,
        useFactory: (namingService: IndexNamingService) => {
          return SearchModuleFactory.createSearchProvider(options, namingService);
        },
        inject: [IndexNamingService],
      },
      {
        provide: SEARCH_SERVICE,
        useClass: SearchService,
      },
      IndexRegistryService,
      SearchableSubscriber,

      // CLI Commands
      IndexListCommand,
      IndexStatusCommand,
      IndexCreateCommand,
      IndexDeleteCommand,
      IndexClearCommand,
      IndexReindexCommand,
    ];
  }

  /**
   * Create providers for asynchronous configuration
   *
   * Handles three types of async configuration:
   * - useFactory: Factory function with dependencies
   * - useClass: Options factory class
   * - useExisting: Existing options factory
   *
   * @param options - Async module configuration options
   * @returns Array of providers
   *
   * @throws {Error} If invalid configuration is provided
   */
  static createAsyncProviders(options: SearchModuleAsyncOptions): Provider[] {
    const baseProviders: Provider[] = [
      IndexNamingService,
      {
        provide: SEARCH_PROVIDER,
        useFactory: (opts: SearchModuleOptions, namingService: IndexNamingService) => {
          return this.createSearchProvider(opts, namingService);
        },
        inject: [SEARCH_OPTIONS, IndexNamingService],
      },
      {
        provide: SEARCH_SERVICE,
        useClass: SearchService,
      },
      IndexRegistryService,
      SearchableSubscriber,

      // CLI Commands
      IndexListCommand,
      IndexStatusCommand,
      IndexCreateCommand,
      IndexDeleteCommand,
      IndexClearCommand,
      IndexReindexCommand,
    ];

    if (options.useFactory) {
      return [
        {
          provide: SEARCH_OPTIONS,
          useFactory: options.useFactory,
          inject: options.inject || [],
        },
        ...baseProviders,
      ];
    }

    if (options.useClass) {
      return [
        {
          provide: SEARCH_OPTIONS,
          useFactory: async (optionsFactory: SearchModuleOptionsFactory) => {
            return optionsFactory.createSearchModuleOptions();
          },
          inject: [options.useClass],
        },
        {
          provide: options.useClass,
          useClass: options.useClass,
        },
        ...baseProviders,
      ];
    }

    if (options.useExisting) {
      return [
        {
          provide: SEARCH_OPTIONS,
          useFactory: async (optionsFactory: SearchModuleOptionsFactory) => {
            return optionsFactory.createSearchModuleOptions();
          },
          inject: [options.useExisting],
        },
        ...baseProviders,
      ];
    }

    throw new Error(
      'Invalid SearchModuleAsyncOptions: must provide useFactory, useClass, or useExisting',
    );
  }

  /**
   * Create the appropriate search provider based on connection type
   *
   * Factory method that instantiates the correct provider (Elasticsearch or Meilisearch)
   * based on the configured connection type.
   *
   * @param options - Module configuration options
   * @param namingService - Index naming service for generating index names
   * @returns Instantiated search provider
   *
   * @throws {Error} If unsupported connection type is provided
   *
   * @private
   */
  static createSearchProvider(
    options: SearchModuleOptions,
    namingService: IndexNamingService,
  ): ElasticsearchProvider | MeilisearchProvider {
    switch (options.connection) {
      case SearchConnectionType.ELASTICSEARCH:
        return this.createElasticsearchProvider(options, namingService);

      case SearchConnectionType.MEILISEARCH:
        return this.createMeilisearchProvider(options, namingService);

      default:
        throw new Error(`Unsupported search connection type: ${options.connection}`);
    }
  }

  /**
   * Create Elasticsearch provider
   *
   * Instantiates an Elasticsearch client and wraps it in the provider.
   *
   * @param options - Module configuration options
   * @param namingService - Index naming service for generating index names
   * @returns Elasticsearch provider instance
   *
   * @throws {Error} If Elasticsearch configuration is missing
   *
   * @private
   */
  private static createElasticsearchProvider(
    options: SearchModuleOptions,
    namingService: IndexNamingService,
  ): ElasticsearchProvider {
    if (!options.elasticsearch) {
      throw new Error(
        'Elasticsearch configuration is required when using ELASTICSEARCH connection type',
      );
    }

    const client = new ElasticsearchClient(options.elasticsearch);
    return new ElasticsearchProvider(client, undefined, namingService);
  }

  /**
   * Create Meilisearch provider
   *
   * Instantiates a Meilisearch client and wraps it in the provider.
   *
   * @param options - Module configuration options
   * @param namingService - Index naming service for generating index names
   * @returns Meilisearch provider instance
   *
   * @throws {Error} If Meilisearch configuration is missing
   *
   * @private
   */
  private static createMeilisearchProvider(
    options: SearchModuleOptions,
    namingService: IndexNamingService,
  ): MeilisearchProvider {
    if (!options.meilisearch) {
      throw new Error(
        'Meilisearch configuration is required when using MEILISEARCH connection type',
      );
    }

    const client = new MeiliSearch(options.meilisearch);
    return new MeilisearchProvider(client, undefined, namingService);
  }
}
