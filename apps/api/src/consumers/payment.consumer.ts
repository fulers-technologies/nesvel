import { Injectable } from '@nestjs/common';
import { BaseConsumer, IPubSubMessage, PubSubService } from '@nesvel/nestjs-pubsub';

/**
 * Payment data interface
 */
interface PaymentData {
  paymentId: string;
  orderId: string;
  amount: number;
  currency: string;
  status: string;
  method: string;
}

/**
 * PaymentConsumer
 *
 * Consumer for payment.processed topic with complex processing logic.
 * Extends BaseConsumer for lifecycle hooks and state management.
 *
 * Use consumers when you need:
 * - Complex message processing logic
 * - Lifecycle control (onSubscribe/onUnsubscribe hooks)
 * - Advanced error handling
 * - State management across messages
 *
 * This example demonstrates a consumer that:
 * - Maintains a processing queue
 * - Tracks statistics
 * - Manages database connections in lifecycle hooks
 */
@Injectable()
export class PaymentConsumer extends BaseConsumer<PaymentData> {
  /**
   * Processing queue for batching
   */
  private processingQueue: PaymentData[] = [];

  /**
   * Statistics tracking
   */
  private stats = {
    processed: 0,
    failed: 0,
    totalAmount: 0,
  };

  /**
   * Flag to track if consumer is ready
   */
  private isReady = false;

  /**
   * Constructor
   *
   * @param pubSubService - The PubSub service (injected automatically for auto-subscription)
   */
  constructor(pubSubService: PubSubService) {
    super();
    this.pubSubService = pubSubService;
  }

  /**
   * Get the topic this consumer subscribes to
   */
  getTopic(): string {
    return 'payment.processed';
  }

  /**
   * Lifecycle hook called when consumer starts subscribing.
   * Automatically called by BaseConsumer after subscription is established.
   *
   * Use this for initialization tasks like:
   * - Setting up database connections
   * - Loading configuration
   * - Initializing caches
   */
  async onSubscribe(): Promise<void> {
    // Example: Initialize database connection
    // await this.databaseService.connect();

    // Example: Load configuration
    // this.config = await this.configService.load('payment-processor');

    // Example: Initialize cache
    // await this.cacheService.initialize();

    // Mark as ready
    this.isReady = true;

    this.logger.log('✅ PaymentConsumer is ready to process messages');
  }

  /**
   * Handle incoming payment messages
   *
   * @param message - The PubSub message containing payment data
   */
  async handle(message: IPubSubMessage<PaymentData>): Promise<void> {
    if (!this.isReady) {
      this.logger.warn('Consumer not ready, skipping message');
      return;
    }

    const payment = message.data;

    try {
      this.logger.log(`💳 Processing payment: ${payment.paymentId} for order ${payment.orderId}`);

      // Add to processing queue
      this.processingQueue.push(payment);

      // Example: Validate payment
      this.validatePayment(payment);

      // Example: Update order status in database
      // await this.orderService.updatePaymentStatus(payment.orderId, 'paid');

      // Example: Send receipt email
      // await this.emailService.sendReceipt(payment);

      // Example: Update inventory
      // await this.inventoryService.confirm(payment.orderId);

      // Example: Trigger fulfillment
      // await this.fulfillmentService.startProcessing(payment.orderId);

      // Update statistics
      this.stats.processed++;
      this.stats.totalAmount += payment.amount;

      this.logger.log(`✅ Payment processed successfully: ${payment.paymentId}`);
      this.logger.debug(
        `Stats: ${this.stats.processed} processed, $${this.stats.totalAmount.toFixed(2)} total`
      );

      // Process batch if queue is large enough
      if (this.processingQueue.length >= 10) {
        await this.processBatch();
      }
    } catch (error: unknown) {
      this.stats.failed++;
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      this.logger.error(`❌ Failed to process payment ${payment.paymentId}:`, errorMessage);

      // Example: Publish error event
      // await this.pubSubService.publish('payment.error', {
      //   paymentId: payment.paymentId,
      //   error: error.message,
      //   timestamp: new Date(),
      // });

      throw error; // Re-throw to trigger retry logic if configured
    }
  }

  /**
   * Lifecycle hook called when consumer stops subscribing
   * Use this for cleanup tasks like:
   * - Closing connections
   * - Flushing buffers
   * - Saving state
   */
  async onUnsubscribe(): Promise<void> {
    this.logger.log('🛑 PaymentConsumer unsubscribing...');

    // Mark as not ready
    this.isReady = false;

    // Process remaining items in queue
    if (this.processingQueue.length > 0) {
      this.logger.log(`Processing ${this.processingQueue.length} remaining items...`);
      await this.processBatch();
    }

    // Example: Close database connections
    // await this.databaseService.disconnect();

    // Example: Flush cache
    // await this.cacheService.flush();

    // Log final statistics
    this.logger.log('📊 Final Statistics:', this.stats);

    this.logger.log('✅ PaymentConsumer unsubscribed and cleaned up');
  }

  /**
   * Validate payment data
   *
   * @param payment - Payment data to validate
   */
  private validatePayment(payment: PaymentData): void {
    if (!payment.paymentId) {
      throw new Error('Payment ID is required');
    }

    if (!payment.orderId) {
      throw new Error('Order ID is required');
    }

    if (payment.amount <= 0) {
      throw new Error('Payment amount must be greater than 0');
    }

    if (payment.status !== 'success') {
      throw new Error(`Invalid payment status: ${payment.status}`);
    }
  }

  /**
   * Process accumulated batch of payments
   */
  private processBatch(): void {
    const batch = [...this.processingQueue];
    this.processingQueue = [];

    this.logger.log(`📦 Processing batch of ${batch.length} payments`);

    // Example: Bulk update database
    // await this.databaseService.bulkUpdate(batch);

    // Example: Send batch notification
    // await this.notificationService.sendBatchSummary(batch);

    this.logger.log(`✅ Batch processed successfully`);
  }

  /**
   * Get current consumer statistics
   */
  getStats() {
    return { ...this.stats, queueSize: this.processingQueue.length };
  }
}
