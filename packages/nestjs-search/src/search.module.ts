import { Module, DynamicModule, Provider } from '@nestjs/common';

import type {
  SearchModuleOptions,
  SearchModuleAsyncOptions,
  SearchModuleOptionsFactory,
  IndexRegistrationOptions,
} from '@/interfaces';

import { ConsoleModule } from '@/console/console.module';
import { SEARCH_OPTIONS, SEARCH_PROVIDER, SEARCH_SERVICE } from '@/constants';
import {
  IndexRegistryService,
  SearchService,
  SearchFactoryService,
  IndexNamingService,
} from '@/services';

/**
 * Search Module
 *
 * Dynamic NestJS module that provides search engine integration.
 * Supports both Elasticsearch and Meilisearch with automatic entity synchronization.
 *
 * **Features**:
 * - Elasticsearch and Meilisearch support
 * - Automatic entity synchronization
 * - CLI commands for index management
 * - Query builder pattern (stateless)
 *
 * **CLI Commands**:
 * - `index:list` - List all indices
 * - `index:status <index>` - Show index status
 * - `index:create <index>` - Create new index
 * - `index:delete <index>` - Delete index
 * - `index:clear <index>` - Clear all documents
 * - `index:reindex <index>` - Rebuild index
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
 * @example
 * ```typescript
 * // Register indices (similar to BullModule.registerQueue)
 * @Module({
 *   imports: [
 *     SearchModule.forRoot({ ... }),
 *     SearchModule.registerIndex({
 *       name: 'products',
 *       alias: 'products_v1',
 *       elasticsearch: {
 *         numberOfShards: 3,
 *         numberOfReplicas: 2,
 *         mappings: {
 *           properties: {
 *             name: { type: 'text' },
 *             price: { type: 'float' },
 *           },
 *         },
 *       },
 *     }),
 *     SearchModule.registerIndex({
 *       name: 'orders',
 *       meilisearch: {
 *         searchableAttributes: ['customerName', 'orderNumber'],
 *         filterableAttributes: ['status', 'total'],
 *       },
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
   *
   * Creates a dynamic module with the provided options.
   * The configuration is available immediately and doesn't depend on
   * other providers or services.
   *
   * @param options - Module configuration options
   * @returns Dynamic module definition
   *
   * @example
   * ```typescript
   * SearchModule.forRoot({
   *   connection: SearchConnectionType.ELASTICSEARCH,
   *   elasticsearch: {
   *     node: 'http://localhost:9200'
   *   },
   *   global: true
   * })
   * ```
   */
  static forRoot(options: SearchModuleOptions): DynamicModule {
    // Create providers
    const providers = this.createProviders(options);

    return {
      module: SearchModule,
      global: options.isGlobal ?? true,
      imports: [ConsoleModule],
      providers,
      exports: [SEARCH_SERVICE, SearchService, IndexRegistryService],
    };
  }

  /**
   * Register an index with configuration
   *
   * Similar to BullModule.registerQueue(), this method allows you to
   * declaratively register search indices with provider-specific settings.
   *
   * **Features**:
   * - Auto-create indices on startup
   * - Provider-specific configurations (Elasticsearch/Meilisearch)
   * - Index aliases support
   * - Custom mappings and analysis
   *
   * @param options - Index registration options
   * @returns Dynamic module definition
   *
   * @example
   * ```typescript
   * @Module({
   *   imports: [
   *     SearchModule.forRoot({ ... }),
   *     SearchModule.registerIndex({
   *       name: 'products',
   *       elasticsearch: {
   *         numberOfShards: 3,
   *         mappings: {
   *           properties: {
   *             name: { type: 'text' },
   *             price: { type: 'float' },
   *           },
   *         },
   *       },
   *     }),
   *   ],
   * })
   * ```
   */
  static registerIndex(options: IndexRegistrationOptions): DynamicModule {
    return {
      module: SearchModule,
      providers: [
        {
          provide: 'INDEX_REGISTRATION_' + options.name,
          useFactory: (registry: IndexRegistryService) => {
            registry.register(options);
            return options;
          },
          inject: [IndexRegistryService],
        },
      ],
    };
  }

  /**
   * Register multiple indices at once
   *
   * Convenience method for registering multiple indices.
   *
   * @param options - Array of index registration options
   * @returns Dynamic module definition
   *
   * @example
   * ```typescript
   * SearchModule.registerIndices([
   *   { name: 'products', ... },
   *   { name: 'orders', ... },
   *   { name: 'users', ... },
   * ])
   * ```
   */
  static registerIndices(optionsArray: IndexRegistrationOptions[]): DynamicModule {
    return {
      module: SearchModule,
      providers: optionsArray.map((options) => ({
        provide: 'INDEX_REGISTRATION_' + options.name,
        useFactory: (registry: IndexRegistryService) => {
          registry.register(options);
          return options;
        },
        inject: [IndexRegistryService],
      })),
    };
  }

  /**
   * Register the search module with asynchronous configuration
   *
   * Creates a dynamic module where the configuration is provided asynchronously,
   * typically through a factory function that depends on other providers like ConfigService.
   *
   * Supports three configuration patterns:
   * - useFactory: Factory function with dependency injection
   * - useClass: Class implementing SearchModuleOptionsFactory
   * - useExisting: Existing provider implementing SearchModuleOptionsFactory
   *
   * @param options - Asynchronous configuration options
   * @returns Dynamic module definition
   *
   * @example
   * Using factory:
   * ```typescript
   * SearchModule.forRootAsync({
   *   useFactory: (config: ConfigService) => ({
   *     connection: config.get('SEARCH_CONNECTION'),
   *     elasticsearch: { node: config.get('ES_NODE') }
   *   }),
   *   inject: [ConfigService]
   * })
   * ```
   */
  static forRootAsync(options: SearchModuleAsyncOptions): DynamicModule {
    // Create async providers
    const asyncProviders = this.createAsyncProviders(options);

    // Create core providers
    const coreProviders = this.createCoreProviders();

    return {
      module: SearchModule,
      global: options.isGlobal ?? true,
      imports: [ConsoleModule, ...(options.imports || [])],
      providers: [...asyncProviders, ...coreProviders],
      exports: [SEARCH_SERVICE, SearchService, IndexRegistryService],
    };
  }

  /**
   * Creates the core providers for the module
   *
   * These providers include:
   * - Options provider (configuration)
   * - Provider (search backend)
   * - Service provider (main Search service)
   * - Factory service (provider factory)
   * - Registry and naming services
   *
   * @param options - The module configuration options
   * @returns An array of providers
   *
   * @private
   */
  private static createProviders(options: SearchModuleOptions): Provider[] {
    return [
      // Options provider
      {
        provide: SEARCH_OPTIONS,
        useValue: options,
      },

      // Factory service
      SearchFactoryService,
      IndexNamingService,
      IndexRegistryService,

      // Provider
      {
        provide: SEARCH_PROVIDER,
        useFactory: (factory: SearchFactoryService) => {
          factory.validateOptions(options);
          return factory.createProvider(options);
        },
        inject: [SearchFactoryService],
      },

      // Service provider
      {
        provide: SEARCH_SERVICE,
        useClass: SearchService,
      },

      // Export service with class token as well
      {
        provide: SearchService,
        useExisting: SEARCH_SERVICE,
      },
    ];
  }

  /**
   * Creates the core providers without options (for async configuration)
   *
   * These providers depend on the async options provider created separately.
   *
   * @returns An array of providers
   *
   * @private
   */
  private static createCoreProviders(): Provider[] {
    return [
      // Factory service
      SearchFactoryService,
      IndexNamingService,
      IndexRegistryService,

      // Provider
      {
        provide: SEARCH_PROVIDER,
        useFactory: (options: SearchModuleOptions, factory: SearchFactoryService) => {
          factory.validateOptions(options);
          return factory.createProvider(options);
        },
        inject: [SEARCH_OPTIONS, SearchFactoryService],
      },

      // Service provider
      {
        provide: SEARCH_SERVICE,
        useClass: SearchService,
      },

      // Export service with class token as well
      {
        provide: SearchService,
        useExisting: SEARCH_SERVICE,
      },
    ];
  }

  /**
   * Creates async providers for module configuration
   *
   * Handles three configuration patterns:
   * - useFactory: Creates options using a factory function
   * - useClass: Creates options using a factory class
   * - useExisting: Uses an existing factory provider
   *
   * @param options - The async configuration options
   * @returns An array of providers
   *
   * @private
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
          useFactory: async (factory: SearchModuleOptionsFactory) => {
            return factory.createSearchModuleOptions();
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
          useFactory: async (factory: SearchModuleOptionsFactory) => {
            return factory.createSearchModuleOptions();
          },
          inject: [options.useExisting],
        },
      ];
    }

    throw new Error(
      'Invalid async configuration. Must provide useFactory, useClass, or useExisting.',
    );
  }
}
