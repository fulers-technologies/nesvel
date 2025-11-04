import { MeiliSearch } from 'meilisearch';
import { Module, DynamicModule, Provider } from '@nestjs/common';
import { Client as ElasticsearchClient } from '@elastic/elasticsearch';

import type {
  SearchModuleOptions,
  SearchModuleAsyncOptions,
  SearchModuleOptionsFactory,
} from '@/interfaces';

import { SEARCH_OPTIONS } from '@/constants';
import { SearchConnectionType } from '@/enums';
import { SEARCH_SERVICE } from '@/decorators';
import { SearchQueryBuilder } from '@/builders';
import { SearchableSubscriber } from '@/subscribers';
import { SearchService, SEARCH_PROVIDER } from '@/services';
import { ElasticsearchProvider, MeilisearchProvider } from '@/providers';

/**
 * Search Module
 *
 * Dynamic NestJS module that provides search engine integration.
 * Supports both Elasticsearch and Meilisearch with automatic entity synchronization.
 *
 * @example
 * ```typescript
 * // Synchronous configuration
 * @Module({
 *   imports: [
 *     SearchModule.forRoot({
 *       connection: SearchConnectionType.ELASTICSEARCH,
 *       elasticsearch: {
 *         node: 'http://localhost:9200',
 *       },
 *     }),
 *   ],
 * })
 * export class AppModule {}
 * ```
 *
 * @example
 * ```typescript
 * // Asynchronous configuration
 * @Module({
 *   imports: [
 *     SearchModule.forRootAsync({
 *       imports: [ConfigModule],
 *       useFactory: (config: ConfigService) => ({
 *         connection: SearchConnectionType.ELASTICSEARCH,
 *         elasticsearch: {
 *           node: config.get('ELASTICSEARCH_NODE'),
 *         },
 *       }),
 *       inject: [ConfigService],
 *     }),
 *   ],
 * })
 * export class AppModule {}
 * ```
 *
 * @author Nesvel
 * @since 1.0.0
 */
@Module({})
export class SearchModule {
  /**
   * Register the search module with synchronous configuration
   */
  static forRoot(options: SearchModuleOptions): DynamicModule {
    const providers = this.createProviders(options);

    return {
      module: SearchModule,
      global: true,
      providers,
      exports: [SEARCH_SERVICE, SearchQueryBuilder],
    };
  }

  /**
   * Register the search module with asynchronous configuration
   */
  static forRootAsync(options: SearchModuleAsyncOptions): DynamicModule {
    const providers: Provider[] = [
      ...this.createAsyncProviders(options),
      {
        provide: SEARCH_PROVIDER,
        useFactory: (opts: SearchModuleOptions) => {
          return this.createSearchProvider(opts);
        },
        inject: [SEARCH_OPTIONS],
      },
      {
        provide: SEARCH_SERVICE,
        useClass: SearchService,
      },
      SearchQueryBuilder,
      SearchableSubscriber,
    ];

    return {
      module: SearchModule,
      global: options.isGlobal ?? true,
      imports: options.imports || [],
      providers,
      exports: [SEARCH_SERVICE, SearchQueryBuilder],
    };
  }

  /**
   * Create providers for synchronous configuration
   */
  private static createProviders(options: SearchModuleOptions): Provider[] {
    const searchProvider = this.createSearchProvider(options);

    return [
      {
        provide: SEARCH_OPTIONS,
        useValue: options,
      },
      {
        provide: SEARCH_PROVIDER,
        useValue: searchProvider,
      },
      {
        provide: SEARCH_SERVICE,
        useClass: SearchService,
      },
      SearchQueryBuilder,
      SearchableSubscriber,
    ];
  }

  /**
   * Create async providers for asynchronous configuration
   */
  private static createAsyncProviders(options: SearchModuleAsyncOptions): Provider[] {
    if (options.useFactory) {
      return [
        {
          provide: SEARCH_OPTIONS,
          useFactory: options.useFactory,
          inject: options.inject || [],
        },
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
      ];
    }

    throw new Error(
      'Invalid SearchModuleAsyncOptions: must provide useFactory, useClass, or useExisting',
    );
  }

  /**
   * Create the appropriate search provider based on connection type
   */
  private static createSearchProvider(options: SearchModuleOptions): any {
    switch (options.connection) {
      case SearchConnectionType.ELASTICSEARCH:
        return this.createElasticsearchProvider(options);

      case SearchConnectionType.MEILISEARCH:
        return this.createMeilisearchProvider(options);

      default:
        throw new Error(`Unsupported search connection type: ${options.connection}`);
    }
  }

  /**
   * Create Elasticsearch provider
   */
  private static createElasticsearchProvider(options: SearchModuleOptions): ElasticsearchProvider {
    if (!options.elasticsearch) {
      throw new Error(
        'Elasticsearch configuration is required when using ELASTICSEARCH connection type',
      );
    }

    const client = new ElasticsearchClient(options.elasticsearch);
    return new ElasticsearchProvider(client);
  }

  /**
   * Create Meilisearch provider
   */
  private static createMeilisearchProvider(options: SearchModuleOptions): MeilisearchProvider {
    if (!options.meilisearch) {
      throw new Error(
        'Meilisearch configuration is required when using MEILISEARCH connection type',
      );
    }

    const client = new MeiliSearch(options.meilisearch);

    return new MeilisearchProvider(client);
  }
}
