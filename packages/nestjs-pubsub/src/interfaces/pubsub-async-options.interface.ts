import { ModuleMetadata, Type } from '@nestjs/common';
import type { IPubSubOptions } from './pubsub-options.interface';
import type { IPubSubOptionsFactory } from './pubsub-options-factory.interface';

/**
 * Options for asynchronous PubSub module registration.
 *
 * This interface extends ModuleMetadata to support various patterns for
 * asynchronously providing PubSub configuration, including factory functions,
 * factory classes, and existing providers.
 */
export interface IPubSubAsyncOptions extends Pick<ModuleMetadata, 'imports'> {
  /**
   * Whether to register the module as a global module.
   *
   * @default false
   */
  global?: boolean;

  /**
   * Factory function that returns PubSub options.
   *
   * This function is called during module initialization and can inject
   * dependencies from the NestJS container. It should return the configuration
   * options for the PubSub module.
   *
   * @param args - Injected dependencies specified in the 'inject' array
   * @returns A Promise that resolves to the PubSub options, or the options directly
   *
   * @example
   * ```typescript
   * {
   *   useFactory: (config: ConfigService) => ({
   *     driver: config.get('PUBSUB_DRIVER'),
   *     driverOptions: config.get('PUBSUB_OPTIONS')
   *   }),
   *   inject: [ConfigService]
   * }
   * ```
   */
  useFactory?: (...args: any[]) => Promise<IPubSubOptions> | IPubSubOptions;

  /**
   * Class that implements IPubSubOptionsFactory.
   *
   * An instance of this class will be created and its createPubSubOptions()
   * method will be called to obtain the configuration options.
   *
   * @example
   * ```typescript
   * {
   *   useClass: PubSubConfigService
   * }
   * ```
   */
  useClass?: Type<IPubSubOptionsFactory>;

  /**
   * Existing provider that implements IPubSubOptionsFactory.
   *
   * The specified provider will be retrieved from the container and its
   * createPubSubOptions() method will be called to obtain the configuration.
   *
   * @example
   * ```typescript
   * {
   *   useExisting: PubSubConfigService
   * }
   * ```
   */
  useExisting?: Type<IPubSubOptionsFactory>;

  /**
   * Array of providers to inject into the factory function.
   *
   * These providers will be resolved from the NestJS container and passed
   * as arguments to the useFactory function in the order specified.
   */
  inject?: any[];
}

/**
 * Namespace for IPubSubAsyncOptions interface containing the symbol for dependency injection.
 */
export namespace IPubSubAsyncOptions {
  /**
   * Unique symbol identifier for the IPubSubAsyncOptions interface.
   * Used for dependency injection and type identification in the NestJS container.
   */
  export const $ = Symbol('IPubSubAsyncOptions');
}
