import { BasePubSubDriver } from './base.driver';
import { MessageHandler } from '@/types/message-handler.type';
import { PubSubDriverType } from '@enums/pubsub-driver-type.enum';
import { IPubSubDriver } from '@interfaces/pubsub-driver.interface';
import type { IKafkaOptions } from '@interfaces/kafka-options.interface';
import type { IPubSubMessage } from '@interfaces/pubsub-message.interface';
import { IBaseDriverOptions } from '@interfaces/base-driver-options.interface';

/**
 * Kafka implementation of the PubSub driver interface.
 *
 * This driver provides pub/sub functionality using Apache Kafka as the messaging backend.
 * It extends BasePubSubDriver to inherit production features:
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
 * Kafka-Specific Features:
 * - Uses kafkajs library
 * - Producer for publishing messages
 * - Consumer for subscribing with consumer groups
 * - Partition-based message distribution
 * - At-least-once delivery semantics
 * - Automatic offset management
 * - Message batching and compression
 * - SASL/SSL authentication
 *
 * @extends BasePubSubDriver
 *
 * Note: kafkajs must be installed as a peer dependency.
 * Install it with: npm install kafkajs
 */
export class KafkaPubSubDriver extends BasePubSubDriver implements IPubSubDriver {
  /**
   * Kafka client instance.
   */
  private kafka: any;

  /**
   * Kafka producer for publishing messages.
   */
  private producer: any;

  /**
   * Kafka consumer for subscribing to topics.
   */
  private consumer: any;

  /**
   * Map of topic names to their registered message handlers.
   */
  private readonly handlers = new Map<string, Set<MessageHandler>>();

  /**
   * Flag indicating whether the consumer is currently running.
   */
  private consumerRunning = false;

  /**
   * Pending topics to subscribe to before starting the consumer.
   */
  private pendingTopics = new Map<string, { options?: Record<string, any> }>();

  /**
   * Timer for batching subscriptions.
   */
  private startConsumerTimer?: NodeJS.Timeout;

  /**
   * Kafka-specific configuration options.
   */
  private readonly kafkaOptions: IKafkaOptions;

  /**
   * Creates a new instance of the Kafka PubSub driver.
   *
   * @param options - Configuration options for Kafka
   * @param baseOptions - Production features configuration
   */
  constructor(options: IKafkaOptions, baseOptions: IBaseDriverOptions = {}) {
    super(baseOptions);
    this.kafkaOptions = options;
  }

  /**
   * Establishes connection to the Kafka cluster.
   */
  async connect(): Promise<void> {
    if (this.connected) {
      this.logger.warn('Already connected to Kafka');
      return;
    }

    try {
      const { Kafka, Partitioners } = await this.loadKafkaJS();

      this.kafka = Kafka.make({
        clientId: this.kafkaOptions.clientId,
        brokers: this.kafkaOptions.brokers,
        ssl: this.kafkaOptions.ssl,
        sasl: this.kafkaOptions.sasl,
        connectionTimeout: this.kafkaOptions.connectionTimeout || 10000,
        requestTimeout: this.kafkaOptions.requestTimeout || 30000,
        retry: this.kafkaOptions.retry,
        logLevel: this.mapLogLevel(this.kafkaOptions.logLevel),
      });

      const producerOptions = {
        createPartitioner: Partitioners.DefaultPartitioner,
        ...this.kafkaOptions.producer,
      };
      this.producer = this.kafka.producer(producerOptions);
      await this.producer.connect();

      this.consumer = this.kafka.consumer({
        groupId: this.kafkaOptions.groupId || 'pubsub-consumer-group',
        ...this.kafkaOptions.consumer,
      });

      this.connected = true;

      this.logger.log('Successfully connected to Kafka', {
        driver: 'kafka',
        clientId: this.kafkaOptions.clientId,
        brokers: this.kafkaOptions.brokers,
        groupId: this.kafkaOptions.groupId || 'pubsub-consumer-group',
      });

      this.metrics.incrementCounter('pubsub.driver.connected', { driver: 'kafka' });
    } catch (error: any) {
      this.logger.error('Failed to connect to Kafka', error.stack, {
        driver: 'kafka',
        error: error.message,
      });

      this.metrics.incrementCounter('pubsub.driver.connect.error', {
        driver: 'kafka',
        errorType: error.name || 'Unknown',
      });

      throw error;
    }
  }

