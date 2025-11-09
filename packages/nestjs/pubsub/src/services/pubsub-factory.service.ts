import { Injectable } from '@nestjs/common';
import { BaseFactory } from '@nesvel/shared';

import { RedisPubSubDriver } from '@drivers/redis.driver';
import { KafkaPubSubDriver } from '@drivers/kafka.driver';
import { GooglePubSubDriver } from '@drivers/google.driver';
import { MemoryPubSubDriver } from '@drivers/memory.driver';
import { PubSubDriverType } from '@enums/pubsub-driver-type.enum';
import type { IPubSubDriver } from '@interfaces/pubsub-driver.interface';
import type { IPubSubOptions } from '@interfaces/pubsub-options.interface';
import { IBaseDriverOptions } from '@interfaces/base-driver-options.interface';
import { DriverNotFoundException } from '@exceptions/driver-not-found.exception';

/**
 * Factory service for creating and configuring PubSub driver instances.
 *
 * This service extends BaseFactory to provide a standardized factory pattern for
 * creating pub/sub messaging driver instances. It manages the lifecycle and
 * configuration of various messaging backends including Redis, Kafka, Google
 * Pub/Sub, and in-memory implementations.
 *
 * Architecture:
 * - Extends BaseFactory with pub/sub-specific configuration handling
 * - Maintains a registry of available messaging drivers
 * - Provides driver-specific validation and instantiation
 * - Supports both driver-specific and base options (metrics, DLQ, etc.)
 * - Enables custom driver registration at runtime
 *
 * Supported Drivers:
 * - Redis: High-performance in-memory pub/sub with persistence options
 * - Kafka: Distributed streaming platform for high-throughput messaging
 * - Google Pub/Sub: Fully managed messaging service on Google Cloud
 * - Memory: In-memory implementation for development and testing
 *
 * Key Features:
 * - Automatic driver instantiation with production features
 * - Driver-specific option validation (brokers, projectId, etc.)
 * - Base options support (metrics, DLQ, rate limiting, circuit breakers)
 * - Runtime driver registration for custom implementations
 * - Type-safe operations with full TypeScript support
 * - Comprehensive error handling with available drivers information
 *
 * Production Features (Base Options):
 * - Metrics collection and monitoring
 * - Dead Letter Queue (DLQ) for failed messages
 * - Rate limiting per topic
 * - Circuit breakers for fault tolerance
 * - Message size validation
 * - Correlation ID tracking
 * - Namespace isolation
 *
 * @extends BaseFactory<IPubSubOptions, IPubSubDriver, Record<string, any>>
 *
 * @example
 * Basic usage with Redis:
 * ```typescript
 * const driver = pubsubFactory.createDriver({
 *   driver: PubSubDriverType.REDIS,
 *   redis: {
 *     host: 'localhost',
 *     port: 6379,
 *     retryStrategy: (times) => Math.min(times * 50, 2000)
 *   },
 *   metrics: true,
 *   deadLetterQueue: { enabled: true }
 * });
 *
 * await driver.publish('user.created', { userId: 123 });
 * await driver.subscribe('user.*', handler);
 * ```
 *
 * @example
 * Using Kafka for distributed messaging:
 * ```typescript
 * const driver = pubsubFactory.createDriver({
 *   driver: PubSubDriverType.KAFKA,
 *   kafka: {
 *     clientId: 'my-app',
 *     brokers: ['localhost:9092'],
 *     groupId: 'my-consumer-group'
 *   },
 *   maxHandlersPerTopic: 5,
 *   namespace: 'production'
 * });
 * ```
 *
 * @example
 * Registering a custom PubSub driver:
 * ```typescript
 * class CustomPubSubDriver implements IPubSubDriver {
 *   static make(options: any, baseOptions: IBaseDriverOptions) {
 *     return CustomPubSubDriver.make(options, baseOptions);
 *   }
 *   async publish(topic: string, message: any): Promise<void> { ... }
 *   async subscribe(pattern: string, handler: Function): Promise<void> { ... }
 * }
 *
 * pubsubFactory.registerDriver('custom', CustomPubSubDriver);
 * ```
 *
 * @see {@link BaseFactory} For base factory implementation
 * @see {@link IPubSubDriver} For driver interface specification
 * @see {@link IPubSubOptions} For configuration options
 * @see {@link IBaseDriverOptions} For production feature options
 *
 * @author Nesvel
 * @since 1.0.0
 */
@Injectable()
export class PubSubFactoryService extends BaseFactory<
  IPubSubOptions,
  IPubSubDriver,
  Record<string, any>
