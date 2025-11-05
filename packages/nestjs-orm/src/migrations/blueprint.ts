import { Knex } from 'knex';

/**
 * Laravel-style Blueprint wrapper for Knex TableBuilder
 *
 * Provides a fluent, Laravel Eloquent-like API for defining database schemas.
 * This class wraps Knex's TableBuilder and adds Laravel-specific conveniences
 * while maintaining compatibility with Knex's underlying functionality.
 *
 * @example
 * ```typescript
 * // In a migration
 * this.createTable('users', (table) => {
 *   const blueprint = new Blueprint(table);
 *   blueprint.id();
 *   blueprint.string('email').unique().notNullable();
 *   blueprint.string('password');
 *   blueprint.rememberToken();
 *   blueprint.timestamps();
 * });
 * ```
 *
 * @author Nesvel
 * @since 1.0.0
 */
export class Blueprint {
  /**
   * The underlying Knex table builder instance
   *
   * @private
   * @readonly
   */
  private readonly table: Knex.TableBuilder;

  /**
   * The Knex client for raw queries
   *
   * @private
   * @readonly
   */
  private readonly client: any;

  /**
   * Create a new Blueprint instance
   *
   * @param table - The Knex TableBuilder instance to wrap
   */
  constructor(table: Knex.TableBuilder) {
    this.table = table;
    this.client = (table as any).client;
  }

  // ============================================================================
  // PRIMARY KEYS & IDs
  // ============================================================================

  /**
   * Create an auto-incrementing UNSIGNED BIGINT (primary key) column
   *
   * This is Laravel's modern default for primary keys.
   * Equivalent to Laravel's `$table->id()`
   *
   * @param column - Column name (default: 'id')
   * @returns Column builder for chaining
   *
   * @example
   * ```typescript
   * blueprint.id(); // creates 'id' column
   * blueprint.id('user_id'); // creates 'user_id' column
   * ```
   */
  id(column = 'id'): Knex.ColumnBuilder {
    return this.table.bigIncrements(column).primary();
  }

  /**
   * Create an auto-incrementing UNSIGNED INTEGER (primary key) column
   *
   * Equivalent to Laravel's `$table->increments()`
   *
   * @param column - Column name
   * @returns Column builder for chaining
   */
  increments(column: string): Knex.ColumnBuilder {
    return this.table.increments(column);
  }

  /**
   * Create an auto-incrementing UNSIGNED BIGINT (primary key) column
   *
   * Equivalent to Laravel's `$table->bigIncrements()`
   *
   * @param column - Column name
   * @returns Column builder for chaining
   */
  bigIncrements(column: string): Knex.ColumnBuilder {
    return this.table.bigIncrements(column);
  }

  /**
   * Create an auto-incrementing UNSIGNED SMALLINT (primary key) column
   *
   * Equivalent to Laravel's `$table->smallIncrements()`
   * Note: Knex doesn't have smallIncrements, using regular increments
   *
   * @param column - Column name
   * @returns Column builder for chaining
   */
  smallIncrements(column: string): Knex.ColumnBuilder {
    return this.table.increments(column);
  }

  /**
   * Create an auto-incrementing UNSIGNED TINYINT (primary key) column
   *
   * Equivalent to Laravel's `$table->tinyIncrements()`
   *
   * @param column - Column name
   * @returns Column builder for chaining
   */
  tinyIncrements(column: string): Knex.ColumnBuilder {
    return this.table.increments(column); // Knex doesn't have tinyIncrements, use increments
  }

  /**
   * Create an auto-incrementing UNSIGNED MEDIUMINT (primary key) column
   *
   * Equivalent to Laravel's `$table->mediumIncrements()`
   *
   * @param column - Column name
   * @returns Column builder for chaining
   */
  mediumIncrements(column: string): Knex.ColumnBuilder {
    return this.table.increments(column); // Knex doesn't have mediumIncrements, use increments
  }

  // ============================================================================
  // STRING TYPES
  // ============================================================================

