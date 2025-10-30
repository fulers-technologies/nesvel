import type { Knex } from 'knex';
import { Logger } from '@nestjs/common';
import type { IColumnDefinition, IIndexDefinition } from '@/interfaces';
import { ColumnType, ForeignKeyAction, IndexType } from '@/enums';

/**
 * Blueprint Class
 *
 * Provides a Laravel Eloquent-inspired fluent API for defining database table schemas.
 * This class acts as a builder pattern for creating and modifying database tables
 * with a clean, expressive syntax that's familiar to Laravel developers.
 *
 * The Blueprint class integrates with Knex.js to provide cross-database compatibility
 * while maintaining the elegant API patterns from Laravel's Schema Builder.
 *
 * @example
 * ```typescript
 * // Create a users table
 * const blueprint = new Blueprint('users');
 * blueprint.id();
 * blueprint.string('email').unique().notNullable();
 * blueprint.string('password');
 * blueprint.boolean('is_active').defaultTo(true);
 * blueprint.timestamps();
 *
 * await blueprint.create(knex);
 * ```
 *
 * @example
 * ```typescript
 * // Modify an existing table
 * const blueprint = new Blueprint('users');
 * blueprint.string('phone_number').nullable().after('email');
 * blueprint.dropColumn('old_field');
 *
 * await blueprint.modify(knex);
 * ```
 *
 * @author Nesvel
 * @since 1.0.0
 */
export class Blueprint {
  /**
   * Logger instance for the Blueprint class
   * Used for logging table creation, modification, and drop operations
   *
   * @private
   * @readonly
   */
  private readonly logger = new Logger(Blueprint.name);

  /**
   * Collection of column definitions to be created or modified
   * Each definition includes the column name, type, and constraints
   *
   * @private
   */
  private _columns: IColumnDefinition[] = [];

  /**
   * Collection of index definitions to be created
   * Includes primary keys, unique indexes, and regular indexes
   *
   * @private
   */
  private _indexes: IIndexDefinition[] = [];

  /**
   * List of column names to be dropped from the table
   * Used during table modification operations
   *
   * @private
   */
  private _dropColumns: string[] = [];

  /**
   * Collection of column rename operations
   * Each entry specifies the current column name and the new name
   *
   * @private
   */
  private _renameColumns: { from: string; to: string }[] = [];

  /**
   * List of index names to be dropped from the table
   * Used during table modification operations
   *
   * @private
   */
  private _dropIndexes: string[] = [];

  /**
   * Knex database instance
   * Stored for use in defaultTo functions that require database-specific defaults
   * (e.g., CURRENT_TIMESTAMP, knex.fn.now())
   *
   * @private
   */
  private knex?: Knex;

  /**
   * Create a new blueprint instance
   *
   * @param tableName - The name of the table this blueprint defines
   */
  constructor(
    private readonly tableName: string,
  ) {}

  /**
   * Add an auto-incrementing primary key column named 'id'
   *
   * @param columnName - Optional custom column name (defaults to 'id')
   * @returns This blueprint instance for chaining
   */
  id(columnName: string = 'id'): Blueprint {
    this.addColumn(columnName, ColumnType.INCREMENTS, {
      primary: true,
      autoIncrement: true,
      unsigned: true,
    });
    return this;
  }

  /**
   * Add a UUID primary key column
   *
   * @param columnName - Optional custom column name (defaults to 'id')
   * @returns Column builder for further customization
   */
  uuid(columnName: string = 'id'): ColumnBuilder {
    return this.addColumn(columnName, ColumnType.UUID, { primary: true });
  }

  /**
   * Add a string column
   *
   * @param columnName - The name of the column
   * @param length - Optional length for the string (defaults to 255)
   * @returns Column builder for further customization
   */
  string(columnName: string, length?: number): ColumnBuilder {
    return this.addColumn(columnName, ColumnType.STRING, length ? { length } : {});
  }

