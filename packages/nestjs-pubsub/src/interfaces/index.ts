/**
 * Core interfaces for the NestJS PubSub module.
 *
 * This module exports all the interface definitions that form the contracts
 * and abstractions for the PubSub system. These interfaces ensure type safety,
 * enable dependency injection, and provide a consistent API across different
 * driver implementations.
 */

export * from './message-serializer.interface';
export * from './pubsub-driver.interface';
export * from './pubsub-message.interface';
export * from './pubsub-options.interface';
export * from './pubsub-options-factory.interface';
export * from './pubsub-async-options.interface';
export * from './subscription-metadata.interface';
export * from './subscribe-options.interface';
export * from './metrics.interface';
export * from './validator.interface';
export * from './health.interface';
export * from './retry-options.interface';
export * from './backpressure-options.interface';
export * from './circuit-breaker-options.interface';
export * from './rate-limiter-options.interface';
export * from './google-pubsub-options.interface';
export * from './memory-options.interface';
export * from './redis-options.interface';
export * from './kafka-options.interface';
export * from './no-op-metrics.interface';
export * from './base-driver-options.interface';
export * from './publish-options.interface';

import type { IPubSubOptions } from './pubsub-options.interface';

/**
 * Type alias for PubSub module configuration options.
 *
 * This is a convenience type alias that maps to IPubSubOptions.
 * It can be used interchangeably with IPubSubOptions for configuring
 * the PubSub module during registration.
 *
 * @see {@link IPubSubOptions}
 *
 * @example
 * ```typescript
 * const config: PubSubConfig = {
 *   driver: PubSubDriverType.REDIS,
 *   redis: {
 *     host: 'localhost',
 *     port: 6379
 *   }
 * };
 * ```
 */
export type PubSubConfig = IPubSubOptions;
