import type { IPubSubAsyncOptions } from '@interfaces/pubsub-async-options.interface';
import type { IPubSubOptionsFactory } from '@interfaces/pubsub-options-factory.interface';
import type { IPubSubOptions } from '@interfaces/pubsub-options.interface';

import { DynamicModule, Module, Provider, Type } from '@nestjs/common';
import { DiscoveryModule, DiscoveryService, MetadataScanner, Reflector } from '@nestjs/core';
import { PubSubFactoryService } from '@services/pubsub-factory.service';
import { PubSubService } from '@services/pubsub.service';

import {
  PUBSUB_MODULE_OPTIONS,
  PUBSUB_DRIVER,
  PUBSUB_SERVICE,
  DEFAULT_PUBSUB_CONFIG,
} from './constants';

/**
 * NestJS module for pub/sub messaging functionality.
 *
 * This module provides a complete pub/sub system with support for multiple
 * messaging backends (Redis, Kafka, Google Cloud Pub/Sub). It integrates
 * seamlessly with NestJS's dependency injection and lifecycle management.
 *
 * Features:
 * - Multiple driver implementations (Redis, Kafka, Google PubSub)
 * - Synchronous and asynchronous configuration
 * - Global or scoped module registration
 * - Automatic connection management
 * - Decorator-based subscription discovery
 * - Type-safe message handling
 * - Custom serialization support
 *
 * The module can be configured in two ways:
 * 1. Synchronous configuration using forRoot()
 * 2. Asynchronous configuration using forRootAsync()
 *
 * @example
 * Synchronous configuration:
 * ```typescript
 * @Module({
 *   imports: [
 *     PubSubModule.forRoot({
 *       driver: 'redis',
 *       driverOptions: {
 *         host: 'localhost',
 *         port: 6379
 *       }
 *     })
 *   ]
 * })
 * export class AppModule {}
 * ```
 *
 * @example
 * Asynchronous configuration with ConfigService:
 * ```typescript
 * @Module({
 *   imports: [
 *     PubSubModule.forRootAsync({
 *       imports: [ConfigModule],
 *       useFactory: (config: ConfigService) => ({
 *         driver: config.get('PUBSUB_DRIVER'),
 *         driverOptions: {
 *           host: config.get('REDIS_HOST'),
 *           port: config.get('REDIS_PORT')
 *         }
 *       }),
 *       inject: [ConfigService]
 *     })
 *   ]
 * })
 * export class AppModule {}
 * ```
 */
@Module({})
export class PubSubModule {
  /**
   * Registers the PubSub module with synchronous configuration.
   *
   * This method creates a dynamic module with the provided options.
   * The configuration is available immediately and doesn't depend on
   * other providers or services.
   *
   * @param options - The PubSub module configuration options
   * @returns A configured dynamic module
   *
   * @example
   * ```typescript
   * PubSubModule.forRoot({
   *   driver: 'kafka',
   *   driverOptions: {
   *     clientId: 'my-app',
   *     brokers: ['localhost:9092']
   *   },
   *   global: true
   * })
   * ```
   */
  static forRoot(options: IPubSubOptions): DynamicModule {
    // Merge with default configuration
    const mergedOptions = {
      ...DEFAULT_PUBSUB_CONFIG,
      ...options,
    };

    // Create providers
    const providers = this.createProviders(mergedOptions);

    return {
      module: PubSubModule,
      global: mergedOptions.global || false,
      imports: [DiscoveryModule],
      providers,
      exports: [PUBSUB_SERVICE, PubSubService],
    };
  }

  /**
   * Registers the PubSub module with asynchronous configuration.
   *
   * This method creates a dynamic module where the configuration is
   * provided asynchronously, typically through a factory function that
   * depends on other providers like ConfigService.
   *
   * Supports three configuration patterns:
   * - useFactory: Factory function with dependency injection
   * - useClass: Class implementing IPubSubOptionsFactory
   * - useExisting: Existing provider implementing IPubSubOptionsFactory
   *
   * @param options - The asynchronous configuration options
   * @returns A configured dynamic module
   *
   * @example
   * Using factory:
   * ```typescript
   * PubSubModule.forRootAsync({
   *   useFactory: (config: ConfigService) => ({
   *     driver: config.get('PUBSUB_DRIVER'),
   *     driverOptions: config.get('PUBSUB_OPTIONS')
   *   }),
   *   inject: [ConfigService]
   * })
   * ```
   *
   * @example
   * Using class:
   * ```typescript
   * PubSubModule.forRootAsync({
   *   useClass: PubSubConfigService
   * })
   * ```
   */
  static forRootAsync(options: IPubSubAsyncOptions): DynamicModule {
    // Create async providers
    const asyncProviders = this.createAsyncProviders(options);

    // Create core providers
    const coreProviders = this.createCoreProviders();

    return {
      module: PubSubModule,
      global: options.global || false,
      imports: [DiscoveryModule, ...(options.imports || [])],
      providers: [...asyncProviders, ...coreProviders],
      exports: [PUBSUB_SERVICE, PubSubService],
    };
  }

