import { Injectable, OnModuleInit, OnModuleDestroy, Logger } from '@nestjs/common';
import type { IPubSubDriver } from '@interfaces/pubsub-driver.interface';
import { MessageHandler } from '@/types/message-handler.type';

/**
 * Main PubSub service providing pub/sub functionality.
 *
 * This service acts as the primary interface for pub/sub operations in the
 * application. It delegates to the underlying driver implementation while
 * providing a consistent, framework-integrated API.
 *
 * The service:
 * - Automatically connects to the messaging backend on module initialization
 * - Provides type-safe publish and subscribe methods
 * - Handles lifecycle management (connect/disconnect)
 * - Wraps driver errors with additional context
 * - Integrates with NestJS dependency injection
 *
 * Usage:
 * ```typescript
 * @Injectable()
 * export class UserService {
 *   constructor(private readonly pubsub: PubSubService) {}
 *
 *   async createUser(userData: any) {
 *     // ... create user logic
 *     await this.pubsub.publish('user.created', userData);
 *   }
 * }
 * ```
 */
@Injectable()
export class PubSubService implements OnModuleInit, OnModuleDestroy {
  /**
   * Logger instance for service operations.
   */
  private readonly logger = new Logger(PubSubService.name);

  /**
   * Creates a new instance of the PubSub service.
   *
   * @param driver - The underlying driver implementation to use
   * @param autoConnect - Whether to automatically connect on module initialization
   */
  constructor(
    private readonly driver: IPubSubDriver,
    private readonly autoConnect: boolean = true,
  ) {}

  /**
   * Lifecycle hook called when the module is initialized.
   *
   * If autoConnect is enabled, this method establishes the connection
   * to the messaging backend automatically.
   */
  async onModuleInit(): Promise<void> {
    if (this.autoConnect) {
      try {
        await this.connect();
        this.logger.log('PubSub service initialized and connected');
      } catch (error: Error | any) {
        this.logger.error('Failed to connect PubSub service:', error);
        throw error;
      }
    }
  }

  /**
   * Lifecycle hook called when the module is being destroyed.
   *
   * This method ensures graceful shutdown by disconnecting from the
   * messaging backend and cleaning up resources.
   */
  async onModuleDestroy(): Promise<void> {
    try {
      await this.disconnect();
      this.logger.log('PubSub service disconnected');
    } catch (error: Error | any) {
      this.logger.error('Error during PubSub service shutdown:', error);
    }
  }

  /**
   * Establishes connection to the messaging backend.
   *
   * This method delegates to the underlying driver's connect method.
   * It's automatically called during module initialization if autoConnect
   * is enabled, but can also be called manually if needed.
   *
   * The method is idempotent and safe to call multiple times.
   *
   * @throws {Error} If the connection cannot be established
   * @returns A Promise that resolves when connected
   *
   * @example
   * ```typescript
   * await pubsubService.connect();
   * ```
   */
  async connect(): Promise<void> {
    await this.driver.connect();
  }

  /**
   * Closes connection to the messaging backend.
   *
   * This method delegates to the underlying driver's disconnect method.
   * It's automatically called during module destruction, but can also be
   * called manually if needed.
   *
   * The method is idempotent and safe to call multiple times.
   *
   * @returns A Promise that resolves when disconnected
   *
   * @example
   * ```typescript
   * await pubsubService.disconnect();
   * ```
   */
  async disconnect(): Promise<void> {
    await this.driver.disconnect();
  }

  /**
   * Publishes a message to a topic.
   *
   * This method sends a message to the specified topic, making it available
   * to all subscribers. The message data can be any serializable value.
   *
   * The method provides type safety through generics, allowing you to specify
   * the expected type of the message data.
   *
   * @template TData - The type of the message data payload
   *
   * @param topic - The topic or channel name to publish to
   * @param data - The message payload to publish
   * @param options - Optional driver-specific publishing options
   *
   * @throws {Error} If not connected or publishing fails
   * @returns A Promise that resolves when the message has been published
   *
   * @example
   * ```typescript
   * interface UserCreatedEvent {
   *   userId: string;
   *   email: string;
   * }
   *
   * await pubsubService.publish<UserCreatedEvent>('user.created', {
   *   userId: '123',
   *   email: 'user@example.com'
   * });
   * ```
   */
  async publish<TData = any>(
    topic: string,
    data: TData,
    options?: Record<string, any>,
  ): Promise<void> {
    try {
      await this.driver.publish(topic, data, options);
      this.logger.debug(`Published message to topic: ${topic}`);
    } catch (error: Error | any) {
      this.logger.error(`Failed to publish to topic ${topic}:`, error);
      throw error;
    }
  }

