import { MessageErrorHandler, MessageFilter } from '@/types/message-handler.type';

/**
 * Metadata structure for topic subscriptions.
 *
 * This interface defines the metadata that is attached to methods decorated
 * with @Subscribe(). It contains all the information needed to establish
 * a subscription and configure message handling behavior.
 *
 * The metadata is stored using Reflect.metadata and retrieved during module
 * initialization to set up subscriptions automatically.
 */
export interface ISubscriptionMetadata {
  /**
   * The topic or channel name to subscribe to.
   *
   * This is the primary identifier for routing messages to the appropriate
   * handler. Topics can use various naming conventions depending on the
   * messaging system and application architecture.
   *
   * @example 'user.created', 'order.completed', 'notification.email'
   */
  topic: string;

  /**
   * Optional filter function to selectively process messages.
   *
   * When provided, this function is evaluated for each incoming message.
   * Only messages for which the filter returns true will be passed to
   * the handler. This enables content-based routing and conditional
   * message processing without requiring separate topics.
   *
   * @example
   * ```typescript
   * filter: (message) => message.data.priority === 'high'
   * ```
   */
  filter?: MessageFilter;

  /**
   * Optional error handler for processing failures.
   *
   * When provided, this function is invoked if the message handler throws
   * an error or returns a rejected promise. It receives both the error and
   * the message that was being processed, allowing for custom error handling
   * logic such as logging, alerting, or dead-letter queue routing.
   *
   * If not provided, errors will be logged and the message will be rejected
   * according to the driver's default behavior.
   *
   * @example
   * ```typescript
   * errorHandler: async (error, message) => {
   *   logger.error('Handler failed', { error, messageId: message.id });
   *   await sendToDeadLetterQueue(message);
   * }
   * ```
   */
  errorHandler?: MessageErrorHandler;

  /**
   * Optional driver-specific subscription options.
   *
   * Different messaging systems support various subscription configuration
   * options. This field allows passing driver-specific options such as:
   *
   * For Kafka:
   * - Consumer group ID
   * - Partition assignment strategy
   * - Offset reset policy
   *
   * For Google PubSub:
   * - Acknowledgment deadline
   * - Flow control settings
   * - Retry policy
   *
   * For Redis:
   * - Pattern matching
   * - Buffer mode
   *
   * @example
   * ```typescript
   * options: {
   *   groupId: 'my-consumer-group',
   *   fromBeginning: true
   * }
   * ```
   */
  options?: Record<string, any>;
}

/**
 * Namespace for ISubscriptionMetadata interface containing the symbol for dependency injection.
 */
export namespace ISubscriptionMetadata {
  /**
   * Unique symbol identifier for the ISubscriptionMetadata interface.
   * Used for dependency injection and type identification in the NestJS container.
   */
  export const $ = Symbol('ISubscriptionMetadata');
}
