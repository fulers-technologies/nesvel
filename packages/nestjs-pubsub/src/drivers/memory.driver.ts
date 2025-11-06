import { EventEmitter2 } from '@nestjs/event-emitter';

import { BasePubSubDriver } from './base.driver';
import { MessageHandler } from '@/types/message-handler.type';
import { PubSubDriverType } from '@enums/pubsub-driver-type.enum';
import { IPubSubDriver } from '@interfaces/pubsub-driver.interface';
import type { IMemoryOptions } from '@interfaces/memory-options.interface';
import type { IPubSubMessage } from '@interfaces/pubsub-message.interface';
import { IBaseDriverOptions } from '@interfaces/base-driver-options.interface';

/**
 * Memory in-process implementation of the PubSub driver interface.
 *
 * This driver provides pub/sub functionality using EventEmitter2 for in-process
 * event handling. It extends BasePubSubDriver to inherit production features:
 *
 * Production Features (from BasePubSubDriver):
 * - Message size validation
 * - Correlation ID tracking
 * - Metrics collection (publish/subscribe/handler metrics)
 * - Structured logging with sampling
 * - Dead Letter Queue support for failed handlers
 * - Handler count limits per topic
 * - Error handling with configurable propagation
 * - Namespace support for multi-tenancy
 *
 * Memory-Specific Features:
 * - Zero external dependencies (uses @nestjs/event-emitter)
 * - Wildcard pattern matching ('*' and '**')
 * - Synchronous and asynchronous event handlers
 * - Multiple handlers per topic
 * - In-process, no network latency
 *
 * Ideal for:
 * - Development and testing environments
 * - Monolithic applications
 * - Simple event-driven architectures within a single process
 * - Applications that don't require message persistence
 *
 * Limitations:
 * - No cross-process messaging
 * - No message persistence
 * - No delivery guarantees across restarts
 * - No distributed messaging capabilities
 *
 * @see {@link https://github.com/EventEmitter2/EventEmitter2 | EventEmitter2}
 * @extends BasePubSubDriver
 */
export class MemoryPubSubDriver extends BasePubSubDriver implements IPubSubDriver {
  /**
   * The underlying EventEmitter2 instance used for event handling.
   * Initialized in the connect() method.
   */
  private emitter!: EventEmitter2;

  /**
   * Map of topic names to their registered message handlers.
   * Used to track subscriptions for getSubscribedTopics() and cleanup.
   */
  private readonly handlers = new Map<string, Set<MessageHandler>>();

  /**
   * EventEmitter2 configuration options.
   */
  private readonly emitterOptions: IMemoryOptions;

  /**
   * Creates a new instance of the Memory PubSub driver.
   *
   * @param emitterOptions - Configuration options for EventEmitter2
   * @param baseOptions - Production features configuration from base driver
   */
  constructor(emitterOptions: IMemoryOptions = {}, baseOptions: IBaseDriverOptions = {}) {
    super(baseOptions);
    this.emitterOptions = emitterOptions;
  }

  /**
   * Initializes the EventEmitter2 instance.
   *
   * This method creates the EventEmitter2 with the provided configuration.
   * Since this is an in-process driver, there's no actual network connection
   * to establish.
   *
   * The method is idempotent and will not create duplicate instances
   * if called multiple times.
   *
   * @throws {Error} If initialization fails
   */
  async connect(): Promise<void> {
    if (this.connected) {
      this.logger.warn('Memory driver is already initialized');
      return;
    }

    try {
      // Initialize EventEmitter2 with options
      this.emitter = new EventEmitter2({
        wildcard: this.emitterOptions.wildcard ?? true,
        delimiter: this.emitterOptions.delimiter ?? '.',
        newListener: this.emitterOptions.newListener ?? false,
        removeListener: this.emitterOptions.removeListener ?? false,
        maxListeners: this.emitterOptions.maxListeners ?? 10,
        verboseMemoryLeak: this.emitterOptions.verboseMemoryLeak ?? false,
        ignoreErrors: this.emitterOptions.ignoreErrors ?? false,
      });

      this.connected = true;

      this.logger.log('Memory PubSub driver initialized', {
        driver: 'memory',
        wildcard: this.emitterOptions.wildcard ?? true,
        delimiter: this.emitterOptions.delimiter ?? '.',
        maxListeners: this.emitterOptions.maxListeners ?? 10,
      });

      // Record connection metric
      this.metrics.incrementCounter('pubsub.driver.connected', {
        driver: 'memory',
      });
    } catch (error: any) {
      this.logger.error('Failed to initialize Memory driver', error.stack, {
        driver: 'memory',
        error: error.message,
      });

      this.metrics.incrementCounter('pubsub.driver.connect.error', {
        driver: 'memory',
        errorType: error.name || 'Unknown',
      });

      throw error;
    }
  }

