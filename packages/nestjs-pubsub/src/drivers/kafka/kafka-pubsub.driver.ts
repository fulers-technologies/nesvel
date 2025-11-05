import { Logger } from '@nestjs/common';
import type { IPubSubDriver } from '@interfaces/pubsub-driver.interface';
import type { IPubSubMessage } from '@interfaces/pubsub-message.interface';
import { MessageHandler } from '@/types/message-handler.type';
import type { IKafkaOptions } from './kafka-options.interface';

/**
 * Kafka implementation of the PubSub driver interface.
 *
 * This driver provides pub/sub functionality using Apache Kafka as the
 * messaging backend. It uses the kafkajs library and maintains:
 * - A producer for publishing messages
 * - A consumer for subscribing to topics
 *
 * The driver supports:
 * - Multiple topic subscriptions with consumer groups
 * - Partition-based message distribution
 * - At-least-once delivery semantics
 * - Automatic offset management
 * - Message batching and compression
 * - SASL/SSL authentication
 *
 * Note: kafkajs must be installed as a peer dependency to use this driver.
 * Install it with: npm install kafkajs
 */
export class KafkaPubSubDriver implements IPubSubDriver {
  /**
   * Logger instance for driver operations.
   */
  private readonly logger = new Logger(KafkaPubSubDriver.name);

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
   * Multiple handlers can be registered for the same topic.
   */
  private readonly handlers = new Map<string, Set<MessageHandler>>();

  /**
   * Flag indicating whether the driver is currently connected.
   */
  private connected = false;

  /**
   * Flag indicating whether the consumer is currently running.
   */
  private consumerRunning = false;

  /**
   * Creates a new instance of the Kafka PubSub driver.
   *
   * @param options - Configuration options for the Kafka connection
   */
  constructor(private readonly options: IKafkaOptions) {}

  /**
   * Factory method to create a new Kafka PubSub driver instance.
   *
   * This method follows the factory pattern convention, providing a static
   * method for instantiation instead of using the constructor directly.
   *
   * @param options - Configuration options for the Kafka connection
   * @returns A new KafkaPubSubDriver instance
   *
   * @example
   * ```typescript
   * const driver = KafkaPubSubDriver.make({
   *   clientId: 'my-app',
   *   brokers: ['localhost:9092']
   * });
   * ```
   */
  static make(options: IKafkaOptions): KafkaPubSubDriver {
    return new KafkaPubSubDriver(options);
  }

  /**
   * Establishes connection to the Kafka cluster.
   *
   * This method initializes the Kafka client, producer, and consumer instances.
   * The producer is connected immediately, while the consumer is connected
   * only when the first subscription is made.
   *
   * The method is idempotent and will not create duplicate connections
   * if called multiple times.
   *
   * @throws {Error} If kafkajs is not installed or connection fails
   */
  async connect(): Promise<void> {
    if (this.connected) {
      this.logger.warn('Already connected to Kafka');
      return;
    }

    try {
      // Dynamically import kafkajs (peer dependency)
      const { Kafka, Partitioners } = await this.loadKafkaJS();

      // Create Kafka client
      this.kafka = new Kafka({
        clientId: this.options.clientId,
        brokers: this.options.brokers,
        ssl: this.options.ssl,
        sasl: this.options.sasl,
        connectionTimeout: this.options.connectionTimeout || 10000,
        requestTimeout: this.options.requestTimeout || 30000,
        retry: this.options.retry,
        logLevel: this.mapLogLevel(this.options.logLevel),
      });

      // Create and connect producer
      // Explicitly use DefaultPartitioner (Java-compatible, new default in v2.0.0)
      // This silences the migration warning and ensures Java client compatibility
      const producerOptions = {
        createPartitioner: Partitioners.DefaultPartitioner,
        ...this.options.producer,
      };
      this.producer = this.kafka.producer(producerOptions);
      await this.producer.connect();

      // Create consumer (will connect on first subscription)
      this.consumer = this.kafka.consumer({
        groupId: this.options.groupId || 'pubsub-consumer-group',
        ...this.options.consumer,
      });

      this.connected = true;
      this.logger.log('Successfully connected to Kafka');
    } catch (error: Error | any) {
      this.logger.error('Failed to connect to Kafka:', error);
      throw error;
    }
  }

