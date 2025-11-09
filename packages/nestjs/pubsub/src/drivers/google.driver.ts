import { BasePubSubDriver } from './base.driver';
import { MessageHandler } from '@/types/message-handler.type';
import { PubSubDriverType } from '@enums/pubsub-driver-type.enum';
import type { IPubSubMessage } from '@interfaces/pubsub-message.interface';
import { IBaseDriverOptions } from '@interfaces/base-driver-options.interface';
import type { IGooglePubSubOptions } from '@interfaces/google-pubsub-options.interface';
import { IPubSubDriver } from '@interfaces/pubsub-driver.interface';

/**
 * Google Cloud Pub/Sub implementation of the PubSub driver interface.
 *
 * This driver provides pub/sub functionality using Google Cloud Pub/Sub as the messaging backend.
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
 * Google Cloud Pub/Sub-Specific Features:
 * - Uses @google-cloud/pubsub library
 * - Topic and subscription management
 * - Message publishing with batching
 * - Message acknowledgment and flow control
 * - Native dead letter queue support (GCP feature)
 * - Exactly-once delivery (when enabled)
 * - Message ordering support
 * - Auto-creation of topics and subscriptions
 * - Publisher flow control and batching
 * - Subscriber flow control (maxMessages, maxBytes)
 * - Message retention configuration
 * - SASL/SSL authentication via GCP credentials
 *
 * @extends BasePubSubDriver
 *
 * Note: @google-cloud/pubsub must be installed as a peer dependency.
 * Install it with: npm install @google-cloud/pubsub
 */
export class GooglePubSubDriver extends BasePubSubDriver implements IPubSubDriver {
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
   * Google Cloud Pub/Sub-specific configuration options.
   */
  private readonly googleOptions: IGooglePubSubOptions;

  /**
   * Creates a new instance of the Google Cloud Pub/Sub driver.
   *
   * @param options - Configuration options for Google Cloud Pub/Sub
   * @param baseOptions - Production features configuration
   */
  constructor(options: IGooglePubSubOptions, baseOptions: IBaseDriverOptions = {}) {
    super(baseOptions);
    this.googleOptions = options;
  }

  /**
   * Establishes connection to Google Cloud Pub/Sub.
   */
  async connect(): Promise<void> {
    if (this.connected) {
      this.logger.warn('Already connected to Google Pub/Sub');
      return;
    }

    try {
      const { PubSub } = await this.loadGooglePubSub();

      const clientConfig: any = {
        projectId: this.googleOptions.projectId,
      };

      if (this.googleOptions.keyFilename) {
        clientConfig.keyFilename = this.googleOptions.keyFilename;
      } else if (this.googleOptions.credentials) {
        clientConfig.credentials = this.googleOptions.credentials;
      }

      if (this.googleOptions.apiEndpoint) {
        clientConfig.apiEndpoint = this.googleOptions.apiEndpoint;
      }

      this.pubSubClient = PubSub.make(clientConfig);

      this.connected = true;

      this.logger.log('Successfully connected to Google Pub/Sub', {
        driver: 'google',
        projectId: this.googleOptions.projectId,
      });

      this.metrics.incrementCounter('pubsub.driver.connected', { driver: 'google' });
    } catch (error: any) {
      this.logger.error('Failed to connect to Google Pub/Sub', error.stack, {
        driver: 'google',
        error: error.message,
      });

      this.metrics.incrementCounter('pubsub.driver.connect.error', {
        driver: 'google',
        errorType: error.name || 'Unknown',
      });

      throw error;
    }
  }

