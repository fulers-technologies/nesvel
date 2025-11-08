import type { SearchModuleOptions } from './search-module-options.interface';

/**
 * Search Module Options Factory Interface
 *
 * Interface for classes that create search module options dynamically.
 * Used for async module configuration.
 *
 * @example
 * ```typescript
 * @Injectable()
 * export class SearchConfigService implements SearchModuleOptionsFactory {
 *   constructor(private configService: ConfigService) {}
 *
 *   createSearchModuleOptions(): SearchModuleOptions {
 *     return {
 *       connection: SearchConnectionType.ELASTICSEARCH,
 *       elasticsearch: {
 *         node: this.configService.get('ELASTICSEARCH_NODE'),
 *       },
 *     };
 *   }
 * }
 * ```
 *
 * @author Nesvel
 * @since 1.0.0
 */
export interface SearchModuleOptionsFactory {
  /**
   * Create search module options
   *
   * @returns Search module options (can be async)
   */
  createSearchModuleOptions(): Promise<SearchModuleOptions> | SearchModuleOptions;
}
