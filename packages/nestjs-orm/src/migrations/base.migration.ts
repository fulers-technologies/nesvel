import { Knex } from 'knex';
import { Logger } from '@nestjs/common';
import { Migration } from '@mikro-orm/migrations';

/**
 * Base Migration Class
 *
 * Extends MikroORM's Migration class and provides direct access to Knex schema builder.
 * All migrations should extend this class and implement the up() and optionally down() methods.
 *
 * This simplified base class provides:
 * - Direct access to Knex schema builder via `this.schema`
 * - All MikroORM migration functionality via parent class
 * - Clean, minimal API focused on schema operations
 *
 * @example
 * ```typescript
 * // Simple migration
 * export class CreateUsersTable extends BaseMigration {
 *   async up(): Promise<void> {
 *     await this.schema.createTable('users', (table) => {
 *       table.increments('id').primary();
 *       table.string('email').unique().notNullable();
 *       table.string('password').notNullable();
 *       table.timestamps(true, true);
 *     });
 *   }
 *
 *   async down(): Promise<void> {
 *     await this.schema.dropTableIfExists('users');
 *   }
 * }
 *
 * // Migration with table alterations
 * export class AddColumnsToUsers extends BaseMigration {
 *   async up(): Promise<void> {
 *     await this.schema.table('users', (table) => {
 *       table.string('phone').nullable();
 *       table.timestamp('email_verified_at').nullable();
 *     });
 *   }
 *
 *   async down(): Promise<void> {
 *     await this.schema.table('users', (table) => {
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
   *   await this.schema.createTable('users', (table) => {
   *     table.increments('id');
   *   });
   *   this.logger.log('Users table created successfully');
   * }
   * ```
   */
  protected readonly logger = new Logger(this.constructor.name);

  /**
   * Get the Knex schema builder instance
   *
   * Provides direct access to Knex's schema builder for table operations.
   * This is the primary way to interact with the database schema.
   *
   * @returns Knex.SchemaBuilder instance
   *
   * @example
   * ```typescript
   * async up(): Promise<void> {
   *   // Create a new table
   *   await this.schema.createTable('posts', (table) => {
   *     table.increments('id');
   *     table.string('title');
   *     table.text('content');
   *   });
   *
   *   // Alter an existing table
   *   await this.schema.table('posts', (table) => {
   *     table.integer('user_id').unsigned();
   *     table.foreign('user_id').references('users.id');
   *   });
   *
   *   // Check if table exists
   *   if (await this.schema.hasTable('old_posts')) {
   *     await this.schema.dropTable('old_posts');
   *   }
   * }
   * ```
   */
  protected get schema(): Knex.SchemaBuilder {
    return this.getKnex().schema;
  }
}