  /**
   * Create a VARCHAR column
   *
   * Equivalent to Laravel's `$table->string()`
   *
   * @param column - Column name
   * @param length - Maximum length (default: 255)
   * @returns Column builder for chaining
   *
   * @example
   * ```typescript
   * blueprint.string('email'); // VARCHAR(255)
   * blueprint.string('code', 10); // VARCHAR(10)
   * ```
   */
  string(column: string, length = 255): Knex.ColumnBuilder {
    return this.table.string(column, length);
  }

  /**
   * Create a TEXT column
   *
   * Equivalent to Laravel's `$table->text()`
   *
   * @param column - Column name
   * @returns Column builder for chaining
   */
  text(column: string): Knex.ColumnBuilder {
    return this.table.text(column);
  }

  /**
   * Create a CHAR column
   *
   * Equivalent to Laravel's `$table->char()`
   *
   * @param column - Column name
   * @param length - Fixed length (default: 255)
   * @returns Column builder for chaining
   */
  char(column: string, length = 255): Knex.ColumnBuilder {
    return this.table.specificType(column, `char(${length})`);
  }

  /**
   * Create a TINYTEXT column
   *
   * Equivalent to Laravel's `$table->tinyText()`
   *
   * @param column - Column name
   * @returns Column builder for chaining
   */
  tinyText(column: string): Knex.ColumnBuilder {
    return this.table.text(column, 'tinytext');
  }

  /**
   * Create a MEDIUMTEXT column
   *
   * Equivalent to Laravel's `$table->mediumText()`
   *
   * @param column - Column name
   * @returns Column builder for chaining
   */
  mediumText(column: string): Knex.ColumnBuilder {
    return this.table.text(column, 'mediumtext');
  }

  /**
   * Create a LONGTEXT column
   *
   * Equivalent to Laravel's `$table->longText()`
   *
   * @param column - Column name
   * @returns Column builder for chaining
   */
  longText(column: string): Knex.ColumnBuilder {
    return this.table.text(column, 'longtext');
  }

  // ============================================================================
  // NUMERIC TYPES
  // ============================================================================

  /**
   * Create an INTEGER column
   *
   * Equivalent to Laravel's `$table->integer()`
   *
   * @param column - Column name
   * @returns Column builder for chaining
   */
  integer(column: string): Knex.ColumnBuilder {
    return this.table.integer(column);
  }

  /**
   * Create a TINYINT column
   *
   * Equivalent to Laravel's `$table->tinyInteger()`
   *
   * @param column - Column name
   * @returns Column builder for chaining
   */
  tinyInteger(column: string): Knex.ColumnBuilder {
    return this.table.specificType(column, 'tinyint');
  }

  /**
   * Create a SMALLINT column
   *
   * Equivalent to Laravel's `$table->smallInteger()`
   *
   * @param column - Column name
   * @returns Column builder for chaining
   */
  smallInteger(column: string): Knex.ColumnBuilder {
    return this.table.specificType(column, 'smallint');
  }

  /**
   * Create a MEDIUMINT column
   *
   * Equivalent to Laravel's `$table->mediumInteger()`
   *
   * @param column - Column name
   * @returns Column builder for chaining
   */
  mediumInteger(column: string): Knex.ColumnBuilder {
    return this.table.specificType(column, 'mediumint');
  }

  /**
   * Create a BIGINT column
   *
   * Equivalent to Laravel's `$table->bigInteger()`
   *
   * @param column - Column name
   * @returns Column builder for chaining
   */
  bigInteger(column: string): Knex.ColumnBuilder {
    return this.table.bigInteger(column);
  }

  /**
   * Create an UNSIGNED INTEGER column
   *
   * Equivalent to Laravel's `$table->unsignedInteger()`
   *
   * @param column - Column name
   * @returns Column builder for chaining
   */
  unsignedInteger(column: string): Knex.ColumnBuilder {
    return this.table.integer(column).unsigned();
  }

  /**
   * Create an UNSIGNED TINYINT column
   *
   * Equivalent to Laravel's `$table->unsignedTinyInteger()`
   *
   * @param column - Column name
   * @returns Column builder for chaining
   */
  unsignedTinyInteger(column: string): Knex.ColumnBuilder {
    return this.table.specificType(column, 'tinyint unsigned');
  }

