import { Injectable, Inject } from '@nestjs/common';
import { SEARCH_OPTIONS } from '@/constants';
import type { SearchModuleOptions } from '@/interfaces';
import { IndexNamingStrategy } from '@/enums';

/**
 * Index Naming Service
 *
 * Manages index naming strategies and alias generation for Elasticsearch-style
 * zero-downtime reindexing patterns.
 *
 * **Naming Strategies**:
 * - `simple`: Direct index names (e.g., 'products')
 * - `timestamped`: Adds timestamp suffix (e.g., 'products_20231104_153422')
 * - `versioned`: Adds version suffix (e.g., 'products_v1')
 *
 * When using `timestamped` or `versioned` strategies, an alias matching the
 * base name is automatically created, enabling:
 * - Zero-downtime reindexing
 * - Easy rollback
 * - Multiple index versions
 *
 * @example
 * ```typescript
 * // With timestamped strategy:
 * const physical = namingService.generatePhysicalIndexName('products');
 * // => 'products_20231104_153422'
 *
 * const alias = namingService.getAliasName('products');
 * // => 'products'
 *
 * // Use alias for all operations
 * await searchService.search(alias, 'query');
 * ```
 *
 * @author Nesvel
 * @since 1.0.0
 */
@Injectable()
export class IndexNamingService {
  /**
   * Current version counter for versioned strategy
   * In production, this should be persisted (database, config file, etc.)
   */
  private versionCounter: Map<string, number> = new Map();

  constructor(
    @Inject(SEARCH_OPTIONS)
    private readonly options: SearchModuleOptions,
  ) {}

  /**
   * Get the naming strategy from configuration
   *
   * @returns The configured naming strategy
   */
  getNamingStrategy(): IndexNamingStrategy {
    return this.options.indexNamingStrategy || IndexNamingStrategy.SIMPLE;
  }

  /**
   * Check if aliases should be used
   *
   * @returns True if the strategy uses aliases (timestamped or versioned)
   */
  shouldUseAliases(): boolean {
    const strategy = this.getNamingStrategy();
    return (
      strategy === IndexNamingStrategy.TIME_STAMPED || strategy === IndexNamingStrategy.VERSIONED
    );
  }

  /**
   * Generate physical index name based on naming strategy
   *
   * This generates the actual index name that will be created in the search engine.
   * Applies prefix first, then naming strategy suffix (timestamp/version).
   *
   * @param baseName - The base index name without prefix (e.g., 'products')
   * @param version - Optional version number (only used for 'versioned' strategy)
   *
   * @returns The physical index name with prefix and strategy suffix
   *
   * @example
   * ```typescript
   * // With prefix 'nesvel' and simple strategy
   * generatePhysicalIndexName('products') // => 'nesvel_products'
   *
   * // With prefix 'nesvel' and timestamped strategy
   * generatePhysicalIndexName('products') // => 'nesvel_products_20231104_153422'
   *
   * // With prefix 'nesvel' and versioned strategy
   * generatePhysicalIndexName('products', 2) // => 'nesvel_products_v2'
   * ```
   */
  generatePhysicalIndexName(baseName: string, version?: number): string {
    // Apply prefix first (if provided)
    const prefix = this.options.indexPrefix;
    const prefixedName = prefix ? `${prefix}_${baseName}` : baseName;

    // Then apply naming strategy
    const strategy = this.getNamingStrategy();

    switch (strategy) {
      case IndexNamingStrategy.TIME_STAMPED:
        return this.generateTimestampedName(prefixedName);

      case IndexNamingStrategy.VERSIONED:
        return this.generateVersionedName(prefixedName, version);

      case IndexNamingStrategy.SIMPLE:
      default:
        return prefixedName;
    }
  }

  /**
   * Get the alias name for an index
   *
   * For timestamped/versioned strategies, this returns the prefixed base name
   * which serves as the alias. For simple strategy, returns the same as physical name.
   *
   * @param baseName - The base index name without prefix (e.g., 'products')
   *
   * @returns The alias name with prefix
   *
   * @example
   * ```typescript
   * // With prefix 'nesvel'
   * getAliasName('products') // => 'nesvel_products'
   * ```
   */
  getAliasName(baseName: string): string {
    // Apply prefix to alias (if provided)
    const prefix = this.options.indexPrefix;
    return prefix ? `${prefix}_${baseName}` : baseName;
  }