  /**
   * Closes connections to Kafka and cleans up resources.
   */
  async disconnect(): Promise<void> {
    if (!this.connected) {
      return;
    }

    try {
      // Clear any pending subscription timer
      if (this.startConsumerTimer) {
        clearTimeout(this.startConsumerTimer);
        this.startConsumerTimer = undefined;
      }

      if (this.consumerRunning) {
        await this.consumer.stop();
        this.consumerRunning = false;
      }

      await Promise.all([this.producer?.disconnect(), this.consumer?.disconnect()]);

      this.handlers.clear();
      this.handlerCounts.clear();
      this.pendingTopics.clear();

      this.connected = false;

      this.logger.log('Disconnected from Kafka', { driver: 'kafka' });
      this.metrics.incrementCounter('pubsub.driver.disconnected', { driver: 'kafka' });
    } catch (error: any) {
      this.logger.error('Error during Kafka disconnection', error.stack, {
        driver: 'kafka',
        error: error.message,
      });

      throw error;
    }
  }

  /**
   * Driver-specific publish implementation.
   */
  protected async publishInternal<TData = any>(
    topic: string,
    message: IPubSubMessage<TData>,
    options?: Record<string, any>,
  ): Promise<void> {
    if (!this.connected) {
      throw new Error('Not connected to Kafka');
    }

    const value = JSON.stringify(message);

    const kafkaMessage: any = { value };

    if (options?.key) {
      kafkaMessage.key = options.key;
    }

    if (options?.headers) {
      kafkaMessage.headers = options.headers;
    }

    await this.producer.send({
      topic,
      messages: [kafkaMessage],
      acks: this.kafkaOptions.producer?.acks ?? -1,
      timeout: this.kafkaOptions.producer?.timeout,
      compression: this.kafkaOptions.producer?.compression,
    });
  }

  /**
   * Driver-specific subscribe implementation.
   */
  protected async subscribeInternal<TData = any>(
    topic: string,
    handler: MessageHandler<TData>,
    options?: Record<string, any>,
  ): Promise<void> {
    if (!this.connected) {
      throw new Error('Not connected to Kafka');
    }

    // Add handler to the map
    if (!this.handlers.has(topic)) {
      this.handlers.set(topic, new Set());
    }
    this.handlers.get(topic)!.add(handler);

    // If consumer is already running, we can't add new subscriptions in Kafka
    if (this.consumerRunning) {
      this.logger.warn(
        `Cannot subscribe to topic ${topic} while consumer is running. ` +
          `Consider subscribing to all topics before the first message is processed.`,
        { topic, driver: 'kafka' },
      );
      return;
    }

    // Connect consumer if not connected yet
    if (!this.consumer.isConnected || !this.consumer.isConnected()) {
      await this.consumer.connect();
    }

    // Queue the topic for subscription
    if (this.handlers.get(topic)!.size === 1) {
      // Only subscribe if this is the first handler for this topic
      this.pendingTopics.set(topic, { options });

      this.logger.debug(`Queued topic for subscription: ${topic}`, {
        topic,
        driver: 'kafka',
        pendingCount: this.pendingTopics.size,
      });
    }

    // Debounce starting the consumer to allow batching of subscriptions
    // This gives time for all @Subscribe decorators to register
    if (this.startConsumerTimer) {
      clearTimeout(this.startConsumerTimer);
    }

    this.startConsumerTimer = setTimeout(async () => {
      await this.subscribeAndStartConsumer();
    }, 100); // 100ms debounce
  }

