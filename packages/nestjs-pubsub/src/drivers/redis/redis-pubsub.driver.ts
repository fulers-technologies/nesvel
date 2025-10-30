import { Logger } from '@nestjs/common';
import type { IPubSubDriver } from '@interfaces/pubsub-driver.interface';
import type { IPubSubMessage } from '@interfaces/pubsub-message.interface';
import { MessageHandler } from '@/types/message-handler.type';
import type { IRedisOptions } from './redis-options.interface';

/**
 * Redis implementation of the PubSub driver interface.
 *
 * This driver provides pub/sub functionality using Redis as the messaging backend.
 * It uses the ioredis library and maintains two separate Redis connections:
 * one for publishing messages and one for subscribing to channels, as required
 * by the Redis protocol.
 *
 * The driver supports:
 * - Standard Redis Pub/Sub operations
 * - Pattern-based subscriptions using wildcards
 * - Redis Cluster mode
 * - Automatic reconnection and resubscription
 * - Message serialization and deserialization
 *
 * Note: ioredis must be installed as a peer dependency to use this driver.
 * Install it with: npm install ioredis
 */
export class RedisPubSubDriver implements IPubSubDriver {
  /**
   * Logger instance for driver operations.
   */
  private readonly logger = new Logger(RedisPubSubDriver.name);

  /**
   * Redis client for publishing messages.
   * A separate client is used for publishing to avoid blocking subscribe operations.
   */
  private publishClient: any;

  /**
   * Redis client for subscribing to channels.
   * A separate client is required by Redis protocol when using pub/sub.
   */
  private subscribeClient: any;

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
   * Creates a new instance of the Redis PubSub driver.
   *
   * @param options - Configuration options for the Redis connection
   */
  constructor(private readonly options: IRedisOptions) {}

  /**
   * Factory method to create a new Redis PubSub driver instance.
   *
   * This method follows the factory pattern convention, providing a static
   * method for instantiation instead of using the constructor directly.
   *
   * @param options - Configuration options for the Redis connection
   * @returns A new RedisPubSubDriver instance
   *
   * @example
   * ```typescript
   * const driver = RedisPubSubDriver.make({
   *   host: 'localhost',
   *   port: 6379
   * });
   * ```
   */
  static make(options: IRedisOptions): RedisPubSubDriver {
    return new RedisPubSubDriver(options);
  }

  /**
   * Establishes connections to the Redis server.
   *
   * This method creates two separate Redis client instances:
   * - publishClient: Used for publishing messages
   * - subscribeClient: Used for subscribing to channels
   *
   * The method is idempotent and will not create duplicate connections
   * if called multiple times.
   *
   * @throws {Error} If ioredis is not installed or connection fails
   */
  async connect(): Promise<void> {
    if (this.connected) {
      this.logger.warn('Already connected to Redis');
      return;
    }

    try {
      // Dynamically import ioredis (peer dependency)
      const Redis = await this.loadRedis();

      // Create connection configuration
      const config = this.buildRedisConfig();

      // Initialize publish client
      if (this.options.cluster) {
        const { Cluster } = await import('ioredis');
        this.publishClient = new Cluster(this.options.cluster.nodes, this.options.cluster.options);
        this.subscribeClient = new Cluster(
          this.options.cluster.nodes,
          this.options.cluster.options,
        );
      } else {
        this.publishClient = new Redis(config);
        this.subscribeClient = new Redis(config);
      }

      // Wait for both clients to be ready
      await Promise.all([
        this.waitForReady(this.publishClient),
        this.waitForReady(this.subscribeClient),
      ]);

      // Set up error handlers
      this.publishClient.on('error', (error: Error) => {
        this.logger.error('Redis publish client error:', error);
      });

      this.subscribeClient.on('error', (error: Error) => {
        this.logger.error('Redis subscribe client error:', error);
      });

      // Set up reconnection handlers
      this.subscribeClient.on('reconnecting', () => {
        this.logger.log('Reconnecting to Redis...');
      });

      this.connected = true;
      this.logger.log('Successfully connected to Redis');
    } catch (error: Error | any) {
      this.logger.error('Failed to connect to Redis:', error);
      throw error;
    }
  }

