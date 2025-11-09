import { EventEmitterModule } from '@nestjs/event-emitter';
import { DynamicModule, Module, Provider } from '@nestjs/common';

import {
  ILoggerModuleOptions,
  ILoggerModuleOptionsFactory,
  ILoggerAsyncModuleAsyncOptions,
} from './interfaces';
import { LoggerService } from './services/logger.service';
import { LOGGER_SERVICE, LOGGER_MODULE_OPTIONS } from './constants';
import { LoggerContextService } from './services/logger-context.service';
import { TransportFactoryService } from './services/transport-factory.service';

/**
 * NestJS module for structured logging functionality.
 *
 * This module provides a comprehensive logging system with support for multiple
 * transport backends (Console, File, Daily Rotate, CloudWatch, Slack, HTTP).
 * It integrates seamlessly with NestJS's dependency injection and lifecycle management.
 *
 * Features:
 * - Multiple transport implementations (Console, File, Daily, CloudWatch, Slack, HTTP)
 * - Synchronous and asynchronous configuration
 * - Global or scoped module registration
 * - Activity tracking (Medusa-style)
 * - Context management (Laravel-style)
 * - Event-driven logging
 * - Panic handling
 * - All log levels (emergency, alert, critical, error, warning, notice, info, http, verbose, debug, silly)
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
 *     LoggerModule.forRoot({
 *       level: LogLevel.INFO,
 *       transports: [
 *         {
 *           type: TransportType.CONSOLE,
 *           level: LogLevel.DEBUG,
 *           colorize: true,
 *           format: 'pretty'
 *         },
 *         {
 *           type: TransportType.FILE,
 *           filename: './logs/app.log',
 *           level: LogLevel.INFO
 *         }
 *       ]
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
 *     LoggerModule.forRootAsync({
 *       imports: [ConfigModule],
 *       useFactory: (config: ConfigService) => ({
 *         level: config.get('LOG_LEVEL'),
 *         transports: [
 *           {
 *             type: TransportType.DAILY,
 *             filename: config.get('LOG_FILE_PATTERN'),
 *             maxSize: '20m',
 *             maxFiles: '14d'
 *           },
 *           {
 *             type: TransportType.CLOUDWATCH,
 *             logGroupName: config.get('AWS_LOG_GROUP'),
 *             logStreamName: config.get('AWS_LOG_STREAM'),
 *             awsRegion: config.get('AWS_REGION')
 *           }
 *         ]
 *       }),
 *       inject: [ConfigService]
 *     })
 *   ]
 * })
 * export class AppModule {}
 * ```
 */
@Module({})
export class LoggerModule {
  /**
   * Registers the Logger module with synchronous configuration.
   *
   * This method creates a dynamic module with the provided options.
   * The configuration is available immediately and doesn't depend on
   * other providers or services.
   *
   * @param options - The Logger module configuration options
   * @returns A configured dynamic module
   *
   * @example
   * ```typescript
   * LoggerModule.forRoot({
   *   level: LogLevel.INFO,
   *   transports: [
   *     {
   *       type: TransportType.CONSOLE,
   *       level: LogLevel.DEBUG,
   *       colorize: true
   *     }
   *   ],
   *   global: true
   * })
   * ```
   */
  static forRoot(options: ILoggerModuleOptions): DynamicModule {
    // Create providers
    const providers = this.createProviders(options);

    return {
      module: LoggerModule,
      global: options.isGlobal || false,
      imports: [EventEmitterModule.forRoot()],
      providers,
      exports: [LOGGER_SERVICE, LoggerService, LoggerContextService],
    };
  }

  /**
   * Registers the Logger module with asynchronous configuration.
   *
   * This method creates a dynamic module where the configuration is
   * provided asynchronously, typically through a factory function that
   * depends on other providers like ConfigService.
   *
   * Supports three configuration patterns:
   * - useFactory: Factory function with dependency injection
   * - useClass: Class implementing ILoggerModuleOptionsFactory
   * - useExisting: Existing provider implementing ILoggerModuleOptionsFactory
   *
   * @param options - The asynchronous configuration options
   * @returns A configured dynamic module
   *
   * @example
   * Using factory:
   * ```typescript
   * LoggerModule.forRootAsync({
   *   useFactory: (config: ConfigService) => ({
   *     level: config.get('LOG_LEVEL'),
   *     transports: config.get('LOG_TRANSPORTS')
   *   }),
   *   inject: [ConfigService]
   * })
   * ```
   *
   * @example
   * Using class:
   * ```typescript
   * LoggerModule.forRootAsync({
   *   useClass: LoggerConfigService
   * })
   * ```
   */
  static forRootAsync(options: ILoggerAsyncModuleAsyncOptions): DynamicModule {
    // Create all async providers (options + core)
    const providers = this.createAsyncProviders(options);

    return {
      module: LoggerModule,
      global: options.isGlobal || false,
      imports: [EventEmitterModule.forRoot(), ...(options.imports || [])],
      providers,
      exports: [LOGGER_SERVICE, LoggerService, LoggerContextService],
    };
  }

