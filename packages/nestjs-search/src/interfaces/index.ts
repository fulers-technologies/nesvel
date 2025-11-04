/**
 * Interfaces Module
 *
 * Exports all interface definitions used in the nestjs-search package.
 * Organized by functionality: core search, module configuration, and query building.
 *
 * @author Nesvel
 * @since 1.0.0
 */

/**
 * Core Search Interfaces
 *
 * Base interfaces for search providers, documents, and results.
 * These define the contract for search engine implementations.
 */
export * from './search-provider.interface';
export * from './search-document.interface';
export * from './search-result.interface';
export * from './search-response.interface';
export * from './search-options.interface';

/**
 * Module Configuration Interfaces
 *
 * Interfaces for configuring the Search Module with both
 * synchronous and asynchronous options.
 */
export * from './search-module-options.interface';
export * from './search-module-async-options.interface';
export * from './search-module-options-factory.interface';

/**
 * Index Registration Interfaces
 *
 * Interfaces for declaratively registering search indices with
 * provider-specific configurations (similar to BullModule.registerQueue).
 */
export * from './index-registration.interface';
export * from './index-registration-options.interface';

/**
 * Query Builder Interfaces
 *
 * Type-safe fluent API interfaces for building complex search queries
 * with support for where clauses, ordering, and aggregations.
 */
export * from './query-builder.interface';
export * from './where-clause.interface';
export * from './order-by-clause.interface';
export * from './aggregation-clause.interface';
export * from './paginated-response.interface';

/**
 * Type Aliases
 *
 * Convenient type aliases for common interfaces.
 */
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