  /**
   * Create an UNSIGNED SMALLINT column
   *
   * Equivalent to Laravel's `$table->unsignedSmallInteger()`
   *
   * @param column - Column name
   * @returns Column builder for chaining
   */
  unsignedSmallInteger(column: string): Knex.ColumnBuilder {
    return this.table.specificType(column, 'smallint unsigned');
  }

  /**
   * Create an UNSIGNED MEDIUMINT column
   *
   * Equivalent to Laravel's `$table->unsignedMediumInteger()`
   *
   * @param column - Column name
   * @returns Column builder for chaining
   */
  unsignedMediumInteger(column: string): Knex.ColumnBuilder {
    return this.table.specificType(column, 'mediumint unsigned');
  }

  /**
   * Create an UNSIGNED BIGINT column
   *
   * Equivalent to Laravel's `$table->unsignedBigInteger()`
   *
   * @param column - Column name
   * @returns Column builder for chaining
   */
  unsignedBigInteger(column: string): Knex.ColumnBuilder {
    return this.table.bigInteger(column).unsigned();
  }

  /**
   * Create a FLOAT column
   *
   * Equivalent to Laravel's `$table->float()`
   *
   * @param column - Column name
   * @param precision - Total digits (default: 8)
   * @param scale - Decimal places (default: 2)
   * @returns Column builder for chaining
   */
  float(column: string, precision = 8, scale = 2): Knex.ColumnBuilder {
    return this.table.float(column, precision, scale);
  }

  /**
   * Create a DOUBLE column
   *
   * Equivalent to Laravel's `$table->double()`
   *
   * @param column - Column name
   * @param precision - Total digits (default: 8)
   * @param scale - Decimal places (default: 2)
   * @returns Column builder for chaining
   */
  double(column: string, precision = 8, scale = 2): Knex.ColumnBuilder {
    return this.table.double(column, precision, scale);
  }

  /**
   * Create a DECIMAL column
   *
   * Equivalent to Laravel's `$table->decimal()`
   *
   * @param column - Column name
   * @param precision - Total digits (default: 8)
   * @param scale - Decimal places (default: 2)
   * @returns Column builder for chaining
   */
  decimal(column: string, precision = 8, scale = 2): Knex.ColumnBuilder {
    return this.table.decimal(column, precision, scale);
  }

  /**
   * Create an UNSIGNED FLOAT column
   *
   * Equivalent to Laravel's `$table->unsignedFloat()`
   *
   * @param column - Column name
   * @param precision - Total digits (default: 8)
   * @param scale - Decimal places (default: 2)
   * @returns Column builder for chaining
   */
  unsignedFloat(column: string, precision = 8, scale = 2): Knex.ColumnBuilder {
    return this.table.float(column, precision, scale).unsigned();
  }

  /**
   * Create an UNSIGNED DOUBLE column
   *
   * Equivalent to Laravel's `$table->unsignedDouble()`
   *
   * @param column - Column name
   * @param precision - Total digits (default: 8)
   * @param scale - Decimal places (default: 2)
   * @returns Column builder for chaining
   */
  unsignedDouble(column: string, precision = 8, scale = 2): Knex.ColumnBuilder {
    return this.table.double(column, precision, scale).unsigned();
  }

  /**
   * Create an UNSIGNED DECIMAL column
   *
   * Equivalent to Laravel's `$table->unsignedDecimal()`
   *
   * @param column - Column name
   * @param precision - Total digits (default: 8)
   * @param scale - Decimal places (default: 2)
   * @returns Column builder for chaining
   */
  unsignedDecimal(column: string, precision = 8, scale = 2): Knex.ColumnBuilder {
    return this.table.decimal(column, precision, scale).unsigned();
  }

  // ============================================================================
  // BOOLEAN
  // ============================================================================

  /**
   * Create a BOOLEAN column
   *
   * Equivalent to Laravel's `$table->boolean()`
   *
   * @param column - Column name
   * @returns Column builder for chaining
   */
  boolean(column: string): Knex.ColumnBuilder {
    return this.table.boolean(column);
  }

  // ============================================================================
  // DATE & TIME
  // ============================================================================

  /**
   * Create a DATE column
   *
   * Equivalent to Laravel's `$table->date()`
   *
   * @param column - Column name
   * @returns Column builder for chaining
   */
  date(column: string): Knex.ColumnBuilder {
    return this.table.date(column);
  }

