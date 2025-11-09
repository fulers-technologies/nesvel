import * as crypto from 'crypto';
import { Logger } from '@nestjs/common';

import { MessageHandler } from '@/types/message-handler.type';
import { NoOpMetrics } from '@interfaces/no-op-metrics.interface';
import type { IPubSubMetrics } from '@interfaces/metrics.interface';
import type { IPubSubDriver } from '@interfaces/pubsub-driver.interface';
import type { IPubSubMessage } from '@interfaces/pubsub-message.interface';
import { IBaseDriverOptions } from '@interfaces/base-driver-options.interface';

/**
 * Abstract base class for PubSub driver implementations.
 *
 * Provides common functionality shared across all drivers including:
 * - Message ID and correlation ID generation
 * - Metrics collection and recording
 * - Structured logging with sampling
 * - Message size validation
 * - Handler tracking and limits
 * - Dead Letter Queue support
 * - Error handling with DLQ fallback
 *
 * All concrete driver implementations should extend this class to inherit
 * production-ready features and ensure consistent behavior.
 *
 * @remarks
 * Subclasses must implement:
 * - connect(): Establish connection to messaging backend
 * - disconnect(): Clean up and close connections
 * - publishInternal(): Driver-specific publish logic
 * - subscribeInternal(): Driver-specific subscribe logic
 * - unsubscribe(): Driver-specific unsubscribe logic
 * - isConnected(): Check connection status
 * - getSubscribedTopics(): List active subscriptions
 *
 * @example
 * ```typescript
 * export class MyCustomDriver extends BasePubSubDriver {
 *   async connect(): Promise<void> {
 *     // Connect to backend
 *   }
 *
 *   protected async publishInternal(topic: string, message: IPubSubMessage): Promise<void> {
 *     // Driver-specific publish
 *   }
 *
 *   // ... implement other abstract methods
 * }
 * ```
 */
export abstract class BasePubSubDriver implements IPubSubDriver {
  /**
   * Logger instance for the driver.
   * Subclasses should initialize with their own class name.
   */
  protected readonly logger = new Logger(this.constructor.name);

  /**
   * Metrics collector for telemetry.
   * Defaults to no-op if not provided.
   */
  protected readonly metrics: IPubSubMetrics;

  /**
   * Maximum handlers allowed per topic.
   */
  protected readonly maxHandlersPerTopic: number;

  /**
   * Dead Letter Queue topic name.
   */
  protected readonly deadLetterQueue?: string;

  /**
   * Whether to throw on handler errors.
   */
  protected readonly throwOnHandlerError: boolean;

  /**
   * Maximum message size in bytes.
   */
  protected readonly maxMessageSize?: number;

  /**
   * Enable correlation ID tracking.
   */
  protected readonly enableCorrelationId: boolean;

  /**
   * Log sampling rate (0.0 to 1.0).
   */
  protected readonly logSamplingRate: number;

  /**
   * Optional namespace prefix for topics.
   */
  protected readonly namespace?: string;

  /**
   * Map tracking handler counts per topic.
   * Used to enforce maxHandlersPerTopic limit.
   */
  protected readonly handlerCounts = new Map<string, number>();

  /**
   * Flag indicating whether the driver is currently connected (initialized).
   */
  protected connected = false;

  /**
   * Creates a new base driver instance.
   *
   * @param options - Production feature configuration
   */
  constructor(options: IBaseDriverOptions = {}) {
    this.namespace = options.namespace;
    this.maxMessageSize = options.maxMessageSize;
    this.deadLetterQueue = options.deadLetterQueue;
    this.metrics = options.metrics || NoOpMetrics.make();
    this.logSamplingRate = options.logSamplingRate ?? 1.0;
    this.maxHandlersPerTopic = options.maxHandlersPerTopic ?? 100;
    this.enableCorrelationId = options.enableCorrelationId ?? true;
    this.throwOnHandlerError = options.throwOnHandlerError ?? false;
  }

