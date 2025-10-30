import { Logger } from '@nestjs/common';
import type { IPubSubDriver } from '@interfaces/pubsub-driver.interface';
import type { IPubSubMessage } from '@interfaces/pubsub-message.interface';
import { MessageHandler } from '@/types/message-handler.type';
import type { IGooglePubSubOptions } from './google-pubsub-options.interface';

/**
 * Google Cloud Pub/Sub implementation of the PubSub driver interface.
 *
 * This driver provides pub/sub functionality using Google Cloud Pub/Sub as
 * the messaging backend. It uses the @google-cloud/pubsub library and provides:
 * - Topic and subscription management
 * - Message publishing with batching
 * - Message acknowledgment and flow control
 * - Dead letter queue support
 * - Exactly-once delivery (when enabled)
 *
 * The driver automatically creates topics and subscriptions if they don't exist
 * (when autoCreateTopics and autoCreateSubscriptions are enabled).
 *
 * Note: @google-cloud/pubsub must be installed as a peer dependency to use this driver.
 * Install it with: npm install @google-cloud/pubsub
 */
export class GooglePubSubDriver implements IPubSubDriver {
  /**
   * Logger instance for driver operations.
   */
  private readonly logger = new Logger(GooglePubSubDriver.name);

  /**
   * Google Cloud Pub/Sub client instance.
   */
  private pubSubClient: any;

  /**
   * Map of topic names to their Topic instances.
   */
  private readonly topics = new Map<string, any>();

  /**
   * Map of topic names to their Subscription instances.
   */
  private readonly subscriptions = new Map<string, any>();

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
   * Creates a new instance of the Google Pub/Sub driver.
   *
   * @param options - Configuration options for the Google Cloud Pub/Sub connection
   */
  constructor(private readonly options: IGooglePubSubOptions) {}

  /**
   * Factory method to create a new Google Pub/Sub driver instance.
   *
   * This method follows the factory pattern convention, providing a static
   * method for instantiation instead of using the constructor directly.
   *
   * @param options - Configuration options for the Google Cloud Pub/Sub connection
   * @returns A new GooglePubSubDriver instance
   *
   * @example
   * ```typescript
   * const driver = GooglePubSubDriver.make({
   *   projectId: 'my-gcp-project',
   *   keyFilename: '/path/to/key.json'
   * });
   * ```
   */
  static make(options: IGooglePubSubOptions): GooglePubSubDriver {
    return new GooglePubSubDriver(options);
  }

  /**
   * Establishes connection to Google Cloud Pub/Sub.
   *
   * This method initializes the Pub/Sub client with the provided credentials
   * and configuration. The actual connection is established lazily when
   * topics or subscriptions are accessed.
   *
   * The method is idempotent and will not create duplicate connections
   * if called multiple times.
   *
   * @throws {Error} If @google-cloud/pubsub is not installed or initialization fails
   */
  async connect(): Promise<void> {
    if (this.connected) {
      this.logger.warn('Already connected to Google Pub/Sub');
      return;
    }

    try {
      // Dynamically import @google-cloud/pubsub (peer dependency)
      const { PubSub } = await this.loadGooglePubSub();

      // Create Pub/Sub client
      const clientConfig: any = {
        projectId: this.options.projectId,
      };

      // Add credentials if provided
      if (this.options.keyFilename) {
        clientConfig.keyFilename = this.options.keyFilename;
      } else if (this.options.credentials) {
        clientConfig.credentials = this.options.credentials;
      }

      // Add API endpoint if provided (useful for emulator)
      if (this.options.apiEndpoint) {
        clientConfig.apiEndpoint = this.options.apiEndpoint;
      }

      this.pubSubClient = new PubSub(clientConfig);

      this.connected = true;
      this.logger.log('Successfully connected to Google Pub/Sub');
    } catch (error: Error | any) {
      this.logger.error('Failed to connect to Google Pub/Sub:', error);
      throw error;
    }
  }

  /**
   * Closes connection to Google Cloud Pub/Sub and cleans up resources.
   *
   * This method:
   * - Closes all active subscriptions
   * - Flushes pending messages from publishers
   * - Clears all registered handlers
   *
   * The method is idempotent and safe to call multiple times.
   */
  async disconnect(): Promise<void> {
    if (!this.connected) {
      return;
    }

    try {
      // Close all subscriptions
      const closePromises = Array.from(this.subscriptions.values()).map((subscription) =>
        subscription.close(),
      );
      await Promise.all(closePromises);

      // Flush all topic publishers
      const flushPromises = Array.from(this.topics.values()).map((topic) => topic.flush());
      await Promise.all(flushPromises);

      // Clear maps
      this.topics.clear();
      this.subscriptions.clear();
      this.handlers.clear();

      this.connected = false;
      this.logger.log('Disconnected from Google Pub/Sub');
    } catch (error: Error | any) {
      this.logger.error('Error during Google Pub/Sub disconnection:', error);
      throw error;
    }
  }

