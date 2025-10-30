/**
 * Index Type Enum
 *
 * Defines the available types of database indexes that can be created
 * on tables. Different index types provide different performance characteristics
 * and use cases for database queries.
 *
 * @enum {string}
 * @since 1.0.0
 */
export enum IndexType {
  /**
   * Standard B-tree index for general querying
   * Suitable for equality and range queries
   */
  INDEX = 'index',

  /**
   * Unique index that enforces uniqueness constraint
   * Ensures no duplicate values in indexed column(s)
   */
  UNIQUE = 'unique',

  /**
   * Primary key index
   * Uniquely identifies each row in the table
   */
  PRIMARY = 'primary',

  /**
   * Full-text index for text search
   * Optimized for searching text content (MySQL/PostgreSQL)
   */
  FULLTEXT = 'fulltext',
}