  /**
   * Create a DATETIME column
   *
   * Equivalent to Laravel's `$table->datetime()`
   *
   * @param column - Column name
   * @param precision - Fractional seconds precision (default: 0)
   * @returns Column builder for chaining
   */
  datetime(column: string, precision = 0): Knex.ColumnBuilder {
    return this.table.datetime(column, { precision });
  }

  /**
   * Create a DATETIME column with timezone
   *
   * Equivalent to Laravel's `$table->datetimeTz()`
   *
   * @param column - Column name
   * @param precision - Fractional seconds precision (default: 0)
   * @returns Column builder for chaining
   */
  datetimeTz(column: string, precision = 0): Knex.ColumnBuilder {
    return this.table.datetime(column, { precision, useTz: true });
  }

  /**
   * Create a TIME column
   *
   * Equivalent to Laravel's `$table->time()`
   *
   * @param column - Column name
   * @param precision - Fractional seconds precision (default: 0)
   * @returns Column builder for chaining
   */
  time(column: string, precision = 0): Knex.ColumnBuilder {
    return this.table.time(column);
  }

  /**
   * Create a TIME column with timezone
   *
   * Equivalent to Laravel's `$table->timeTz()`
   *
   * @param column - Column name
   * @param precision - Fractional seconds precision (default: 0)
   * @returns Column builder for chaining
   */
  timeTz(column: string, precision = 0): Knex.ColumnBuilder {
    return this.table.time(column);
  }

  /**
   * Create a TIMESTAMP column
   *
   * Equivalent to Laravel's `$table->timestamp()`
   *
   * @param column - Column name
   * @param precision - Fractional seconds precision (default: 0)
   * @returns Column builder for chaining
   */
  timestamp(column: string, precision = 0): Knex.ColumnBuilder {
    return this.table.timestamp(column, { precision });
  }

  /**
   * Create a TIMESTAMP column with timezone
   *
   * Equivalent to Laravel's `$table->timestampTz()`
   *
   * @param column - Column name
   * @param precision - Fractional seconds precision (default: 0)
   * @returns Column builder for chaining
   */
  timestampTz(column: string, precision = 0): Knex.ColumnBuilder {
    return this.table.timestamp(column, { precision, useTz: true });
  }

  /**
   * Create a YEAR column
   *
   * Equivalent to Laravel's `$table->year()`
   *
   * @param column - Column name
   * @returns Column builder for chaining
   */
  year(column: string): Knex.ColumnBuilder {
    return this.table.specificType(column, 'year');
  }

  /**
   * Add created_at and updated_at timestamp columns
   *
   * Equivalent to Laravel's `$table->timestamps()`
   *
   * @param precision - Fractional seconds precision (default: 0)
   * @param useCurrent - Use CURRENT_TIMESTAMP as default (default: true)
   * @returns void
   *
   * @example
   * ```typescript
   * blueprint.timestamps(); // Adds created_at and updated_at
   * blueprint.timestamps(3); // With millisecond precision
   * ```
   */
  timestamps(precision = 0, useCurrent = true): void {
    if (useCurrent) {
      this.table
        .timestamp('created_at', { precision })
        .notNullable()
        .defaultTo(this.client.raw('CURRENT_TIMESTAMP'));
      this.table
        .timestamp('updated_at', { precision })
        .notNullable()
        .defaultTo(this.client.raw('CURRENT_TIMESTAMP'));
    } else {
      this.table.timestamp('created_at', { precision }).notNullable();
      this.table.timestamp('updated_at', { precision }).notNullable();
    }
  }

  /**
   * Add created_at and updated_at timestamp columns with timezone
   *
   * Equivalent to Laravel's `$table->timestampsTz()`
   *
   * @param precision - Fractional seconds precision (default: 0)
   * @param useCurrent - Use CURRENT_TIMESTAMP as default (default: true)
   * @returns void
   */
  timestampsTz(precision = 0, useCurrent = true): void {
    if (useCurrent) {
      this.table
        .timestamp('created_at', { precision, useTz: true })
        .notNullable()
        .defaultTo(this.client.raw('CURRENT_TIMESTAMP'));
      this.table
        .timestamp('updated_at', { precision, useTz: true })
        .notNullable()
        .defaultTo(this.client.raw('CURRENT_TIMESTAMP'));
    } else {
      this.table
        .timestamp('created_at', { precision, useTz: true })
        .notNullable();
      this.table
        .timestamp('updated_at', { precision, useTz: true })
        .notNullable();
    }
  }

