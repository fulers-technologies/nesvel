import { EventEmitter2 } from '@nestjs/event-emitter';
import { InstanceWrapper } from '@nestjs/core/injector/instance-wrapper';
import { Injectable, Logger, OnModuleInit, Inject } from '@nestjs/common';
import { DiscoveryService, MetadataScanner, ModuleRef } from '@nestjs/core';

import { PubSubService } from './pubsub.service';
import { PubSubDriverType } from '@/enums/pubsub-driver-type.enum';
import type { IPubSubOptions } from '@interfaces/pubsub-options.interface';
import type { IPubSubMessage } from '@interfaces/pubsub-message.interface';
import { PUBSUB_MODULE_OPTIONS, PUBSUB_SUBSCRIBE_METADATA } from '@/constants';
import type { ISubscriptionMetadata } from '@interfaces/subscription-metadata.interface';

/**
 * Service responsible for discovering and registering @Subscribe decorated methods.
 *
 * This service scans all providers in the application for methods decorated with
 * @Subscribe and automatically sets up subscriptions based on the configured driver.
 *
 * For LOCAL driver:
 * - Registers handlers with EventEmitter2 directly
 * - Uses native EventEmitter2 patterns and wildcards
 *
 * For other drivers (Redis, Kafka, Google PubSub):
 * - Registers handlers with the PubSubService
 * - Uses driver-specific subscription mechanisms
 *
 * @author Nesvel
 * @since 1.0.0
 */
@Injectable()
export class SubscriptionDiscoveryService implements OnModuleInit {
  /**
   * Logger instance for tracking subscription discovery and registration.
   */
  private readonly logger = new Logger(SubscriptionDiscoveryService.name);

  /**
   * Creates an instance of SubscriptionDiscoveryService.
   *
   * @param options - The PubSub module configuration options
   * @param discoveryService - NestJS service for discovering providers
   * @param metadataScanner - NestJS service for scanning class metadata
   * @param moduleRef - Reference to the current module for dependency injection
   * @param pubSubService - The main PubSub service for subscription registration
   */
  constructor(
    @Inject(PUBSUB_MODULE_OPTIONS)
    private readonly options: IPubSubOptions,
    private readonly discoveryService: DiscoveryService,
    private readonly metadataScanner: MetadataScanner,
    private readonly moduleRef: ModuleRef,
    private readonly pubSubService: PubSubService,
  ) {}

  /**
   * Lifecycle hook that discovers and registers all @Subscribe decorated methods.
   *
   * This method is called after the module has been initialized and all dependencies
   * are available. It scans the application for subscription handlers and registers
   * them with the appropriate backend.
   */
  async onModuleInit(): Promise<void> {
    // Ensure PubSubService is connected before registering subscriptions
    if (!this.pubSubService.isConnected()) {
      await this.pubSubService.connect();
    }

    this.logger.log('Discovering @Subscribe decorated methods...');

    // Get all providers in the application
    const providers = this.discoveryService.getProviders();

    // Counter for discovered subscriptions
    let subscriptionCount = 0;

    // Scan each provider for @Subscribe decorated methods
    for (const wrapper of providers) {
      const { instance } = wrapper;

      if (!instance || !Object.getPrototypeOf(instance)) {
        continue;
      }

      // Scan all methods in the instance
      const prototype = Object.getPrototypeOf(instance);
      const methodNames = this.metadataScanner.getAllMethodNames(prototype);

      for (const methodName of methodNames) {
        // Check if method has @Subscribe metadata
        const metadata = this.getSubscriptionMetadata(instance, methodName);

        if (metadata) {
          await this.registerSubscription(instance, methodName, metadata, wrapper);
          subscriptionCount++;
        }
      }
    }

    this.logger.log(
      `Discovered and registered ${subscriptionCount} subscription(s) for driver: ${this.options.driver}`,
    );
  }

  /**
   * Extracts @Subscribe metadata from a method.
   *
   * @param instance - The provider instance
   * @param methodName - The method name to check
   * @returns The subscription metadata if found, undefined otherwise
   */
  private getSubscriptionMetadata(
    instance: any,
    methodName: string,
  ): ISubscriptionMetadata | undefined {
    try {
      const prototype = Object.getPrototypeOf(instance);

      // Try to get metadata from the method directly (correct way for SetMetadata)
      const method = prototype[methodName];
      if (method) {
        const metadata = Reflect.getMetadata(PUBSUB_SUBSCRIBE_METADATA, method);
        if (metadata) {
          return metadata;
        }
      }

      // Fallback: try prototype
      const metadata = Reflect.getMetadata(PUBSUB_SUBSCRIBE_METADATA, prototype, methodName);

      return metadata;
    } catch (error: Error | any) {
      // Method doesn't have @Subscribe decorator
      return undefined;
    }
  }

