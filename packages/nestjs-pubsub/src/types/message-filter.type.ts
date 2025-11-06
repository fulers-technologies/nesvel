import type { IPubSubMessage } from '@interfaces/pubsub-message.interface';

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