  /**
   * Generic factory method to create driver instances.
   *
   * This static method allows subclasses to inherit a factory pattern
   * without needing to implement their own make() method. It uses
   * TypeScript generics to ensure proper typing.
   *
   * @template T - The driver class type
   * @param args - Arguments to pass to the driver constructor
   * @returns A new instance of the driver
   *
   * @example
   * ```typescript
   * class MyDriver extends BasePubSubDriver {
   *   constructor(options: MyOptions, baseOptions: IBaseDriverOptions) {
   *     super(baseOptions);
   *     // driver-specific initialization
   *   }
   * }
   *
   * // Usage:
   * const driver = MyDriver.make(myOptions, baseOptions);
   * ```
   */
  static make<T extends BasePubSubDriver>(this: new (...args: any[]) => T, ...args: any[]): T {
    // Create a new instance using the constructor with all provided arguments
    // 'this' refers to the actual driver class (e.g., RedisPubSubDriver)
    // The spread operator passes all arguments to the constructor
    return this.make(...args);
  }

  // ========================================
  // Abstract Methods (must be implemented by subclasses)
  // ========================================

  /**
   * Establish connection to the messaging backend.
   * Subclasses must implement backend-specific connection logic.
   */
  abstract connect(): Promise<void>;

  /**
   * Close connection and clean up resources.
   * Subclasses must implement backend-specific disconnection logic.
   */
  abstract disconnect(): Promise<void>;

  /**
   * Driver-specific publish implementation.
   *
   * This method receives a fully prepared message with ID, correlation ID,
   * timestamp, and validated size. Subclasses only need to handle the
   * actual publishing to their backend.
   *
   * @param topic - The topic to publish to (already namespaced if applicable)
   * @param message - The complete message structure
   * @param options - Optional driver-specific options
   */
  protected abstract publishInternal<TData = any>(
    topic: string,
    message: IPubSubMessage<TData>,
    options?: Record<string, any>,
  ): Promise<void>;

  /**
   * Driver-specific subscribe implementation.
   *
   * This method receives a wrapped handler that includes error handling,
   * metrics, and DLQ support. Subclasses only need to register the handler
   * with their backend.
   *
   * @param topic - The topic to subscribe to (already namespaced if applicable)
   * @param handler - The wrapped message handler
   * @param options - Optional driver-specific options
   */
  protected abstract subscribeInternal<TData = any>(
    topic: string,
    handler: MessageHandler<TData>,
    options?: Record<string, any>,
  ): Promise<void>;

  /**
   * Unsubscribe from a topic.
   * Subclasses must implement backend-specific unsubscribe logic.
   *
   * @param topic - The topic to unsubscribe from
   * @param options - Optional driver-specific options
   */
  abstract unsubscribe(topic: string, options?: Record<string, any>): Promise<void>;

  /**
   * Check if driver is connected to backend.
   * Subclasses must implement connection state checking.
   */
  abstract isConnected(): boolean;

  /**
   * Get list of currently subscribed topics.
   * Subclasses must implement topic listing logic.
   */
  abstract getSubscribedTopics(): string[];

  // ========================================
  // Public Methods (implemented with production features)
  // ========================================

  /**
   * Publish a message to a topic with full production features.
   *
   * This method wraps the driver-specific publishInternal with:
   * - Message size validation
   * - Correlation ID generation
   * - Metrics collection
   * - Structured logging with sampling
   * - Error handling and tracking
   *
   * @template TData - Type of message payload
   * @param topic - Topic to publish to
   * @param data - Message payload
   * @param options - Publishing options (metadata, attributes, correlationId)
   */
  async publish<TData = any>(
    topic: string,
    data: TData,
    options?: Record<string, any>,
  ): Promise<void> {
    const startTime = Date.now();
    const namespacedTopic = this.applyNamespace(topic);

    try {
      // Validate message size
      const messageSize = this.getMessageSize(data);
      this.validateMessageSize(messageSize, namespacedTopic);

      // Record message size metric
      this.metrics.recordHistogram('pubsub.message.size.bytes', messageSize, {
        topic: namespacedTopic,
        driver: this.getDriverName(),
      });

      // Generate or use provided correlation ID
      const correlationId = this.getCorrelationId(options);

      // Build complete message structure
      const message: IPubSubMessage<TData> = {
        id: this.generateMessageId(),
        topic: namespacedTopic,
        data,
        timestamp: new Date(),
        metadata: {
          ...options?.metadata,
          correlationId,
        },
        attributes: options?.attributes,
      };

      // Call driver-specific publish
      await this.publishInternal(namespacedTopic, message, options);

      // Record success metrics
      this.metrics.incrementCounter('pubsub.publish.success', {
        topic: namespacedTopic,
        driver: this.getDriverName(),
      });

      // Log with sampling
      if (this.shouldLog()) {
        const duration = Date.now() - startTime;
        this.logger.debug('Message published', {
          operation: 'publish',
          topic: namespacedTopic,
          originalTopic: topic,
          messageId: message.id,
          messageSize,
          correlationId,
          driver: this.getDriverName(),
          duration,
          timestamp: message.timestamp.toISOString(),
        });
      }
    } catch (error: any) {
      // Record failure metrics
      this.metrics.incrementCounter('pubsub.publish.error', {
        topic: namespacedTopic,
        driver: this.getDriverName(),
        errorType: error.name || 'Unknown',
      });

      const duration = Date.now() - startTime;
      this.logger.error(`Failed to publish to ${namespacedTopic}`, error.stack, {
        topic: namespacedTopic,
        originalTopic: topic,
        driver: this.getDriverName(),
        error: error.message,
        duration,
      });

      throw error;
    }
  }