  /**
   * Cleans up resources and removes all event listeners.
   *
   * This method:
   * - Removes all registered event listeners
   * - Clears all handler maps
   * - Resets the connected state
   *
   * The method is idempotent and safe to call multiple times.
   */
  async disconnect(): Promise<void> {
    if (!this.connected) {
      return;
    }

    try {
      // Remove all listeners
      this.emitter?.removeAllListeners();

      // Clear handlers
      this.handlers.clear();
      this.handlerCounts.clear();

      this.connected = false;

      this.logger.log('Memory PubSub driver disconnected', {
        driver: 'memory',
      });

      // Record disconnection metric
      this.metrics.incrementCounter('pubsub.driver.disconnected', {
        driver: 'memory',
      });
    } catch (error: any) {
      this.logger.error('Error during Memory driver disconnection', error.stack, {
        driver: 'memory',
        error: error.message,
      });

      throw error;
    }
  }

  /**
   * Driver-specific publish implementation.
   *
   * Emits the prepared message to EventEmitter2. The message has already been
   * validated, sized, and enriched with correlation IDs by the base class.
   *
   * @param topic - The topic to publish to (already namespaced)
   * @param message - The complete, validated message structure
   * @param options - Optional publishing options (unused by Memory driver)
   *
   * @throws {Error} If not connected or emitting fails
   */
  protected async publishInternal<TData = any>(
    topic: string,
    message: IPubSubMessage<TData>,
    options?: Record<string, any>,
  ): Promise<void> {
    if (!this.connected) {
      throw new Error('Memory driver is not initialized');
    }

    // Emit the message to EventEmitter2
    // Handlers are already wrapped by base class with error handling, metrics, etc.
    this.emitter.emit(topic, message);
  }

  /**
   * Driver-specific subscribe implementation.
   *
   * Registers the wrapped handler with EventEmitter2. The handler has already been
   * wrapped by the base class with error handling, metrics, DLQ support, etc.
   *
   * @param topic - The topic to subscribe to (already namespaced)
   * @param handler - The wrapped message handler
   * @param options - Optional subscription options (unused by Memory driver)
   *
   * @throws {Error} If not connected or subscription fails
   *
   * @example
   * Wildcard patterns are supported if enabled in constructor options:
   * ```typescript
   * // Exact match
   * await driver.subscribe('user.created', handler);
   *
   * // Wildcard patterns (if wildcard: true)
   * await driver.subscribe('user.*', handler);        // Single level
   * await driver.subscribe('user.**', handler);       // Multi-level
   * await driver.subscribe('**.created', handler);    // Any namespace
   * ```
   */
  protected async subscribeInternal<TData = any>(
    topic: string,
    handler: MessageHandler<TData>,
    options?: Record<string, any>,
  ): Promise<void> {
    if (!this.connected) {
      throw new Error('Memory driver is not initialized');
    }

    // Track handler for getSubscribedTopics()
    if (!this.handlers.has(topic)) {
      this.handlers.set(topic, new Set());
    }
    this.handlers.get(topic)!.add(handler);

    // Register handler with EventEmitter2
    // The handler is already wrapped with error handling, metrics, DLQ, etc.
    this.emitter.on(topic, handler);
  }

  /**
   * Unsubscribe from a topic and remove all handlers.
   *
   * This method removes all registered handlers for the specified topic
   * and removes the event listeners from EventEmitter2.
   *
   * @param topic - The event name/topic to unsubscribe from
   * @param options - Optional unsubscription options (currently unused)
   */
  async unsubscribe(topic: string, options?: Record<string, any>): Promise<void> {
    if (!this.connected) {
      return;
    }

    try {
      const namespacedTopic = this.applyNamespace(topic);

      // Remove handlers from tracking map
      this.handlers.delete(namespacedTopic);
      this.handlerCounts.delete(namespacedTopic);

      // Remove all listeners for this topic
      this.emitter.removeAllListeners(namespacedTopic);

      this.logger.log(`Unsubscribed from topic: ${namespacedTopic}`, {
        topic: namespacedTopic,
        originalTopic: topic,
        driver: 'memory',
      });

      // Record unsubscription metric
      this.metrics.incrementCounter('pubsub.unsubscribe', {
        topic: namespacedTopic,
        driver: 'memory',
      });
    } catch (error: any) {
      this.logger.error(`Failed to unsubscribe from ${topic}`, error.stack, {
        topic,
        driver: 'memory',
        error: error.message,
      });

      throw error;
    }
  }

  /**
   * Checks if the driver is currently initialized.
   *
   * @returns true if initialized, false otherwise
   */
  isConnected(): boolean {
    return this.connected;
  }

  /**
   * Retrieves the list of topics currently subscribed to.
   *
   * @returns An array of subscribed topic names (with namespaces if applicable)
   */
  getSubscribedTopics(): string[] {
    return Array.from(this.handlers.keys());
  }

  /**
   * Get the driver name for logging and metrics.
   * Overrides base class to provide specific driver name.
   *
   * @returns PubSubDriverType.MEMORY
   */
  protected getDriverName(): PubSubDriverType {
    return PubSubDriverType.MEMORY;
  }
}
