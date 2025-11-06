import { PubSubService } from '@services/pubsub.service';
import type { PublishOptions } from '@interfaces/publish-options.interface';

/**
 * Abstract base class for creating type-safe PubSub publishers with lifecycle hooks.
 *
 * This class provides a structured way to create publishers that encapsulate
 * topic-specific publishing logic with pre/post processing hooks. It promotes
 * the separation of concerns by isolating publishing logic for specific events
 * into dedicated publisher classes.
 *
 * Benefits:
 * - Type-safe message publishing with generic type support
 * - Pre-publish validation and data transformation hooks
 * - Post-publish logging, metrics, and cleanup hooks
 * - Centralized topic management per publisher
 * - Reusable publisher patterns across the application
 *
 * Lifecycle:
 * 1. beforePublish() - Validate/transform data, check preconditions
 * 2. pubsub.publish() - Actual message publishing to the topic
 * 3. afterPublish() - Record metrics, log events, trigger side effects
 *
 * @template T - The type of data being published to the topic
 *
 * @example
 * Basic publisher:
 * ```typescript
 * @Injectable()
 * export class UserCreatedPublisher extends BasePublisher<UserCreatedEvent> {
 *   getTopic(): string {
 *     return 'user.created';
 *   }
 *
 *   // Publish method is already implemented by base class
 *   // Usage: await this.publish({ userId: 123, email: 'user@example.com' });
 * }
 * ```
 *
 * @example
 * Publisher with validation hook:
 * ```typescript
 * @Injectable()
 * export class OrderPublisher extends BasePublisher<OrderEvent> {
 *   getTopic(): string {
 *     return 'order.created';
 *   }
 *
 *   // Validate order data before publishing
 *   protected async beforePublish(data: OrderEvent): Promise<void> {
 *     if (!data.orderId || data.amount <= 0) {
 *       throw new Error('Invalid order data');
 *     }
 *
 *     // Transform/enrich data if needed
 *     data.timestamp = new Date();
 *   }
 *
 *   // Record metrics after publishing
 *   protected async afterPublish(data: OrderEvent): Promise<void> {
 *     this.metricsService.increment('orders.published', {
 *       amount: data.amount,
 *     });
 *   }
 * }
 * ```
 *
 * @see {@link BaseConsumer} for the consumer counterpart
 */
export abstract class BasePublisher<T = any> {
  /**
   * PubSub service instance for publishing messages.
   * Injected via constructor and available to subclasses.
   */
  constructor(protected readonly pubsub: PubSubService) {}

  /**
   * Returns the topic name this publisher will publish to.
   *
   * This method must be implemented by concrete publisher classes to define
   * which topic they publish messages to. The topic name should be consistent
   * and descriptive of the event type.
   *
   * Topic naming conventions:
   * - Use dot notation for namespacing: `entity.action` (e.g., 'user.created')
   * - Use kebab-case for multi-word entities: `order-item.updated`
   * - Keep topics lowercase and descriptive
   *
   * @returns The topic name as a string
   *
   * @example
   * ```typescript
   * getTopic(): string {
   *   return 'payment.completed';
   * }
   * ```
   */
  abstract getTopic(): string;

  /**
   * Publishes data to the configured topic with lifecycle hooks.
   *
   * This method orchestrates the publishing process by:
   * 1. Calling beforePublish() hook for validation/transformation
   * 2. Publishing the message to the topic via PubSubService
   * 3. Calling afterPublish() hook for metrics/logging
   *
   * The method is type-safe, ensuring the published data matches the
   * generic type T specified in the publisher class.
   *
   * @param data - The data payload to publish
   * @param options - Optional publishing options (driver-specific)
   * @returns Promise that resolves when publishing and all hooks complete
   *
   * @throws {Error} If beforePublish() validation fails or publishing fails
   *
   * @example
   * ```typescript
   * // In a service or controller:
   * await this.userCreatedPublisher.publish({
   *   userId: user.id,
   *   email: user.email,
   *   createdAt: new Date()
   * });
   * ```
   */
  async publish(data: T, options?: PublishOptions): Promise<void> {
    // Step 1: Pre-publish hook - validate, transform, or prepare data
    await this.beforePublish(data, options);

    // Step 2: Publish the message to the topic
    await this.pubsub.publish<T>(this.getTopic(), data, options);

    // Step 3: Post-publish hook - metrics, logging, cleanup
    await this.afterPublish(data, options);
  }

  /**
   * Lifecycle hook called before message publishing.
   *
   * Override this method in subclasses to implement:
   * - Data validation and schema checking
   * - Data transformation or enrichment
   * - Precondition checks (e.g., rate limiting, permissions)
   * - Logging of publish attempts
   *
   * If this method throws an error, the publishing process will be aborted
   * and the message will not be sent to the topic.
   *
   * @param data - The data about to be published
   * @param options - Publishing options
   * @returns Promise that resolves when pre-processing is complete
   *
   * @throws {Error} To abort publishing if validation fails
   *
   * @example
   * ```typescript
   * protected async beforePublish(data: UserEvent): Promise<void> {
   *   // Validate required fields
   *   if (!data.userId) {
   *     throw new Error('userId is required');
   *   }
   *
   *   // Enrich with metadata
   *   data.publishedAt = new Date();
   *   data.version = '1.0';
   *
   *   // Log the attempt
   *   this.logger.debug(`Publishing user event for user ${data.userId}`);
   * }
   * ```
   */
  protected async beforePublish(data: T, options?: PublishOptions): Promise<void> {
    // Default implementation does nothing
    // Subclasses can override to add custom logic
  }

  /**
   * Lifecycle hook called after successful message publishing.
   *
   * Override this method in subclasses to implement:
   * - Metrics recording and monitoring
   * - Success logging and auditing
   * - Triggering side effects or follow-up actions
   * - Cleanup or resource management
   *
   * This hook is called after the message has been successfully published.
   * If this method throws an error, the message has already been sent and
   * cannot be recalled.
   *
   * @param data - The data that was published
   * @param options - Publishing options that were used
   * @returns Promise that resolves when post-processing is complete
   *
   * @example
   * ```typescript
   * protected async afterPublish(data: OrderEvent): Promise<void> {
   *   // Record metrics
   *   this.metricsService.increment('orders.published');
   *   this.metricsService.histogram('order.amount', data.amount);
   *
   *   // Log success
   *   this.logger.log(`Successfully published order ${data.orderId}`);
   *
   *   // Update cache or state
   *   await this.cache.invalidate(`order:${data.orderId}`);
   * }
   * ```
   */
  protected async afterPublish(data: T, options?: PublishOptions): Promise<void> {
    // Default implementation does nothing
    // Subclasses can override to add custom logic
  }
}
