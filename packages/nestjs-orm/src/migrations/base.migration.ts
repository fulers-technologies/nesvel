import { Knex } from 'knex';
import { Logger } from '@nestjs/common';
import { DatabaseException } from '@/exceptions';
import type {
  IRollbackable,
  IMigrationContext,
  IMigrationResult,
} from '@/interfaces';
import { isRollbackable } from '@/interfaces';

/**
 * Base Migration Class
 *
 * Provides a Laravel Eloquent-inspired fluent API for database migrations using Knex.
 * All migrations should extend this class and implement the up() and down() methods.
 *
 * Features include:
 * - Fluent schema builder API similar to Laravel migrations
 * - Comprehensive error handling and logging
 * - Migration rollback support
 * - Performance tracking and metadata collection
 * - Safe execution with transaction support
 *
 * @example
 * ```typescript
 * // Migration without rollback support
 * export class CreateUsersTable extends BaseMigration {
 *   async up(context: IMigrationContext): Promise<void> {
 *     await context.schema.createTable('users', (table) => {
 *       table.increments('id').primary();
 *       table.string('email').unique().notNullable();
 *       table.string('password').notNullable();
 *       table.timestamps(true, true);
 *     });
 *   }
 * }
 *
 * // Migration with rollback support
 * export class CreatePostsTable extends BaseMigration implements IRollbackable {
 *   async up(context: IMigrationContext): Promise<void> {
 *     await context.schema.createTable('posts', (table) => {
 *       table.increments('id').primary();
 *       table.string('title').notNullable();
 *       table.text('content');
 *       table.timestamps(true, true);
 *     });
 *   }
 *
 *   async down(context: IMigrationContext): Promise<void> {
 *     await context.schema.dropTableIfExists('posts');
 *   }
 * }
 * ```
 *
 * @author Nesvel
 * @since 1.0.0
 */
export abstract class BaseMigration {
  protected readonly logger = new Logger(this.constructor.name);

  /**
   * The unique name/identifier for this migration
   */
  public readonly name: string;

  /**
   * The version or timestamp of this migration
   */
  public readonly version: string;

  /**
   * Create a new base migration instance
   *
   * @param name - The unique name for this migration
   * @param version - The version or timestamp
   */
  constructor(name?: string, version?: string, description?: string) {
    this.name = name || this.constructor.name;
    this.version = version || new Date().toISOString();
  }

  /**
   * Execute the migration (apply changes)
   * This method must be implemented by all concrete migration classes
   *
   * @param context - Migration context with database connection and utilities
   */
  abstract up(context: IMigrationContext): Promise<void>;

  /**
   * Execute the migration with comprehensive error handling and logging
   *
   * @param db - The Knex database connection
   * @returns Migration result with execution details
   */
  async execute(db: Knex): Promise<IMigrationResult> {
    const startTime = Date.now();
    const logger = new Logger(`Migration:${this.name}`);

    logger.log(`Starting migration: ${this.name}`);

    try {
      const context: IMigrationContext = {
        db,
        logger,
        schema: db.schema,
      };

      // Execute migration within a transaction for safety
      await db.transaction(async (trx: Knex.Transaction) => {
        context.db = trx;
        context.schema = trx.schema;

        await this.up(context);
      });

      const executionTime = Date.now() - startTime;
      logger.log(`Migration ${this.name} completed successfully in ${executionTime}ms`);

      return {
        success: true,
        executionTime,
        metadata: {
          migrationSize: this.calculateMigrationSize(),
        },
      };
    } catch (error: Error | any) {
      const executionTime = Date.now() - startTime;
      const errorMessage = error instanceof Error ? error.message : String(error);

      logger.error(`Migration ${this.name} failed after ${executionTime}ms:`, error);

      // Wrap in our custom exception
      const migrationError = DatabaseException.forMigrationFailure(this.name, errorMessage);

      return {
        success: false,
        executionTime,
        error: migrationError.message,
        metadata: {},
      };
    }
  }

