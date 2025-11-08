/**
 * Metadata key for storing subscription information on methods.
 *
 * This symbol is used by the @Subscribe() decorator to attach subscription
 * metadata to methods. The metadata includes the topic name, filter function,
 * error handler, and driver-specific options.
 *
 * During module initialization, the PubSub system uses this metadata key to
 * discover all methods decorated with @Subscribe() and automatically set up
 * the appropriate subscriptions.
 *
 * This constant is used internally by the decorator and discovery mechanisms.
 * Application code typically doesn't need to use it directly unless implementing
 * custom decorators or discovery logic.
 *
 * @example
 * Internal usage in the @Subscribe() decorator:
 * ```typescript
 * import { SetMetadata } from '@nestjs/common';
 * import { PUBSUB_SUBSCRIBE_METADATA } from './constants';
 *
 * export function Subscribe(topic: string, options?: SubscribeOptions) {
 *   const metadata = { topic, ...options };
 *   return SetMetadata(PUBSUB_SUBSCRIBE_METADATA, metadata);
 * }
 * ```
 *
 * @example
 * Reading metadata in discovery:
 * ```typescript
 * import { Reflector } from '@nestjs/core';
 * import { PUBSUB_SUBSCRIBE_METADATA } from './constants';
 *
 * const metadata = this.reflector.get(
 *   PUBSUB_SUBSCRIBE_METADATA,
 *   methodRef
 * );
 * ```
 */
export const PUBSUB_SUBSCRIBE_METADATA = Symbol('PUBSUB_SUBSCRIBE_METADATA');
