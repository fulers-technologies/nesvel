/**
 * Interface representing a standardized pub/sub message structure.
 *
 * This interface defines the common structure for all messages flowing through
 * the PubSub system, regardless of the underlying driver implementation.
 * It ensures consistency and type safety across different messaging backends.
 *
 * @template TData - The type of the message payload data
 */
export interface IPubSubMessage<TData = any> {
  /**
   * Unique identifier for the message.
   * This ID is generated when the message is created and remains constant
   * throughout its lifecycle. Useful for tracking, deduplication, and debugging.
   */
  id: string;

  /**
   * The topic or channel name where the message is published.
   * Topics are used to categorize messages and route them to appropriate subscribers.
   *
   * @example 'user.created', 'order.completed', 'notification.email'
   */
  topic: string;

  /**
   * The actual payload data of the message.
   * This can be any serializable data structure (object, array, primitive, etc.).
   * The type is determined by the generic parameter TData.
   */
  data: TData;

  /**
   * Timestamp indicating when the message was created.
   * This is set automatically when the message is published and is useful
   * for ordering, TTL calculations, and audit trails.
   */
  timestamp: Date;

  /**
   * Optional metadata associated with the message.
   * This can include additional context such as:
   * - Correlation IDs for distributed tracing
   * - User or service identifiers
   * - Message priority or TTL
   * - Custom application-specific attributes
   *
   * @example { correlationId: '123', userId: 'user-456', priority: 'high' }
   */
  metadata?: Record<string, any>;

  /**
   * Optional attributes specific to the underlying driver.
   * Different messaging systems may have their own specific attributes
   * (e.g., Kafka partition keys, Google PubSub ordering keys).
   * This field allows passing through driver-specific information without
   * breaking the common interface.
   */
  attributes?: Record<string, any>;
}

/**
 * Namespace for IPubSubMessage interface containing the symbol for dependency injection.
 */
export namespace IPubSubMessage {
  /**
   * Unique symbol identifier for the IPubSubMessage interface.
   * Used for dependency injection and type identification in the NestJS container.
   */
  export const $ = Symbol('IPubSubMessage');
}