  /**
   * Subscribes to a topic and registers a message handler.
   *
   * This method establishes a subscription to the specified topic and registers
   * a handler function that will be invoked for each message received.
   *
   * Multiple handlers can be registered for the same topic, and each will
   * receive all messages published to that topic.
   *
   * The method provides type safety through generics, allowing you to specify
   * the expected type of the message data.
   *
   * @template TData - The expected type of message data for this subscription
   *
   * @param topic - The topic or channel name to subscribe to
   * @param handler - The callback function to invoke for each received message
   * @param options - Optional driver-specific subscription options
   *
   * @throws {Error} If not connected or subscription fails
   * @returns A Promise that resolves when the subscription is established
   *
   * @example
   * ```typescript
   * interface UserCreatedEvent {
   *   userId: string;
   *   email: string;
   * }
   *
   * await pubsubService.subscribe<UserCreatedEvent>(
   *   'user.created',
   *   async (message) => {
   *     console.log('User created:', message.data.userId);
   *     await sendWelcomeEmail(message.data.email);
   *   }
   * );
   * ```
   */
  async subscribe<TData = any>(
    topic: string,
    handler: MessageHandler<TData>,
    options?: Record<string, any>,
  ): Promise<void> {
    try {
      await this.driver.subscribe(topic, handler, options);
      this.logger.log(`Subscribed to topic: ${topic}`);
    } catch (error: Error | any) {
      this.logger.error(`Failed to subscribe to topic ${topic}:`, error);
      throw error;
    }
  }

  /**
   * Unsubscribes from a topic and removes all handlers.
   *
   * This method removes the subscription to the specified topic, stopping
   * the delivery of new messages and cleaning up associated resources.
   *
   * The method is idempotent and safe to call for topics that are not subscribed.
   *
   * @param topic - The topic or channel name to unsubscribe from
   * @param options - Optional driver-specific unsubscription options
   *
   * @returns A Promise that resolves when the unsubscription is complete
   *
   * @example
   * ```typescript
   * await pubsubService.unsubscribe('user.created');
   * ```
   */
  async unsubscribe(topic: string, options?: Record<string, any>): Promise<void> {
    try {
      await this.driver.unsubscribe(topic, options);
      this.logger.log(`Unsubscribed from topic: ${topic}`);
    } catch (error: Error | any) {
      this.logger.error(`Failed to unsubscribe from topic ${topic}:`, error);
      throw error;
    }
  }

  /**
   * Checks if the service is currently connected to the messaging backend.
   *
   * This method provides a way to query the connection state without
   * attempting to establish a new connection.
   *
   * @returns true if connected, false otherwise
   *
   * @example
   * ```typescript
   * if (pubsubService.isConnected()) {
   *   await pubsubService.publish('topic', data);
   * }
   * ```
   */
  isConnected(): boolean {
    return this.driver.isConnected();
  }

  /**
   * Retrieves the list of topics currently subscribed to.
   *
   * This method returns an array of topic names that have active subscriptions.
   * It's useful for debugging, monitoring, and managing subscriptions.
   *
   * @returns An array of subscribed topic names
   *
   * @example
   * ```typescript
   * const topics = pubsubService.getSubscribedTopics();
   * console.log('Currently subscribed to:', topics);
   * ```
   */
  getSubscribedTopics(): string[] {
    return this.driver.getSubscribedTopics();
  }

  /**
   * Gets the underlying driver instance.
   *
   * This method provides access to the raw driver for advanced use cases
   * where driver-specific functionality is needed. Use with caution as it
   * bypasses the service layer's error handling and logging.
   *
   * @returns The underlying driver instance
   *
   * @example
   * ```typescript
   * const driver = pubsubService.getDriver();
   * // Use driver-specific methods
   * ```
   */
  getDriver(): IPubSubDriver {
    return this.driver;
  }
}
