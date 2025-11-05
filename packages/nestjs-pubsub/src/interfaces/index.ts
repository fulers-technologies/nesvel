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
export type { SubscribeOptions } from './subscribe-options.interface';

import type { IPubSubOptions } from './pubsub-options.interface';
export type PubSubConfig = IPubSubOptions;
