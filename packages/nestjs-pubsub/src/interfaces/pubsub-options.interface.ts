import { PubSubDriverType } from '@enums';
import type { IMessageSerializer } from './message-serializer.interface';

/**
 * Configuration options for the PubSub module.
 *
 * This interface defines the structure of configuration options that can be
 * passed when registering the PubSub module. It allows customization of
 * driver selection, driver-specific options, serialization behavior, and
 * module registration scope.
 */
export interface IPubSubOptions {
  /**
   * The type of messaging driver to use.
   *
   * Determines which messaging backend implementation will be instantiated
   * and used for pub/sub operations. Each driver type corresponds to a
   * different messaging system with its own characteristics and capabilities.
   *
   * Supported values:
   * - 'redis': Uses Redis Pub/Sub via ioredis
   * - 'kafka': Uses Apache Kafka via kafkajs
   * - 'google-pubsub': Uses Google Cloud Pub/Sub
   */
  driver: PubSubDriverType | string;

  /**
   * Driver-specific configuration options.
   *
   * Each driver type accepts different configuration options specific to
   * its messaging backend. These options are passed directly to the driver
   * implementation and control connection parameters, authentication,
   * performance tuning, and other driver-specific behaviors.
   *
   * @example
   * For Redis:
   * ```typescript
   * {
   *   host: 'localhost',
   *   port: 6379,
   *   password: 'secret',
   *   db: 0
   * }
   * ```
   *
   * For Kafka:
   * ```typescript
   * {
   *   clientId: 'my-app',
   *   brokers: ['localhost:9092'],
   *   groupId: 'my-consumer-group'
   * }
   * ```
   */
  driverOptions?: Record<string, any>;

  /**
   * Custom message serializer for encoding and decoding message payloads.
   *
   * By default, messages are serialized using JSON.stringify and deserialized
   * using JSON.parse. You can provide a custom serializer to use different
   * serialization formats (e.g., MessagePack, Protocol Buffers, Avro) or to
   * implement custom encoding/decoding logic.
   *
   * @example
   * ```typescript
   * {
   *   serialize: (data) => msgpack.encode(data),
   *   deserialize: (buffer) => msgpack.decode(buffer)
   * }
   * ```
   */
  serializer?: IMessageSerializer;

  /**
   * Whether to register the module as a global module.
   *
   * When set to true, the PubSub module will be registered globally,
   * making it available throughout the application without needing to
   * import it in every module. This is convenient for modules that are
   * used widely across the application.
   *
   * @default false
   */
  global?: boolean;

  /**
   * Whether to automatically connect to the messaging backend on module initialization.
   *
   * When set to true, the driver will automatically call connect() during
   * the module's onModuleInit lifecycle hook. When false, you must manually
   * call connect() on the PubSubService before using pub/sub operations.
   *
   * @default true
   */
  autoConnect?: boolean;

  /**
   * Maximum number of retry attempts for failed operations.
   *
   * When publish or subscribe operations fail, the driver will automatically
   * retry up to this number of times before throwing an error. This helps
   * handle transient network issues or temporary backend unavailability.
   *
   * @default 3
   */
  maxRetries?: number;

  /**
   * Delay in milliseconds between retry attempts.
   *
   * When an operation fails and is retried, this delay is applied between
   * attempts. This prevents overwhelming the backend with rapid retry attempts
   * and allows time for transient issues to resolve.
   *
   * @default 1000
   */
  retryDelay?: number;

  /**
   * Optional namespace prefix for all topics.
   *
   * When provided, this prefix is automatically prepended to all topic names
   * used in publish and subscribe operations. This is useful for:
   * - Multi-tenancy scenarios
   * - Environment separation (dev, staging, prod)
   * - Avoiding topic name collisions
   *
   * @example
   * With namespace 'myapp:dev:', publishing to 'user.created' will actually
   * publish to 'myapp:dev:user.created'
   */
  namespace?: string;
}