  /**
   * Publishes a message to a Google Pub/Sub topic.
   *
   * The message data is serialized to JSON and published to the specified
   * topic. If the topic doesn't exist and autoCreateTopics is enabled,
   * it will be created automatically.
   *
   * @template TData - The type of the message data payload
   *
   * @param topic - The topic name to publish to
   * @param data - The message payload to publish
   * @param options - Optional publishing options (orderingKey, attributes)
   *
   * @throws {Error} If not connected or publishing fails
   */
  async publish<TData = any>(
    topic: string,
    data: TData,
    options?: Record<string, any>,
  ): Promise<void> {
    if (!this.connected) {
      throw new Error('Not connected to Google Pub/Sub');
    }

    try {
      // Get or create topic
      const topicInstance = await this.getOrCreateTopic(topic);

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
      const messageBuffer = Buffer.from(JSON.stringify(message));

      // Prepare publish options
      const publishOptions: any = {
        data: messageBuffer,
      };

      // Add ordering key if provided
      if (options?.orderingKey) {
        publishOptions.orderingKey = options.orderingKey;
      }

      // Add custom attributes if provided
      if (options?.attributes) {
        publishOptions.attributes = options.attributes;
      }

      // Publish message
      const messageId = await topicInstance.publishMessage(publishOptions);

      this.logger.debug(`Published message ${messageId} to topic: ${topic}`);
    } catch (error: Error | any) {
      this.logger.error(`Failed to publish to ${topic}:`, error);
      throw error;
    }
  }

  /**
   * Subscribes to a Google Pub/Sub topic and registers a message handler.
   *
   * When messages are published to the specified topic, the handler
   * function will be invoked with the deserialized message.
   *
   * If the subscription doesn't exist and autoCreateSubscriptions is enabled,
   * it will be created automatically.
   *
   * @template TData - The expected type of message data for this subscription
   *
   * @param topic - The topic name to subscribe to
   * @param handler - The callback function to invoke for each message
   * @param options - Optional subscription options (subscriptionName, etc.)
   *
   * @throws {Error} If not connected or subscription fails
   */
  async subscribe<TData = any>(
    topic: string,
    handler: MessageHandler<TData>,
    options?: Record<string, any>,
  ): Promise<void> {
    if (!this.connected) {
      throw new Error('Not connected to Google Pub/Sub');
    }

    try {
      // Register handler
      if (!this.handlers.has(topic)) {
        this.handlers.set(topic, new Set());
      }
      this.handlers.get(topic)!.add(handler);

      // Get or create subscription
      const subscriptionName =
        options?.subscriptionName || `${this.options.subscriptionPrefix || 'sub-'}${topic}`;

      const subscription = await this.getOrCreateSubscription(topic, subscriptionName);

      // Set up message handler if this is the first handler for this topic
      if (this.handlers.get(topic)!.size === 1) {
        subscription.on('message', async (message: any) => {
          await this.handleMessage(topic, message);
        });

        subscription.on('error', (error: Error) => {
          this.logger.error(`Subscription error for ${topic}:`, error);
        });

        this.logger.log(`Subscribed to topic: ${topic}`);
      }
    } catch (error: Error | any) {
      this.logger.error(`Failed to subscribe to ${topic}:`, error);
      throw error;
    }
  }

  /**
   * Unsubscribes from a Google Pub/Sub topic and removes all handlers.
   *
   * This method removes all registered handlers for the specified topic
   * and closes the subscription.
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

      // Close subscription
      const subscription = this.subscriptions.get(topic);
      if (subscription) {
        await subscription.close();
        this.subscriptions.delete(topic);
      }

      this.logger.log(`Unsubscribed from topic: ${topic}`);
    } catch (error: Error | any) {
      this.logger.error(`Failed to unsubscribe from ${topic}:`, error);
      throw error;
    }
  }

  /**
   * Checks if the driver is currently connected to Google Pub/Sub.
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
   * Gets an existing topic or creates it if it doesn't exist.
   *
   * @param topicName - The name of the topic
   * @returns The Topic instance
   */
  private async getOrCreateTopic(topicName: string): Promise<any> {
    // Return cached topic if available
    if (this.topics.has(topicName)) {
      return this.topics.get(topicName);
    }

    // Get topic reference
    const topic = this.pubSubClient.topic(topicName);

    // Configure publisher options
    if (this.options.publisher) {
      if (this.options.publisher.batching) {
        topic.setPublishOptions({
          batching: this.options.publisher.batching,
        });
      }
      if (this.options.publisher.enableMessageOrdering) {
        topic.setPublishOptions({
          enableMessageOrdering: true,
        });
      }
    }

    // Create topic if it doesn't exist and auto-create is enabled
    if (this.options.autoCreateTopics !== false) {
      const [exists] = await topic.exists();
      if (!exists) {
        await topic.create();
        this.logger.log(`Created topic: ${topicName}`);
      }
    }

    // Cache and return topic
    this.topics.set(topicName, topic);
    return topic;
  }

