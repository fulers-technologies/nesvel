/**
 * Foreign Key Action Enum
 *
 * Defines the referential integrity actions that can be applied to foreign key
 * constraints when the referenced row is updated or deleted. These actions
 * maintain data consistency across related tables.
 *
 * @enum {string}
 * @since 1.0.0
 */
export enum ForeignKeyAction {
  /**
   * Cascade the operation to dependent rows
   * DELETE: Deletes all rows that reference the deleted row
   * UPDATE: Updates all referencing foreign keys to the new value
   */
  CASCADE = 'CASCADE',

  /**
   * Restrict the operation if dependent rows exist
   * Prevents deletion or update if any rows reference the target row
   * This is typically the default behavior
   */
  RESTRICT = 'RESTRICT',

  /**
   * Set the foreign key to NULL
   * When the referenced row is deleted/updated, set referencing foreign keys to NULL
   * Note: The foreign key column must be nullable
   */
  SET_NULL = 'SET NULL',

  /**
   * Prevent the operation (similar to RESTRICT)
   * The check is deferred until the end of the transaction
   * Not supported by all database systems
   */
  NO_ACTION = 'NO ACTION',

  /**
   * Set the foreign key to its default value
   * When the referenced row is deleted/updated, set foreign keys to their default value
   * The foreign key column must have a default value defined
   */
  SET_DEFAULT = 'SET DEFAULT',
}