  /**
   * Get the operational index name to use for operations
   *
   * This returns the name that should be used when performing operations like
   * search, delete, update, etc. For timestamped/versioned strategies, this
   * returns the alias name (so operations work against the latest version).
   * For simple strategy, this returns the physical index name.
   *
   * @param baseName - The base index name without prefix (e.g., 'products')
   *
   * @returns The operational name (alias for timestamped/versioned, physical for simple)
   *
   * @example
   * ```typescript
   * // With SIMPLE strategy and prefix 'nesvel'
   * getOperationalName('products') // => 'nesvel_products'
   *
   * // With TIMESTAMPED strategy and prefix 'nesvel'
   * getOperationalName('products') // => 'nesvel_products' (the alias)
   * ```
   */
  getOperationalName(baseName: string): string {
    // For timestamped/versioned strategies, use the alias
    // For simple strategy, use the physical name (which is the same as alias)
    return this.getAliasName(baseName);
  }

  /**
   * Parse physical index name to extract base name and suffix
   *
   * Useful for identifying the base name from a physical index name.
   *
   * @param physicalName - The physical index name
   *
   * @returns Object with baseName and suffix (timestamp or version)
   *
   * @example
   * ```typescript
   * parseIndexName('products_20231104_153422')
   * // => { baseName: 'products', suffix: '20231104_153422', type: 'timestamped' }
   *
   * parseIndexName('products_v2')
   * // => { baseName: 'products', suffix: 'v2', type: 'versioned' }
   *
   * parseIndexName('products')
   * // => { baseName: 'products', suffix: null, type: 'simple' }
   * ```
   */
  parseIndexName(physicalName: string): {
    baseName: string;
    suffix: string | null;
    type: 'simple' | 'timestamped' | 'versioned';
  } {
    // Check for versioned pattern: name_vN
    const versionMatch = physicalName.match(/^(.+)_(v\d+)$/);
    if (versionMatch && versionMatch[1] && versionMatch[2]) {
      return {
        baseName: versionMatch[1],
        suffix: versionMatch[2],
        type: 'versioned',
      };
    }

    // Check for timestamped pattern: name_YYYYMMDD_HHMMSS
    const timestampMatch = physicalName.match(/^(.+)_(\d{8}_\d{6})$/);
    if (timestampMatch && timestampMatch[1] && timestampMatch[2]) {
      return {
        baseName: timestampMatch[1],
        suffix: timestampMatch[2],
        type: 'timestamped',
      };
    }

    // Simple pattern
    return {
      baseName: physicalName,
      suffix: null,
      type: 'simple',
    };
  }

  /**
   * Get the current version for a base index name
   *
   * Only applicable for versioned strategy.
   *
   * @param baseName - The base index name
   *
   * @returns The current version number (0 if not set)
   */
  getCurrentVersion(baseName: string): number {
    return this.versionCounter.get(baseName) || 0;
  }

  /**
   * Set the version for a base index name
   *
   * Useful for initializing version counters from existing indexes.
   *
   * @param baseName - The base index name
   * @param version - The version number to set
   */
  setVersion(baseName: string, version: number): void {
    this.versionCounter.set(baseName, version);
  }

  /**
   * Generate timestamped index name
   *
   * Format: {baseName}_{YYYYMMDD}_{HHMMSS}
   *
   * @param baseName - The base index name
   *
   * @returns Index name with timestamp suffix
   *
   * @private
   */
  private generateTimestampedName(baseName: string): string {
    const now = new Date();
    const date = now.toISOString().slice(0, 10).replace(/-/g, ''); // YYYYMMDD
    const time = now.toISOString().slice(11, 19).replace(/:/g, ''); // HHMMSS
    return `${baseName}_${date}_${time}`;
  }

  /**
   * Generate versioned index name
   *
   * Format: {baseName}_v{version}
   *
   * @param baseName - The base index name
   * @param version - Optional version number (auto-increments if not provided)
   *
   * @returns Index name with version suffix
   *
   * @private
   */
  private generateVersionedName(baseName: string, version?: number): string {
    if (version !== undefined) {
      return `${baseName}_v${version}`;
    }

    // Auto-increment version
    const currentVersion = this.versionCounter.get(baseName) || 0;
    const nextVersion = currentVersion + 1;
    this.versionCounter.set(baseName, nextVersion);

    return `${baseName}_v${nextVersion}`;
  }
}