  /**
   * Gets an existing subscription or creates it if it doesn't exist.
   *
   * @param topicName - The name of the topic
   * @param subscriptionName - The name of the subscription
   * @returns The Subscription instance
   */
  private async getOrCreateSubscription(topicName: string, subscriptionName: string): Promise<any> {
    // Return cached subscription if available
    if (this.subscriptions.has(topicName)) {
      return this.subscriptions.get(topicName);
    }

    // Ensure topic exists
    await this.getOrCreateTopic(topicName);

    // Get subscription reference
    const subscription = this.pubSubClient.subscription(subscriptionName);

    // Create subscription if it doesn't exist and auto-create is enabled
    if (this.options.autoCreateSubscriptions !== false) {
      const [exists] = await subscription.exists();
      if (!exists) {
        const subscriptionConfig: any = {
          topic: topicName,
        };

        // Add subscriber options
        if (this.options.subscriber) {
          if (this.options.subscriber.ackDeadline) {
            subscriptionConfig.ackDeadlineSeconds = this.options.subscriber.ackDeadline;
          }
          if (this.options.subscriber.flowControl) {
            subscriptionConfig.flowControl = this.options.subscriber.flowControl;
          }
        }

        // Add dead letter policy
        if (this.options.deadLetterPolicy) {
          subscriptionConfig.deadLetterPolicy = this.options.deadLetterPolicy;
        }

        // Add message retention
        if (this.options.messageRetentionDuration) {
          subscriptionConfig.messageRetentionDuration = {
            seconds: this.options.messageRetentionDuration,
          };
        }

        // Add exactly-once delivery
        if (this.options.enableExactlyOnceDelivery) {
          subscriptionConfig.enableExactlyOnceDelivery = true;
        }

        await this.pubSubClient.createSubscription(topicName, subscriptionName, subscriptionConfig);
        this.logger.log(`Created subscription: ${subscriptionName}`);
      }
    }

    // Configure subscription options
    if (this.options.subscriber) {
      if (this.options.subscriber.flowControl) {
        subscription.setOptions({
          flowControl: this.options.subscriber.flowControl,
        });
      }
      if (this.options.subscriber.maxConcurrency) {
        subscription.setOptions({
          flowControl: {
            ...subscription.flowControl,
            maxMessages: this.options.subscriber.maxConcurrency,
          },
        });
      }
    }

    // Cache and return subscription
    this.subscriptions.set(topicName, subscription);
    return subscription;
  }

  /**
   * Handles incoming messages from Google Pub/Sub subscriptions.
   *
   * This method deserializes the message and invokes all registered handlers
   * for the topic. Errors in individual handlers are caught and logged but
   * do not prevent other handlers from executing.
   *
   * Messages are acknowledged after successful processing or nacked on failure.
   *
   * @param topic - The topic name
   * @param pubsubMessage - The Google Pub/Sub message object
   */
  private async handleMessage(topic: string, pubsubMessage: any): Promise<void> {
    try {
      // Deserialize message
      const messageData = pubsubMessage.data.toString();
      const message: IPubSubMessage = JSON.parse(messageData);

      // Get handlers for this topic
      const topicHandlers = this.handlers.get(topic);
      if (!topicHandlers || topicHandlers.size === 0) {
        pubsubMessage.ack();
        return;
      }

      // Invoke all handlers
      const promises = Array.from(topicHandlers).map(async (handler) => {
        try {
          await handler(message);
        } catch (error: Error | any) {
          this.logger.error(`Error in handler for topic ${topic}:`, error);
          throw error; // Re-throw to trigger nack
        }
      });

      await Promise.all(promises);

      // Acknowledge message on success
      pubsubMessage.ack();
    } catch (error: Error | any) {
      this.logger.error('Failed to handle message:', error);

      // Negative acknowledge on failure (will be redelivered)
      pubsubMessage.nack();
    }
  }

  /**
   * Dynamically loads the @google-cloud/pubsub library.
   *
   * @returns The @google-cloud/pubsub module
   * @throws {Error} If @google-cloud/pubsub is not installed
   */
  private async loadGooglePubSub(): Promise<any> {
    try {
      return await import('@google-cloud/pubsub');
    } catch (error: Error | any) {
      throw new Error(
        '@google-cloud/pubsub is not installed. Please install it with: npm install @google-cloud/pubsub',
      );
    }
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
