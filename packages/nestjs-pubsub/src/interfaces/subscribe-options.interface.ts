import { MessageErrorHandler, MessageFilter } from '@/types/message-handler.type';

/**
 * Options for configuring a subscription via the @Subscribe decorator.
 *
 * These options control how messages are filtered, handled, and processed
 * for the decorated method.
 */
export interface SubscribeOptions {
  /**
   * Optional filter function to selectively process messages.
   * Only messages for which the filter returns true will be passed to the handler.
   *
   * @example
   * ```typescript
   * filter: (message) => message.data.priority === 'high'
   * ```
   */
  filter?: MessageFilter;

  /**
   * Optional error handler for processing failures.
   * Invoked when the message handler throws an error or returns a rejected promise.
   *
   * @example
   * ```typescript
   * errorHandler: async (error, message) => {
   *   logger.error('Handler failed', { error, messageId: message.id });
   * }
   * ```
   */
  errorHandler?: MessageErrorHandler;

  /**
   * Optional queue group for load balancing subscriptions.
   * Multiple subscribers in the same queue group will share message processing.
   */
  queueGroup?: string;

  /**
   * Whether to enable manual message acknowledgment.
   * When true, messages must be explicitly acknowledged.
   */
  ack?: boolean;

  /**
   * Maximum number of retry attempts for failed message processing.
   */
  maxRetries?: number;

  /**
   * Optional driver-specific subscription options.
   * These options are passed directly to the underlying driver.
   *
   * @example
   * For Kafka:
   * ```typescript
   * options: { groupId: 'my-consumer-group', fromBeginning: true }
   * ```
   */
  options?: Record<string, any>;
}
