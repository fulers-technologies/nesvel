/**
 * Column Type Enum
 *
 * Defines the available database column types that can be used when
 * building database schemas through the Blueprint migration system.
 * These types map to Knex.js column types and support cross-database compatibility.
 *
 * @enum {string}
 * @since 1.0.0
 */
export enum ColumnType {
  /**
   * Auto-incrementing integer primary key
   * Suitable for primary key columns
   */
  INCREMENTS = 'increments',

  /**
   * Big auto-incrementing integer
   * For large tables requiring 64-bit auto-increment
   */
  BIG_INCREMENTS = 'bigincrements',

  /**
   * UUID (Universally Unique Identifier)
   * Standard format: 8-4-4-4-12 hexadecimal digits
   */
  UUID = 'uuid',

  /**
   * Variable-length string
   * Default length: 255 characters
   */
  STRING = 'string',

  /**
   * Text column for medium-length content
   * Typically up to 65,535 characters
   */
  TEXT = 'text',

  /**
   * Long text column for large content
   * Typically up to 4,294,967,295 characters
   */
  LONG_TEXT = 'longtext',

  /**
   * Medium text column
   * Typically up to 16,777,215 characters
   */
  MEDIUM_TEXT = 'mediumtext',

  /**
   * Standard integer (-2,147,483,648 to 2,147,483,647)
   */
  INTEGER = 'integer',

  /**
   * Big integer (-9,223,372,036,854,775,808 to 9,223,372,036,854,775,807)
   */
  BIG_INTEGER = 'biginteger',

  /**
   * Small integer (-32,768 to 32,767)
   */
  SMALL_INTEGER = 'smallinteger',

  /**
   * Tiny integer (-128 to 127)
   */
  TINY_INTEGER = 'tinyinteger',

  /**
   * Decimal/Numeric with fixed precision
   * For precise decimal numbers (e.g., currency)
   */
  DECIMAL = 'decimal',

  /**
   * Single precision floating point
   * Approximate numeric values
   */
  FLOAT = 'float',

  /**
   * Double precision floating point
   * Higher precision than float
   */
  DOUBLE = 'double',

  /**
   * Boolean/bit column
   * True/false values
   */
  BOOLEAN = 'boolean',

  /**
   * Enumerated type with predefined values
   * Restricts column to specific set of values
   */
  ENUM = 'enum',

  /**
   * Date without time
   * Format: YYYY-MM-DD
   */
  DATE = 'date',

  /**
   * Date and time
   * Format: YYYY-MM-DD HH:MM:SS
   */
  DATETIME = 'datetime',

  /**
   * Time without date
   * Format: HH:MM:SS
   */
  TIME = 'time',

  /**
   * Timestamp
   * Unix timestamp or database-specific timestamp
   */
  TIMESTAMP = 'timestamp',

  /**
   * Timestamp with timezone (PostgreSQL)
   * Stores timezone information
   */
  TIMESTAMP_TZ = 'timestamptz',

  /**
   * JSON column
   * Stores JSON formatted data
   */
  JSON = 'json',

  /**
   * JSONB column (PostgreSQL)
   * Binary JSON with indexing support
   */
  JSONB = 'jsonb',

  /**
   * Binary data
   * For storing files, images, etc.
   */
  BINARY = 'binary',

  /**
   * Large binary object
   * For very large binary data
   */
  BLOB = 'blob',
}