> {
  /**
   * Registry of available pub/sub messaging drivers.
   *
   * Maps driver type identifiers to their corresponding driver classes.
   * This registry is used by BaseFactory to instantiate the appropriate
   * messaging driver based on configuration.
   *
   * Available drivers:
   * - REDIS: High-performance in-memory pub/sub with persistence
   * - KAFKA: Distributed streaming platform for high-throughput messaging
   * - MEMORY: In-memory implementation for development/testing
   * - GOOGLE_PUBSUB: Fully managed Google Cloud messaging service
   *
   * @protected
   * @readonly
   */
  protected readonly driverRegistry = new Map<string, any>([
    [PubSubDriverType.REDIS, RedisPubSubDriver],
    [PubSubDriverType.KAFKA, KafkaPubSubDriver],
    [PubSubDriverType.MEMORY, MemoryPubSubDriver],
    [PubSubDriverType.GOOGLE_PUBSUB, GooglePubSubDriver],
  ]);

  /**
   * Extracts the messaging driver type from configuration.
   *
   * Determines which pub/sub messaging driver should be used based on
   * the provided configuration. The driver type determines the messaging
   * backend (Redis, Kafka, Google Pub/Sub, or Memory).
   *
   * @param options - The pub/sub configuration object containing driver selection
   * @returns The driver type identifier (e.g., 'redis', 'kafka', 'google-pubsub', 'memory')
   *
   * @protected
   * @override Implementation of BaseFactory abstract method
   *
   * @example
   * ```typescript
   * const driver = this.getDriverType({ driver: PubSubDriverType.REDIS });
   * // Returns: 'redis'
   *
   * const kafkaDriver = this.getDriverType({ driver: PubSubDriverType.KAFKA });
   * // Returns: 'kafka'
   * ```
   */
  protected getDriverType(options: IPubSubOptions): string {
    return options.driver;
  }

  /**
   * Gets driver-specific configuration options.
   *
   * Extracts and returns the configuration options specific to the selected
   * pub/sub messaging driver. Each driver has its own set of configurable
   * parameters:
   *
   * - Memory: Optional configuration (uses defaults if not provided)
   * - Redis: host, port, password, db, retryStrategy, etc.
   * - Kafka: clientId, brokers, groupId, consumer/producer configs
   * - Google Pub/Sub: projectId, credentials, apiEndpoint, etc.
   *
   * @param options - The pub/sub configuration containing driver-specific options
   * @returns Driver-specific configuration options, or empty object for custom drivers
   *
   * @protected
   * @override Implementation of BaseFactory abstract method
   *
   * @example
   * ```typescript
   * const redisOpts = this.getDriverOptions({
   *   driver: PubSubDriverType.REDIS,
   *   redis: { host: 'localhost', port: 6379 }
   * });
   * // Returns: { host: 'localhost', port: 6379 }
   *
   * const kafkaOpts = this.getDriverOptions({
   *   driver: PubSubDriverType.KAFKA,
   *   kafka: { brokers: ['localhost:9092'], clientId: 'my-app' }
   * });
   * // Returns: { brokers: ['localhost:9092'], clientId: 'my-app' }
   * ```
   */
  protected getDriverOptions(options: IPubSubOptions): Record<string, any> {
    switch (options.driver) {
      case PubSubDriverType.MEMORY:
        return options.memory || {};
      case PubSubDriverType.REDIS:
        return options.redis || {};
      case PubSubDriverType.KAFKA:
        return options.kafka || {};
      case PubSubDriverType.GOOGLE_PUBSUB:
        return options.googlePubSub || {};
      default:
        return {};
    }
  }

  /**
   * Instantiates a pub/sub driver with driver-specific and base options.
   *
   * Creates a new instance of the specified pub/sub driver class, passing both
   * driver-specific configuration (Redis connection, Kafka brokers, etc.) and
   * base production features (metrics, DLQ, rate limiting, circuit breakers).
   *
   * Base production features include:
   * - Metrics collection for monitoring
   * - Dead Letter Queue (DLQ) for failed messages
   * - Rate limiting per topic
   * - Circuit breakers for fault tolerance
   * - Message size validation
   * - Correlation ID tracking
   * - Namespace isolation
   *
   * All drivers implement the static make() method which accepts both
   * driver options and base options for consistent instantiation.
   *
   * @param DriverClass - The driver class constructor (RedisPubSubDriver, KafkaPubSubDriver, etc.)
   * @param driverOptions - Driver-specific configuration (connection details, etc.)
   * @param config - Full pub/sub configuration containing base production features
   * @returns A fully configured pub/sub driver instance with production features
   *
   * @protected
   * @override Implementation of BaseFactory abstract method
   *
   * @example
   * ```typescript
   * const driver = this.instantiateDriver(
   *   RedisPubSubDriver,
   *   { host: 'localhost', port: 6379 },
   *   {
   *     driver: PubSubDriverType.REDIS,
   *     redis: { host: 'localhost', port: 6379 },
   *     metrics: true,
   *     deadLetterQueue: { enabled: true },
   *     namespace: 'production'
   *   }
   * );
   * // Returns: RedisPubSubDriver with metrics, DLQ, and namespace configured
   * ```
   */
  protected instantiateDriver(
    DriverClass: any,
    driverOptions: Record<string, any> | undefined,
    config: IPubSubOptions,
  ): IPubSubDriver {
    /**
     * Build base driver options for production features.
     *
     * Extracts and consolidates production-grade features from the main configuration
     * into a structured base options object. These options are passed to all drivers
     * to enable consistent behavior across different messaging backends.
     */
    const baseOptions: IBaseDriverOptions = {
      /** Enable metrics collection for monitoring message throughput and latency */
      metrics: config.metrics,
      /** Maximum number of concurrent handlers per topic pattern */
      maxHandlersPerTopic: config.maxHandlersPerTopic,
      /** Dead Letter Queue configuration for handling failed messages */
      deadLetterQueue: config.deadLetterQueue,
      /** Whether to throw errors when message handlers fail (default: false) */
      throwOnHandlerError: config.throwOnHandlerError,
      /** Maximum allowed message size in bytes (prevents memory issues) */
      maxMessageSize: config.maxMessageSize,
      /** Enable automatic correlation ID tracking across message flows */
      enableCorrelationId: config.enableCorrelationId,
      /** Sampling rate for logging (0.0 to 1.0) to reduce log volume */
      logSamplingRate: config.logSamplingRate,
      /** Namespace prefix for topic isolation in multi-tenant environments */
      namespace: config.namespace,
    };

    /**
     * Instantiate driver with both driver-specific and base options.
     *
     * Calls the driver's static make() factory method, passing both the driver-specific
     * configuration (connection details, etc.) and base production features.
     */
    return DriverClass.make(driverOptions, baseOptions);
  }

  /**
   * Creates the appropriate error for unsupported driver.
   *
   * Generates a custom DriverNotFoundException when a requested pub/sub driver
   * is not found in the driver registry. This error provides helpful information
   * about the invalid driver and lists all available drivers.
   *
   * @param driverType - The requested driver identifier that wasn't found in the registry
   * @param availableDrivers - List of all available driver types for helpful error message
   * @returns A DriverNotFoundException instance with descriptive error message
   *
   * @protected
   * @override Implementation of BaseFactory abstract method
   *
   * @example
   * ```typescript
   * const error = this.getNotFoundError('unknown-driver', ['redis', 'kafka', 'memory']);
   * // Returns: DriverNotFoundException with message:
   * // "PubSub driver 'unknown-driver' not found. Available: redis, kafka, memory, google-pubsub"
   * ```
   */
  protected getNotFoundError(driverType: string, availableDrivers: string[]): Error {
    return DriverNotFoundException.make(driverType, availableDrivers);
  }

  /**
   * Validates driver-specific configuration options.
   *
   * Performs validation of driver-specific parameters to ensure they meet the
   * requirements of each pub/sub driver. This validation occurs before driver
   * instantiation to provide early error detection.
   *
   * Validation rules by driver:
   * - Memory: No validation required (uses sensible defaults)
   * - Redis: No validation required (uses sensible defaults)
   * - Kafka:
   *   - clientId: Required string
   *   - brokers: Required non-empty array of broker URLs
   *   - Example: { clientId: 'my-app', brokers: ['localhost:9092'] }
   * - Google Pub/Sub:
   *   - projectId: Required string (GCP project ID)
   *   - Example: { projectId: 'my-gcp-project' }
   *
   * Custom drivers skip validation and log a debug message.
   *
   * @param driverType - The driver type identifier to validate options for
   * @param driverOptions - The driver-specific configuration options to validate
   *
   * @throws {Error} If required options are missing or invalid
   *
   * @protected
   * @override Optional template method from BaseFactory
   *
   * @example
   * ```typescript
   * // Valid Kafka options
   * this.validateDriverOptions('kafka', {
   *   clientId: 'my-app',
   *   brokers: ['localhost:9092']
   * });
   * // No error thrown
   *
   * // Invalid Kafka options (missing brokers)
   * this.validateDriverOptions('kafka', { clientId: 'my-app' });
   * // Throws: Error: Kafka driver requires brokers array in driverOptions
   *
   * // Invalid Google Pub/Sub (missing projectId)
   * this.validateDriverOptions('google-pubsub', {});
   * // Throws: Error: Google PubSub driver requires projectId in driverOptions
   * ```
   */
  protected validateDriverOptions(driverType: string, driverOptions?: Record<string, any>): void {
    switch (driverType) {
      case PubSubDriverType.MEMORY:
        // Memory driver validation is lenient as it has sensible defaults
        break;

      case PubSubDriverType.REDIS:
        // Redis validation is lenient as it has sensible defaults
        break;

      case PubSubDriverType.KAFKA:
        if (!driverOptions) {
          throw new Error('Kafka driver requires driverOptions');
        }
        if (!driverOptions.clientId) {
          throw new Error('Kafka driver requires clientId in driverOptions');
        }
        if (!driverOptions.brokers || !Array.isArray(driverOptions.brokers)) {
          throw new Error('Kafka driver requires brokers array in driverOptions');
        }
        if (driverOptions.brokers.length === 0) {
          throw new Error('Kafka driver requires at least one broker');
        }
        break;

      case PubSubDriverType.GOOGLE_PUBSUB:
        if (!driverOptions) {
          throw new Error('Google PubSub driver requires driverOptions');
        }
        if (!driverOptions.projectId) {
          throw new Error('Google PubSub driver requires projectId in driverOptions');
        }
        break;

      default:
        // For custom drivers, skip validation
        this.logger.debug(`Skipping validation for custom driver: ${driverType}`);
    }
  }
}
