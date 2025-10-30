import { Knex } from 'knex';
import { Logger } from '@nestjs/common';

/**
 * Migration execution context containing database connection and utilities
 *
 * Contains comprehensive information and tools needed for migration execution
 * including database connection, schema builder, and logging capabilities.
 *
 * @author Nesvel
 * @since 1.0.0
 */
export interface IMigrationContext {
  /** The Knex database connection */
  db: Knex;
  /** Logger instance for migration logging */
  logger: Logger;
  /** Schema builder instance */
  schema: Knex.SchemaBuilder;
}

// Export as both interface and type alias for compatibility
export type MigrationContext = IMigrationContext;
