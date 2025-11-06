import type { PubSubConfig } from '@nesvel/nestjs-pubsub';
import { PubSubDriverType, DEFAULT_PUBSUB_CONFIG } from '@nesvel/nestjs-pubsub';

/**
 * PubSub Module Configuration
 *
 * Production-ready pub/sub messaging configuration for NestJS.
 * Provides comprehensive messaging integration with multiple drivers.
 *
 * Features:
 * - Multi-driver support (Redis, Kafka, Google PubSub)
 * - Automatic connection management
 * - Type-safe operations
 * - Configurable retry mechanisms
 * - Topic namespacing
 *
 * All configuration values can be overridden via environment variables.
 *
 * @see {@link https://redis.io/topics/pubsub | Redis Pub/Sub}
 * @see {@link https://kafka.apache.org | Apache Kafka}
 * @see {@link https://cloud.google.com/pubsub | Google Cloud Pub/Sub}
 *
 * @example
 * ```typescript
 * // Access configuration values
 * const driver = pubsubConfig.driver;
 * const maxRetries = pubsubConfig.maxRetries;
 * const redisHost = pubsubConfig.redis?.host;
 * ```
 */
export const pubsubConfig: PubSubConfig = {
  /**
   * Messaging driver type
   *
   * Determines which messaging system to use.
   * Options: REDIS, KAFKA, GOOGLE_PUBSUB
   *
   * @env PUBSUB_DRIVER
   * @default PubSubDriverType.REDIS
   */
  driver: (process.env.PUBSUB_DRIVER as PubSubDriverType) || PubSubDriverType.KAFKA,

  /**
   * Register module globally
   *
   * When true, the module will be available globally without imports.
   *
   * @env PUBSUB_GLOBAL
   * @default false
   */
  isGlobal: process.env.PUBSUB_GLOBAL === 'true' || true,

  /**
   * Auto-connect on module initialization
   *
   * When true, connects to the messaging system on app bootstrap.
   *
   * @env PUBSUB_AUTO_CONNECT
   * @default true
   */
  autoConnect: process.env.PUBSUB_AUTO_CONNECT !== 'false',

  /**
   * Maximum retry attempts for failed operations
   *
   * @env PUBSUB_MAX_RETRIES
   * @default 3
   */
  maxRetries: parseInt(
    process.env.PUBSUB_MAX_RETRIES || String(DEFAULT_PUBSUB_CONFIG.maxRetries),
    10
  ),

  /**
   * Delay between retry attempts (in milliseconds)
   *
   * @env PUBSUB_RETRY_DELAY
   * @default 1000
   */
  retryDelay: parseInt(
    process.env.PUBSUB_RETRY_DELAY || String(DEFAULT_PUBSUB_CONFIG.retryDelay),
    10
  ),

  /**
   * Optional namespace prefix for topics
   *
   * Used to namespace topics in multi-tenant applications
   * or to separate different environments.
   *
   * @env PUBSUB_NAMESPACE
   */
  namespace: process.env.PUBSUB_NAMESPACE || undefined,

  /**
   * Redis configuration
   *
   * Default configuration for Redis Pub/Sub driver.
   * Used when driver is set to PubSubDriverType.REDIS.
   *
   * @env REDIS_HOST - Redis server hostname
   * @env REDIS_PORT - Redis server port
   * @env REDIS_PASSWORD - Redis authentication password
   * @env REDIS_DB - Redis database index
   * @env REDIS_KEY_PREFIX - Key prefix for Redis operations
   * @env REDIS_USE_PATTERN_SUBSCRIBE - Use pattern-based subscriptions
   */
  redis: {
    host: process.env.REDIS_HOST || 'localhost',
    port: parseInt(process.env.REDIS_PORT || '6379', 10),
    db: parseInt(process.env.REDIS_DB || '0', 10),
    password: process.env.REDIS_PASSWORD || undefined,
    keyPrefix: process.env.REDIS_KEY_PREFIX || undefined,
    usePatternSubscribe: process.env.REDIS_USE_PATTERN_SUBSCRIBE === 'true',
  },

  /**
   * Kafka configuration
   *
   * Default configuration for Kafka Pub/Sub driver.
   * Used when driver is set to PubSubDriverType.KAFKA.
   *
   * @env KAFKA_CLIENT_ID - Kafka client identifier
   * @env KAFKA_BROKERS - Comma-separated list of Kafka brokers
   * @env KAFKA_GROUP_ID - Consumer group ID
   * @env KAFKA_FROM_BEGINNING - Start consuming from beginning
   * @env KAFKA_AUTO_COMMIT - Enable auto-commit
   * @env KAFKA_SASL_MECHANISM - SASL authentication mechanism
   * @env KAFKA_SASL_USERNAME - SASL username
   * @env KAFKA_SASL_PASSWORD - SASL password
   */
  kafka: {
    clientId: process.env.KAFKA_CLIENT_ID || 'pubsub-client',
    groupId: process.env.KAFKA_GROUP_ID || 'pubsub-consumer-group',
    brokers: process.env.KAFKA_BROKERS ? process.env.KAFKA_BROKERS.split(',') : ['localhost:9092'],
    consumer: {
      autoCommit: process.env.KAFKA_AUTO_COMMIT !== 'false',
      fromBeginning: process.env.KAFKA_FROM_BEGINNING === 'true',
    },
  },

  /**
   * Google Pub/Sub configuration
   *
   * Default configuration for Google Cloud Pub/Sub driver.
   * Used when driver is set to PubSubDriverType.GOOGLE_PUBSUB.
   *
   * @env GOOGLE_PUBSUB_PROJECT_ID - GCP project ID
   * @env GOOGLE_PUBSUB_KEY_FILENAME - Path to service account key file
   * @env GOOGLE_PUBSUB_API_ENDPOINT - API endpoint (for emulator)
   * @env GOOGLE_PUBSUB_AUTO_CREATE_TOPICS - Auto-create topics
   * @env GOOGLE_PUBSUB_AUTO_CREATE_SUBSCRIPTIONS - Auto-create subscriptions
   * @env GOOGLE_PUBSUB_SUBSCRIPTION_PREFIX - Subscription name prefix
   */
  googlePubSub: {
    projectId: process.env.GOOGLE_PUBSUB_PROJECT_ID || '',
    keyFilename: process.env.GOOGLE_PUBSUB_KEY_FILENAME || undefined,
    apiEndpoint: process.env.GOOGLE_PUBSUB_API_ENDPOINT || undefined,
    autoCreateTopics: process.env.GOOGLE_PUBSUB_AUTO_CREATE_TOPICS !== 'false',
    subscriptionPrefix: process.env.GOOGLE_PUBSUB_SUBSCRIPTION_PREFIX || 'sub-',
    autoCreateSubscriptions: process.env.GOOGLE_PUBSUB_AUTO_CREATE_SUBSCRIPTIONS !== 'false',
  },
};
