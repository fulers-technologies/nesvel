/**
 * PubSub exceptions.
 *
 * This module exports custom exception classes for handling PubSub-related
 * errors. These exceptions provide structured error information and enable
 * type-safe error handling throughout the application.
 */

export * from './pubsub.exception';
export * from './circuit-open.exception';
export * from './publish-failed.exception';
export * from './driver-not-found.exception';
export * from './rate-limit-exceeded.exception';
export * from './max-retries-exceeded.exception';
export * from './backpressure-timeout.exception';
