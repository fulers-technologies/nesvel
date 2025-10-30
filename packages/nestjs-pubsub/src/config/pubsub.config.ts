import { registerAs, ConfigService } from '@nestjs/config';
import { PubSubDriverType } from '@enums/pubsub-driver-type.enum';
import type { IPubSubOptions } from '@interfaces/pubsub-options.interface';
import { DEFAULT_PUBSUB_CONFIG } from '@constants/default-pubsub-config.constant';

/**
 * PubSub configuration namespace key.
 *
 * This constant is used as the namespace key when registering PubSub
 * configuration with ConfigModule using registerAs().
 *
 * @constant
 */
export const PUBSUB_CONFIG_KEY = 'pubsub';

/**
 * PubSub configuration factory using registerAs pattern.
 *
 * This factory function creates a namespaced configuration object for
 * the PubSub module. It should be used with ConfigModule.forFeature()
 * to register PubSub configuration.
 *
 * Environment Variables:
 * - PUBSUB_DRIVER: The messaging driver to use (redis, kafka, google-pubsub)
 * - PUBSUB_GLOBAL: Whether to register the module globally
 * - PUBSUB_AUTO_CONNECT: Whether to auto-connect on module initialization
 * - PUBSUB_MAX_RETRIES: Maximum retry attempts for failed operations
 * - PUBSUB_RETRY_DELAY: Delay between retry attempts (ms)
 * - PUBSUB_NAMESPACE: Optional namespace prefix for topics
 *
 * Redis-specific:
 * - REDIS_HOST: Redis server hostname
 * - REDIS_PORT: Redis server port
 * - REDIS_PASSWORD: Redis authentication password
 * - REDIS_DB: Redis database index
 * - REDIS_KEY_PREFIX: Key prefix for Redis operations
 * - REDIS_USE_PATTERN_SUBSCRIBE: Use pattern-based subscriptions
 *
 * Kafka-specific:
 * - KAFKA_CLIENT_ID: Kafka client identifier
 * - KAFKA_BROKERS: Comma-separated list of Kafka brokers
 * - KAFKA_GROUP_ID: Consumer group ID
 * - KAFKA_FROM_BEGINNING: Start consuming from beginning
 * - KAFKA_AUTO_COMMIT: Enable auto-commit
 * - KAFKA_SASL_MECHANISM: SASL authentication mechanism
 * - KAFKA_SASL_USERNAME: SASL username
 * - KAFKA_SASL_PASSWORD: SASL password
 *
 * Google PubSub-specific:
 * - GOOGLE_PUBSUB_PROJECT_ID: GCP project ID
 * - GOOGLE_PUBSUB_KEY_FILENAME: Path to service account key file
 * - GOOGLE_PUBSUB_API_ENDPOINT: API endpoint (for emulator)
 * - GOOGLE_PUBSUB_AUTO_CREATE_TOPICS: Auto-create topics
 * - GOOGLE_PUBSUB_AUTO_CREATE_SUBSCRIPTIONS: Auto-create subscriptions
 * - GOOGLE_PUBSUB_SUBSCRIPTION_PREFIX: Subscription name prefix
 *
 * @returns Configuration factory function
 *
 * @example
 * ```typescript
 * @Module({
 *   imports: [
 *     ConfigModule.forRoot({
 *       load: [pubsubConfig],
 *     }),
 *     PubSubModule.registerAsync({
 *       imports: [ConfigModule],
 *       inject: [ConfigService],
 *       useFactory: (config: ConfigService) => config.get('pubsub')
 *     })
 *   ]
 * })
 * export class AppModule {}
 * ```
 */
