import { PubSubDriverType } from '@enums/pubsub-driver-type.enum';
import type { IPubSubOptions } from '@interfaces/pubsub-options.interface';
import { DEFAULT_PUBSUB_CONFIG } from '@constants/default-pubsub-config.constant';

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
export const pubsubConfig: IPubSubOptions = {
  /**
   * Messaging driver type
   *
   * Determines which messaging system to use.
   * Options: REDIS, KAFKA, GOOGLE_PUBSUB
   *
   * @env PUBSUB_DRIVER
   * @default PubSubDriverType.REDIS
   */
  driver: (process.env.PUBSUB_DRIVER as PubSubDriverType) || PubSubDriverType.REDIS,

  /**
   * Register module globally
   *
   * When true, the module will be available globally without imports.
   *
   * @env PUBSUB_GLOBAL
   * @default false
   */
  global: process.env.PUBSUB_GLOBAL === 'true',

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
    10,
  ),

  /**
   * Delay between retry attempts (in milliseconds)
   *
   * @env PUBSUB_RETRY_DELAY
   * @default 1000
   */
  retryDelay: parseInt(
    process.env.PUBSUB_RETRY_DELAY || String(DEFAULT_PUBSUB_CONFIG.retryDelay),
    10,
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
   * Driver-specific options
   *
   * Configuration options specific to the selected driver.
   * Structure varies based on the driver type.
   */
  driverOptions: (() => {
    const driver = (process.env.PUBSUB_DRIVER as PubSubDriverType) || PubSubDriverType.REDIS;

    switch (driver) {
      case PubSubDriverType.REDIS:
        return {
          host: process.env.REDIS_HOST || 'localhost',
          port: parseInt(process.env.REDIS_PORT || '6379', 10),
          password: process.env.REDIS_PASSWORD || undefined,
          db: parseInt(process.env.REDIS_DB || '0', 10),
          keyPrefix: process.env.REDIS_KEY_PREFIX || undefined,
          usePatternSubscribe: process.env.REDIS_USE_PATTERN_SUBSCRIBE === 'true',
        };

      case PubSubDriverType.KAFKA:
        const kafkaOptions: any = {
          clientId: process.env.KAFKA_CLIENT_ID || 'pubsub-client',
          brokers: process.env.KAFKA_BROKERS
            ? process.env.KAFKA_BROKERS.split(',')
            : ['localhost:9092'],
          groupId: process.env.KAFKA_GROUP_ID || 'pubsub-consumer-group',
          consumer: {
            fromBeginning: process.env.KAFKA_FROM_BEGINNING === 'true',
            autoCommit: process.env.KAFKA_AUTO_COMMIT !== 'false',
          },
        };

        if (process.env.KAFKA_SASL_MECHANISM) {
          kafkaOptions.sasl = {
            mechanism: process.env.KAFKA_SASL_MECHANISM,
            username: process.env.KAFKA_SASL_USERNAME,
            password: process.env.KAFKA_SASL_PASSWORD,
          };
        }
        return kafkaOptions;

      case PubSubDriverType.GOOGLE_PUBSUB:
        return {
          projectId: process.env.GOOGLE_PUBSUB_PROJECT_ID || '',
          keyFilename: process.env.GOOGLE_PUBSUB_KEY_FILENAME || undefined,
          apiEndpoint: process.env.GOOGLE_PUBSUB_API_ENDPOINT || undefined,
          autoCreateTopics: process.env.GOOGLE_PUBSUB_AUTO_CREATE_TOPICS !== 'false',
          autoCreateSubscriptions:
            process.env.GOOGLE_PUBSUB_AUTO_CREATE_SUBSCRIPTIONS !== 'false',
          subscriptionPrefix: process.env.GOOGLE_PUBSUB_SUBSCRIPTION_PREFIX || 'sub-',
        };

      default:
        return {};
    }
  })(),
};
