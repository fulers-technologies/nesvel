import { IndexType } from '../enums';

/**
 * Index definition for table indexes
 *
 * Defines the structure and properties of a database index
 * for use with the Blueprint fluent schema builder.
 *
 * @author Nesvel
 * @since 1.0.0
 */
export interface IIndexDefinition {
  /** Index name */
  name?: string;
  /** Columns included in the index */
  columns: string[];
  /** Index type */
  type: IndexType;
  /** Whether this is a partial index */
  where?: string;
  /** Additional index options */
  options?: {
    /** Whether the index should be created concurrently (PostgreSQL) */
    concurrent?: boolean;
    /** Index method (btree, hash, gin, gist, etc.) */
    using?: string;
    /** Storage parameters */
    with?: Record<string, any>;
  };
}

// Export as both interface and type alias for compatibility
export type IndexDefinition = IIndexDefinition;