  /**
   * Creates the core providers for the module.
   *
   * These providers include:
   * - Options provider (configuration)
   * - Factory provider (transport factory)
   * - Service provider (main Logger service)
   * - Context provider (request-scoped context)
   *
   * @param options - The module configuration options
   * @returns An array of providers
   */
  private static createProviders(options: ILoggerModuleOptions): Provider[] {
    return [
      // Options provider - synchronous configuration
      {
        provide: LOGGER_MODULE_OPTIONS,
        useValue: options,
      },
      ...this.createCoreProviders(),
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
   * This method returns all providers needed for async configuration,
   * including the options provider and core providers.
   *
   * @param options - The async configuration options
   * @returns An array of providers
   */
  private static createAsyncProviders(options: ILoggerAsyncModuleAsyncOptions): Provider[] {
    let optionsProvider: Provider;

    if (options.useFactory) {
      optionsProvider = {
        provide: LOGGER_MODULE_OPTIONS,
        useFactory: async (...args: any[]) => {
          const opts = await options.useFactory!(...args);
          return opts;
        },
        inject: options.inject || [],
      };
      return [optionsProvider, ...this.createCoreProviders()];
    }

    if (options.useClass) {
      return [
        {
          provide: LOGGER_MODULE_OPTIONS,
          useFactory: async (factory: ILoggerModuleOptionsFactory) => {
            const opts = await factory.createLoggerOptions();
            return opts;
          },
          inject: [options.useClass],
        },
        {
          provide: options.useClass,
          useClass: options.useClass,
        },
        ...this.createCoreProviders(),
      ];
    }

    if (options.useExisting) {
      return [
        {
          provide: LOGGER_MODULE_OPTIONS,
          useFactory: async (factory: ILoggerModuleOptionsFactory) => {
            const opts = await factory.createLoggerOptions();
            return opts;
          },
          inject: [options.useExisting],
        },
        ...this.createCoreProviders(),
      ];
    }

    throw new Error(
      'Invalid async configuration. Must provide useFactory, useClass, or useExisting.'
    );
  }

  /**
   * Creates the core providers without options (for async configuration).
   *
   * These providers are shared between synchronous and asynchronous configurations.
   * They depend on LOGGER_MODULE_OPTIONS being provided by either createProviders
   * or createAsyncProviders.
   *
   * @returns An array of providers
   */
  private static createCoreProviders(): Provider[] {
    return [
      // Context service (request-scoped)
      LoggerContextService,

      // Factory service
      TransportFactoryService,

      // Service provider - main logger instance
      {
        provide: LOGGER_SERVICE,
        useFactory: (
          options: ILoggerModuleOptions,
          factory: TransportFactoryService,
          context: LoggerContextService
        ) => {
          // Filter and build enabled transports
          const enabledTransports = this.buildTransports(options, factory);

          // Create logger service instance
          const logger = LoggerService.make();

          // Set default log level if specified
          if (options.level) {
            logger.setLogLevel(options.level);
          }

          // Add all enabled transports to the logger
          enabledTransports.forEach((transport) => logger.addTransport(transport));

          return logger;
        },
        inject: [LOGGER_MODULE_OPTIONS, TransportFactoryService, LoggerContextService],
      },

      // Export service with class token as well for class-based injection
      {
        provide: LoggerService,
        useExisting: LOGGER_SERVICE,
      },
    ];
  }

  /**
   * Filters and builds enabled transports from configuration.
   *
   * This method handles the Laravel-style configuration where all transports
   * are defined declaratively. It filters only enabled transports and converts
   * them to the format expected by TransportFactoryService.
   *
   * @param options - The logger configuration options
   * @param factory - The transport factory service
   * @returns Array of instantiated transport instances
   */
  private static buildTransports(options: any, factory: TransportFactoryService): any[] {
    const transportsConfig = options.transports;

    // Handle new declarative config format (Laravel-style)
    if (
      transportsConfig &&
      typeof transportsConfig === 'object' &&
      !Array.isArray(transportsConfig)
    ) {
      const enabledTransports: any[] = [];

      // Filter and collect enabled transports
      Object.values(transportsConfig).forEach((transportConfig: any) => {
        if (transportConfig && transportConfig.enabled) {
          // Remove the 'enabled' property before passing to factory
          const { enabled, ...transportOptions } = transportConfig;
          enabledTransports.push(transportOptions);
        }
      });

      // Create transport instances
      return factory.createMultiple(enabledTransports);
    }

    // Handle legacy array format
    if (Array.isArray(transportsConfig)) {
      return factory.createMultiple(transportsConfig);
    }

    // No transports configured
    return [];
  }
}
