import { Module, DynamicModule } from '@nestjs/common';

import type {
  SearchModuleOptions,
  SearchModuleAsyncOptions,
  IndexRegistrationOptions,
} from '@/interfaces';

import {
  IndexListCommand,
  IndexStatusCommand,
  IndexClearCommand,
  IndexCreateCommand,
  IndexDeleteCommand,
  IndexReindexCommand,
} from '@/console/commands';
import { SEARCH_SERVICE } from '@/constants';
import { SearchModuleFactory } from '@/factories';
import { IndexRegistryService, SearchService } from '@/services';

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
   * @param options - Module configuration options
   * @returns Dynamic module definition
   */
  static forRoot(options: SearchModuleOptions): DynamicModule {
    return {
      module: SearchModule,
      global: true,
      providers: SearchModuleFactory.createProviders(options),
      exports: [SEARCH_SERVICE, IndexRegistryService],
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
   */
  static forRootAsync(options: SearchModuleAsyncOptions): DynamicModule {
    return {
      module: SearchModule,
      global: options.isGlobal ?? true,
      imports: options.imports || [],
      providers: SearchModuleFactory.createAsyncProviders(options),
      exports: [SEARCH_SERVICE, IndexRegistryService],
    };
  }
}