export const pubsubConfig = registerAs(PUBSUB_CONFIG_KEY, () => {
  const driver = (process.env.PUBSUB_DRIVER || PubSubDriverType.REDIS) as PubSubDriverType;

  let driverOptions: any;

  switch (driver) {
    case PubSubDriverType.REDIS:
      driverOptions = {
        host: process.env.REDIS_HOST || 'localhost',
        port: parseInt(process.env.REDIS_PORT || '6379', 10),
        password: process.env.REDIS_PASSWORD || undefined,
        db: parseInt(process.env.REDIS_DB || '0', 10),
        keyPrefix: process.env.REDIS_KEY_PREFIX || undefined,
        usePatternSubscribe: process.env.REDIS_USE_PATTERN_SUBSCRIBE === 'true',
      };
      break;

    case PubSubDriverType.KAFKA:
      driverOptions = {
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
        driverOptions.sasl = {
          mechanism: process.env.KAFKA_SASL_MECHANISM,
          username: process.env.KAFKA_SASL_USERNAME,
          password: process.env.KAFKA_SASL_PASSWORD,
        };
      }
      break;

    case PubSubDriverType.GOOGLE_PUBSUB:
      driverOptions = {
        projectId: process.env.GOOGLE_PUBSUB_PROJECT_ID || '',
        keyFilename: process.env.GOOGLE_PUBSUB_KEY_FILENAME || undefined,
        apiEndpoint: process.env.GOOGLE_PUBSUB_API_ENDPOINT || undefined,
        autoCreateTopics: process.env.GOOGLE_PUBSUB_AUTO_CREATE_TOPICS !== 'false',
        autoCreateSubscriptions: process.env.GOOGLE_PUBSUB_AUTO_CREATE_SUBSCRIPTIONS !== 'false',
        subscriptionPrefix: process.env.GOOGLE_PUBSUB_SUBSCRIPTION_PREFIX || 'sub-',
      };
      break;

    default:
      driverOptions = {};
  }

  return {
    driver,
    driverOptions,
    global: process.env.PUBSUB_GLOBAL === 'true',
    autoConnect: process.env.PUBSUB_AUTO_CONNECT !== 'false',
    maxRetries: parseInt(
      process.env.PUBSUB_MAX_RETRIES || String(DEFAULT_PUBSUB_CONFIG.maxRetries),
      10,
    ),
    retryDelay: parseInt(
      process.env.PUBSUB_RETRY_DELAY || String(DEFAULT_PUBSUB_CONFIG.retryDelay),
      10,
    ),
    namespace: process.env.PUBSUB_NAMESPACE || undefined,
  } as IPubSubOptions;
});

/**
 * Creates PubSub configuration from environment variables using ConfigService.
 *
 * This function provides a convenient way to build PubSub configuration
 * from environment variables using ConfigService. It supports all PubSub
 * drivers and applies sensible defaults for missing values.
 *
 * @param configService - NestJS ConfigService instance
 *
 * @returns PubSub configuration options
 *
 * @example
 * ```typescript
 * PubSubModule.registerAsync({
 *   imports: [ConfigModule],
 *   inject: [ConfigService],
 *   useFactory: (config: ConfigService) => createPubSubConfig(config)
 * });
 * ```
 */