  /**
   * Closes connections to the Kafka cluster and cleans up resources.
   *
   * This method:
   * - Stops the consumer
   * - Disconnects producer and consumer
   * - Clears all registered handlers
   *
   * The method is idempotent and safe to call multiple times.
   */
  async disconnect(): Promise<void> {
    if (!this.connected) {
      return;
    }

    try {
      // Stop consumer if running
      if (this.consumerRunning) {
        await this.consumer.stop();
        this.consumerRunning = false;
      }

      // Disconnect producer and consumer
      await Promise.all([this.producer?.disconnect(), this.consumer?.disconnect()]);

      // Clear handlers
      this.handlers.clear();

      this.connected = false;
      this.logger.log('Disconnected from Kafka');
    } catch (error: Error | any) {
      this.logger.error('Error during Kafka disconnection:', error);
      throw error;
    }
  }

  /**
   * Publishes a message to a Kafka topic.
   *
   * The message data is serialized to JSON and sent to the specified topic.
   * Kafka will distribute the message to one of the topic's partitions based
   * on the partition key (if provided) or using round-robin distribution.
   *
   * @template TData - The type of the message data payload
   *
   * @param topic - The topic name to publish to
   * @param data - The message payload to publish
   * @param options - Optional publishing options (partition, key, headers)
   *
   * @throws {Error} If not connected or publishing fails
   */
  async publish<TData = any>(
    topic: string,
    data: TData,
    options?: Record<string, any>,
  ): Promise<void> {
    if (!this.connected) {
      throw new Error('Not connected to Kafka');
    }

    try {
      // Build message structure
      const message: IPubSubMessage<TData> = {
        id: this.generateMessageId(),
        topic,
        data,
        timestamp: new Date(),
        metadata: options?.metadata,
        attributes: options?.attributes,
      };

      // Serialize message
      const value = JSON.stringify(message);

      // Prepare Kafka message
      const kafkaMessage: any = {
        value,
      };

      // Add partition key if provided
      if (options?.key) {
        kafkaMessage.key = options.key;
      }

      // Add headers if provided
      if (options?.headers) {
        kafkaMessage.headers = options.headers;
      }

      // Send message
      await this.producer.send({
        topic,
        messages: [kafkaMessage],
        acks: this.options.producer?.acks ?? -1,
        timeout: this.options.producer?.timeout,
        compression: this.options.producer?.compression,
      });

      this.logger.debug(`Published message to topic: ${topic}`);
    } catch (error: Error | any) {
      this.logger.error(`Failed to publish to ${topic}:`, error);
      throw error;
    }
  }

  /**
   * Subscribes to a Kafka topic and registers a message handler.
   *
   * When messages are published to the specified topic, the handler
   * function will be invoked with the deserialized message.
   *
   * The consumer will automatically join the consumer group and start
   * receiving messages. Multiple handlers can be registered for the same
   * topic, and each will receive all messages assigned to this consumer.
   *
   * @template TData - The expected type of message data for this subscription
   *
   * @param topic - The topic name to subscribe to
   * @param handler - The callback function to invoke for each message
   * @param options - Optional subscription options (fromBeginning, etc.)
   *
   * @throws {Error} If not connected or subscription fails
   */
  async subscribe<TData = any>(
    topic: string,
    handler: MessageHandler<TData>,
    options?: Record<string, any>,
  ): Promise<void> {
    if (!this.connected) {
      throw new Error('Not connected to Kafka');
    }

    try {
      // Register handler
      if (!this.handlers.has(topic)) {
        this.handlers.set(topic, new Set());
      }
      this.handlers.get(topic)!.add(handler);

      // Connect consumer if not already connected
      if (!this.consumerRunning) {
        await this.consumer.connect();
      }

      // Subscribe to topic if this is the first handler
      if (this.handlers.get(topic)!.size === 1) {
        await this.consumer.subscribe({
          topic,
          fromBeginning: options?.fromBeginning ?? this.options.consumer?.fromBeginning ?? false,
        });

        this.logger.log(`Subscribed to topic: ${topic}`);
      }

      // Start consumer if not already running
      if (!this.consumerRunning) {
        await this.startConsumer();
      }
    } catch (error: Error | any) {
      this.logger.error(`Failed to subscribe to ${topic}:`, error);
      throw error;
    }
  }