  /**
   * Creates the core providers for the module.
   *
   * These providers include:
   * - Options provider (configuration)
   * - Driver provider (messaging backend)
   * - Service provider (main PubSub service)
   * - Factory provider (driver factory)
   *
   * @param options - The module configuration options
   * @returns An array of providers
   */
  private static createProviders(options: IPubSubOptions): Provider[] {
    return [
      // Options provider
      {
        provide: PUBSUB_MODULE_OPTIONS,
        useValue: options,
      },

      // Factory service
      PubSubFactoryService,

      // Driver provider
      {
        provide: PUBSUB_DRIVER,
        useFactory: (factory: PubSubFactoryService) => {
          factory.validateOptions(options);
          return factory.createDriver(options);
        },
        inject: [PubSubFactoryService],
      },

      // Service provider
      {
        provide: PUBSUB_SERVICE,
        useFactory: (driver: any) => {
          return new PubSubService(driver, options.autoConnect ?? true);
        },
        inject: [PUBSUB_DRIVER],
      },

      // Export service with class token as well
      {
        provide: PubSubService,
        useExisting: PUBSUB_SERVICE,
      },
    ];
  }

  /**
   * Creates the core providers without options (for async configuration).
   *
   * These providers depend on the async options provider created separately.
   *
   * @returns An array of providers
   */
  private static createCoreProviders(): Provider[] {
    return [
      // Factory service
      PubSubFactoryService,

      // Driver provider
      {
        provide: PUBSUB_DRIVER,
        useFactory: (options: IPubSubOptions, factory: PubSubFactoryService) => {
          factory.validateOptions(options);
          return factory.createDriver(options);
        },
        inject: [PUBSUB_MODULE_OPTIONS, PubSubFactoryService],
      },

      // Service provider
      {
        provide: PUBSUB_SERVICE,
        useFactory: (driver: any, options: IPubSubOptions) => {
          return new PubSubService(driver, options.autoConnect ?? true);
        },
        inject: [PUBSUB_DRIVER, PUBSUB_MODULE_OPTIONS],
      },

      // Export service with class token as well
      {
        provide: PubSubService,
        useExisting: PUBSUB_SERVICE,
      },
    ];
  }

  /**
   * Creates async providers for module configuration.
   *
   * Handles three configuration patterns:
   * - useFactory: Creates options using a factory function
   * - useClass: Creates options using a factory class
   * - useExisting: Uses an existing factory provider
   *
   * @param options - The async configuration options
   * @returns An array of providers
   */
  private static createAsyncProviders(options: IPubSubAsyncOptions): Provider[] {
    if (options.useFactory) {
      return [
        {
          provide: PUBSUB_MODULE_OPTIONS,
          useFactory: async (...args: any[]) => {
            const opts = await options.useFactory!(...args);
            return {
              ...DEFAULT_PUBSUB_CONFIG,
              ...opts,
            };
          },
          inject: options.inject || [],
        },
      ];
    }

    if (options.useClass) {
      return [
        {
          provide: PUBSUB_MODULE_OPTIONS,
          useFactory: async (factory: IPubSubOptionsFactory) => {
            const opts = await factory.createPubSubOptions();
            return {
              ...DEFAULT_PUBSUB_CONFIG,
              ...opts,
            };
          },
          inject: [options.useClass],
        },
        {
          provide: options.useClass,
          useClass: options.useClass,
        },
      ];
    }

    if (options.useExisting) {
      return [
        {
          provide: PUBSUB_MODULE_OPTIONS,
          useFactory: async (factory: IPubSubOptionsFactory) => {
            const opts = await factory.createPubSubOptions();
            return {
              ...DEFAULT_PUBSUB_CONFIG,
              ...opts,
            };
          },
          inject: [options.useExisting],
        },
      ];
    }

    throw new Error(
      'Invalid async configuration. Must provide useFactory, useClass, or useExisting.',
    );
  }
}