  /**
   * Closes connections to the Redis server and cleans up resources.
   *
   * This method:
   * - Unsubscribes from all active subscriptions
   * - Closes both Redis client connections
   * - Clears all registered handlers
   *
   * The method is idempotent and safe to call multiple times.
   */
  async disconnect(): Promise<void> {
    if (!this.connected) {
      return;
    }

    try {
      // Unsubscribe from all channels
      if (this.subscribeClient) {
        await this.subscribeClient.unsubscribe();
        await this.subscribeClient.punsubscribe();
      }

      // Close both clients
      await Promise.all([this.publishClient?.quit(), this.subscribeClient?.quit()]);

      // Clear handlers
      this.handlers.clear();

      this.connected = false;
      this.logger.log('Disconnected from Redis');
    } catch (error: Error | any) {
      this.logger.error('Error during Redis disconnection:', error);
      throw error;
    }
  }

  /**
   * Publishes a message to a Redis channel.
   *
   * The message data is serialized to JSON and published to the specified
   * channel. All subscribers to that channel will receive the message.
   *
   * @template TData - The type of the message data payload
   *
   * @param topic - The channel name to publish to
   * @param data - The message payload to publish
   * @param options - Optional publishing options (currently unused for Redis)
   *
   * @throws {Error} If not connected or publishing fails
   */
  async publish<TData = any>(
    topic: string,
    data: TData,
    options?: Record<string, any>,
  ): Promise<void> {
    if (!this.connected) {
      throw new Error('Not connected to Redis');
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

      // Apply key prefix if configured
      const channel = this.applyKeyPrefix(topic);

      // Serialize and publish
      const serialized = JSON.stringify(message);
      await this.publishClient.publish(channel, serialized);

      this.logger.debug(`Published message to channel: ${channel}`);
    } catch (error: Error | any) {
      this.logger.error(`Failed to publish to ${topic}:`, error);
      throw error;
    }
  }

  /**
   * Subscribes to a Redis channel and registers a message handler.
   *
   * When messages are published to the specified channel, the handler
   * function will be invoked with the deserialized message.
   *
   * Multiple handlers can be registered for the same channel, and each
   * will receive all messages published to that channel.
   *
   * @template TData - The expected type of message data for this subscription
   *
   * @param topic - The channel name to subscribe to
   * @param handler - The callback function to invoke for each message
   * @param options - Optional subscription options (supports 'pattern' flag)
   *
   * @throws {Error} If not connected or subscription fails
   */
  async subscribe<TData = any>(
    topic: string,
    handler: MessageHandler<TData>,
    options?: Record<string, any>,
  ): Promise<void> {
    if (!this.connected) {
      throw new Error('Not connected to Redis');
    }

    try {
      // Register handler
      if (!this.handlers.has(topic)) {
        this.handlers.set(topic, new Set());
      }
      this.handlers.get(topic)!.add(handler);

      // Apply key prefix if configured
      const channel = this.applyKeyPrefix(topic);

      // Determine subscription type
      const usePattern = options?.pattern || this.options.usePatternSubscribe;

      // Subscribe to channel if this is the first handler
      if (this.handlers.get(topic)!.size === 1) {
        if (usePattern) {
          await this.subscribeClient.psubscribe(channel);
        } else {
          await this.subscribeClient.subscribe(channel);
        }

        // Set up message handler for this channel
        const eventName = usePattern ? 'pmessage' : 'message';
        this.subscribeClient.on(
          eventName,
          async (pattern: string, channel: string, message: string) => {
            await this.handleMessage(topic, message);
          },
        );

        this.logger.log(`Subscribed to ${usePattern ? 'pattern' : 'channel'}: ${channel}`);
      }
    } catch (error: Error | any) {
      this.logger.error(`Failed to subscribe to ${topic}:`, error);
      throw error;
    }
  }