  /**
   * Rollback the migration with comprehensive error handling and logging
   * Only works if the migration implements the IRollbackable interface
   *
   * @param db - The Knex database connection
   * @returns Migration result with rollback details
   */
  async rollback(db: Knex): Promise<IMigrationResult> {
    const startTime = Date.now();
    const logger = new Logger(`Rollback:${this.name}`);

    logger.log(`Starting rollback: ${this.name}`);

    // Check if this migration supports rollback
    if (!isRollbackable(this)) {
      const executionTime = Date.now() - startTime;
      const errorMessage = `Migration ${this.name} does not implement IRollbackable interface and cannot be rolled back`;

      logger.error(errorMessage);

      return {
        success: false,
        executionTime,
        error: errorMessage,
        metadata: {},
      };
    }

    try {
      const context: IMigrationContext = {
        db,
        logger,
        schema: db.schema,
      };

      // Execute rollback within a transaction for safety
      await db.transaction(async (trx: Knex.Transaction) => {
        context.db = trx;
        context.schema = trx.schema;

        // Call the down method from IRollbackable interface
        // TypeScript knows this is safe because of the type guard above
        await (this as IRollbackable).down(context);
      });

      const executionTime = Date.now() - startTime;
      logger.log(`Rollback ${this.name} completed successfully in ${executionTime}ms`);

      return {
        success: true,
        executionTime,
        metadata: {},
      };
    } catch (error: Error | any) {
      const executionTime = Date.now() - startTime;
      const errorMessage = error instanceof Error ? error.message : String(error);

      logger.error(`Rollback ${this.name} failed after ${executionTime}ms:`, error);

      return {
        success: false,
        executionTime,
        error: errorMessage,
        metadata: {},
      };
    }
  }
  /**
   * Type guard to check if a migration implements IRollbackable
   *
   * @param migration - The migration instance to check
   * @returns True if the migration can be rolled back
   */
  isRollbackable(migration: any): migration is IRollbackable {
    return migration && typeof migration.down === 'function';
  }

  /**
   * Check if this migration can be safely rolled back
   * Uses the IRollbackable interface to determine if rollback is supported
   *
   * @param db - The Knex database connection (optional, for additional validation)
   * @returns True if the migration can be rolled back
   */
  async canRollback(db?: Knex): Promise<boolean> {
    // Check if this migration implements the IRollbackable interface
    const implementsRollback = isRollbackable(this);

    if (!implementsRollback) {
      return false;
    }

    // If database connection is provided, perform additional validation
    if (db) {
      try {
        await db.raw('SELECT 1');
        return true;
      } catch (error: Error | any) {
        this.logger.error('Migration rollback validation failed - database not available:', error);
        return false;
      }
    }

    return true;
  }

  /**
   * Get migration dependencies (migrations that must run before this one)
   * Override this method to specify dependencies
   *
   * @returns Array of migration names that this migration depends on
   */
  getDependencies(): string[] {
    return [];
  }

  /**
   * Validate the migration before execution
   * Override this method to implement custom validation logic
   *
   * @param db - The Knex database connection
   * @returns True if the migration is valid and can be executed
   */
  async validate(db: Knex): Promise<boolean> {
    // Basic validation - check if database connection is available
    try {
      await db.raw('SELECT 1');
      return true;
    } catch (error: Error | any) {
      this.logger.error('Migration validation failed - database not available:', error);
      return false;
    }
  }

  /**
   * Get estimated execution time for this migration
   * Override this method to provide time estimates for large migrations
   *
   * @returns Estimated execution time in milliseconds
   */
  getEstimatedExecutionTime(): number {
    // Default estimate based on migration complexity
    return this.calculateMigrationSize() * 100; // 100ms per unit of complexity
  }

