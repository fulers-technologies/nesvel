/**
 * Supported driver types for the PubSub module.
 *
 * This enum defines the available messaging backend implementations that
 * can be used with the PubSub module. Each driver type corresponds to a
 * specific messaging system with its own characteristics and capabilities.
 *
 * The enum values are used in the module configuration to specify which
 * driver should be instantiated and used for pub/sub operations.
 *
 * @example
 * ```typescript
 * import { PubSubDriverType } from '@nestjs-pubsub/core';
 *
 * PubSubModule.forRoot({
 *   driver: PubSubDriverType.REDIS,
 *   driverOptions: { host: 'localhost', port: 6379 }
 * })
 * ```
 */
export enum PubSubDriverType {
  /**
   * Redis Pub/Sub driver using ioredis library.
   *
   * Redis is an in-memory data structure store that provides pub/sub
   * messaging capabilities. It's suitable for simple pub/sub scenarios
   * with low latency requirements.
   *
   * Characteristics:
   * - Low latency
   * - No message persistence
   * - At-most-once delivery
   * - Simple setup and configuration
   *
   * @see https://redis.io/topics/pubsub
   */
  REDIS = 'redis',

  /**
   * Apache Kafka driver using kafkajs library.
   *
   * Kafka is a distributed event streaming platform designed for
   * high-throughput, fault-tolerant messaging. It's ideal for event
   * sourcing, log aggregation, and stream processing.
   *
   * Characteristics:
   * - High throughput
   * - Message persistence
   * - At-least-once delivery
   * - Consumer groups support
   * - Partition-based ordering
   *
   * @see https://kafka.apache.org/
   */
  KAFKA = 'kafka',

  /**
   * Google Cloud Pub/Sub driver using @google-cloud/pubsub library.
   *
   * Google Cloud Pub/Sub is a fully managed, real-time messaging service
   * that allows you to send and receive messages between independent
   * applications. It's designed for cloud-native applications.
   *
   * Characteristics:
   * - Fully managed service
   * - Message persistence
   * - At-least-once delivery (exactly-once available)
   * - Global distribution
   * - Auto-scaling
   *
   * @see https://cloud.google.com/pubsub
   */
  GOOGLE_PUBSUB = 'google-pubsub',
}
