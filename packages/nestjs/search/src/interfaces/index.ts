/**
 * Search Interfaces
 *
 * Exports all interface definitions for the search module.
 *
 * @module Interfaces
 */

// Core interfaces
export * from './search-module-options.interface';
export * from './search-module-async-options.interface';
export * from './search-module-options-factory.interface';
export * from './search-provider.interface';

// Registration interfaces
export * from './index-registration.interface';
export * from './index-registration-options.interface';

// Query interfaces
export * from './query-builder.interface';
export * from './search-options.interface';
export * from './where-clause.interface';
export * from './order-by-clause.interface';
export * from './aggregation-clause.interface';

// Response interfaces
export * from './search-response.interface';
export * from './search-result.interface';
export * from './paginated-response.interface';

// Document interfaces
export * from './search-document.interface';

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
