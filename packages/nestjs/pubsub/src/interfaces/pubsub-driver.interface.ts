import { MessageHandler } from '@/types/message-handler.type';

/**
 * Core interface that all PubSub driver implementations must implement.
 *
 * This interface defines the contract for messaging backend drivers,
 * ensuring a consistent API across different implementations (Redis, Kafka,
 * Google PubSub, etc.). Each driver handles the specifics of connecting to
 * and communicating with its respective messaging system while exposing
 * a unified interface to the rest of the application.
 *
 * Drivers are responsible for:
 * - Establishing and managing connections to the messaging backend
 * - Publishing messages to topics/channels
 * - Subscribing to topics and routing messages to handlers
 * - Managing subscriptions and cleanup
 * - Handling driver-specific configuration and error scenarios
 */
export interface IPubSubDriver {
  /**
   * Establishes a connection to the messaging backend.
   *
   * This method initializes the driver and establishes any necessary connections,
   * authentication, and setup required by the underlying messaging system.
   * It should be called before any publish or subscribe operations.
   *
   * The method is idempotent - calling it multiple times should not create
   * multiple connections but should ensure a connection exists.
   *
   * @throws {ConnectionError} If the connection cannot be established
   * @returns A Promise that resolves when the connection is successfully established
   *
   * @example
   * ```typescript
   * await driver.connect();
   * console.log('Connected to messaging backend');
   * ```
   */
  connect(): Promise<void>;

  /**
   * Closes the connection to the messaging backend and releases resources.
   *
   * This method performs cleanup operations including:
   * - Closing network connections
   * - Unsubscribing from all active subscriptions
   * - Releasing any held resources (memory, file handles, etc.)
   * - Gracefully shutting down background workers or threads
   *
   * After calling disconnect, the driver should not be used until connect
   * is called again. The method is idempotent and safe to call multiple times.
   *
   * @returns A Promise that resolves when disconnection and cleanup are complete
   *
   * @example
   * ```typescript
   * await driver.disconnect();
   * console.log('Disconnected from messaging backend');
   * ```
   */
  disconnect(): Promise<void>;

  /**
   * Publishes a message to a specified topic.
   *
   * This method sends a message to the messaging backend, making it available
   * to all subscribers of the specified topic. The message data can be any
   * serializable value (object, array, string, number, etc.).
   *
   * The driver is responsible for:
   * - Serializing the message data appropriately
   * - Adding message metadata (ID, timestamp, etc.)
   * - Handling transmission errors and retries
   * - Ensuring message delivery according to the backend's guarantees
   *
   * @template TData - The type of the message data payload
   *
   * @param topic - The topic or channel name to publish to
   * @param data - The message payload to publish
   * @param options - Optional driver-specific publishing options (e.g., partition key, ordering key)
   *
   * @throws {PublishError} If the message cannot be published
   * @returns A Promise that resolves when the message has been published
   *
   * @example
   * ```typescript
   * await driver.publish('user.created', { userId: '123', email: 'user@example.com' });
   * ```
   */
  publish<TData = any>(topic: string, data: TData, options?: Record<string, any>): Promise<void>;

  /**
   * Subscribes to a topic and registers a message handler.
   *
   * This method establishes a subscription to the specified topic and registers
   * a handler function that will be invoked for each message received on that topic.
   *
   * The driver is responsible for:
   * - Creating the subscription with the messaging backend
   * - Deserializing incoming messages
   * - Invoking the handler for each received message
   * - Managing message acknowledgment (if supported by the backend)
   * - Handling errors during message processing
   *
   * Multiple handlers can be registered for the same topic, and each will
   * receive all messages published to that topic.
   *
   * @template TData - The expected type of message data for this subscription
   *
   * @param topic - The topic or channel name to subscribe to
   * @param handler - The callback function to invoke for each received message
   * @param options - Optional driver-specific subscription options (e.g., consumer group, filter)
   *
   * @throws {SubscriptionError} If the subscription cannot be created
   * @returns A Promise that resolves when the subscription is successfully established
   *
   * @example
   * ```typescript
   * await driver.subscribe('user.created', async (message) => {
   *   console.log('Received user:', message.data);
   * });
   * ```
   */
  subscribe<TData = any>(
    topic: string,
    handler: MessageHandler<TData>,
    options?: Record<string, any>,
  ): Promise<void>;

  /**
   * Unsubscribes from a topic and removes all associated handlers.
   *
   * This method removes the subscription to the specified topic, stopping
   * the delivery of new messages and cleaning up associated resources.
   *
   * After unsubscribing:
   * - No new messages will be received for this topic
   * - Existing handlers will no longer be invoked
   * - Backend subscription resources will be released
   *
   * The method is idempotent - calling it for a topic that is not subscribed
   * should not throw an error.
   *
   * @param topic - The topic or channel name to unsubscribe from
   * @param options - Optional driver-specific unsubscription options
   *
   * @returns A Promise that resolves when the unsubscription is complete
   *
   * @example
   * ```typescript
   * await driver.unsubscribe('user.created');
   * console.log('Unsubscribed from user.created topic');
   * ```
   */
  unsubscribe(topic: string, options?: Record<string, any>): Promise<void>;

  /**
   * Checks if the driver is currently connected to the messaging backend.
   *
   * This method provides a way to query the connection state without
   * attempting to establish a new connection. It's useful for health checks,
   * monitoring, and conditional logic.
   *
   * @returns true if connected, false otherwise
   *
   * @example
   * ```typescript
   * if (driver.isConnected()) {
   *   await driver.publish('topic', data);
   * } else {
   *   await driver.connect();
   * }
   * ```
   */
  isConnected(): boolean;

  /**
   * Retrieves the list of topics currently subscribed to by this driver instance.
   *
   * This method returns an array of topic names that have active subscriptions.
   * It's useful for debugging, monitoring, and managing subscriptions programmatically.
   *
   * @returns An array of subscribed topic names
   *
   * @example
   * ```typescript
   * const topics = driver.getSubscribedTopics();
   * console.log('Currently subscribed to:', topics);
   * ```
   */
  getSubscribedTopics(): string[];
}

/**
 * Namespace for IPubSubDriver interface containing the symbol for dependency injection.
 */
export namespace IPubSubDriver {
  /**
   * Unique symbol identifier for the IPubSubDriver interface.
   * Used for dependency injection and type identification in the NestJS container.
   */
  export const $ = Symbol('IPubSubDriver');
}