  /**
   * Registers a subscription based on the configured driver type.
   *
   * @param instance - The provider instance containing the handler method
   * @param methodName - The name of the handler method
   * @param metadata - The subscription metadata from @Subscribe decorator
   * @param wrapper - The NestJS instance wrapper
   */
  private async registerSubscription(
    instance: any,
    methodName: string,
    metadata: ISubscriptionMetadata,
    wrapper: InstanceWrapper,
  ): Promise<void> {
    const { topic, filter, errorHandler, options } = metadata;
    const handler = instance[methodName].bind(instance);

    // Wrap handler with filter and error handling
    const wrappedHandler = this.wrapHandler(handler, filter, errorHandler, topic, wrapper);

    try {
      // Route to appropriate registration based on driver type
      if (this.options.driver === PubSubDriverType.MEMORY) {
        await this.registerWithEventEmitter(topic, wrappedHandler);
      } else {
        await this.registerWithDriver(topic, wrappedHandler, options);
      }

      this.logger.debug(
        `Registered subscription: ${wrapper.name || 'Anonymous'}.${methodName}() -> ${topic}`,
      );
    } catch (error: Error | any) {
      this.logger.error(
        `Failed to register subscription for ${topic} in ${wrapper.name || 'Anonymous'}.${methodName}():`,
        error,
      );
    }
  }

  /**
   * Registers a subscription with EventEmitter2 (for LOCAL driver).
   *
   * @param topic - The event name/topic to subscribe to
   * @param handler - The message handler function
   */
  private async registerWithEventEmitter(
    topic: string,
    handler: (message: IPubSubMessage) => Promise<void>,
  ): Promise<void> {
    try {
      // Get EventEmitter2 instance from the container
      const eventEmitter = this.moduleRef.get(EventEmitter2, { strict: false });

      // Register the handler with EventEmitter2
      eventEmitter.on(topic, handler);

      this.logger.debug(`Registered with EventEmitter2: ${topic}`);
    } catch (error: Error | any) {
      // EventEmitter2 might not be available if user didn't import EventEmitterModule
      this.logger.warn(
        `Failed to register with EventEmitter2 for ${topic}. ` +
          `Falling back to driver subscription. ` +
          `Did you import EventEmitterModule in your root module?`,
      );

      // Fallback to driver subscription
      await this.registerWithDriver(topic, handler, {});
    }
  }

  /**
   * Registers a subscription with the PubSub driver (for Redis, Kafka, etc.).
   *
   * @param topic - The topic/channel to subscribe to
   * @param handler - The message handler function
   * @param options - Driver-specific subscription options
   */
  private async registerWithDriver(
    topic: string,
    handler: (message: IPubSubMessage) => Promise<void>,
    options?: Record<string, any>,
  ): Promise<void> {
    await this.pubSubService.subscribe(topic, handler, options);
  }

  /**
   * Wraps a handler function with filter and error handling logic.
   *
   * @param handler - The original handler function
   * @param filter - Optional message filter function
   * @param errorHandler - Optional error handler function
   * @param topic - The topic name (for logging)
   * @param wrapper - The instance wrapper (for logging)
   * @returns The wrapped handler function
   */
  private wrapHandler(
    handler: Function,
    filter?: (message: IPubSubMessage) => boolean,
    errorHandler?: (error: Error, message: IPubSubMessage) => Promise<void> | void,
    topic?: string,
    wrapper?: InstanceWrapper,
  ): (message: IPubSubMessage) => Promise<void> {
    return async (message: IPubSubMessage) => {
      try {
        // Apply filter if provided
        if (filter && !filter(message)) {
          this.logger.debug(`Message filtered out for topic: ${topic}`);
          return;
        }

        // Invoke the handler
        await handler(message);
      } catch (error: Error | any) {
        // Use custom error handler if provided
        if (errorHandler) {
          try {
            await errorHandler(error, message);
          } catch (handlerError: Error | any) {
            this.logger.error(`Error in custom error handler for topic ${topic}:`, handlerError);
          }
        } else {
          // Default error logging
          this.logger.error(
            `Error in subscription handler for topic ${topic} in ${wrapper?.name || 'Anonymous'}:`,
            error,
          );
        }
      }
    };
  }
}
