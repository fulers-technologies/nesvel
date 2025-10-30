import { EntityOperation } from '../enums';

/**
 * Entity Event Payload Interface
 *
 * Comprehensive data structure containing all information about entity lifecycle events.
 * This payload is published to the PubSub system and provides detailed context about
 * the database operation, including change tracking, performance metrics, and metadata.
 *
 * Used for:
 * - Audit logging and compliance tracking
 * - Cache invalidation strategies
 * - Real-time notifications and webhooks
 * - Event sourcing and CQRS patterns
 * - Integration with external systems
 *
 * @template T - The entity type that triggered the event
 *
 * @example
 * ```typescript
 * // Subscribe to user creation events
 * this.pubsub.subscribe('user.created', (payload: EntityEventPayload<User>) => {
 *   console.log(`New user registered: ${payload.entity.email}`);
 *   console.log(`Created at: ${payload.timestamp}`);
 *   // Send welcome email, update analytics, etc.
 * });
 *
 * // Subscribe to update events with change tracking
 * this.pubsub.subscribe('user.updated', (payload: EntityEventPayload<User>) => {
 *   if (payload.changes?.modified.includes('email')) {
 *     console.log('User changed email from', payload.changes.originalValues.email);
 *     console.log('to', payload.changes.newValues.email);
 *   }
 * });
 * ```
 */
export interface EntityEventPayload<T = any> {
  /**
   * The entity instance that triggered the event
   *
   * Contains the full entity data at the time of the event.
   * Sensitive fields are automatically sanitized to prevent
   * accidental exposure of passwords, tokens, etc.
   */
  entity: T;

  /**
   * The name of the entity class
   *
   * Derived from the entity constructor name, used for
   * channel routing and event categorization.
   *
   * @example "User", "Post", "Order"
   */
  entityName: string;

  /**
   * The type of database operation that occurred
   *
   * Maps to different entity lifecycle events:
   * - CREATED: Entity was inserted into the database
   * - UPDATED: Entity fields were modified
   * - DELETED: Entity was permanently removed (hard delete)
   * - LOADED: Entity was retrieved from database
   * - SOFT_DELETED: Entity was marked as deleted but not removed
   * - RESTORED: Previously soft-deleted entity was restored
   */
  operation: EntityOperation;

  /**
   * The primary key value of the entity
   *
   * Extracted automatically from common ID field patterns (id, _id, uuid, guid).
   * Used for efficient event routing and entity identification.
   *
   * @optional
   */
  entityId?: string | number | undefined;

  /**
   * ISO timestamp when the event occurred
   *
   * Precise moment the database operation was completed,
   * useful for event ordering and audit trails.
   */
  timestamp: Date;

  /**
   * Contextual information about the operation environment
   *
   * Contains runtime and environmental context including:
   * - Node.js environment details
   * - Process information
   * - Transaction context
   * - Custom metadata from event args
   */
  context: Record<string, any>;

  /**
   * Detailed change tracking information for update operations
   *
   * Only populated for update events when trackDetailedChanges is enabled.
   * Provides before/after values for all modified fields.
   */
  changes?: {
    /**
     * Array of field names that were modified
     *
     * @example ["email", "updatedAt", "lastLoginAt"]
     */
    modified: string[];

    /**
     * Field values before the update operation
     *
     * Partial object containing only the fields that were changed,
     * preserving the original state for audit purposes.
     */
    originalValues: Partial<T>;

    /**
     * Field values after the update operation
     *
     * Partial object containing the new values for all modified fields.
     */
    newValues: Partial<T>;
  };

  /**
   * Additional contextual information about the operation
   *
   * Extensible metadata object for custom information,
   * performance metrics, and operational context.
   */
  metadata: {
    /**
     * Indicates if this is a newly created record
     *
     * True for create operations, false for updates/deletes.
     */
    isNewRecord: boolean;

    /**
     * Source of the event (typically 'orm')
     *
     * Indicates the system component that generated the event.
     */
    source: string;

    /**
     * Human-readable description of the operation
     *
     * Provides additional context about what happened.
     */
    description?: string;

    /**
     * Transaction ID if the operation was part of a transaction
     *
     * Links related operations together for audit and debugging.
     */
    transactionId?: string;

    /**
     * Performance metrics for the operation
     *
     * Optional timing and resource usage information,
     * enabled via includePerformanceMetrics option.
     */
    performance?: {
      /**
       * Time taken for event processing in milliseconds
       *
       * Measured from event start to publication completion.
       */
      eventProcessingTime: number;

      /**
       * Memory usage snapshot during the operation
       *
       * Node.js process memory usage at event time.
       */
      memoryUsage: NodeJS.MemoryUsage;

      /**
       * ISO timestamp when metrics were captured
       *
       * Precise timing for performance analysis.
       */
      timestamp: string;
    };

    /**
     * Indicates if this was part of a bulk operation
     *
     * MikroORM events are always per-entity, so this is typically false.
     * Can be set to true by custom implementations for batch operations.
     */
    isBulkOperation?: boolean;

    /**
     * ID of the user who performed the operation
     *
     * Requires integration with authentication/authorization system.
     * Can be populated through request context or service layer.
     */
    userId?: string | number;
  };
}