  /**
   * Add a text column
   *
   * @param columnName - The name of the column
   * @returns Column builder for further customization
   */
  text(columnName: string): ColumnBuilder {
    return this.addColumn(columnName, ColumnType.TEXT);
  }

  /**
   * Add a long text column
   *
   * @param columnName - The name of the column
   * @returns Column builder for further customization
   */
  longText(columnName: string): ColumnBuilder {
    return this.addColumn(columnName, ColumnType.LONG_TEXT);
  }

  /**
   * Add an integer column
   *
   * @param columnName - The name of the column
   * @returns Column builder for further customization
   */
  integer(columnName: string): ColumnBuilder {
    return this.addColumn(columnName, ColumnType.INTEGER);
  }

  /**
   * Add a big integer column
   *
   * @param columnName - The name of the column
   * @returns Column builder for further customization
   */
  bigInteger(columnName: string): ColumnBuilder {
    return this.addColumn(columnName, ColumnType.BIG_INTEGER);
  }

  /**
   * Add a small integer column
   *
   * @param columnName - The name of the column
   * @returns Column builder for further customization
   */
  smallInteger(columnName: string): ColumnBuilder {
    return this.addColumn(columnName, ColumnType.SMALL_INTEGER);
  }

  /**
   * Add a tiny integer column
   *
   * @param columnName - The name of the column
   * @returns Column builder for further customization
   */
  tinyInteger(columnName: string): ColumnBuilder {
    return this.addColumn(columnName, ColumnType.TINY_INTEGER);
  }

  /**
   * Add an unsigned integer column
   *
   * @param columnName - The name of the column
   * @returns Column builder for further customization
   */
  unsignedInteger(columnName: string): ColumnBuilder {
    return this.addColumn(columnName, ColumnType.INTEGER, { unsigned: true });
  }

  /**
   * Add a decimal column
   *
   * @param columnName - The name of the column
   * @param precision - Total number of digits
   * @param scale - Number of digits after decimal point
   * @returns Column builder for further customization
   */
  decimal(columnName: string, precision: number = 10, scale: number = 2): ColumnBuilder {
    return this.addColumn(columnName, ColumnType.DECIMAL, { length: precision, scale });
  }

  /**
   * Add a float column
   *
   * @param columnName - The name of the column
   * @returns Column builder for further customization
   */
  float(columnName: string): ColumnBuilder {
    return this.addColumn(columnName, ColumnType.FLOAT);
  }

  /**
   * Add a double column
   *
   * @param columnName - The name of the column
   * @returns Column builder for further customization
   */
  double(columnName: string): ColumnBuilder {
    return this.addColumn(columnName, ColumnType.DOUBLE);
  }

  /**
   * Add a boolean column
   *
   * @param columnName - The name of the column
   * @returns Column builder for further customization
   */
  boolean(columnName: string): ColumnBuilder {
    return this.addColumn(columnName, ColumnType.BOOLEAN);
  }

  /**
   * Add an enum column
   *
   * @param columnName - The name of the column
   * @param values - Allowed values for the enum
   * @returns Column builder for further customization
   */
  enum(columnName: string, values: string[]): ColumnBuilder {
    return this.addColumn(columnName, ColumnType.ENUM, { enumValues: values });
  }

  /**
   * Add a date column
   *
   * @param columnName - The name of the column
   * @returns Column builder for further customization
   */
  date(columnName: string): ColumnBuilder {
    return this.addColumn(columnName, ColumnType.DATE);
  }

  /**
   * Add a datetime column
   *
   * @param columnName - The name of the column
   * @returns Column builder for further customization
   */
  dateTime(columnName: string): ColumnBuilder {
    return this.addColumn(columnName, ColumnType.DATETIME);
  }

  /**
   * Add a time column
   *
   * @param columnName - The name of the column
   * @returns Column builder for further customization
   */
  time(columnName: string): ColumnBuilder {
    return this.addColumn(columnName, ColumnType.TIME);
  }

  /**
   * Add a timestamp column
   *
   * @param columnName - The name of the column
   * @returns Column builder for further customization
   */
  timestamp(columnName: string): ColumnBuilder {
    return this.addColumn(columnName, ColumnType.TIMESTAMP);
  }