  /**
   * Unsubscribes from a Kafka topic.
   */
  async unsubscribe(topic: string, options?: Record<string, any>): Promise<void> {
    if (!this.connected) {
      return;
    }

    try {
      const namespacedTopic = this.applyNamespace(topic);

      this.handlers.delete(namespacedTopic);
      this.handlerCounts.delete(namespacedTopic);

      this.logger.log(`Unsubscribed from topic: ${namespacedTopic}`, {
        topic: namespacedTopic,
        originalTopic: topic,
        driver: 'kafka',
      });

      this.metrics.incrementCounter('pubsub.unsubscribe', {
        topic: namespacedTopic,
        driver: 'kafka',
      });
    } catch (error: any) {
      this.logger.error(`Failed to unsubscribe from ${topic}`, error.stack, {
        topic,
        driver: 'kafka',
        error: error.message,
      });

      throw error;
    }
  }

  /**
   * Checks if connected to Kafka.
   */
  isConnected(): boolean {
    return this.connected;
  }

  /**
   * Retrieves subscribed topics.
   */
  getSubscribedTopics(): string[] {
    return Array.from(this.handlers.keys());
  }

  /**
   * Subscribes to all pending topics and starts the Kafka consumer.
   */
  private async subscribeAndStartConsumer(): Promise<void> {
    if (this.consumerRunning) {
      return;
    }

    if (this.pendingTopics.size === 0) {
      this.logger.warn('No topics to subscribe to', { driver: 'kafka' });
      return;
    }

    try {
      // Subscribe to all pending topics at once
      const subscriptionPromises = Array.from(this.pendingTopics.entries()).map(
        async ([topic, { options }]) => {
          await this.consumer.subscribe({
            topic,
            fromBeginning:
              options?.fromBeginning ?? this.kafkaOptions.consumer?.fromBeginning ?? false,
          });

          this.logger.log(`Subscribed to topic: ${topic}`, {
            topic,
            driver: 'kafka',
            fromBeginning: options?.fromBeginning,
          });
        },
      );

      await Promise.all(subscriptionPromises);

      // Clear pending topics
      this.pendingTopics.clear();

      // Now start the consumer
      await this.startConsumer();
    } catch (error: any) {
      this.logger.error('Failed to subscribe to topics', error.stack, {
        driver: 'kafka',
        error: error.message,
      });
      throw error;
    }
  }

  /**
   * Starts the Kafka consumer.
   */
  private async startConsumer(): Promise<void> {
    await this.consumer.run({
      autoCommit: this.kafkaOptions.consumer?.autoCommit ?? true,
      autoCommitInterval: this.kafkaOptions.consumer?.autoCommitInterval,
      eachMessage: async ({ topic, partition, message }: any) => {
        await this.handleMessage(topic, message);
      },
    });

    this.consumerRunning = true;
    this.logger.log('Kafka consumer started', { driver: 'kafka' });
  }

  /**
   * Handles incoming messages from Kafka.
   */
  private async handleMessage(topic: string, kafkaMessage: any): Promise<void> {
    try {
      const messageData = kafkaMessage.value.toString();
      const message: IPubSubMessage = JSON.parse(messageData);

      const topicHandlers = this.handlers.get(topic);
      if (!topicHandlers || topicHandlers.size === 0) {
        return;
      }

      const promises = Array.from(topicHandlers).map(async (handler) => {
        await handler(message);
      });

      await Promise.all(promises);
    } catch (error: any) {
      this.logger.error('Failed to handle message', error.stack, {
        topic,
        driver: 'kafka',
        error: error.message,
      });
    }
  }

  /**
   * Dynamically loads kafkajs library.
   */
  private async loadKafkaJS(): Promise<any> {
    try {
      return await import('kafkajs');
    } catch (error: any) {
      throw new Error('kafkajs is not installed. Please install it with: npm install kafkajs');
    }
  }

  /**
   * Maps log level string to kafkajs enum.
   */
  private mapLogLevel(level?: string): number {
    const levels: Record<string, number> = {
      NOTHING: 0,
      ERROR: 1,
      WARN: 2,
      INFO: 4,
      DEBUG: 5,
    };
    return levels[level || 'INFO'] || 4;
  }

  /**
   * Get driver name for logging and metrics.
   *
   * @returns PubSubDriverType.KAFKA
   */
  protected getDriverName(): PubSubDriverType {
    return PubSubDriverType.KAFKA;
  }
}
