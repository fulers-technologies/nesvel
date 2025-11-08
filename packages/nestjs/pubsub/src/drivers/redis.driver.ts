import { BasePubSubDriver } from './base.driver';
import { MessageHandler } from '@/types/message-handler.type';
import { PubSubDriverType } from '@enums/pubsub-driver-type.enum';
import { IPubSubDriver } from '@interfaces/pubsub-driver.interface';
import type { IRedisOptions } from '@interfaces/redis-options.interface';
import type { IPubSubMessage } from '@interfaces/pubsub-message.interface';
import { IBaseDriverOptions } from '@interfaces/base-driver-options.interface';

/**
 * Redis implementation of the PubSub driver interface.
 *
 * This driver provides pub/sub functionality using Redis as the messaging backend.
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
 * Redis-Specific Features:
 * - Uses ioredis library
 * - Maintains two separate connections (publish/subscribe)
 * - Pattern-based subscriptions using wildcards
 * - Redis Cluster mode support
 * - Automatic reconnection and resubscription
 * - Key prefix support for multi-tenancy
 *
 * @remarks
 * This driver requires two separate Redis connections as mandated by the Redis protocol:
 * - publishClient: Used for publishing messages
 * - subscribeClient: Used for subscribing to channels (cannot be used for other commands)
 *
 * @see {@link https://github.com/luin/ioredis | ioredis}
 * @extends BasePubSubDriver
 *
 * Note: ioredis must be installed as a peer dependency to use this driver.
 * Install it with: npm install ioredis
 */
export class RedisPubSubDriver extends BasePubSubDriver implements IPubSubDriver {
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
   * Redis-specific configuration options.
   */
  private readonly redisOptions: IRedisOptions;

