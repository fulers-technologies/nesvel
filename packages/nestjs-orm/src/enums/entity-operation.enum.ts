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
  CREATED = 'created',

  /**
   * Entity was updated (UPDATE operation)
   * Triggered when existing entity fields are modified
   */
  UPDATED = 'updated',

  /**
   * Entity was deleted (DELETE operation)
   * Triggered when an entity is permanently removed (hard delete)
   */
  DELETED = 'deleted',

  /**
   * Entity was loaded from database (SELECT operation)
   * Triggered when an entity is retrieved/queried
   */
  LOADED = 'loaded',

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