  /**
   * Add deleted_at timestamp column for soft deletes
   *
   * Equivalent to Laravel's `$table->softDeletes()`
   *
   * @param column - Column name (default: 'deleted_at')
   * @param precision - Fractional seconds precision (default: 0)
   * @returns Column builder for chaining
   */
  softDeletes(column = 'deleted_at', precision = 0): Knex.ColumnBuilder {
    return this.table.timestamp(column, { precision }).nullable();
  }

  /**
   * Add deleted_at timestamp column with timezone for soft deletes
   *
   * Equivalent to Laravel's `$table->softDeletesTz()`
   *
   * @param column - Column name (default: 'deleted_at')
   * @param precision - Fractional seconds precision (default: 0)
   * @returns Column builder for chaining
   */
  softDeletesTz(column = 'deleted_at', precision = 0): Knex.ColumnBuilder {
    return this.table.timestamp(column, { precision, useTz: true }).nullable();
  }

  // ============================================================================
  // BINARY
  // ============================================================================

  /**
   * Create a BLOB column
   *
   * Equivalent to Laravel's `$table->binary()`
   *
   * @param column - Column name
   * @returns Column builder for chaining
   */
  binary(column: string): Knex.ColumnBuilder {
    return this.table.binary(column);
  }

  // ============================================================================
  // JSON
  // ============================================================================

  /**
   * Create a JSON column
   *
   * Equivalent to Laravel's `$table->json()`
   *
   * @param column - Column name
   * @returns Column builder for chaining
   */
  json(column: string): Knex.ColumnBuilder {
    return this.table.json(column);
  }

  /**
   * Create a JSONB column (PostgreSQL)
   *
   * Equivalent to Laravel's `$table->jsonb()`
   *
   * @param column - Column name
   * @returns Column builder for chaining
   */
  jsonb(column: string): Knex.ColumnBuilder {
    return this.table.jsonb(column);
  }

  // ============================================================================
  // UUID & ULID
  // ============================================================================

  /**
   * Create a UUID column
   *
   * Equivalent to Laravel's `$table->uuid()`
   *
   * @param column - Column name
   * @returns Column builder for chaining
   */
  uuid(column: string): Knex.ColumnBuilder {
    return this.table.uuid(column);
  }

  /**
   * Create a ULID column
   *
   * Equivalent to Laravel's `$table->ulid()`
   *
   * @param column - Column name
   * @param length - Length of ULID (default: 26)
   * @returns Column builder for chaining
   */
  ulid(column: string, length = 26): Knex.ColumnBuilder {
    return this.table.string(column, length);
  }

  /**
   * Create a UUID column for foreign key
   *
   * Equivalent to Laravel's `$table->foreignUuid()`
   *
   * @param column - Column name
   * @returns Column builder for chaining
   */
  foreignUuid(column: string): Knex.ColumnBuilder {
    return this.table.uuid(column);
  }

  /**
   * Create a ULID column for foreign key
   *
   * Equivalent to Laravel's `$table->foreignUlid()`
   *
   * @param column - Column name
   * @returns Column builder for chaining
   */
  foreignUlid(column: string): Knex.ColumnBuilder {
    return this.table.string(column, 26);
  }

  // ============================================================================
  // FOREIGN KEYS
  // ============================================================================

  /**
   * Create an UNSIGNED BIGINT column for foreign key
   *
   * Equivalent to Laravel's `$table->foreignId()`
   *
   * @param column - Column name
   * @returns Column builder for chaining
   *
   * @example
   * ```typescript
   * blueprint.foreignId('user_id').references('id').inTable('users');
   * ```
   */
  foreignId(column: string): Knex.ColumnBuilder {
    return this.table.bigInteger(column).unsigned();
  }