export function createPubSubConfig(configService: ConfigService): IPubSubOptions {
  const driver = configService.get<PubSubDriverType>('PUBSUB_DRIVER', PubSubDriverType.REDIS);

  let driverOptions: any;

  switch (driver) {
    case PubSubDriverType.REDIS:
      driverOptions = {
        host: configService.get<string>('REDIS_HOST', 'localhost'),
        port: configService.get<number>('REDIS_PORT', 6379),
        password: configService.get<string>('REDIS_PASSWORD'),
        db: configService.get<number>('REDIS_DB', 0),
        keyPrefix: configService.get<string>('REDIS_KEY_PREFIX'),
        usePatternSubscribe: configService.get<boolean>('REDIS_USE_PATTERN_SUBSCRIBE', false),
      };
      break;

    case PubSubDriverType.KAFKA:
      driverOptions = {
        clientId: configService.get<string>('KAFKA_CLIENT_ID', 'pubsub-client'),
        brokers: configService.get<string>('KAFKA_BROKERS', 'localhost:9092').split(','),
        groupId: configService.get<string>('KAFKA_GROUP_ID', 'pubsub-consumer-group'),
        consumer: {
          fromBeginning: configService.get<boolean>('KAFKA_FROM_BEGINNING', false),
          autoCommit: configService.get<boolean>('KAFKA_AUTO_COMMIT', true),
        },
      };

      const saslMechanism = configService.get<string>('KAFKA_SASL_MECHANISM');
      if (saslMechanism) {
        driverOptions.sasl = {
          mechanism: saslMechanism,
          username: configService.get<string>('KAFKA_SASL_USERNAME'),
          password: configService.get<string>('KAFKA_SASL_PASSWORD'),
        };
      }
      break;

    case PubSubDriverType.GOOGLE_PUBSUB:
      driverOptions = {
        projectId: configService.get<string>('GOOGLE_PUBSUB_PROJECT_ID'),
        keyFilename: configService.get<string>('GOOGLE_PUBSUB_KEY_FILENAME'),
        apiEndpoint: configService.get<string>('GOOGLE_PUBSUB_API_ENDPOINT'),
        autoCreateTopics: configService.get<boolean>('GOOGLE_PUBSUB_AUTO_CREATE_TOPICS', true),
        autoCreateSubscriptions: configService.get<boolean>(
          'GOOGLE_PUBSUB_AUTO_CREATE_SUBSCRIPTIONS',
          true,
        ),
        subscriptionPrefix: configService.get<string>('GOOGLE_PUBSUB_SUBSCRIPTION_PREFIX', 'sub-'),
      };
      break;

    default:
      throw new Error(`Unsupported PubSub driver: ${driver}`);
  }

  return {
    driver,
    driverOptions,
    global: configService.get<boolean>('PUBSUB_GLOBAL', DEFAULT_PUBSUB_CONFIG.global),
    autoConnect: configService.get<boolean>(
      'PUBSUB_AUTO_CONNECT',
      DEFAULT_PUBSUB_CONFIG.autoConnect,
    ),
    maxRetries: configService.get<number>('PUBSUB_MAX_RETRIES', DEFAULT_PUBSUB_CONFIG.maxRetries),
    retryDelay: configService.get<number>('PUBSUB_RETRY_DELAY', DEFAULT_PUBSUB_CONFIG.retryDelay),
    namespace: configService.get<string>('PUBSUB_NAMESPACE'),
  };
}

/**
 * Creates Redis-specific PubSub configuration from environment variables.
 *
 * @param configService - NestJS ConfigService instance
 *
 * @returns Redis PubSub configuration options
 *
 * @example
 * ```typescript
 * useFactory: (config: ConfigService) => createRedisConfig(config)
 * ```
 */
export function createRedisConfig(configService: ConfigService): IPubSubOptions {
  return {
    driver: PubSubDriverType.REDIS,
    driverOptions: {
      host: configService.get<string>('REDIS_HOST', 'localhost'),
      port: configService.get<number>('REDIS_PORT', 6379),
      password: configService.get<string>('REDIS_PASSWORD'),
      db: configService.get<number>('REDIS_DB', 0),
      keyPrefix: configService.get<string>('REDIS_KEY_PREFIX'),
      usePatternSubscribe: configService.get<boolean>('REDIS_USE_PATTERN_SUBSCRIBE', false),
    },
    autoConnect: configService.get<boolean>(
      'PUBSUB_AUTO_CONNECT',
      DEFAULT_PUBSUB_CONFIG.autoConnect,
    ),
    maxRetries: configService.get<number>('PUBSUB_MAX_RETRIES', DEFAULT_PUBSUB_CONFIG.maxRetries),
    retryDelay: configService.get<number>('PUBSUB_RETRY_DELAY', DEFAULT_PUBSUB_CONFIG.retryDelay),
  };
}

/**
 * Creates Kafka-specific PubSub configuration from environment variables.
 *
 * @param configService - NestJS ConfigService instance
 *
 * @returns Kafka PubSub configuration options
 *
 * @example
 * ```typescript
 * useFactory: (config: ConfigService) => createKafkaConfig(config)
 * ```
 */
