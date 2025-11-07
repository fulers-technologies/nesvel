import type { SearchModuleOptions } from './search-module-options.interface';

/**
 * Search Configuration
 *
 * Alias for SearchModuleOptions to provide a more intuitive name
 * when used in application configuration contexts.
 *
 * @example
 * ```typescript
 * const config: SearchConfig = {
 *   connection: SearchConnectionType.ELASTICSEARCH,
 *   elasticsearch: { node: 'http://localhost:9200' },
 * };
 * ```
 */
export interface SearchConfig extends SearchModuleOptions {}