  /**
   * Subscribe to a topic with full production features.
   *
   * This method wraps the user's handler with:
   * - Handler count limit enforcement
   * - Execution time metrics
   * - Error handling with DLQ support
   * - Structured error logging
   * - Success/failure metrics
   *
   * @template TData - Expected type of message payload
   * @param topic - Topic to subscribe to
   * @param handler - Message handler function
   * @param options - Subscription options
   */
  async subscribe<TData = any>(
    topic: string,
    handler: MessageHandler<TData>,
    options?: Record<string, any>,
  ): Promise<void> {
    const namespacedTopic = this.applyNamespace(topic);

    // Check handler limit
    this.enforceHandlerLimit(namespacedTopic);

    // Wrap handler with production features
    const wrappedHandler = this.wrapHandler(namespacedTopic, handler);

    // Call driver-specific subscribe
    await this.subscribeInternal(namespacedTopic, wrappedHandler, options);

    // Track handler count
    const count = this.handlerCounts.get(namespacedTopic) || 0;
    this.handlerCounts.set(namespacedTopic, count + 1);

    // Record subscription metric
    this.metrics.incrementCounter('pubsub.subscribe', {
      topic: namespacedTopic,
      driver: this.getDriverName(),
    });

    this.logger.log(`Subscribed to topic: ${namespacedTopic}`, {
      topic: namespacedTopic,
      originalTopic: topic,
      handlerCount: count + 1,
    });
  }

  // ========================================
  // Protected Helper Methods
  // ========================================

  /**
   * Wrap a message handler with production features.
   *
   * The wrapped handler includes:
   * - Execution time tracking
   * - Error handling with DLQ support
   * - Success/failure metrics
   * - Structured error logging
   *
   * @param topic - Topic the handler is registered for
   * @param handler - Original handler function
   * @returns Wrapped handler with production features
   */
  protected wrapHandler<TData = any>(
    topic: string,
    handler: MessageHandler<TData>,
  ): MessageHandler<TData> {
    return async (message: IPubSubMessage<TData>) => {
      const startTime = Date.now();
      const endTimer = this.metrics.startTimer('pubsub.handler.duration', {
        topic,
        driver: this.getDriverName(),
      });

      try {
        // Execute user's handler
        await handler(message);

        // Record success
        this.metrics.incrementCounter('pubsub.handler.success', {
          topic,
          driver: this.getDriverName(),
        });

        endTimer();
      } catch (error: any) {
        endTimer();

        // Record failure
        this.metrics.incrementCounter('pubsub.handler.error', {
          topic,
          driver: this.getDriverName(),
          errorType: error.name || 'Unknown',
        });

        const duration = Date.now() - startTime;
        this.logger.error(`Error in handler for topic ${topic}`, error.stack, {
          topic,
          messageId: message.id,
          correlationId: message.metadata?.correlationId,
          driver: this.getDriverName(),
          error: error.message,
          duration,
        });

        // Send to DLQ if configured
        if (this.deadLetterQueue) {
          await this.sendToDeadLetterQueue(message, error);
        }

        // Optionally rethrow
        if (this.throwOnHandlerError) {
          throw error;
        }
      }
    };
  }

