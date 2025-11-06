/**
 * Configuration options for the Google Cloud Pub/Sub driver.
 *
 * This interface defines the connection and behavior options for the Google
 * Cloud Pub/Sub driver implementation. It closely mirrors the @google-cloud/pubsub
 * configuration options while providing sensible defaults for pub/sub use cases.
 *
 * The Google Pub/Sub driver uses:
 * - The PubSub client for managing topics and subscriptions
 * - Topic publishers for publishing messages
 * - Subscription listeners for receiving messages
 */
export interface IGooglePubSubOptions {
  /**
   * Google Cloud project ID.
   * This is required to identify which GCP project contains your Pub/Sub resources.
   *
   * @example 'my-gcp-project'
   */
  projectId: string;

  /**
   * Path to the service account key JSON file.
   * This file contains the credentials needed to authenticate with Google Cloud.
   *
   * If not provided, the driver will use Application Default Credentials (ADC),
   * which automatically discovers credentials from the environment.
   *
   * @example '/path/to/service-account-key.json'
   */
  keyFilename?: string;

  /**
   * Service account credentials as a JSON object.
   * Alternative to keyFilename, allows passing credentials directly.
   *
   * @example
   * ```typescript
   * {
   *   client_email: 'service-account@project.iam.gserviceaccount.com',
   *   private_key: '-----BEGIN PRIVATE KEY-----\n...\n-----END PRIVATE KEY-----\n'
   * }
   * ```
   */
  credentials?: {
    client_email: string;
    private_key: string;
  };

  /**
   * API endpoint override.
   * Useful for testing with the Pub/Sub emulator or custom endpoints.
   *
   * @example 'localhost:8085' (for emulator)
   * @default 'pubsub.googleapis.com'
   */
  apiEndpoint?: string;

  /**
   * Whether to automatically create topics if they don't exist.
   * When true, publishing to a non-existent topic will create it automatically.
   *
   * @default true
   */
  autoCreateTopics?: boolean;

  /**
   * Whether to automatically create subscriptions if they don't exist.
   * When true, subscribing to a non-existent subscription will create it automatically.
   *
   * @default true
   */
  autoCreateSubscriptions?: boolean;

  /**
   * Default subscription name prefix.
   * Used when creating subscriptions automatically. The actual subscription name
   * will be: `${prefix}${topic-name}`.
   *
   * @default 'sub-'
   */
  subscriptionPrefix?: string;

  /**
   * Publisher-specific configuration.
   */
  publisher?: {
    /**
     * Maximum number of messages to batch before sending.
     *
     * @default 100
     */
    batching?: {
      /**
       * Maximum number of messages in a batch.
       *
       * @default 100
       */
      maxMessages?: number;

      /**
       * Maximum total size of messages in a batch (in bytes).
       *
       * @default 1048576 (1MB)
       */
      maxBytes?: number;

      /**
       * Maximum time to wait before sending a batch (in milliseconds).
       *
       * @default 10
       */
      maxMilliseconds?: number;
    };

    /**
     * Message ordering configuration.
     * When enabled, messages with the same ordering key are delivered in order.
     */
    enableMessageOrdering?: boolean;

    /**
     * GZIP compression threshold in bytes.
     * Messages larger than this will be compressed.
     *
     * @default -1 (disabled)
     */
    gaxOpts?: {
      timeout?: number;
    };
  };

  /**
   * Subscriber-specific configuration.
   */
  subscriber?: {
    /**
     * Acknowledgment deadline in seconds.
     * The maximum time after receiving a message before it must be acknowledged.
     * If not acknowledged within this time, the message will be redelivered.
     *
     * @default 10
     */
    ackDeadline?: number;

    /**
     * Flow control configuration for managing message delivery rate.
     */
    flowControl?: {
      /**
       * Maximum number of messages to have in memory at once.
       *
       * @default 1000
       */
      maxMessages?: number;

      /**
       * Maximum total size of messages in memory (in bytes).
       *
       * @default 104857600 (100MB)
       */
      maxBytes?: number;

      /**
       * Whether to allow more messages than maxMessages when needed.
       *
       * @default false
       */
      allowExcessMessages?: boolean;
    };

    /**
     * Maximum number of concurrent message handlers.
     * Controls how many messages can be processed in parallel.
     *
     * @default 10
     */
    maxConcurrency?: number;

    /**
     * Streaming pull configuration.
     */
    streamingOptions?: {
      /**
       * Maximum time to keep a streaming pull connection open (in milliseconds).
       *
       * @default 300000 (5 minutes)
       */
      maxStreamDuration?: number;

      /**
       * Timeout for streaming pull requests (in milliseconds).
       *
       * @default 300000 (5 minutes)
       */
      timeout?: number;
    };
  };

  /**
   * Retry configuration for failed operations.
   */
  retry?: {
    /**
     * Initial retry delay in milliseconds.
     *
     * @default 100
     */
    initialRetryDelayMillis?: number;

    /**
     * Retry delay multiplier for exponential backoff.
     *
     * @default 1.3
     */
    retryDelayMultiplier?: number;

    /**
     * Maximum retry delay in milliseconds.
     *
     * @default 60000
     */
    maxRetryDelayMillis?: number;

    /**
     * Total timeout for all retry attempts (in milliseconds).
     *
     * @default 600000 (10 minutes)
     */
    totalTimeoutMillis?: number;
  };

  /**
   * Dead letter policy configuration.
   * Messages that fail processing can be sent to a dead letter topic.
   */
  deadLetterPolicy?: {
    /**
     * Name of the dead letter topic.
     * Failed messages will be published to this topic.
     *
     * @example 'dead-letter-topic'
     */
    deadLetterTopic?: string;

    /**
     * Maximum number of delivery attempts before sending to dead letter topic.
     *
     * @default 5
     */
    maxDeliveryAttempts?: number;
  };

  /**
   * Message retention duration for subscriptions (in seconds).
   * How long to retain unacknowledged messages.
   *
   * @default 604800 (7 days)
   */
  messageRetentionDuration?: number;

  /**
   * Whether to enable exactly-once delivery.
   * When enabled, duplicate messages are automatically filtered out.
   *
   * @default false
   */
  enableExactlyOnceDelivery?: boolean;
}

/**
 * Namespace for IGooglePubSubOptions interface containing the symbol for dependency injection.
 */
export namespace IGooglePubSubOptions {
  /**
   * Unique symbol identifier for the IGooglePubSubOptions interface.
   * Used for dependency injection and type identification in the NestJS container.
   */
  export const $ = Symbol('IGooglePubSubOptions');
}