  /**
   * Unsubscribes from a Redis channel and removes all handlers.
   *
   * This method removes all registered handlers for the specified channel
   * and unsubscribes from the Redis channel if no handlers remain.
   *
   * @param topic - The channel name to unsubscribe from
   * @param options - Optional unsubscription options
   */
  async unsubscribe(topic: string, options?: Record<string, any>): Promise<void> {
    if (!this.connected) {
      return;
    }

    try {
      // Remove handlers
      this.handlers.delete(topic);

      // Apply key prefix if configured
      const channel = this.applyKeyPrefix(topic);

      // Unsubscribe from channel
      const usePattern = options?.pattern || this.options.usePatternSubscribe;
      if (usePattern) {
        await this.subscribeClient.punsubscribe(channel);
      } else {
        await this.subscribeClient.unsubscribe(channel);
      }

      this.logger.log(`Unsubscribed from channel: ${channel}`);
    } catch (error: Error | any) {
      this.logger.error(`Failed to unsubscribe from ${topic}:`, error);
      throw error;
    }
  }

  /**
   * Checks if the driver is currently connected to Redis.
   *
   * @returns true if connected, false otherwise
   */
  isConnected(): boolean {
    return this.connected;
  }

  /**
   * Retrieves the list of channels currently subscribed to.
   *
   * @returns An array of subscribed channel names
   */
  getSubscribedTopics(): string[] {
    return Array.from(this.handlers.keys());
  }

  /**
   * Handles incoming messages from Redis channels.
   *
   * This method deserializes the message and invokes all registered handlers
   * for the topic. Errors in individual handlers are caught and logged but
   * do not prevent other handlers from executing.
   *
   * @param topic - The topic name (without key prefix)
   * @param messageData - The serialized message data
   */
  private async handleMessage(topic: string, messageData: string): Promise<void> {
    try {
      // Deserialize message
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
   * Dynamically loads the ioredis library.
   *
   * @returns The Redis class from ioredis
   * @throws {Error} If ioredis is not installed
   */
  private async loadRedis(): Promise<any> {
    try {
      const ioredis = await import('ioredis');
      return ioredis.default || ioredis;
    } catch (error: Error | any) {
      throw new Error('ioredis is not installed. Please install it with: npm install ioredis');
    }
  }

  /**
   * Builds the Redis connection configuration from options.
   *
   * @returns Redis connection configuration object
   */
  private buildRedisConfig(): any {
    return {
      host: this.options.host || 'localhost',
      port: this.options.port || 6379,
      password: this.options.password,
      username: this.options.username,
      db: this.options.db || 0,
      connectTimeout: this.options.connectTimeout || 10000,
      autoResubscribe: this.options.autoResubscribe ?? true,
      autoResendUnfulfilledCommands: this.options.autoResendUnfulfilledCommands ?? true,
      maxRetriesPerRequest: this.options.maxRetriesPerRequest ?? null,
      enableOfflineQueue: this.options.enableOfflineQueue ?? true,
      tls: this.options.tls,
      keyPrefix: this.options.keyPrefix,
    };
  }

  /**
   * Waits for a Redis client to be ready.
   *
   * @param client - The Redis client instance
   * @returns A Promise that resolves when the client is ready
   */
  private waitForReady(client: any): Promise<void> {
    return new Promise((resolve, reject) => {
      if (client.status === 'ready') {
        resolve();
        return;
      }

      client.once('ready', () => resolve());
      client.once('error', (error: Error) => reject(error));
    });
  }

  /**
   * Applies the configured key prefix to a topic name.
   *
   * @param topic - The topic name
   * @returns The topic name with prefix applied
   */
  private applyKeyPrefix(topic: string): string {
    if (this.options.keyPrefix) {
      return `${this.options.keyPrefix}${topic}`;
    }
    return topic;
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