  /**
   * Create a foreign key column for specific model
   *
   * Equivalent to Laravel's `$table->foreignIdFor()`
   *
   * @param tableName - Related table name
   * @param column - Column name (defaults to {table}_id)
   * @returns Column builder for chaining
   *
   * @example
   * ```typescript
   * blueprint.foreignIdFor('users'); // Creates user_id
   * blueprint.foreignIdFor('users', 'author_id'); // Creates author_id
   * ```
   */
  foreignIdFor(tableName: string, column?: string): Knex.ColumnBuilder {
    const columnName = column || `${tableName.replace(/s$/, '')}_id`;
    return this.foreignId(columnName);
  }

  // ============================================================================
  // ENUM & SET
  // ============================================================================

  /**
   * Create an ENUM column
   *
   * Equivalent to Laravel's `$table->enum()`
   *
   * @param column - Column name
   * @param allowed - Array of allowed values
   * @returns Column builder for chaining
   *
   * @example
   * ```typescript
   * blueprint.enum('status', ['pending', 'active', 'completed']);
   * ```
   */
  enum(column: string, allowed: string[]): Knex.ColumnBuilder {
    return this.table.enum(column, allowed);
  }

  /**
   * Create a SET column
   *
   * Equivalent to Laravel's `$table->set()`
   *
   * @param column - Column name
   * @param allowed - Array of allowed values
   * @returns Column builder for chaining
   */
  set(column: string, allowed: string[]): Knex.ColumnBuilder {
    return this.table.specificType(column, `set(${allowed.map((v) => `'${v}'`).join(', ')})`);
  }

  // ============================================================================
  // GEOMETRY (MySQL)
  // ============================================================================

  /**
   * Create a GEOMETRY column
   *
   * Equivalent to Laravel's `$table->geometry()`
   *
   * @param column - Column name
   * @returns Column builder for chaining
   */
  geometry(column: string): Knex.ColumnBuilder {
    return this.table.specificType(column, 'geometry');
  }

  /**
   * Create a POINT column
   *
   * Equivalent to Laravel's `$table->point()`
   *
   * @param column - Column name
   * @param srid - Spatial reference system identifier
   * @returns Column builder for chaining
   */
  point(column: string, srid?: number): Knex.ColumnBuilder {
    const type = srid ? `point srid ${srid}` : 'point';
    return this.table.specificType(column, type);
  }

  /**
   * Create a LINESTRING column
   *
   * Equivalent to Laravel's `$table->lineString()`
   *
   * @param column - Column name
   * @returns Column builder for chaining
   */
  lineString(column: string): Knex.ColumnBuilder {
    return this.table.specificType(column, 'linestring');
  }

  /**
   * Create a POLYGON column
   *
   * Equivalent to Laravel's `$table->polygon()`
   *
   * @param column - Column name
   * @returns Column builder for chaining
   */
  polygon(column: string): Knex.ColumnBuilder {
    return this.table.specificType(column, 'polygon');
  }

  /**
   * Create a GEOMETRYCOLLECTION column
   *
   * Equivalent to Laravel's `$table->geometryCollection()`
   *
   * @param column - Column name
   * @returns Column builder for chaining
   */
  geometryCollection(column: string): Knex.ColumnBuilder {
    return this.table.specificType(column, 'geometrycollection');
  }

  /**
   * Create a MULTIPOINT column
   *
   * Equivalent to Laravel's `$table->multiPoint()`
   *
   * @param column - Column name
   * @returns Column builder for chaining
   */
  multiPoint(column: string): Knex.ColumnBuilder {
    return this.table.specificType(column, 'multipoint');
  }

  /**
   * Create a MULTILINESTRING column
   *
   * Equivalent to Laravel's `$table->multiLineString()`
   *
   * @param column - Column name
   * @returns Column builder for chaining
   */
  multiLineString(column: string): Knex.ColumnBuilder {
    return this.table.specificType(column, 'multilinestring');
  }

  /**
   * Create a MULTIPOLYGON column
   *
   * Equivalent to Laravel's `$table->multiPolygon()`
   *
   * @param column - Column name
   * @returns Column builder for chaining
   */
  multiPolygon(column: string): Knex.ColumnBuilder {
    return this.table.specificType(column, 'multipolygon');
  }

