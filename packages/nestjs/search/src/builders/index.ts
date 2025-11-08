/**
 * Builders Module
 *
 * Exports all query builder classes and utilities for constructing
 * search queries using a fluent, Laravel Eloquent-inspired API.
 *
 * **Main Exports**:
 * - `SearchQueryBuilder` - Primary entry point for building queries
 * - `BaseQueryBuilder` - Abstract base class (for advanced use)
 *
 * **Usage**: Most users will only need `SearchQueryBuilder`.
 *
 * @author Nesvel
 * @since 1.0.0
 *
 * @example
 * ```typescript
 * import { SearchQueryBuilder } from '@nesvel/nestjs-search';
 *
 * const products = await SearchQueryBuilder
 *   .for<Product>()
 *   .index('products')
 *   .where('status', 'active')
 *   .orderBy('price', 'asc')
 *   .get();
 * ```
 */

export * from './base-query.builder';
export * from './search-query.builder';

export * from './meilisearch';
export * from './elasticsearch';
