import { PubSubDriverType } from '@enums';
import type { IMessageSerializer } from './message-serializer.interface';
import type { IMessageValidator } from './validator.interface';
import type { IPubSubMetrics } from './metrics.interface';
import type { IMemoryOptions } from './memory-options.interface';
import type { IRedisOptions } from './redis-options.interface';
import type { IKafkaOptions } from './kafka-options.interface';
import type { IGooglePubSubOptions } from './google-pubsub-options.interface';
import type { IRetryOptions } from './retry-options.interface';
import type { ICircuitBreakerOptions } from './circuit-breaker-options.interface';
import type { IRateLimiterOptions } from './rate-limiter-options.interface';
import type { IBackpressureOptions } from './backpressure-options.interface';

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
  isGlobal?: boolean;

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

  /**
   * Memory driver configuration.
   *
   * Configuration options specific to the Memory (EventEmitter2) driver.
   * Used when driver is set to PubSubDriverType.MEMORY.
   *
   * @see {@link IMemoryOptions}
   */
  memory?: IMemoryOptions;

  /**
   * Redis driver configuration.
   *
   * Configuration options specific to the Redis driver.
   * Used when driver is set to PubSubDriverType.REDIS.
   *
   * @see {@link IRedisOptions}
   */
  redis?: IRedisOptions;

  /**
   * Kafka driver configuration.
   *
   * Configuration options specific to the Kafka driver.
   * Used when driver is set to PubSubDriverType.KAFKA.
   *
   * @see {@link IKafkaOptions}
   */
  kafka?: IKafkaOptions;

  /**
   * Google Pub/Sub driver configuration.
   *
   * Configuration options specific to the Google Cloud Pub/Sub driver.
   * Used when driver is set to PubSubDriverType.GOOGLE_PUBSUB.
   *
   * @see {@link IGooglePubSubOptions}
   */
  googlePubSub?: IGooglePubSubOptions;

  // ========================================
  // Production Features
  // ========================================

  /**
   * Optional metrics collector for telemetry and monitoring.
   *
   * Provides integration with monitoring systems like Prometheus, DataDog, New Relic, etc.
   * When provided, the PubSub system will automatically record metrics for:
   * - Message publish/subscribe counts
   * - Handler execution duration
   * - Error rates
   * - System health indicators
   *
   * @see {@link IPubSubMetrics}
   * @example
   * ```typescript
   * {
   *   metrics: new PrometheusMetrics(registry)
   * }
   * ```
   */
  metrics?: IPubSubMetrics;

  /**
   * Optional message validator for schema validation.
   *
   * Validates message payloads before publishing to ensure they conform to
   * expected schemas or constraints. This prevents invalid data from propagating
   * through the system.
   *
   * @see {@link IMessageValidator}
   * @example
   * ```typescript
   * {
   *   validator: new JoiValidator(schemas)
   * }
   * ```
   */
  validator?: IMessageValidator;

  /**
   * Retry configuration for failed operations.
   *
   * Extends the basic maxRetries and retryDelay options with advanced features
   * like exponential backoff, error filtering, and custom retry logic.
   *
   * @see {@link IRetryOptions}
   * @example
   * ```typescript
   * {
   *   retry: {
   *     maxRetries: 5,
   *     retryDelay: 1000,
   *     backoffMultiplier: 2,
   *     retryableErrors: ['ECONNREFUSED', 'ETIMEDOUT']
   *   }
   * }
   * ```
   */
  retry?: Partial<IRetryOptions>;

  /**
   * Circuit breaker configuration for fault tolerance.
   *
   * Implements the circuit breaker pattern to prevent cascading failures.
   * When a driver repeatedly fails, the circuit opens and rejects operations
   * immediately, giving the failing service time to recover.
   *
   * @see {@link ICircuitBreakerOptions}
   * @example
   * ```typescript
   * {
   *   circuitBreaker: {
   *     failureThreshold: 5,
   *     resetTimeout: 60000,
   *     successThreshold: 2
   *   }
   * }
   * ```
   */
  circuitBreaker?: ICircuitBreakerOptions;

  /**
   * Rate limiter configuration for controlling throughput.
   *
   * Limits the rate of message publishing per topic to prevent flooding
   * and ensure fair resource allocation. Useful for protecting downstream
   * services from overload.
   *
   * @see {@link IRateLimiterOptions}
   * @example
   * ```typescript
   * {
   *   rateLimiter: {
   *     maxRequestsPerWindow: 100,
   *     windowSize: 60000, // 1 minute
   *     useSlidingWindow: true
   *   }
   * }
   * ```
   */
  rateLimiter?: IRateLimiterOptions;

  /**
   * Backpressure configuration for flow control.
   *
   * Limits the number of concurrent operations to prevent system overload.
   * When the limit is reached, new operations wait until capacity becomes
   * available, implementing backpressure flow control.
   *
   * @see {@link IBackpressureOptions}
   * @example
   * ```typescript
   * {
   *   backpressure: {
   *     maxInflight: 1000,
   *     waitTimeout: 30000
   *   }
   * }
   * ```
   */
  backpressure?: IBackpressureOptions;

  /**
   * Dead Letter Queue (DLQ) topic for failed messages.
   *
   * When a message handler fails repeatedly or encounters a fatal error,
   * the message can be sent to a DLQ for manual inspection and recovery.
   * This prevents message loss while avoiding infinite retry loops.
   *
   * @example
   * ```typescript
   * {
   *   deadLetterQueue: 'failed-messages'
   * }
   * ```
   */
  deadLetterQueue?: string;

  /**
   * Whether to throw errors when message handlers fail.
   *
   * When true, handler errors are propagated to the caller.
   * When false, errors are logged but do not halt execution.
   *
   * @default false
   */
  throwOnHandlerError?: boolean;

  /**
   * Maximum allowed message size in bytes.
   *
   * Messages exceeding this size will be rejected before publishing.
   * This prevents large payloads from impacting system performance.
   *
   * @default undefined (no limit)
   */
  maxMessageSize?: number;

  /**
   * Maximum number of handlers allowed per topic.
   *
   * Prevents memory leaks from unbounded handler registration.
   * When the limit is reached, new subscriptions will fail.
   *
   * @default 100
   */
  maxHandlersPerTopic?: number;

  /**
   * Maximum subscription registration failure rate before startup fails.
   *
   * During initialization, if more than this percentage of subscriptions
   * fail to register, the application will refuse to start. This prevents
   * starting in a degraded state.
   *
   * @default 0.1 (10%)
   */
  maxSubscriptionFailureRate?: number;

  /**
   * Enable correlation ID tracking for distributed tracing.
   *
   * When enabled, messages are tagged with correlation IDs that can be
   * traced across services for debugging and monitoring.
   *
   * @default true
   */
  enableCorrelationId?: boolean;

  /**
   * Log sampling rate for high-volume topics (0.0 to 1.0).
   *
   * For topics with high message rates, this controls what percentage
   * of messages are logged. 1.0 logs all messages, 0.1 logs 10%, etc.
   * This prevents log flooding while maintaining visibility.
   *
   * @default 1.0 (log all)
   */
  logSamplingRate?: number;
}