  /**
   * Add standard timestamp columns (created_at, updated_at)
   *
   * @param useTimezone - Whether to use timezone-aware timestamps
   * @param defaultToCurrent - Whether to default to current timestamp
   * @returns This blueprint instance for chaining
   */
  timestamps(useTimezone: boolean = false, defaultToCurrent: boolean = true): Blueprint {
    const timestampType = useTimezone ? ColumnType.TIMESTAMP_TZ : ColumnType.TIMESTAMP;

    const createdAt = this.addColumn('created_at', timestampType);
    const updatedAt = this.addColumn('updated_at', timestampType);

    if (defaultToCurrent) {
      createdAt.defaultTo(this.knex?.fn.now() || 'CURRENT_TIMESTAMP');
      updatedAt.defaultTo(this.knex?.fn.now() || 'CURRENT_TIMESTAMP');
    }

    return this;
  }

  /**
   * Add soft delete timestamp column (deleted_at)
   *
   * @returns Column builder for further customization
   */
  softDeletes(): ColumnBuilder {
    return this.addColumn('deleted_at', ColumnType.TIMESTAMP).nullable();
  }

  /**
   * Add a JSON column
   *
   * @param columnName - The name of the column
   * @returns Column builder for further customization
   */
  json(columnName: string): ColumnBuilder {
    return this.addColumn(columnName, ColumnType.JSON);
  }

  /**
   * Add a JSONB column (PostgreSQL)
   *
   * @param columnName - The name of the column
   * @returns Column builder for further customization
   */
  jsonb(columnName: string): ColumnBuilder {
    return this.addColumn(columnName, ColumnType.JSONB);
  }

  /**
   * Add a binary column
   *
   * @param columnName - The name of the column
   * @returns Column builder for further customization
   */
  binary(columnName: string): ColumnBuilder {
    return this.addColumn(columnName, ColumnType.BINARY);
  }

  /**
   * Add a foreign key column
   *
   * @param columnName - The name of the column
   * @param references - Table and column reference
   * @returns Column builder for further customization
   */
  foreignId(columnName: string, references?: { table: string; column?: string }): ColumnBuilder {
    const builder = this.addColumn(columnName, ColumnType.BIG_INTEGER, { unsigned: true });

    if (references) {
      builder.references(references.table, references.column || 'id');
    }

    return builder;
  }

  /**
   * Add a foreign UUID column
   *
   * @param columnName - The name of the column
   * @param references - Table and column reference
   * @returns Column builder for further customization
   */
  foreignUuid(columnName: string, references?: { table: string; column?: string }): ColumnBuilder {
    const builder = this.addColumn(columnName, ColumnType.UUID);

    if (references) {
      builder.references(references.table, references.column || 'id');
    }

    return builder;
  }

  /**
   * Add an index to the table
   *
   * @param columns - Column(s) to index
   * @param indexName - Optional index name
   * @returns This blueprint instance for chaining
   */
  index(columns: string | string[], indexName?: string): Blueprint {
    this._indexes.push({
      ...(indexName && { name: indexName }),
      columns: Array.isArray(columns) ? columns : [columns],
      type: IndexType.INDEX,
    });
    return this;
  }

  /**
   * Add a unique index to the table
   *
   * @param columns - Column(s) to index
   * @param indexName - Optional index name
   * @returns This blueprint instance for chaining
   */
  unique(columns: string | string[], indexName?: string): Blueprint {
    this._indexes.push({
      ...(indexName && { name: indexName }),
      columns: Array.isArray(columns) ? columns : [columns],
      type: IndexType.UNIQUE,
    });
    return this;
  }

  /**
   * Add a primary key constraint
   *
   * @param columns - Column(s) for the primary key
   * @returns This blueprint instance for chaining
   */
  primary(columns: string | string[]): Blueprint {
    this._indexes.push({
      columns: Array.isArray(columns) ? columns : [columns],
      type: IndexType.PRIMARY,
    });
    return this;
  }

