import { KafkaSaslMechanism, KafkaCompression, KafkaLogLevel } from '../../enums';

/**
 * Configuration options for the Kafka PubSub driver.
 *
 * This interface defines the connection and behavior options for the Kafka
 * driver implementation. It closely mirrors the kafkajs configuration options
 * while providing sensible defaults for pub/sub use cases.
 *
 * The Kafka driver uses:
 * - A producer for publishing messages
 * - One or more consumers for subscribing to topics
 */
export interface IKafkaOptions {
  /**
   * Unique identifier for this Kafka client.
   * Used for logging and metrics identification.
   *
   * @example 'my-app-pubsub'
   */
  clientId: string;

  /**
   * Array of Kafka broker addresses.
   *
   * @example ['localhost:9092', 'broker2:9092']
   */
  brokers: string[];

  /**
   * Consumer group ID for subscriptions.
   * All consumers with the same group ID will share message consumption,
   * enabling load balancing and parallel processing.
   *
   * @default 'pubsub-consumer-group'
   */
  groupId?: string;

  /**
   * SSL/TLS configuration for secure connections.
   */
  ssl?: {
    /**
     * Whether to reject unauthorized certificates.
     *
     * @default true
     */
    rejectUnauthorized?: boolean;

    /**
     * CA certificate(s) in PEM format.
     */
    ca?: string | string[] | Buffer | Buffer[];

    /**
     * Client certificate in PEM format.
     */
    cert?: string | Buffer;

    /**
     * Client private key in PEM format.
     */
    key?: string | Buffer;
  };

  /**
   * SASL authentication configuration.
   */
  sasl?: {
    /**
     * SASL mechanism to use.
     *
     * Supported mechanisms:
     * - KafkaSaslMechanism.PLAIN: Simple username/password authentication
     * - KafkaSaslMechanism.SCRAM_SHA_256: SCRAM-SHA-256 authentication
     * - KafkaSaslMechanism.SCRAM_SHA_512: SCRAM-SHA-512 authentication
     * - KafkaSaslMechanism.AWS: AWS IAM authentication
     */
    mechanism: KafkaSaslMechanism;

    /**
     * SASL username.
     */
    username?: string;

    /**
     * SASL password.
     */
    password?: string;

    /**
     * AWS-specific configuration (when mechanism is 'aws').
     */
    aws?: {
      /**
       * AWS access key ID.
       */
      accessKeyId: string;

      /**
       * AWS secret access key.
       */
      secretAccessKey: string;

      /**
       * AWS session token (for temporary credentials).
       */
      sessionToken?: string;

      /**
       * AWS region.
       */
      region: string;
    };
  };

  /**
   * Connection timeout in milliseconds.
   *
   * @default 10000
   */
  connectionTimeout?: number;

  /**
   * Request timeout in milliseconds.
   *
   * @default 30000
   */
  requestTimeout?: number;

  /**
   * Producer-specific configuration.
   */
  producer?: {
    /**
     * Whether to require acknowledgment from all in-sync replicas.
     *
     * Values:
     * - 0: No acknowledgment
     * - 1: Leader acknowledgment only
     * - -1: All in-sync replicas acknowledgment
     *
     * @default -1
     */
    acks?: 0 | 1 | -1;

    /**
     * Compression type for messages.
     *
     * @default KafkaCompression.NONE
     */
    compression?: KafkaCompression;

    /**
     * Maximum time to wait for messages to batch before sending.
     *
     * @default 0
     */
    timeout?: number;

    /**
     * Whether to allow automatic topic creation.
     *
     * @default true
     */
    allowAutoTopicCreation?: boolean;

    /**
     * Transactional ID for exactly-once semantics.
     * When provided, the producer will use transactions.
     */
    transactionalId?: string;

    /**
     * Maximum time to wait for transaction-related operations.
     *
     * @default 60000
     */
    transactionTimeout?: number;
  };

  /**
   * Consumer-specific configuration.
   */
  consumer?: {
    /**
     * Minimum number of bytes to fetch in a request.
     *
     * @default 1
     */
    minBytes?: number;

    /**
     * Maximum number of bytes to fetch in a request.
     *
     * @default 10485760 (10MB)
     */
    maxBytes?: number;

    /**
     * Maximum time to wait for data in a fetch request.
     *
     * @default 5000
     */
    maxWaitTimeInMs?: number;

    /**
     * Whether to start consuming from the beginning of the topic.
     *
     * @default false
     */
    fromBeginning?: boolean;

    /**
     * Session timeout in milliseconds.
     * If the consumer doesn't send a heartbeat within this time,
     * it will be considered dead and removed from the group.
     *
     * @default 30000
     */
    sessionTimeout?: number;

    /**
     * Heartbeat interval in milliseconds.
     *
     * @default 3000
     */
    heartbeatInterval?: number;

    /**
     * Partition assignment strategy.
     *
     * @default 'RoundRobinAssigner'
     */
    partitionAssignmentStrategy?: string;

    /**
     * Whether to automatically commit offsets.
     *
     * @default true
     */
    autoCommit?: boolean;

    /**
     * Auto-commit interval in milliseconds.
     *
     * @default 5000
     */
    autoCommitInterval?: number;

    /**
     * Maximum number of bytes per partition to fetch.
     *
     * @default 1048576 (1MB)
     */
    maxBytesPerPartition?: number;
  };

  /**
   * Retry configuration for failed operations.
   */
  retry?: {
    /**
     * Maximum number of retry attempts.
     *
     * @default 5
     */
    maxRetryTime?: number;

    /**
     * Initial retry delay in milliseconds.
     *
     * @default 300
     */
    initialRetryTime?: number;

    /**
     * Multiplier for exponential backoff.
     *
     * @default 2
     */
    factor?: number;

    /**
     * Multiplier for adding jitter to retry delays.
     *
     * @default 0.2
     */
    multiplier?: number;

    /**
     * Maximum retry delay in milliseconds.
     *
     * @default 30000
     */
    retries?: number;
  };

  /**
   * Logging configuration.
   */
  logLevel?: KafkaLogLevel;
}

/**
 * Namespace for IKafkaOptions interface containing the symbol for dependency injection.
 */
export namespace IKafkaOptions {
  /**
   * Unique symbol identifier for the IKafkaOptions interface.
   * Used for dependency injection and type identification in the NestJS container.
   */
  export const $ = Symbol('IKafkaOptions');
}
