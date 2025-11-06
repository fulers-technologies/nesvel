import type { IPubSubMessage } from '@interfaces/pubsub-message.interface';

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