  /**
   * Calculate a rough "size" metric for the migration
   * Used for performance estimation and logging
   *
   * @returns Numeric size/complexity metric
   */
  private calculateMigrationSize(): number {
    // Simple heuristic based on the migration class structure
    let source = this.up.toString();

    // Only include down method if this migration implements IRollbackable
    if (isRollbackable(this)) {
      source += (this as IRollbackable).down.toString();
    }

    const lines = source.split('\n').length;
    const complexity = (source.match(/\.(create|alter|drop)/g) || []).length;

    return lines + complexity * 10;
  }

  /**
   * Create a table with common timestamp columns
   * Convenience method similar to Laravel's timestamps()
   *
   * @param context - Migration context
   * @param tableName - Name of the table to create
   * @param callback - Function to define table schema
   */
  protected async createTable(
    context: IMigrationContext,
    tableName: string,
    callback: (table: Knex.CreateTableBuilder) => void,
  ): Promise<void> {
    await context.schema.createTable(tableName, (table: Knex.CreateTableBuilder) => {
      callback(table);

      // Add standard timestamp columns if not already added
      if (!this.hasTimestamps(table)) {
        table.timestamps(true, true);
      }
    });

    context.logger.log(`Created table: ${tableName}`);
  }

  /**
   * Drop a table safely with existence check
   *
   * @param context - Migration context
   * @param tableName - Name of the table to drop
   */
  protected async dropTable(context: IMigrationContext, tableName: string): Promise<void> {
    const exists = await context.schema.hasTable(tableName);
    if (exists) {
      await context.schema.dropTable(tableName);
      context.logger.log(`Dropped table: ${tableName}`);
    } else {
      context.logger.warn(`Table ${tableName} does not exist, skipping drop`);
    }
  }

  /**
   * Add an index to a table
   *
   * @param context - Migration context
   * @param tableName - Name of the table
   * @param columns - Column(s) to index
   * @param indexName - Optional custom index name
   */
  protected async addIndex(
    context: IMigrationContext,
    tableName: string,
    columns: string | string[],
    indexName?: string,
  ): Promise<void> {
    await context.schema.table(tableName, (table: Knex.AlterTableBuilder) => {
      if (indexName) {
        table.index(columns, indexName);
      } else {
        table.index(columns);
      }
    });

    const columnList = Array.isArray(columns) ? columns.join(', ') : columns;
    context.logger.log(`Added index on ${tableName}(${columnList})`);
  }

  /**
   * Remove an index from a table
   *
   * @param context - Migration context
   * @param tableName - Name of the table
   * @param columns - Column(s) that are indexed
   * @param indexName - Optional custom index name
   */
  protected async dropIndex(
    context: IMigrationContext,
    tableName: string,
    columns: string | string[],
    indexName?: string,
  ): Promise<void> {
    await context.schema.table(tableName, (table: Knex.AlterTableBuilder) => {
      if (indexName) {
        table.dropIndex([], indexName);
      } else {
        table.dropIndex(columns);
      }
    });

    const columnList = Array.isArray(columns) ? columns.join(', ') : columns;
    context.logger.log(`Dropped index on ${tableName}(${columnList})`);
  }

  /**
   * Check if a table builder already has timestamp columns defined
   *
   * @param table - The table builder
   * @returns True if timestamps are already defined
   */
  private hasTimestamps(table: Knex.CreateTableBuilder): boolean {
    // This is a heuristic check - in practice you might want to
    // maintain a list of added columns or use a more robust method
    const tableString = table.toString();
    return tableString.includes('created_at') || tableString.includes('updated_at');
  }

  /**
   * Get migration information for logging and tracking
   *
   * @returns Object with migration details
   */
  getInfo(): {
    name: string;
    version: string;
    estimatedTime: number;
    dependencies: string[];
  } {
    return {
      name: this.name,
      version: this.version,
      estimatedTime: this.getEstimatedExecutionTime(),
      dependencies: this.getDependencies(),
    };
  }
}
