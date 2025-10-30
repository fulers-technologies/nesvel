import type { IPubSubOptions } from './pubsub-options.interface';

/**
 * Factory interface for creating PubSub options asynchronously.
 *
 * This interface is used when the PubSub module configuration needs to be
 * created asynchronously, typically when it depends on other services or
 * configuration sources (e.g., ConfigService, environment variables, remote config).
 */
export interface IPubSubOptionsFactory {
  /**
   * Creates and returns the PubSub module options.
   *
   * This method is called during module initialization and should return
   * the configuration options for the PubSub module. It can perform
   * asynchronous operations like fetching configuration from external sources.
   *
   * @returns A Promise that resolves to the PubSub options, or the options directly
   */
  createPubSubOptions(): Promise<IPubSubOptions> | IPubSubOptions;
}

/**
 * Namespace for IPubSubOptionsFactory interface containing the symbol for dependency injection.
 */
export namespace IPubSubOptionsFactory {
  /**
   * Unique symbol identifier for the IPubSubOptionsFactory interface.
   * Used for dependency injection and type identification in the NestJS container.
   */
  export const $ = Symbol('IPubSubOptionsFactory');
}
