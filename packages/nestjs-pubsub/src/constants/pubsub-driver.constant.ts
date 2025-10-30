/**
 * Injection token for the PubSub driver instance.
 *
 * This symbol is used as a dependency injection token to inject the active
 * driver implementation into services. The driver is the low-level component
 * that handles communication with the messaging backend (Redis, Kafka, etc.).
 *
 * The token is used internally by the PubSubService to access the driver
 * instance. Application code typically doesn't need to inject the driver
 * directly, as the PubSubService provides a higher-level API. However,
 * advanced use cases may require direct driver access.
 *
 * @example
 * ```typescript
 * import { Inject, Injectable } from '@nestjs/common';
 * import { PUBSUB_DRIVER, IPubSubDriver } from '@nestjs-pubsub/core';
 *
 * @Injectable()
 * export class AdvancedService {
 *   constructor(
 *     @Inject(PUBSUB_DRIVER) private readonly driver: IPubSubDriver
 *   ) {
 *     console.log('Driver connected:', this.driver.isConnected());
 *   }
 * }
 * ```
 */
export const PUBSUB_DRIVER = Symbol('PUBSUB_DRIVER');
