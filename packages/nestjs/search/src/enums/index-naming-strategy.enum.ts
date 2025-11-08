/**
 * Index Naming Strategy Enum
 *
 * Defines the available strategies for generating index names in the search module.
 *
 * **Strategies**:
 * - `SIMPLE`: Direct index names (e.g., 'nesvel_products')
 * - `TIME_STAMPED`: Adds timestamp suffix (e.g., 'nesvel_products_20231104_153422') with alias 'nesvel_products'
 * - `VERSIONED`: Adds version suffix (e.g., 'nesvel_products_v1') with alias 'nesvel_products'
 *
 * When using `TIME_STAMPED` or `VERSIONED` strategies, an alias matching the
 * prefixed base name is automatically created, enabling:
 * - Zero-downtime reindexing
 * - Easy rollback
 * - Multiple index versions
 *
 * @example
 * ```typescript
 * import { IndexNamingStrategy } from '@nesvel/nestjs-search';
 *
 * const config = {
 *   indexNamingStrategy: IndexNamingStrategy.TIME_STAMPED,
 *   // ...
 * };
 * ```
 *
 * @author Nesvel
 * @since 1.0.0
 */
export enum IndexNamingStrategy {
  /**
   * Simple strategy - use index name as-is with prefix
   * Example: 'products' → 'nesvel_products'
   */
  SIMPLE = 'simple',

  /**
   * Timestamped strategy - append timestamp to index name
   * Example: 'products' → 'nesvel_products_20231104_153422'
   * Creates alias: 'nesvel_products'
   */
  TIME_STAMPED = 'timestamped',

  /**
   * Versioned strategy - append version number to index name
   * Example: 'products' → 'nesvel_products_v1'
   * Creates alias: 'nesvel_products'
   */
  VERSIONED = 'versioned',
}