  /**
   * Creates a new instance of the Redis PubSub driver.
   *
   * @param options - Configuration options for the Redis connection
   * @param baseOptions - Production features configuration from base driver
   */
  constructor(options: IRedisOptions, baseOptions: IBaseDriverOptions = {}) {
    super(baseOptions);
    this.redisOptions = options;
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

      // Initialize clients
      if (this.redisOptions.cluster) {
        const { Cluster } = await import('ioredis');
        this.publishClient = new Cluster(
          this.redisOptions.cluster.nodes,
          this.redisOptions.cluster.options,
        );
        this.subscribeClient = new Cluster(
          this.redisOptions.cluster.nodes,
          this.redisOptions.cluster.options,
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
        this.logger.error('Redis publish client error', error.stack, {
          driver: 'redis',
          client: 'publish',
        });
        this.metrics.incrementCounter('pubsub.driver.error', {
          driver: 'redis',
          client: 'publish',
        });
      });

      this.subscribeClient.on('error', (error: Error) => {
        this.logger.error('Redis subscribe client error', error.stack, {
          driver: 'redis',
          client: 'subscribe',
        });
        this.metrics.incrementCounter('pubsub.driver.error', {
          driver: 'redis',
          client: 'subscribe',
        });
      });

      // Set up reconnection handlers
      this.subscribeClient.on('reconnecting', () => {
        this.logger.log('Reconnecting to Redis', { driver: 'redis' });
      });

      this.connected = true;

      this.logger.log('Successfully connected to Redis', {
        driver: 'redis',
        host: this.redisOptions.host || 'localhost',
        port: this.redisOptions.port || 6379,
        cluster: !!this.redisOptions.cluster,
        keyPrefix: this.redisOptions.keyPrefix,
      });

      // Record connection metric
      this.metrics.incrementCounter('pubsub.driver.connected', {
        driver: 'redis',
      });
    } catch (error: any) {
      this.logger.error('Failed to connect to Redis', error.stack, {
        driver: 'redis',
        error: error.message,
      });

      this.metrics.incrementCounter('pubsub.driver.connect.error', {
        driver: 'redis',
        errorType: error.name || 'Unknown',
      });

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
      this.handlerCounts.clear();

      this.connected = false;

      this.logger.log('Disconnected from Redis', { driver: 'redis' });

      // Record disconnection metric
      this.metrics.incrementCounter('pubsub.driver.disconnected', {
        driver: 'redis',
      });
    } catch (error: any) {
      this.logger.error('Error during Redis disconnection', error.stack, {
        driver: 'redis',
        error: error.message,
      });

      throw error;
    }
  }

  /**
   * Driver-specific publish implementation.
   *
   * Publishes the prepared message to Redis channel. The message has already been
   * validated, sized, and enriched with correlation IDs by the base class.
   *
   * @param topic - The topic to publish to (already namespaced)
   * @param message - The complete, validated message structure
   * @param options - Optional publishing options (unused by Redis driver)
   *
   * @throws {Error} If not connected or publishing fails
   */
  protected async publishInternal<TData = any>(
    topic: string,
    message: IPubSubMessage<TData>,
    options?: Record<string, any>,
  ): Promise<void> {
    if (!this.connected) {
      throw new Error('Not connected to Redis');
    }

    // Apply key prefix if configured
    const channel = this.applyKeyPrefix(topic);

    // Serialize and publish to Redis
    const serialized = JSON.stringify(message);
    await this.publishClient.publish(channel, serialized);
  }

  /**
   * Driver-specific subscribe implementation.
   *
   * Registers the wrapped handler with Redis. The handler has already been
   * wrapped by the base class with error handling, metrics, DLQ support, etc.
   *
   * @param topic - The topic to subscribe to (already namespaced)
   * @param handler - The wrapped message handler
   * @param options - Optional subscription options (supports 'pattern' flag)
   *
   * @throws {Error} If not connected or subscription fails
   */
  protected async subscribeInternal<TData = any>(
    topic: string,
    handler: MessageHandler<TData>,
    options?: Record<string, any>,
  ): Promise<void> {
    if (!this.connected) {
      throw new Error('Not connected to Redis');
    }

    // Register handler
    if (!this.handlers.has(topic)) {
      this.handlers.set(topic, new Set());
    }
    this.handlers.get(topic)!.add(handler);

    // Apply key prefix if configured
    const channel = this.applyKeyPrefix(topic);

    // Determine subscription type
    const usePattern = options?.pattern || this.redisOptions.usePatternSubscribe;

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
        async (_pattern: string, _channel: string, messageData: string) => {
          await this.handleMessage(topic, messageData);
        },
      );

      this.logger.log(`Subscribed to ${usePattern ? 'pattern' : 'channel'}: ${channel}`, {
        topic: channel,
        originalTopic: topic,
        pattern: usePattern,
        driver: 'redis',
      });
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
      const namespacedTopic = this.applyNamespace(topic);

      // Remove handlers
      this.handlers.delete(namespacedTopic);
      this.handlerCounts.delete(namespacedTopic);

      // Apply key prefix if configured
      const channel = this.applyKeyPrefix(namespacedTopic);

      // Unsubscribe from channel
      const usePattern = options?.pattern || this.redisOptions.usePatternSubscribe;
      if (usePattern) {
        await this.subscribeClient.punsubscribe(channel);
      } else {
        await this.subscribeClient.unsubscribe(channel);
      }

      this.logger.log(`Unsubscribed from channel: ${channel}`, {
        topic: channel,
        originalTopic: topic,
        driver: 'redis',
      });

      // Record unsubscription metric
      this.metrics.incrementCounter('pubsub.unsubscribe', {
        topic: channel,
        driver: 'redis',
      });
    } catch (error: any) {
      this.logger.error(`Failed to unsubscribe from ${topic}`, error.stack, {
        topic,
        driver: 'redis',
        error: error.message,
      });

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
   * for the topic. Handlers are already wrapped by base class with error handling.
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

      // Invoke all handlers (already wrapped with error handling by base class)
      const promises = Array.from(topicHandlers).map(async (handler) => {
        await handler(message);
      });

      await Promise.all(promises);
    } catch (error: any) {
      this.logger.error('Failed to handle message', error.stack, {
        topic,
        driver: 'redis',
        error: error.message,
      });
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
    } catch (error: any) {
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
      host: this.redisOptions.host || 'localhost',
      port: this.redisOptions.port || 6379,
      password: this.redisOptions.password,
      username: this.redisOptions.username,
      db: this.redisOptions.db || 0,
      connectTimeout: this.redisOptions.connectTimeout || 10000,
      autoResubscribe: this.redisOptions.autoResubscribe ?? true,
      autoResendUnfulfilledCommands: this.redisOptions.autoResendUnfulfilledCommands ?? true,
      maxRetriesPerRequest: this.redisOptions.maxRetriesPerRequest ?? null,
      enableOfflineQueue: this.redisOptions.enableOfflineQueue ?? true,
      tls: this.redisOptions.tls,
      keyPrefix: this.redisOptions.keyPrefix,
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
    if (this.redisOptions.keyPrefix) {
      return `${this.redisOptions.keyPrefix}${topic}`;
    }
    return topic;
  }

  /**
   * Get the driver name for logging and metrics.
   * Overrides base class to provide specific driver name.
   *
   * @returns PubSubDriverType.REDIS
   */
  protected getDriverName(): PubSubDriverType {
    return PubSubDriverType.REDIS;
  }
}