  /**
   * Unsubscribes from a Kafka topic and removes all handlers.
   *
   * Note: Kafka doesn't support unsubscribing from individual topics while
   * maintaining other subscriptions. This method removes the handlers but
   * keeps the consumer subscription active. To fully unsubscribe, you need
   * to disconnect and reconnect the consumer.
   *
   * @param topic - The topic name to unsubscribe from
   * @param options - Optional unsubscription options
   */
  async unsubscribe(topic: string, options?: Record<string, any>): Promise<void> {
    if (!this.connected) {
      return;
    }

    try {
      // Remove handlers
      this.handlers.delete(topic);

      this.logger.log(`Unsubscribed from topic: ${topic}`);

      // Note: Kafka consumer doesn't support unsubscribing from individual topics
      // The subscription remains active but messages will be ignored
    } catch (error: Error | any) {
      this.logger.error(`Failed to unsubscribe from ${topic}:`, error);
      throw error;
    }
  }

  /**
   * Checks if the driver is currently connected to Kafka.
   *
   * @returns true if connected, false otherwise
   */
  isConnected(): boolean {
    return this.connected;
  }

  /**
   * Retrieves the list of topics currently subscribed to.
   *
   * @returns An array of subscribed topic names
   */
  getSubscribedTopics(): string[] {
    return Array.from(this.handlers.keys());
  }

  /**
   * Starts the Kafka consumer to process messages.
   *
   * This method sets up the message processing loop that receives messages
   * from Kafka and dispatches them to registered handlers.
   */
  private async startConsumer(): Promise<void> {
    await this.consumer.run({
      autoCommit: this.options.consumer?.autoCommit ?? true,
      autoCommitInterval: this.options.consumer?.autoCommitInterval,
      eachMessage: async ({ topic, partition, message }: any) => {
        await this.handleMessage(topic, message);
      },
    });

    this.consumerRunning = true;
    this.logger.log('Kafka consumer started');
  }

  /**
   * Handles incoming messages from Kafka topics.
   *
   * This method deserializes the message and invokes all registered handlers
   * for the topic. Errors in individual handlers are caught and logged but
   * do not prevent other handlers from executing.
   *
   * @param topic - The topic name
   * @param kafkaMessage - The Kafka message object
   */
  private async handleMessage(topic: string, kafkaMessage: any): Promise<void> {
    try {
      // Deserialize message
      const messageData = kafkaMessage.value.toString();
      const message: IPubSubMessage = JSON.parse(messageData);

      // Get handlers for this topic
      const topicHandlers = this.handlers.get(topic);
      if (!topicHandlers || topicHandlers.size === 0) {
        return;
      }

      // Invoke all handlers
      const promises = Array.from(topicHandlers).map(async (handler) => {
        try {
          await handler(message);
        } catch (error: Error | any) {
          this.logger.error(`Error in handler for topic ${topic}:`, error);
        }
      });

      await Promise.all(promises);
    } catch (error: Error | any) {
      this.logger.error('Failed to handle message:', error);
    }
  }

  /**
   * Dynamically loads the kafkajs library.
   *
   * @returns The kafkajs module
   * @throws {Error} If kafkajs is not installed
   */
  private async loadKafkaJS(): Promise<any> {
    try {
      return await import('kafkajs');
    } catch (error: Error | any) {
      throw new Error('kafkajs is not installed. Please install it with: npm install kafkajs');
    }
  }

  /**
   * Maps string log level to kafkajs log level enum.
   *
   * @param level - The log level string
   * @returns The kafkajs log level value
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
   * Generates a unique message ID.
   *
   * @returns A unique message identifier
   */
  private generateMessageId(): string {
    return `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
  }
}