  /**
   * Drop a column from the table
   *
   * @param columnName - The name of the column to drop
   * @returns This blueprint instance for chaining
   */
  dropColumn(columnName: string): Blueprint {
    this._dropColumns.push(columnName);
    return this;
  }

  /**
   * Drop multiple columns from the table
   *
   * @param columnNames - The names of the columns to drop
   * @returns This blueprint instance for chaining
   */
  dropColumns(columnNames: string[]): Blueprint {
    this._dropColumns.push(...columnNames);
    return this;
  }

  /**
   * Rename a column
   *
   * @param from - Current column name
   * @param to - New column name
   * @returns This blueprint instance for chaining
   */
  renameColumn(from: string, to: string): Blueprint {
    this._renameColumns.push({ from, to });
    return this;
  }

  /**
   * Drop an index from the table
   *
   * @param indexName - The name of the index to drop
   * @returns This blueprint instance for chaining
   */
  dropIndex(indexName: string): Blueprint {
    this._dropIndexes.push(indexName);
    return this;
  }

  /**
   * Create the table using this blueprint
   *
   * @param knex - The Knex database connection
   */
  async create(knex: Knex): Promise<void> {
    this.knex = knex;

    await knex.schema.createTable(this.tableName, (table: Knex.CreateTableBuilder) => {
      this.applyColumns(table);
      this.applyIndexes(table);
    });

    this.logger.log(`Table '${this.tableName}' created successfully`);
  }

  /**
   * Modify an existing table using this blueprint
   *
   * @param knex - The Knex database connection
   */
  async modify(knex: Knex): Promise<void> {
    this.knex = knex;

    await knex.schema.alterTable(this.tableName, (table: Knex.AlterTableBuilder) => {
      // Apply column drops first
      this._dropColumns.forEach((columnName) => {
        table.dropColumn(columnName);
      });

      // Apply column renames
      this._renameColumns.forEach(({ from, to }) => {
        table.renameColumn(from, to);
      });

      // Apply new columns
      this.applyColumns(table);

      // Apply new indexes
      this.applyIndexes(table);

      // Drop indexes
      this._dropIndexes.forEach((indexName) => {
        table.dropIndex([], indexName);
      });
    });

    this.logger.log(`Table '${this.tableName}' modified successfully`);
  }

  /**
   * Drop the table
   *
   * @param knex - The Knex database connection
   */
  async drop(knex: Knex): Promise<void> {
    await knex.schema.dropTableIfExists(this.tableName);
    this.logger.log(`Table '${this.tableName}' dropped successfully`);
  }

