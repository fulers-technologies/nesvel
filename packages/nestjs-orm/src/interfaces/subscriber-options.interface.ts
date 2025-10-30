/**
 * Subscriber Configuration Options Interface
 *
 * Comprehensive configuration object for customizing BaseSubscriber behavior.
 * All options have sensible defaults and can be overridden per instance.
 *
 * @example
 * ```typescript
 * const options: SubscriberOptions = {
 *   enabled: true,
 *   includePerformanceMetrics: true,
 *   trackDetailedChanges: true,
 *   maxChangeTrackingSize: 500,
 *   channelPattern: 'events.{entityName}.{operation}',
 *   logEvents: process.env.NODE_ENV === 'development'
 * };
 * ```
 */
export interface SubscriberOptions {
  /**
   * Global toggle for event publishing
   *
   * When disabled, no events will be published but subscriber
   * will still be registered and can be re-enabled at runtime.
   *
   * @default true
   */
  enabled?: boolean;

  /**
   * Include performance timing and memory metrics in event payloads
   *
   * Adds execution time and memory usage data to events.
   * Useful for monitoring but adds slight overhead.
   *
   * @default false
   */
  includePerformanceMetrics?: boolean;

  /**
   * Track detailed before/after values for update operations
   *
   * When enabled, captures original and new values for all modified fields.
   * Disable for high-volume entities to reduce memory usage.
   *
   * @default true
   */
  trackDetailedChanges?: boolean;

  /**
   * Maximum number of field changes to track per update
   *
   * Prevents memory issues with entities having many fields.
   * Changes beyond this limit are truncated with a warning.
   *
   * @default 1000
   */
  maxChangeTrackingSize?: number;

  /**
   * Template pattern for generating PubSub channel names
   *
   * Supports placeholders:
   * - {entityName}: The entity class name
   * - {operation}: The operation type (created, updated, etc.)
   *
   * @default "{entityName}.{operation}"
   * @example "events.{entityName}.{operation}" → "events.User.created"
   */
  channelPattern?: string;

  /**
   * Enable debug logging for all event operations
   *
   * Logs event publishing activity for debugging and monitoring.
   * Should be disabled in production to avoid log spam.
   *
   * @default false
   */
  logEvents?: boolean;

  /**
   * Enable publishing of entity load events
   *
   * When enabled, publishes '{entityName}.loaded' events when entities
   * are retrieved from the database. This can generate high volume events
   * and should be used carefully in production environments.
   *
   * Useful for:
   * - Access logging and audit trails
   * - Cache invalidation triggers
   * - Analytics and usage tracking
   * - Security monitoring
   *
   * @default false
   * @warning Can generate significant event volume in read-heavy applications
   */
  publishLoadEvents?: boolean;
}
