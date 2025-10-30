/**
 * Blueprint Action Enum
 *
 * Defines the types of operations that can be performed on database tables
 * through the Blueprint migration system. Each action represents a different
 * lifecycle stage of table management.
 *
 * @enum {string}
 * @since 1.0.0
 */
export enum BlueprintAction {
  /**
   * Create a new table
   * Defines a new table schema and creates it in the database
   */
  CREATE = 'create',

  /**
   * Modify an existing table
   * Alters table structure by adding, dropping, or changing columns/indexes
   */
  MODIFY = 'modify',

  /**
   * Drop an existing table
   * Permanently removes the table and all its data from the database
   */
  DROP = 'drop',
}