  /**
   * Apply column definitions to the Knex table builder
   *
   * @param table - The Knex table builder
   */
  private applyColumns(table: Knex.CreateTableBuilder | Knex.AlterTableBuilder): void {
    this._columns.forEach((column) => {
      let columnBuilder: any;

      // Create the column based on its type
      switch (column.type) {
        case ColumnType.INCREMENTS:
          columnBuilder = table.increments(column.name);
          break;
        case ColumnType.STRING:
          columnBuilder = column.length
            ? table.string(column.name, column.length)
            : table.string(column.name);
          break;
        case ColumnType.TEXT:
          columnBuilder = table.text(column.name);
          break;
        case ColumnType.LONG_TEXT:
          columnBuilder = table.text(column.name, 'longtext');
          break;
        case ColumnType.INTEGER:
          columnBuilder = table.integer(column.name);
          break;
        case ColumnType.BIG_INTEGER:
          columnBuilder = table.bigInteger(column.name);
          break;
        case ColumnType.SMALL_INTEGER:
          columnBuilder = table.smallint(column.name);
          break;
        case ColumnType.TINY_INTEGER:
          columnBuilder = (table as any).tinyint
            ? (table as any).tinyint(column.name)
            : table.integer(column.name);
          break;
        case ColumnType.DECIMAL:
          columnBuilder = table.decimal(column.name, column.length, column.scale);
          break;
        case ColumnType.FLOAT:
          columnBuilder = table.float(column.name);
          break;
        case ColumnType.DOUBLE:
          columnBuilder = table.double(column.name);
          break;
        case ColumnType.BOOLEAN:
          columnBuilder = table.boolean(column.name);
          break;
        case ColumnType.DATE:
          columnBuilder = table.date(column.name);
          break;
        case ColumnType.DATETIME:
          columnBuilder = table.datetime(column.name);
          break;
        case ColumnType.TIME:
          columnBuilder = table.time(column.name);
          break;
        case ColumnType.TIMESTAMP:
          columnBuilder = table.timestamp(column.name);
          break;
        case ColumnType.TIMESTAMP_TZ:
          columnBuilder = table.timestamp(column.name, { useTz: true });
          break;
        case ColumnType.JSON:
          columnBuilder = table.json(column.name);
          break;
        case ColumnType.JSONB:
          columnBuilder = table.jsonb(column.name);
          break;
        case ColumnType.UUID:
          columnBuilder = table.uuid(column.name);
          break;
        case ColumnType.BINARY:
          columnBuilder = table.binary(column.name);
          break;
        case ColumnType.ENUM:
          columnBuilder = table.enum(column.name, column.enumValues!);
          break;
        default:
          throw new Error(`Unsupported column type: ${column.type}`);
      }

      // Apply column modifiers
      if (column.primary) {
        columnBuilder.primary();
      }

      if (column.unique) {
        columnBuilder.unique();
      }

      if (column.nullable) {
        columnBuilder.nullable();
      } else {
        columnBuilder.notNullable();
      }

      if (column.defaultValue !== undefined) {
        columnBuilder.defaultTo(column.defaultValue);
      }

      if (column.unsigned) {
        columnBuilder.unsigned();
      }

      if (column.comment) {
        columnBuilder.comment(column.comment);
      }

      // Apply foreign key constraint
      if (column.references) {
        columnBuilder.references(column.references.column).inTable(column.references.table);

        if (column.references.onDelete) {
          columnBuilder.onDelete(column.references.onDelete);
        }

        if (column.references.onUpdate) {
          columnBuilder.onUpdate(column.references.onUpdate);
        }
      }

      // Apply index
      if (column.index) {
        if (column.index.type === IndexType.UNIQUE) {
          columnBuilder.unique(column.index.name);
        } else {
          columnBuilder.index(column.index.name);
        }
      }
    });
  }

  /**
   * Apply index definitions to the Knex table builder
   *
   * @param table - The Knex table builder
   */
  private applyIndexes(table: Knex.CreateTableBuilder | Knex.AlterTableBuilder): void {
    this._indexes.forEach((indexDef) => {
      switch (indexDef.type) {
        case IndexType.PRIMARY:
          table.primary(indexDef.columns);
          break;
        case IndexType.UNIQUE:
          if (indexDef.name) {
            table.unique(indexDef.columns, indexDef.name);
          } else {
            table.unique(indexDef.columns);
          }
          break;
        case IndexType.INDEX:
          if (indexDef.name) {
            table.index(indexDef.columns, indexDef.name);
          } else {
            table.index(indexDef.columns);
          }
          break;
        case IndexType.FULLTEXT:
          // Note: Fulltext indexes are not supported by all databases
          // This would need database-specific implementation
          this.logger.warn(
            `Fulltext indexes not supported by Knex, skipping index: ${indexDef.name}`,
          );
          break;
      }
    });
  }

  /**
   * Add a column to the blueprint
   *
   * @param name - Column name
   * @param type - Column type
   * @param options - Additional column options
   * @returns Column builder for further customization
   */
  private addColumn(
    name: string,
    type: string,
    options: Partial<IColumnDefinition> = {},
  ): ColumnBuilder {
    const column: IColumnDefinition = {
      name,
      type,
      nullable: false,
      primary: false,
      unique: false,
      autoIncrement: false,
      unsigned: false,
      ...options,
    };

    this._columns.push(column);
    return new ColumnBuilder(column, this);
  }
}