  /**
   * Closes connection to Google Cloud Pub/Sub and cleans up resources.
   */
  async disconnect(): Promise<void> {
    if (!this.connected) {
      return;
    }

    try {
      const closePromises = Array.from(this.subscriptions.values()).map((subscription) =>
        subscription.close(),
      );
      await Promise.all(closePromises);

      const flushPromises = Array.from(this.topics.values()).map((topic) => topic.flush());
      await Promise.all(flushPromises);

      this.topics.clear();
      this.subscriptions.clear();
      this.handlers.clear();
      this.handlerCounts.clear();

      this.connected = false;

      this.logger.log('Disconnected from Google Pub/Sub', { driver: 'google' });
      this.metrics.incrementCounter('pubsub.driver.disconnected', { driver: 'google' });
    } catch (error: any) {
      this.logger.error('Error during Google Pub/Sub disconnection', error.stack, {
        driver: 'google',
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
      throw new Error('Not connected to Google Pub/Sub');
    }

    const topicInstance = await this.getOrCreateTopic(topic);

    const messageBuffer = Buffer.from(JSON.stringify(message));

    const publishOptions: any = {
      data: messageBuffer,
    };

    if (options?.orderingKey) {
      publishOptions.orderingKey = options.orderingKey;
    }

    if (options?.attributes) {
      publishOptions.attributes = options.attributes;
    }

    const messageId = await topicInstance.publishMessage(publishOptions);

    this.logger.debug(`Published message ${messageId} to topic: ${topic}`, {
      topic,
      messageId,
      driver: 'google',
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
      throw new Error('Not connected to Google Pub/Sub');
    }

    if (!this.handlers.has(topic)) {
      this.handlers.set(topic, new Set());
    }
    this.handlers.get(topic)!.add(handler);

    const subscriptionName =
      options?.subscriptionName || `${this.googleOptions.subscriptionPrefix || 'sub-'}${topic}`;

    const subscription = await this.getOrCreateSubscription(topic, subscriptionName);

    if (this.handlers.get(topic)!.size === 1) {
      subscription.on('message', async (pubsubMessage: any) => {
        await this.handleMessage(topic, pubsubMessage);
      });

      subscription.on('error', (error: Error) => {
        this.logger.error(`Subscription error for ${topic}`, error.stack, {
          topic,
          driver: 'google',
          error: error.message,
        });
      });

      this.logger.log(`Subscribed to topic: ${topic}`, {
        topic,
        subscriptionName,
        driver: 'google',
      });
    }
  }

  /**
   * Unsubscribes from a Google Cloud Pub/Sub topic.
   */
  async unsubscribe(topic: string, options?: Record<string, any>): Promise<void> {
    if (!this.connected) {
      return;
    }

    try {
      const namespacedTopic = this.applyNamespace(topic);

      this.handlers.delete(namespacedTopic);
      this.handlerCounts.delete(namespacedTopic);

      const subscription = this.subscriptions.get(namespacedTopic);
      if (subscription) {
        await subscription.close();
        this.subscriptions.delete(namespacedTopic);
      }

      this.logger.log(`Unsubscribed from topic: ${namespacedTopic}`, {
        topic: namespacedTopic,
        originalTopic: topic,
        driver: 'google',
      });

      this.metrics.incrementCounter('pubsub.unsubscribe', {
        topic: namespacedTopic,
        driver: 'google',
      });
    } catch (error: any) {
      this.logger.error(`Failed to unsubscribe from ${topic}`, error.stack, {
        topic,
        driver: 'google',
        error: error.message,
      });

      throw error;
    }
  }

  /**
   * Checks if connected to Google Cloud Pub/Sub.
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
   * Gets an existing topic or creates it if it doesn't exist.
   */
  private async getOrCreateTopic(topicName: string): Promise<any> {
    if (this.topics.has(topicName)) {
      return this.topics.get(topicName);
    }

    const topic = this.pubSubClient.topic(topicName);

    if (this.googleOptions.publisher) {
      if (this.googleOptions.publisher.batching) {
        topic.setPublishOptions({
          batching: this.googleOptions.publisher.batching,
        });
      }
      if (this.googleOptions.publisher.enableMessageOrdering) {
        topic.setPublishOptions({
          enableMessageOrdering: true,
        });
      }
    }

    if (this.googleOptions.autoCreateTopics !== false) {
      const [exists] = await topic.exists();
      if (!exists) {
        await topic.create();
        this.logger.log(`Created topic: ${topicName}`, {
          topic: topicName,
          driver: 'google',
        });
      }
    }

    this.topics.set(topicName, topic);
    return topic;
  }

  /**
   * Gets an existing subscription or creates it if it doesn't exist.
   */
  private async getOrCreateSubscription(topicName: string, subscriptionName: string): Promise<any> {
    if (this.subscriptions.has(topicName)) {
      return this.subscriptions.get(topicName);
    }

    await this.getOrCreateTopic(topicName);

    const subscription = this.pubSubClient.subscription(subscriptionName);

    if (this.googleOptions.autoCreateSubscriptions !== false) {
      const [exists] = await subscription.exists();
      if (!exists) {
        const subscriptionConfig: any = {
          topic: topicName,
        };

        if (this.googleOptions.subscriber) {
          if (this.googleOptions.subscriber.ackDeadline) {
            subscriptionConfig.ackDeadlineSeconds = this.googleOptions.subscriber.ackDeadline;
          }
          if (this.googleOptions.subscriber.flowControl) {
            subscriptionConfig.flowControl = this.googleOptions.subscriber.flowControl;
          }
        }

        if (this.googleOptions.deadLetterPolicy) {
          subscriptionConfig.deadLetterPolicy = this.googleOptions.deadLetterPolicy;
        }

        if (this.googleOptions.messageRetentionDuration) {
          subscriptionConfig.messageRetentionDuration = {
            seconds: this.googleOptions.messageRetentionDuration,
          };
        }

        if (this.googleOptions.enableExactlyOnceDelivery) {
          subscriptionConfig.enableExactlyOnceDelivery = true;
        }

        await this.pubSubClient.createSubscription(topicName, subscriptionName, subscriptionConfig);
        this.logger.log(`Created subscription: ${subscriptionName}`, {
          subscriptionName,
          topic: topicName,
          driver: 'google',
        });
      }
    }

    if (this.googleOptions.subscriber) {
      if (this.googleOptions.subscriber.flowControl) {
        subscription.setOptions({
          flowControl: this.googleOptions.subscriber.flowControl,
        });
      }
      if (this.googleOptions.subscriber.maxConcurrency) {
        subscription.setOptions({
          flowControl: {
            ...subscription.flowControl,
            maxMessages: this.googleOptions.subscriber.maxConcurrency,
          },
        });
      }
    }

    this.subscriptions.set(topicName, subscription);
    return subscription;
  }

  /**
   * Handles incoming messages from Google Cloud Pub/Sub subscriptions.
   */
  private async handleMessage(topic: string, pubsubMessage: any): Promise<void> {
    try {
      const messageData = pubsubMessage.data.toString();
      const message: IPubSubMessage = JSON.parse(messageData);

      const topicHandlers = this.handlers.get(topic);
      if (!topicHandlers || topicHandlers.size === 0) {
        pubsubMessage.ack();
        return;
      }

      const promises = Array.from(topicHandlers).map(async (handler) => {
        await handler(message);
      });

      await Promise.all(promises);

      pubsubMessage.ack();
    } catch (error: any) {
      this.logger.error('Failed to handle message', error.stack, {
        topic,
        driver: 'google',
        error: error.message,
      });

      pubsubMessage.nack();
    }
  }

  /**
   * Dynamically loads @google-cloud/pubsub library.
   */
  private async loadGooglePubSub(): Promise<any> {
    try {
      return await import('@google-cloud/pubsub');
    } catch (error: any) {
      throw new Error(
        '@google-cloud/pubsub is not installed. Please install it with: npm install @google-cloud/pubsub',
      );
    }
  }

  /**
   * Get driver name for logging and metrics.
   *
   * @returns PubSubDriverType.GOOGLE_PUBSUB
   */
  protected getDriverName(): PubSubDriverType {
    return PubSubDriverType.GOOGLE_PUBSUB;
  }
}