  /**
   * Create a MULTIPOLYGON column with Z dimension
   *
   * Equivalent to Laravel's `$table->multiPolygonZ()`
   *
   * @param column - Column name
   * @returns Column builder for chaining
   */
  multiPolygonZ(column: string): Knex.ColumnBuilder {
    return this.table.specificType(column, 'multipolygonz');
  }

  // ============================================================================
  // NETWORK (PostgreSQL)
  // ============================================================================

  /**
   * Create an IP address column
   *
   * Equivalent to Laravel's `$table->ipAddress()`
   *
   * @param column - Column name
   * @returns Column builder for chaining
   */
  ipAddress(column: string): Knex.ColumnBuilder {
    return this.table.specificType(column, 'inet');
  }

  /**
   * Create a MAC address column
   *
   * Equivalent to Laravel's `$table->macAddress()`
   *
   * @param column - Column name
   * @returns Column builder for chaining
   */
  macAddress(column: string): Knex.ColumnBuilder {
    return this.table.specificType(column, 'macaddr');
  }

  // ============================================================================
  // SPECIAL
  // ============================================================================

  /**
   * Create a VARCHAR(100) column for "remember me" token
   *
   * Equivalent to Laravel's `$table->rememberToken()`
   *
   * @returns Column builder for chaining
   */
  rememberToken(): Knex.ColumnBuilder {
    return this.table.string('remember_token', 100).nullable();
  }

  /**
   * Add columns for polymorphic relations
   *
   * Creates {name}_type (VARCHAR) and {name}_id (UNSIGNED BIGINT) columns.
   * Equivalent to Laravel's `$table->morphs()`
   *
   * @param name - Relation name
   * @param indexName - Optional index name
   * @returns void
   *
   * @example
   * ```typescript
   * blueprint.morphs('commentable'); // Creates commentable_type and commentable_id
   * ```
   */
  morphs(name: string, indexName?: string): void {
    this.table.string(`${name}_type`);
    this.table.bigInteger(`${name}_id`).unsigned();

    if (indexName !== null) {
      this.table.index([`${name}_type`, `${name}_id`], indexName);
    }
  }

  /**
   * Add nullable columns for polymorphic relations
   *
   * Equivalent to Laravel's `$table->nullableMorphs()`
   *
   * @param name - Relation name
   * @param indexName - Optional index name
   * @returns void
   */
  nullableMorphs(name: string, indexName?: string): void {
    this.table.string(`${name}_type`).nullable();
    this.table.bigInteger(`${name}_id`).unsigned().nullable();

    if (indexName !== null) {
      this.table.index([`${name}_type`, `${name}_id`], indexName);
    }
  }

  /**
   * Add UUID columns for polymorphic relations
   *
   * Equivalent to Laravel's `$table->uuidMorphs()`
   *
   * @param name - Relation name
   * @param indexName - Optional index name
   * @returns void
   */
  uuidMorphs(name: string, indexName?: string): void {
    this.table.string(`${name}_type`);
    this.table.uuid(`${name}_id`);

    if (indexName !== null) {
      this.table.index([`${name}_type`, `${name}_id`], indexName);
    }
  }

  /**
   * Add nullable UUID columns for polymorphic relations
   *
   * Equivalent to Laravel's `$table->nullableUuidMorphs()`
   *
   * @param name - Relation name
   * @param indexName - Optional index name
   * @returns void
   */
  nullableUuidMorphs(name: string, indexName?: string): void {
    this.table.string(`${name}_type`).nullable();
    this.table.uuid(`${name}_id`).nullable();

    if (indexName !== null) {
      this.table.index([`${name}_type`, `${name}_id`], indexName);
    }
  }

  /**
   * Add ULID columns for polymorphic relations
   *
   * Equivalent to Laravel's `$table->ulidMorphs()`
   *
   * @param name - Relation name
   * @param indexName - Optional index name
   * @returns void
   */
  ulidMorphs(name: string, indexName?: string): void {
    this.table.string(`${name}_type`);
    this.table.string(`${name}_id`, 26);

    if (indexName !== null) {
      this.table.index([`${name}_type`, `${name}_id`], indexName);
    }
  }