/**
 * Column Builder Class
 *
 * Provides fluent API for configuring individual column properties.
 * This class is returned by Blueprint column methods to allow method chaining.
 */
export class ColumnBuilder {
  constructor(
    private readonly column: IColumnDefinition,
    private readonly blueprint: Blueprint,
  ) {}

  /**
   * Make the column nullable
   *
   * @returns This column builder for chaining
   */
  nullable(): ColumnBuilder {
    this.column.nullable = true;
    return this;
  }

  /**
   * Make the column not nullable
   *
   * @returns This column builder for chaining
   */
  notNullable(): ColumnBuilder {
    this.column.nullable = false;
    return this;
  }

  /**
   * Set a default value for the column
   *
   * @param value - The default value
   * @returns This column builder for chaining
   */
  defaultTo(value: any): ColumnBuilder {
    this.column.defaultValue = value;
    return this;
  }

  /**
   * Make the column a primary key
   *
   * @returns This column builder for chaining
   */
  primary(): ColumnBuilder {
    this.column.primary = true;
    return this;
  }

  /**
   * Add a unique constraint to the column
   *
   * @param indexName - Optional index name
   * @returns This column builder for chaining
   */
  unique(indexName?: string): ColumnBuilder {
    this.column.unique = true;
    if (indexName) {
      this.column.index = { name: indexName, type: IndexType.UNIQUE };
    }
    return this;
  }

  /**
   * Make the column unsigned (for numeric types)
   *
   * @returns This column builder for chaining
   */
  unsigned(): ColumnBuilder {
    this.column.unsigned = true;
    return this;
  }

  /**
   * Add an index to the column
   *
   * @param indexName - Optional index name
   * @returns This column builder for chaining
   */
  index(indexName?: string): ColumnBuilder {
    this.column.index = {
      ...(indexName && { name: indexName }),
      type: IndexType.INDEX,
    };
    return this;
  }

  /**
   * Add a comment to the column
   *
   * @param comment - The column comment
   * @returns This column builder for chaining
   */
  comment(comment: string): ColumnBuilder {
    this.column.comment = comment;
    return this;
  }

  /**
   * Add a foreign key reference
   *
   * @param table - Referenced table name
   * @param column - Referenced column name (defaults to 'id')
   * @returns This column builder for chaining
   */
  references(table: string, column: string = 'id'): ColumnBuilder {
    this.column.references = {
      table,
      column,
      onDelete: ForeignKeyAction.RESTRICT,
      onUpdate: ForeignKeyAction.CASCADE,
    };
    return this;
  }

  /**
   * Set the foreign key on delete action
   *
   * @param action - The action to take
   * @returns This column builder for chaining
   */
  onDelete(action: ForeignKeyAction): ColumnBuilder {
    if (this.column.references) {
      this.column.references.onDelete = action;
    }
    return this;
  }

  /**
   * Set the foreign key on update action
   *
   * @param action - The action to take
   * @returns This column builder for chaining
   */
  onUpdate(action: ForeignKeyAction): ColumnBuilder {
    if (this.column.references) {
      this.column.references.onUpdate = action;
    }
    return this;
  }

  /**
   * Set foreign key to cascade on delete
   *
   * @returns This column builder for chaining
   */
  cascadeOnDelete(): ColumnBuilder {
    return this.onDelete(ForeignKeyAction.CASCADE);
  }

  /**
   * Set foreign key to restrict on delete
   *
   * @returns This column builder for chaining
   */
  restrictOnDelete(): ColumnBuilder {
    return this.onDelete(ForeignKeyAction.RESTRICT);
  }

  /**
   * Set foreign key to set null on delete
   *
   * @returns This column builder for chaining
   */
  nullOnDelete(): ColumnBuilder {
    return this.onDelete(ForeignKeyAction.SET_NULL);
  }

  // Return the blueprint for continued chaining
  end(): Blueprint {
    return this.blueprint;
  }
}
