import { OnModuleInit, OnModuleDestroy, Logger, Inject, Optional } from '@nestjs/common';
import type { IPubSubMessage } from '@interfaces/pubsub-message.interface';
import { PubSubService } from '@services/pubsub.service';

/**
 * Abstract base class for creating type-safe PubSub consumers with lifecycle hooks.
 *
 * This class provides a structured way to create message consumers (listeners)
 * that process messages from specific topics. It promotes clean separation of
 * concerns by encapsulating topic subscription and message handling logic into
 * dedicated consumer classes.
 *
 * Benefits:
 * - Type-safe message handling with generic type support
 * - Subscription lifecycle hooks (onSubscribe, onUnsubscribe)
 * - Centralized topic and handler logic per consumer
 * - Clean separation from @Subscribe decorator approach
 * - Reusable consumer patterns across the application
 *
 * Lifecycle:
 * 1. onSubscribe() - Called when subscription is registered (setup)
 * 2. handle() - Called for each received message (processing)
 * 3. onUnsubscribe() - Called when unsubscribed or shutdown (cleanup)
 *
 * Use Cases:
 * - Complex message processing requiring setup/teardown
 * - Consumers that need state management or resource allocation
 * - Programmatic subscription management (dynamic topics)
 * - Class-based consumers for better organization and testing
 *
 * @template T - The type of message data expected from the topic
 *
 * @example
 * Basic consumer:
 * ```typescript
 * @Injectable()
 * export class UserCreatedConsumer extends BaseConsumer<UserCreatedEvent> {
 *   constructor(private readonly userService: UserService) {
 *     super();
 *   }
 *
 *   getTopic(): string {
 *     return 'user.created';
 *   }
 *
 *   async handle(message: IPubSubMessage<UserCreatedEvent>): Promise<void> {
 *     const { userId, email } = message.data;
 *     await this.userService.sendWelcomeEmail(userId, email);
 *   }
 * }
 * ```
 *
 * @example
 * Consumer with lifecycle hooks:
 * ```typescript
 * @Injectable()
 * export class OrderProcessorConsumer extends BaseConsumer<OrderEvent> {
 *   private processor: OrderProcessor;
 *
 *   getTopic(): string {
 *     return 'order.created';
 *   }
 *
 *   // Initialize resources when subscription starts
 *   async onSubscribe(): Promise<void> {
 *     this.processor = await OrderProcessor.initialize();
 *     console.log('Order processor consumer ready');
 *   }
 *
 *   // Process each order message
 *   async handle(message: IPubSubMessage<OrderEvent>): Promise<void> {
 *     await this.processor.process(message.data);
 *   }
 *
 *   // Clean up resources on shutdown
 *   async onUnsubscribe(): Promise<void> {
 *     await this.processor.shutdown();
 *     console.log('Order processor consumer stopped');
 *   }
 * }
 * ```
 *
 * @see {@link BasePublisher} for the publisher counterpart
 * @see {@link Subscribe} decorator for alternative declarative approach
 */
export abstract class BaseConsumer<T = any> implements OnModuleInit, OnModuleDestroy {
  /**
   * Logger instance for consumer operations.
   * Can be overridden in subclasses for custom logging.
   */
  protected readonly logger = new Logger(this.constructor.name);

  /**
   * Constructor
   *
   * Note: PubSubService must be injected in subclasses for auto-subscription to work.
   */
  constructor() {
    this.logger = new Logger(this.constructor.name);
  }

  /**
   * Set the PubSub service instance.
   * Called automatically by NestJS after construction if PubSubService is injected in subclass.
   *
   * @param pubSubService - The PubSub service instance
   */
  protected pubSubService?: PubSubService;

  /**
   * NestJS lifecycle hook - automatically subscribes to the topic on module initialization.
   *
   * This method is called automatically by NestJS when the module initializes.
   * It subscribes the consumer to its topic and calls the onSubscribe() lifecycle hook.
   *
   * You generally don't need to override this method. If you do, make sure to call super.onModuleInit().
   */
  async onModuleInit(): Promise<void> {
    if (!this.pubSubService) {
      this.logger.warn(
        `PubSubService not injected for ${this.constructor.name}. Skipping auto-subscription.`,
      );
      return;
    }

    this.logger.log(`Initializing ${this.constructor.name}...`);

    // Subscribe to the topic
    await this.pubSubService.subscribe(this.getTopic(), (message) => this.handle(message));

    // Call the lifecycle hook
    await this.onSubscribe();

    this.logger.log(`${this.constructor.name} initialized and subscribed to ${this.getTopic()}`);
  }

  /**
   * NestJS lifecycle hook - automatically calls cleanup on module destruction.
   *
   * This method is called automatically by NestJS when the module is destroyed.
   * It calls the onUnsubscribe() lifecycle hook for cleanup.
   *
   * You generally don't need to override this method. If you do, make sure to call super.onModuleDestroy().
   */
  async onModuleDestroy(): Promise<void> {
    this.logger.log(`Destroying ${this.constructor.name}...`);
    await this.onUnsubscribe();
    this.logger.log(`${this.constructor.name} destroyed and unsubscribed`);
  }