  /**
   * Add nullable ULID columns for polymorphic relations
   *
   * Equivalent to Laravel's `$table->nullableUlidMorphs()`
   *
   * @param name - Relation name
   * @param indexName - Optional index name
   * @returns void
   */
  nullableUlidMorphs(name: string, indexName?: string): void {
    this.table.string(`${name}_type`).nullable();
    this.table.string(`${name}_id`, 26).nullable();

    if (indexName !== null) {
      this.table.index([`${name}_type`, `${name}_id`], indexName);
    }
  }

  // ============================================================================
  // INDEX METHODS
  // ============================================================================

  /**
   * Add a primary key
   *
   * @param columns - Column name or array of column names
   * @param constraintName - Optional constraint name
   * @returns void
   */
  primary(
    columns: string | readonly string[],
    constraintName?: string,
  ): Knex.TableBuilder {
    const cols = Array.isArray(columns) ? columns : [columns];
    return this.table.primary(cols, constraintName);
  }

  /**
   * Add a unique index
   *
   * @param columns - Column name or array of column names
   * @param indexName - Optional index name
   * @returns void
   */
  unique(columns: string | string[], indexName?: string): Knex.TableBuilder {
    return this.table.unique(columns, indexName);
  }

  /**
   * Add an index
   *
   * @param columns - Column name or array of column names
   * @param indexName - Optional index name
   * @param indexType - Optional index type (e.g., 'BTREE', 'HASH')
   * @returns void
   */
  index(columns: string | string[], indexName?: string, indexType?: string): Knex.TableBuilder {
    return this.table.index(columns, indexName, indexType);
  }

  /**
   * Add a foreign key constraint
   *
   * @param columns - Column name or array of column names
   * @param foreignKeyName - Optional foreign key name
   * @returns Foreign key builder for chaining
   */
  foreign(
    columns: string | readonly string[],
    foreignKeyName?: string,
  ): Knex.ForeignConstraintBuilder | Knex.MultikeyForeignConstraintBuilder {
    if (Array.isArray(columns)) {
      return this.table.foreign(columns as readonly string[], foreignKeyName);
    }
    return this.table.foreign(columns as string, foreignKeyName);
  }

  /**
   * Drop a column
   *
   * @param column - Column name
   * @returns void
   */
  dropColumn(column: string): Knex.TableBuilder {
    return this.table.dropColumn(column);
  }

  /**
   * Drop multiple columns
   *
   * @param columns - Array of column names
   * @returns void
   */
  dropColumns(...columns: string[]): Knex.TableBuilder {
    return this.table.dropColumns(...columns);
  }

  /**
   * Drop primary key
   *
   * @param constraintName - Optional constraint name
   * @returns void
   */
  dropPrimary(constraintName?: string): Knex.TableBuilder {
    return this.table.dropPrimary(constraintName);
  }

  /**
   * Drop unique index
   *
   * @param columns - Column name or array of column names
   * @param indexName - Optional index name
   * @returns void
   */
  dropUnique(
    columns: string | readonly string[],
    indexName?: string,
  ): Knex.TableBuilder {
    const cols = Array.isArray(columns) ? columns : [columns];
    return this.table.dropUnique(cols, indexName);
  }

  /**
   * Drop index
   *
   * @param columns - Column name or array of column names
   * @param indexName - Optional index name
   * @returns void
   */
  dropIndex(columns: string | string[], indexName?: string): Knex.TableBuilder {
    return this.table.dropIndex(columns, indexName);
  }

  /**
   * Drop foreign key
   *
   * @param columns - Column name or array of column names
   * @param foreignKeyName - Optional foreign key name
   * @returns void
   */
  dropForeign(columns: string | string[], foreignKeyName?: string): Knex.TableBuilder {
    return this.table.dropForeign(columns, foreignKeyName);
  }

  /**
   * Rename a column
   *
   * @param from - Current column name
   * @param to - New column name
   * @returns void
   */
  renameColumn(from: string, to: string): Knex.TableBuilder {
    return this.table.renameColumn(from, to);
  }

  /**
   * Get the underlying Knex table builder
   *
   * Use this to access Knex methods not wrapped by Blueprint
   *
   * @returns Knex TableBuilder instance
   */
  getTable(): Knex.TableBuilder {
    return this.table;
  }
}