  /**
   * Send a failed message to the Dead Letter Queue.
   *
   * @param message - The original message that failed
   * @param error - The error that occurred
   */
  protected async sendToDeadLetterQueue<TData = any>(
    message: IPubSubMessage<TData>,
    error: Error,
  ): Promise<void> {
    if (!this.deadLetterQueue) {
      return;
    }

    try {
      const dlqMessage = {
        originalTopic: message.topic,
        originalMessageId: message.id,
        originalData: message.data,
        originalTimestamp: message.timestamp,
        error: {
          name: error.name,
          message: error.message,
          stack: error.stack,
        },
        failedAt: new Date(),
        metadata: message.metadata,
      };

      await this.publishInternal(this.deadLetterQueue, {
        id: this.generateMessageId(),
        topic: this.deadLetterQueue,
        data: dlqMessage as any,
        timestamp: new Date(),
        metadata: { ...message.metadata, isDLQ: true },
      });

      this.logger.warn(`Message sent to DLQ: ${this.deadLetterQueue}`, {
        originalTopic: message.topic,
        originalMessageId: message.id,
        dlqTopic: this.deadLetterQueue,
        error: error.message,
      });

      this.metrics.incrementCounter('pubsub.dlq.sent', {
        topic: message.topic,
        driver: this.getDriverName(),
      });
    } catch (dlqError: any) {
      this.logger.error('Failed to send message to DLQ', dlqError.stack, {
        originalTopic: message.topic,
        dlqTopic: this.deadLetterQueue,
        dlqError: dlqError.message,
      });

      this.metrics.incrementCounter('pubsub.dlq.error', {
        topic: message.topic,
        driver: this.getDriverName(),
      });
    }
  }

  /**
   * Apply namespace prefix to topic if configured.
   *
   * @param topic - Original topic name
   * @returns Namespaced topic name
   */
  protected applyNamespace(topic: string): string {
    return this.namespace ? `${this.namespace}${topic}` : topic;
  }

  /**
   * Generate a unique message ID.
   *
   * @returns Unique message identifier
   */
  protected generateMessageId(): string {
    return `${Date.now()}-${Math.random().toString(36).substring(2, 11)}`;
  }

  /**
   * Generate a correlation ID for distributed tracing.
   *
   * @returns UUID v4 correlation ID
   */
  protected generateCorrelationId(): string {
    return crypto.randomUUID();
  }

  /**
   * Get or generate correlation ID from options.
   *
   * @param options - Publishing options
   * @returns Correlation ID or undefined
   */
  protected getCorrelationId(options?: Record<string, any>): string | undefined {
    if (!this.enableCorrelationId) {
      return undefined;
    }

    return (
      options?.correlationId || options?.metadata?.correlationId || this.generateCorrelationId()
    );
  }

  /**
   * Calculate message size in bytes.
   *
   * @param data - Message payload
   * @returns Size in bytes
   */
  protected getMessageSize(data: any): number {
    return JSON.stringify(data).length;
  }

  /**
   * Validate message size against configured limit.
   *
   * @param size - Message size in bytes
   * @param topic - Topic name for error message
   * @throws {Error} If size exceeds limit
   */
  protected validateMessageSize(size: number, topic: string): void {
    if (this.maxMessageSize && size > this.maxMessageSize) {
      throw new Error(
        `Message size ${size} bytes exceeds maximum ${this.maxMessageSize} bytes for topic "${topic}"`,
      );
    }
  }

  /**
   * Enforce handler count limit for a topic.
   *
   * @param topic - Topic name
   * @throws {Error} If limit exceeded
   */
  protected enforceHandlerLimit(topic: string): void {
    const currentCount = this.handlerCounts.get(topic) || 0;
    if (currentCount >= this.maxHandlersPerTopic) {
      throw new Error(
        `Maximum handler limit (${this.maxHandlersPerTopic}) exceeded for topic "${topic}"`,
      );
    }
  }

  /**
   * Determine if current operation should be logged based on sampling rate.
   *
   * @returns True if should log, false otherwise
   */
  protected shouldLog(): boolean {
    return Math.random() < this.logSamplingRate;
  }

  /**
   * Get the driver name for logging and metrics.
   * Subclasses can override to provide specific driver name.
   *
   * @returns Driver name
   */
  protected getDriverName(): string {
    return this.constructor.name.replace('PubSubDriver', '').toLowerCase();
  }
}
