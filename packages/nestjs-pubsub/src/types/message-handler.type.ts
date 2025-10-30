import type { IPubSubMessage } from '@interfaces/pubsub-message.interface';

/**
 * Type definition for a message handler function.
 *
 * Message handlers are callback functions that process incoming messages
 * from subscribed topics. They receive a message object and can perform
 * asynchronous operations, returning a Promise that resolves when processing
 * is complete.
 *
 * The handler can optionally return void for fire-and-forget scenarios
 * or Promise<void> for asynchronous processing with completion tracking.
 *
 * @template TData - The expected type of the message data payload
 *
 * @param message - The incoming message to be processed
 * @returns A Promise that resolves when message processing is complete, or void
 *
 * @example
 * ```typescript
 * const handler: MessageHandler<UserCreatedEvent> = async (message) => {
 *   console.log('User created:', message.data);
 *   await sendWelcomeEmail(message.data.email);
 * };
 * ```
 */
export type MessageHandler<TData = any> = (message: IPubSubMessage<TData>) => Promise<void> | void;

/**
 * Type definition for an error handler function in message processing.
 *
 * Error handlers are invoked when a message handler throws an exception
 * or rejects its promise. They receive both the error that occurred and
 * the message that was being processed, allowing for custom error handling,
 * logging, dead-letter queue routing, or retry logic.
 *
 * @template TData - The expected type of the message data payload
 *
 * @param error - The error that occurred during message processing
 * @param message - The message that was being processed when the error occurred
 * @returns A Promise that resolves when error handling is complete, or void
 *
 * @example
 * ```typescript
 * const errorHandler: MessageErrorHandler = async (error, message) => {
 *   console.error('Failed to process message:', message.id, error);
 *   await sendToDeadLetterQueue(message);
 * };
 * ```
 */
export type MessageErrorHandler<TData = any> = (
  error: Error,
  message: IPubSubMessage<TData>,
) => Promise<void> | void;

/**
 * Type definition for a message filter predicate function.
 *
 * Message filters are used to selectively process messages based on their
 * content or metadata. The filter function receives a message and returns
 * a boolean indicating whether the message should be processed by the handler.
 *
 * This is useful for implementing conditional message processing, content-based
 * routing, or filtering out messages that don't meet certain criteria.
 *
 * @template TData - The expected type of the message data payload
 *
 * @param message - The message to evaluate
 * @returns true if the message should be processed, false otherwise
 *
 * @example
 * ```typescript
 * const filter: MessageFilter<OrderEvent> = (message) => {
 *   return message.data.amount > 1000; // Only process high-value orders
 * };
 * ```
 */
export type MessageFilter<TData = any> = (message: IPubSubMessage<TData>) => boolean;
