import { Knex } from 'knex';
import { Logger } from '@nestjs/common';
import { Migration } from '@mikro-orm/migrations';

import { Blueprint } from './blueprint';

/**
 * Base Migration Class
 *
 * Extends MikroORM's Migration class and provides Laravel-style Blueprint API
 * for schema management. All migrations should extend this class and implement
 * the up() and optionally down() methods.
 *
 * This base class provides:
 * - Laravel-style Blueprint API via `create()`, `table()`, `drop()` methods
 * - Automatic SQL queuing for proper transaction management
 * - Logger for structured logging
 * - All MikroORM migration functionality via parent class
 *
 * @example
 * ```typescript
 * // Create table migration
 * export class CreateUsersTable extends BaseMigration {
 *   async up(): Promise<void> {
 *     this.create('users', (table) => {
 *       table.id();
 *       table.string('email').unique().notNullable();
 *       table.string('password').notNullable();
 *       table.rememberToken();
 *       table.timestamps();
 *     });
 *   }
 *
 *   async down(): Promise<void> {
 *     this.drop('users');
 *   }
 * }
 *
 * // Alter table migration
 * export class AddColumnsToUsers extends BaseMigration {
 *   async up(): Promise<void> {
 *     this.table('users', (table) => {
 *       table.string('phone').nullable();
 *       table.timestamp('email_verified_at').nullable();
 *     });
 *   }
 *
 *   async down(): Promise<void> {
 *     this.table('users', (table) => {
 *       table.dropColumn('phone');
 *       table.dropColumn('email_verified_at');
 *     });
 *   }
 * }
 * ```
 *
 * @author Nesvel
 * @since 1.0.0
 */
export abstract class BaseMigration extends Migration {
  /**
   * Logger instance for migration operations
   *
   * Provides structured logging throughout migration execution.
   * Automatically configured with the migration class name as context.
   *
   * Use this logger to output informational messages, warnings, or errors
   * during migration execution for better debugging and monitoring.
   *
   * @protected
   * @readonly
   *
   * @example
   * ```typescript
   * async up(): Promise<void> {
   *   this.logger.log('Creating users table...');
   *   this.create('users', (table) => {
   *     table.id();
   *   });
   *   this.logger.log('Users table created successfully');
   * }
   * ```
   */
  protected readonly logger = new Logger(this.constructor.name);

  /**
   * Create a new table using Laravel-style Blueprint API
   *
   * @param tableName - Name of the table to create
   * @param callback - Blueprint callback for defining table structure
   * @returns void
   *
   * @example
   * ```typescript
   * this.create('posts', (table) => {
   *   table.id();
   *   table.string('title').notNullable();
   *   table.text('content');
   *   table.foreignId('user_id').references('id').inTable('users');
   *   table.timestamps();
   * });
   * ```
   */
  protected create(tableName: string, callback: (table: Blueprint) => void): void {
    const builder = this.getKnex().schema.createTable(
      tableName,
      (tableBuilder: Knex.CreateTableBuilder) => {
        const table = new Blueprint(tableBuilder);
        callback(table);
      },
    );
    const queries = builder.toSQL();
    queries.forEach((query) => this.addSql(query.sql));
  }

  /**
   * Alter an existing table using Laravel-style Blueprint API
   *
   * @param tableName - Name of the table to alter
   * @param callback - Blueprint callback for defining alterations
   * @returns void
   *
   * @example
   * ```typescript
   * this.table('posts', (table) => {
   *   table.string('slug').unique();
   *   table.boolean('is_published').defaultTo(false);
   * });
   * ```
   */
  protected table(tableName: string, callback: (table: Blueprint) => void): void {
    const builder = this.getKnex().schema.table(
      tableName,
      (tableBuilder: Knex.AlterTableBuilder) => {
        const table = new Blueprint(tableBuilder);
        callback(table);
      },
    );
    const queries = builder.toSQL();
    queries.forEach((query) => this.addSql(query.sql));
  }

  /**
   * Drop a table if it exists
   *
   * @param tableName - Name of the table to drop
   * @returns void
   *
   * @example
   * ```typescript
   * this.drop('posts');
   * ```
   */
  protected drop(tableName: string): void {
    const builder = this.getKnex().schema.dropTableIfExists(tableName);
    const queries = builder.toSQL();
    queries.forEach((query) => this.addSql(query.sql));
  }

  /**
   * Rename a table
   *
   * @param oldName - Current table name
   * @param newName - New table name
   * @returns void
   *
   * @example
   * ```typescript
   * this.rename('posts', 'articles');
   * ```
   */
  protected rename(oldName: string, newName: string): void {
    const builder = this.getKnex().schema.renameTable(oldName, newName) as any;
    const queries = builder.toSQL();
    queries.forEach((query: any) => this.addSql(query.sql));
  }
}
