import { Injectable } from '@nestjs/common';
import { Subscribe, IPubSubMessage } from '@nesvel/nestjs-pubsub';

/**
 * OrderListener
 *
 * Listener for order-related events using @Subscribe decorators.
 * This is the recommended approach for 80% of subscription use cases.
 *
 * Use listeners with @Subscribe when you need:
 * - Simple, declarative subscriptions
 * - Multiple handlers for different topics in one class
 * - Quick setup without lifecycle complexity
 */
@Injectable()
export class OrderListener {
  /**
   * Handle order creation events
   *
   * @param message - The PubSub message containing order data
   */
  @Subscribe('order.created')
  async handleOrderCreated(message: IPubSubMessage<any>): Promise<void> {
    console.log('📦 Order created event received:', message.data);

    // Example: Send confirmation email
    // await this.emailService.sendOrderConfirmation(message.data);

    // Example: Update inventory
    // await this.inventoryService.reserve(message.data.items);

    // Example: Trigger analytics
    // await this.analyticsService.trackOrder(message.data);
  }

  /**
   * Handle order status updates
   *
   * @param message - The PubSub message containing order status update
   */
  @Subscribe('order.updated')
  async handleOrderUpdated(message: IPubSubMessage<any>): Promise<void> {
    console.log('🔄 Order updated event received:', message.data);

    // Example: Update order status in database
    // await this.orderService.updateStatus(message.data.orderId, message.data.status);

    // Example: Notify customer
    // await this.notificationService.sendStatusUpdate(message.data);
  }

  /**
   * Handle order cancellation events
   *
   * @param message - The PubSub message containing cancelled order data
   */
  @Subscribe('order.cancelled')
  async handleOrderCancelled(message: IPubSubMessage<any>): Promise<void> {
    console.log('❌ Order cancelled event received:', message.data);

    // Example: Refund payment
    // await this.paymentService.refund(message.data.orderId);

    // Example: Release inventory
    // await this.inventoryService.release(message.data.items);
  }

  /**
   * Handle order errors
   * Optional: Add error handling for the same topic
   *
   * @param message - The PubSub message that caused an error
   */
  @Subscribe('order.error')
  async handleOrderError(message: IPubSubMessage<any>): Promise<void> {
    console.error('⚠️ Order error event received:', message.data);

    // Example: Log error to monitoring system
    // await this.errorService.logError(message);

    // Example: Send alert to operations team
    // await this.alertService.sendAlert('Order processing error', message.data);
  }
}
