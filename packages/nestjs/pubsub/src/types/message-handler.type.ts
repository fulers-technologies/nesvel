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
