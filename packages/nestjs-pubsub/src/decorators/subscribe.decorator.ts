import { SetMetadata } from '@nestjs/common';

import { PUBSUB_SUBSCRIBE_METADATA } from '@constants';
import type { ISubscriptionMetadata } from '@interfaces/subscription-metadata.interface';
import type { SubscribeOptions } from '@interfaces/subscribe-options.interface';

/**
 * Decorator that marks a method as a message handler for a specific topic.
 *
 * This decorator is used to declaratively register message handlers in NestJS
 * controllers or providers. When the module is initialized, the PubSub system
 * will automatically discover all methods decorated with @Subscribe and set up
 * the appropriate subscriptions.
 *
 * The decorated method will be invoked for each message received on the
 * specified topic. The method receives a single parameter of type IPubSubMessage
 * containing the message data and metadata.
 *
 * Features:
 * - Automatic subscription setup during module initialization
 * - Type-safe message handling with generics
 * - Optional message filtering
 * - Custom error handling
 * - Driver-specific options support
 *
 * @param topic - The topic or channel name to subscribe to
 * @param options - Optional configuration for the subscription
 *
 * @example
 * Basic usage:
 * ```typescript
 * @Injectable()
 * export class UserEventHandler {
 *   @Subscribe('user.created')
 *   async handleUserCreated(message: IPubSubMessage<UserCreatedEvent>) {
 *     console.log('User created:', message.data);
 *   }
 * }
 * ```
 *
 * @example
 * With filtering:
 * ```typescript
 * @Injectable()
 * export class OrderEventHandler {
 *   @Subscribe('order.completed', {
 *     filter: (message) => message.data.amount > 1000
 *   })
 *   async handleHighValueOrder(message: IPubSubMessage<OrderEvent>) {
 *     console.log('High value order:', message.data);
 *   }
 * }
 * ```
 *
 * @example
 * With error handling:
 * ```typescript
 * @Injectable()
 * export class PaymentEventHandler {
 *   constructor(private readonly logger: Logger) {}
 *
 *   @Subscribe('payment.failed', {
 *     errorHandler: async (error, message) => {
 *       this.logger.error('Failed to process payment event', {
 *         error,
 *         messageId: message.id
 *       });
 *     }
 *   })
 *   async handlePaymentFailed(message: IPubSubMessage<PaymentEvent>) {
 *     // Handle payment failure
 *   }
 * }
 * ```
 *
 * @example
 * With driver-specific options (Kafka):
 * ```typescript
 * @Injectable()
 * export class AnalyticsEventHandler {
 *   @Subscribe('analytics.event', {
 *     options: {
 *       groupId: 'analytics-consumer-group',
 *       fromBeginning: true
 *     }
 *   })
 *   async handleAnalyticsEvent(message: IPubSubMessage<AnalyticsEvent>) {
 *     // Process analytics event
 *   }
 * }
 * ```
 */
export function Subscribe(topic: string, options?: SubscribeOptions): MethodDecorator {
  // Build subscription metadata
  const optionsObject = {
    ...options?.options,
    ...(options?.queueGroup && { queueGroup: options.queueGroup }),
    ...(options?.ack !== undefined && { ack: options.ack }),
    ...(options?.maxRetries !== undefined && { maxRetries: options.maxRetries }),
  };

  const metadata: ISubscriptionMetadata = {
    topic,
    filter: options?.filter,
    errorHandler: options?.errorHandler,
    ...(options !== undefined && { options: optionsObject }),
  };

  // Return decorator that attaches metadata to the method
  return SetMetadata(PUBSUB_SUBSCRIBE_METADATA, metadata);
}
