/**
 * Injection token for the PubSub module options.
 *
 * This symbol is used as a dependency injection token to inject the module
 * configuration into providers. It allows the PubSub module and its services
 * to access the configuration options provided during module registration.
 *
 * The token is used internally by the module infrastructure and typically
 * doesn't need to be used directly by application code. However, it can be
 * useful for custom providers or services that need access to the raw
 * configuration.
 *
 * @example
 * ```typescript
 * import { Inject, Injectable } from '@nestjs/common';
 * import { PUBSUB_MODULE_OPTIONS, IPubSubOptions } from '@nestjs-pubsub/core';
 *
 * @Injectable()
 * export class CustomService {
 *   constructor(
 *     @Inject(PUBSUB_MODULE_OPTIONS) private readonly options: IPubSubOptions
 *   ) {
 *     console.log('PubSub driver:', this.options.driver);
 *   }
 * }
 * ```
 */
export const PUBSUB_MODULE_OPTIONS = Symbol('PUBSUB_MODULE_OPTIONS');
