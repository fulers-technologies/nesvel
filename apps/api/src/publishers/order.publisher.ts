import { Injectable, Logger } from '@nestjs/common';
import { BasePublisher, PubSubService, PublishOptions } from '@nesvel/nestjs-pubsub';

/**
 * Order data interface
 */
interface OrderData {
  orderId: string;
  userId: string;
  items: Array<{ productId: string; quantity: number; price: number }>;
  totalAmount: number;
  status: string;
  createdAt?: Date;
}

/**
 * OrderPublisher
 *
 * Publisher for order-related events.
 * Extends BasePublisher to provide hooks for validation, transformation, and logging.
 *
 * Use publishers when you need:
 * - Data validation before publishing
 * - Data transformation
 * - Logging and monitoring
 * - Consistent publishing patterns across the application
 */
@Injectable()
export class OrderPublisher extends BasePublisher<OrderData> {
  /**
   * Logger instance for publisher operations
   */
  private readonly logger = new Logger(OrderPublisher.name);

  /**
   * Constructor
   *
   * @param pubsub - The PubSub service instance
   */
  constructor(protected readonly pubsub: PubSubService) {
    super(pubsub);
  }

  /**
   * Get the topic this publisher publishes to
   */
  getTopic(): string {
    return 'order.created';
  }

  /**
   * Hook executed before publishing
   * Use this for:
   * - Data validation
   * - Data transformation
   * - Logging
   *
   * @param data - The data to be published
   * @param options - Publishing options
   */
  protected async beforePublish(data: OrderData, options?: PublishOptions): Promise<void> {
    // Validate order data
    if (!data.orderId) {
      throw new Error('Order ID is required');
    }

    if (!data.userId) {
      throw new Error('User ID is required');
    }

    if (!data.items || data.items.length === 0) {
      throw new Error('Order must have at least one item');
    }

    if (data.totalAmount <= 0) {
      throw new Error('Order total amount must be greater than 0');
    }

    // Enrich data with timestamp if not present
    if (!data.createdAt) {
      data.createdAt = new Date();
    }

    // Log publishing attempt
    this.logger.log(`Publishing order ${data.orderId} for user ${data.userId}`);
    this.logger.debug(`Order details: ${data.items.length} items, total: $${data.totalAmount}`);
  }

  /**
   * Hook executed after publishing
   * Use this for:
   * - Success logging
   * - Metrics collection
   * - Cleanup tasks
   *
   * @param data - The published data
   * @param options - Publishing options used
   */
  protected async afterPublish(data: OrderData, options?: PublishOptions): Promise<void> {
    // Log successful publish
    this.logger.log(`✅ Successfully published order ${data.orderId}`);

    // Example: Update metrics
    // await this.metricsService.increment('orders.published');
    // await this.metricsService.histogram('order.amount', data.totalAmount);

    // Example: Trigger follow-up actions
    // if (data.totalAmount > 1000) {
    //   await this.alertService.notifyLargeOrder(data);
    // }
  }

  /**
   * Publish order update event
   *
   * @param orderId - The order ID
   * @param status - The new order status
   */
  async publishUpdate(orderId: string, status: string): Promise<void> {
    await this.pubsub.publish('order.updated', {
      orderId,
      status,
      updatedAt: new Date(),
    });

    this.logger.log(`📤 Published order update: ${orderId} -> ${status}`);
  }

  /**
   * Publish order cancellation event
   *
   * @param orderId - The order ID
   * @param reason - The cancellation reason
   */
  async publishCancellation(orderId: string, reason: string): Promise<void> {
    await this.pubsub.publish('order.cancelled', {
      orderId,
      reason,
      cancelledAt: new Date(),
    });

    this.logger.log(`📤 Published order cancellation: ${orderId}`);
  }

  /**
   * Publish order error event
   *
   * @param orderId - The order ID
   * @param error - The error details
   */
  async publishError(orderId: string, error: any): Promise<void> {
    await this.pubsub.publish('order.error', {
      orderId,
      error: error.message || error,
      timestamp: new Date(),
    });

    this.logger.error(`📤 Published order error: ${orderId}`);
  }
}
