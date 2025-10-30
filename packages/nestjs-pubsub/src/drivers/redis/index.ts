/**
 * Redis PubSub driver implementation.
 *
 * This module provides a Redis-based implementation of the PubSub driver
 * interface using the ioredis library. It supports standard Redis Pub/Sub
 * operations, pattern-based subscriptions, and Redis Cluster mode.
 */

export * from './redis-options.interface';
export * from './redis-pubsub.driver';