  /**
   * Returns the topic name this consumer will subscribe to.
   *
   * This method must be implemented by concrete consumer classes to define
   * which topic they listen to for messages. The topic name should match
   * the topic used by the corresponding publisher.
   *
   * Topic naming conventions:
   * - Use dot notation for namespacing: `entity.action` (e.g., 'user.created')
   * - Use kebab-case for multi-word entities: `order-item.updated`
   * - Keep topics lowercase and descriptive
   * - Match the topic exactly as defined in the publisher
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
   * Handles an incoming message from the subscribed topic.
   *
   * This method is called automatically for each message received on the topic.
   * Implement this method in subclasses to define how messages should be processed.
   *
   * The method receives a fully structured message with:
   * - id: Unique message identifier
   * - topic: The topic the message was published to
   * - data: The typed payload (generic type T)
   * - timestamp: When the message was published
   * - metadata: Additional message metadata
   * - attributes: Driver-specific attributes
   *
   * Error Handling:
   * - If this method throws an error, the error will be caught by the driver
   * - The message may be retried or sent to a dead letter queue depending on config
   * - Use try-catch for graceful error handling and logging
   *
   * Performance Tips:
   * - Keep processing fast to avoid blocking other messages
   * - For long-running tasks, consider queuing them asynchronously
   * - Return void for fire-and-forget, Promise<void> for awaitable processing
   *
   * @param message - The received message with data and metadata
   * @returns Promise that resolves when processing is complete, or void
   *
   * @throws {Error} If processing fails (will trigger error handling/retry logic)
   *
   * @example
   * ```typescript
   * async handle(message: IPubSubMessage<UserEvent>): Promise<void> {
   *   const { userId, action } = message.data;
   *
   *   try {
   *     // Process the message
   *     await this.userService.handleEvent(userId, action);
   *
   *     // Log success
   *     this.logger.log(`Processed ${action} for user ${userId}`);
   *   } catch (error) {
   *     // Log error and optionally re-throw
   *     this.logger.error(`Failed to process message ${message.id}`, error);
   *     throw error; // Re-throw to trigger retry/DLQ
   *   }
   * }
   * ```
   */
  abstract handle(message: IPubSubMessage<T>): Promise<void> | void;

  /**
   * Lifecycle hook called when the subscription is successfully registered.
   *
   * This hook is invoked after the consumer has been subscribed to the topic
   * and before any messages are processed. Use this hook to:
   * - Initialize resources (database connections, caches, etc.)
   * - Set up state or configuration needed for message processing
   * - Perform health checks or readiness verification
   * - Log subscription status
   *
   * If this method throws an error, the subscription process may fail or retry
   * depending on the driver configuration.
   *
   * @returns Promise that resolves when initialization is complete
   *
   * @example
   * ```typescript
   * async onSubscribe(): Promise<void> {
   *   // Initialize database connection pool
   *   this.dbPool = await this.createConnectionPool();
   *
   *   // Load configuration
   *   this.config = await this.loadConfig();
   *
   *   // Set up monitoring
   *   this.metrics.gauge('consumer.active', 1);
   *
   *   this.logger.log(`Subscribed to ${this.getTopic()}`);
   * }
   * ```
   */
  async onSubscribe(): Promise<void> {
    // Default implementation does nothing
    // Subclasses can override to add initialization logic
  }

  /**
   * Lifecycle hook called when unsubscribed or during application shutdown.
   *
   * This hook is invoked when:
   * - The application is shutting down gracefully
   * - The consumer is explicitly unsubscribed from the topic
   * - The subscription needs to be cleaned up for any reason
   *
   * Use this hook to:
   * - Close database connections or file handles
   * - Flush pending operations or buffers
   * - Release allocated resources (memory, locks, etc.)
   * - Save state or checkpoint progress
   * - Log shutdown status
   *
   * This method should not throw errors, as it's often called during cleanup.
   * Catch and log any errors internally for debugging.
   *
   * @returns Promise that resolves when cleanup is complete
   *
   * @example
   * ```typescript
   * async onUnsubscribe(): Promise<void> {
   *   try {
   *     // Close database connections
   *     await this.dbPool?.close();
   *
   *     // Flush any pending work
   *     await this.workQueue.flush();
   *
   *     // Update monitoring
   *     this.metrics.gauge('consumer.active', 0);
   *
   *     this.logger.log(`Unsubscribed from ${this.getTopic()}`);
   *   } catch (error) {
   *     // Log but don't throw during cleanup
   *     this.logger.error('Error during consumer cleanup', error);
   *   }
   * }
   * ```
   */
  async onUnsubscribe(): Promise<void> {
    // Default implementation does nothing
    // Subclasses can override to add cleanup logic
  }
}