export function createKafkaConfig(configService: ConfigService): IPubSubOptions {
  const driverOptions: any = {
    clientId: configService.get<string>('KAFKA_CLIENT_ID', 'pubsub-client'),
    brokers: configService.get<string>('KAFKA_BROKERS', 'localhost:9092').split(','),
    groupId: configService.get<string>('KAFKA_GROUP_ID', 'pubsub-consumer-group'),
    consumer: {
      fromBeginning: configService.get<boolean>('KAFKA_FROM_BEGINNING', false),
      autoCommit: configService.get<boolean>('KAFKA_AUTO_COMMIT', true),
    },
  };

  const saslMechanism = configService.get<string>('KAFKA_SASL_MECHANISM');
  if (saslMechanism) {
    driverOptions.sasl = {
      mechanism: saslMechanism,
      username: configService.get<string>('KAFKA_SASL_USERNAME'),
      password: configService.get<string>('KAFKA_SASL_PASSWORD'),
    };
  }

  return {
    driver: PubSubDriverType.KAFKA,
    driverOptions,
    autoConnect: configService.get<boolean>(
      'PUBSUB_AUTO_CONNECT',
      DEFAULT_PUBSUB_CONFIG.autoConnect,
    ),
    maxRetries: configService.get<number>('PUBSUB_MAX_RETRIES', DEFAULT_PUBSUB_CONFIG.maxRetries),
    retryDelay: configService.get<number>('PUBSUB_RETRY_DELAY', DEFAULT_PUBSUB_CONFIG.retryDelay),
  };
}

/**
 * Creates Google PubSub-specific configuration from environment variables.
 *
 * @param configService - NestJS ConfigService instance
 *
 * @returns Google PubSub configuration options
 *
 * @example
 * ```typescript
 * useFactory: (config: ConfigService) => createGooglePubSubConfig(config)
 * ```
 */
export function createGooglePubSubConfig(configService: ConfigService): IPubSubOptions {
  return {
    driver: PubSubDriverType.GOOGLE_PUBSUB,
    driverOptions: {
      projectId: configService.get<string>('GOOGLE_PUBSUB_PROJECT_ID'),
      keyFilename: configService.get<string>('GOOGLE_PUBSUB_KEY_FILENAME'),
      apiEndpoint: configService.get<string>('GOOGLE_PUBSUB_API_ENDPOINT'),
      autoCreateTopics: configService.get<boolean>('GOOGLE_PUBSUB_AUTO_CREATE_TOPICS', true),
      autoCreateSubscriptions: configService.get<boolean>(
        'GOOGLE_PUBSUB_AUTO_CREATE_SUBSCRIPTIONS',
        true,
      ),
      subscriptionPrefix: configService.get<string>('GOOGLE_PUBSUB_SUBSCRIPTION_PREFIX', 'sub-'),
    },
    autoConnect: configService.get<boolean>(
      'PUBSUB_AUTO_CONNECT',
      DEFAULT_PUBSUB_CONFIG.autoConnect,
    ),
    maxRetries: configService.get<number>('PUBSUB_MAX_RETRIES', DEFAULT_PUBSUB_CONFIG.maxRetries),
    retryDelay: configService.get<number>('PUBSUB_RETRY_DELAY', DEFAULT_PUBSUB_CONFIG.retryDelay),
  };
}

/**
 * Validates the PubSub configuration from environment variables.
 *
 * This function checks that all required environment variables are set
 * for the selected driver and throws descriptive errors if any are missing.
 *
 * @throws {Error} If required configuration is missing
 *
 * @example
 * ```typescript
 * import { validatePubSubConfig } from './config/pubsub.config';
 *
 * // In your main.ts or bootstrap function
 * validatePubSubConfig();
 * ```
 */
export function validatePubSubConfig(): void {
  const driver = process.env.PUBSUB_DRIVER || PubSubDriverType.REDIS;

  switch (driver) {
    case PubSubDriverType.KAFKA:
      if (!process.env.KAFKA_CLIENT_ID) {
        console.warn('KAFKA_CLIENT_ID not set, using default: pubsub-client');
      }
      if (!process.env.KAFKA_BROKERS) {
        console.warn('KAFKA_BROKERS not set, using default: localhost:9092');
      }
      break;

    case PubSubDriverType.GOOGLE_PUBSUB:
      if (!process.env.GOOGLE_PUBSUB_PROJECT_ID) {
        throw new Error(
          'GOOGLE_PUBSUB_PROJECT_ID environment variable is required for Google PubSub driver',
        );
      }
      break;

    case PubSubDriverType.REDIS:
      if (!process.env.REDIS_HOST) {
        console.warn('REDIS_HOST not set, using default: localhost');
      }
      break;

    default:
      console.warn(`Unknown driver: ${driver}, skipping validation`);
  }
}
