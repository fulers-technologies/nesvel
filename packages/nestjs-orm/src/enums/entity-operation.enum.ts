/**
 * Entity Operation Enum
 *
 * Defines the types of database operations that can occur on entities
 * throughout their lifecycle. These operations are tracked and published
 * as events for audit logging, cache invalidation, and integration purposes.
 *
 * @enum {string}
 * @since 1.0.0
 */
export enum EntityOperation {
  /**
   * Entity was created (INSERT operation)
   * Triggered when a new entity is persisted to the database
   */
  CREATED = 'create',

  /**
   * Entity was updated (UPDATE operation)
   * Triggered when existing entity fields are modified
   */
  UPDATED = 'update',

  /**
   * Entity was deleted (DELETE operation)
   * Triggered when an entity is permanently removed (hard delete)
   */
  DELETED = 'delete',

  /**
   * Entity was saved (INSERT or UPDATE)
   * Triggered when an entity is persisted (create or update)
   */
  SAVED = 'save',

  /**
   * Entity was upserted (INSERT or UPDATE based on existence)
   * Triggered when using upsert operation
   */
  UPSERTED = 'upsert',

  /**
   * Entity was loaded from database (SELECT operation)
   * Triggered when an entity is retrieved/queried
   */
  LOADED = 'find',

  /**
   * Entities were counted (COUNT operation)
   * Triggered when counting entities
   */
  COUNTED = 'count',

  /**
   * Entities were inserted in batch
   * Triggered during bulk insert operations
   */
  INSERTED = 'insert',

  /**
   * Entities were paginated
   * Triggered during pagination operations
   */
  PAGINATED = 'paginate',

  /**
   * Aggregate function (SUM)
   * Triggered when calculating sum
   */
  SUM = 'sum',

  /**
   * Aggregate function (AVG)
   * Triggered when calculating average
   */
  AVG = 'avg',

  /**
   * Aggregate function (MIN)
   * Triggered when finding minimum
   */
  MIN = 'min',

  /**
   * Aggregate function (MAX)
   * Triggered when finding maximum
   */
  MAX = 'max',

  /**
   * Table was truncated (DELETE ALL)
   * Triggered when truncating entire table
   */
  TRUNCATED = 'truncate',

  /**
   * Entity was soft deleted
   * Triggered when an entity is marked as deleted but not physically removed
   */
  SOFT_DELETED = 'soft_deleted',

  /**
   * Entity was restored from soft delete
   * Triggered when a previously soft-deleted entity is restored
   */
  RESTORED = 'restored',
}
