import type { ModuleMetadata, Type } from '@nestjs/common';

import type { SearchModuleOptions } from './search-module-options.interface';
import type { SearchModuleOptionsFactory } from './search-module-options-factory.interface';

/**
 * Search Module Async Options Interface
 *
 * Configuration for async module initialization.
 * Supports multiple patterns: useFactory, useClass, useExisting.
 *
 * @example
 * ```typescript
 * // Using factory
 * SearchModule.forRootAsync({
 *   imports: [ConfigModule],
 *   useFactory: (config: ConfigService) => ({
 *     connection: SearchConnectionType.ELASTICSEARCH,
 *     elasticsearch: { node: config.get('ES_NODE') },
 *   }),
 *   inject: [ConfigService],
 * });
 * ```
 *
 * @example
 * ```typescript
 * // Using class
 * SearchModule.forRootAsync({
 *   useClass: SearchConfigService,
 * });
 * ```
 *
 * @author Nesvel
 * @since 1.0.0
 */
export interface SearchModuleAsyncOptions extends Pick<ModuleMetadata, 'imports'> {
  /**
   * Factory function to create options
   */
  useFactory?: (...args: any[]) => Promise<SearchModuleOptions> | SearchModuleOptions;

  /**
   * Dependencies to inject into the factory function
   */
  inject?: any[];

  /**
   * Use an existing class to provide options
   */
  useExisting?: Type<SearchModuleOptionsFactory>;

  /**
   * Use a class to provide options
   */
  useClass?: Type<SearchModuleOptionsFactory>;

  /**
   * Whether the module is global
   * @default false
   */
  isGlobal?: boolean;
}
