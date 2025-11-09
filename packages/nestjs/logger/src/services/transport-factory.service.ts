import { Injectable } from '@nestjs/common';
import { BaseFactory } from '@nesvel/shared';

import { HttpTransport } from '@transports/http.transport';
import { FileTransport } from '@transports/file.transport';
import { TransportType } from '@enums/transport-type.enum';
import type { ITransport, LoggerConfig } from '@interfaces';
import { SlackTransport } from '@transports/slack.transport';
import { ConsoleTransport } from '@transports/console.transport';
import { CloudWatchTransport } from '@transports/cloudwatch.transport';
import { DailyRotateTransport } from '@transports/daily-rotate.transport';
import { TransportNotFoundException } from '@exceptions/transport-not-found.exception';

/**
 * Factory service for creating and configuring Transport instances.
 *
 * This service extends BaseFactory to provide a standardized factory pattern for
 * creating logger transport instances. It manages the lifecycle and configuration
 * of various logging backends including Console, File, Daily Rotate, CloudWatch,
 * Slack, and HTTP transports.
 *
 * Architecture:
 * - Extends BaseFactory with transport-specific configuration handling
 * - Maintains a registry of available transport drivers
 * - Provides transport-specific validation and instantiation
 * - Enables custom transport registration at runtime
 *
 * Supported Transports:
 * - Console: Pretty-printed, colorized output for development
 * - File: JSON logs to file with size-based rotation
 * - Daily: Date-based log file rotation (winston-daily-rotate-file)
 * - CloudWatch: AWS CloudWatch Logs integration
 * - Slack: Slack webhook notifications for errors
 * - HTTP: Send logs to HTTP endpoints
 * - Custom: User-defined transport implementations
 *
 * Key Features:
 * - Automatic transport instantiation
 * - Transport-specific option validation
 * - Runtime transport registration for custom implementations
 * - Type-safe operations with full TypeScript support
 * - Comprehensive error handling with available transports information
 *
 * @extends BaseFactory<LoggerConfig, ITransport, Record<string, any>>
 *
 * @example
 * Basic usage with Console transport:
 * ```typescript
 * const transport = transportFactory.createDriver({
 *   type: TransportType.CONSOLE,
 *   level: LogLevel.DEBUG,
 *   colorize: true,
 *   format: 'pretty'
 * });
 *
 * logger.addTransport(transport);
 * ```
 *
 * @example
 * Using File transport:
 * ```typescript
 * const transport = transportFactory.createDriver({
 *   type: TransportType.FILE,
 *   level: LogLevel.INFO,
 *   filename: './logs/app.log',
 *   maxsize: 5242880,
 *   maxFiles: 5
 * });
 * ```
 *
 * @example
 * Registering a custom transport:
 * ```typescript
 * class CustomTransport implements ITransport {
 *   log(level: string, message: string, context?: any): void { ... }
 *   async flush(): Promise<void> { ... }
 *   async close(): Promise<void> { ... }
 * }
 *
 * transportFactory.registerDriver('custom', CustomTransport);
 * ```
 *
 * @see {@link BaseFactory} For base factory implementation
 * @see {@link ITransport} For transport interface specification
 * @see {@link LoggerConfig} For configuration options
 *
 * @author Nesvel
 * @since 1.0.0
 */
@Injectable()
export class TransportFactoryService extends BaseFactory<
  LoggerConfig,
  ITransport,
  Record<string, any>
> {
  /**
   * Registry of available transport drivers.
   *
   * Maps transport type identifiers to their corresponding transport classes.
   * This registry is used by BaseFactory to instantiate the appropriate
   * transport based on configuration.
   *
   * Available transports:
   * - CONSOLE: Pretty-printed, colorized console output
   * - FILE: JSON logs to file with size-based rotation
   * - DAILY: Date-based log file rotation (future)
   * - CLOUDWATCH: AWS CloudWatch Logs (future)
   * - SLACK: Slack webhook notifications (future)
   * - HTTP: HTTP endpoint logging (future)
   * - CUSTOM: User-defined transport implementations
   *
   * @protected
   * @readonly
   */
  protected readonly driverRegistry = new Map<string, any>([
    [TransportType.FILE, FileTransport],
    [TransportType.HTTP, HttpTransport],
    [TransportType.SLACK, SlackTransport],
    [TransportType.CONSOLE, ConsoleTransport],
    [TransportType.DAILY, DailyRotateTransport],
    [TransportType.CLOUDWATCH, CloudWatchTransport],
  ]);

  /**
   * Extracts the transport type from configuration.
   *
   * Determines which transport driver should be used based on the provided
   * configuration. The transport type determines the logging backend
   * (Console, File, CloudWatch, etc.).
   *
   * @param options - The transport configuration object containing type selection
   * @returns The transport type identifier (e.g., 'console', 'file', 'daily')
   *
   * @protected
   * @override Implementation of BaseFactory abstract method
   *
   * @example
   * ```typescript
   * const type = this.getDriverType({ type: TransportType.CONSOLE });
   * // Returns: 'console'
   *
   * const fileType = this.getDriverType({ type: TransportType.FILE });
   * // Returns: 'file'
   * ```
   */
  protected getDriverType(options: LoggerConfig): string {
    return options.transporter;
  }

  /**
   * Gets transport-specific configuration options.
   *
   * Extracts and returns the configuration options for the transport.
   * Since LoggerConfig is a union type with all transport-specific
   * options, we just return the entire options object.
   *
   * @param options - The transport configuration containing all options
   * @returns Transport-specific configuration options
   *
   * @protected
   * @override Implementation of BaseFactory abstract method
   *
   * @example
   * ```typescript
   * const opts = this.getDriverOptions({
   *   type: TransportType.CONSOLE,
   *   level: LogLevel.DEBUG,
   *   colorize: true
   * });
   * // Returns: { type: 'console', level: 'debug', colorize: true }
   * ```
   */
  protected getDriverOptions(options: LoggerConfig): Record<string, any> {
    return options;
  }

  /**
   * Instantiates a transport with the provided options.
   *
   * Creates a new instance of the specified transport class, passing
   * the transport-specific configuration. All transports are instantiated
   * using their constructor with the full options object.
   *
   * @param TransportClass - The transport class constructor
   * @param driverOptions - Transport-specific configuration
   * @param config - Full transport configuration
   * @returns A fully configured transport instance
   *
   * @protected
   * @override Implementation of BaseFactory abstract method
   *
   * @example
   * ```typescript
   * const transport = this.instantiateDriver(
   *   ConsoleTransport,
   *   { type: 'console', level: 'debug', colorize: true },
   *   { type: TransportType.CONSOLE, level: 'debug', colorize: true }
   * );
   * // Returns: ConsoleTransport instance
   * ```
   */
  protected instantiateDriver(
    TransportClass: any,
    driverOptions: Record<string, any> | undefined,
    config: LoggerConfig
  ): ITransport {
    return new TransportClass(driverOptions || config);
  }

  /**
   * Creates the appropriate error for unsupported transport.
   *
   * Generates a custom TransportNotFoundException when a requested transport
   * is not found in the driver registry. This error provides helpful information
   * about the invalid transport and lists all available transports.
   *
   * @param driverType - The requested transport identifier that wasn't found
   * @param availableDrivers - List of all available transport types
   * @returns A TransportNotFoundException instance with descriptive error message
   *
   * @protected
   * @override Implementation of BaseFactory abstract method
   *
   * @example
   * ```typescript
   * const error = this.getNotFoundError('unknown-transport', ['console', 'file']);
   * // Returns: TransportNotFoundException with message:
   * // "Transport 'unknown-transport' not found. Available transports: console, file"
   * ```
   */
  protected getNotFoundError(driverType: string, availableDrivers: string[]): Error {
    return TransportNotFoundException.make(driverType, availableDrivers);
  }

  /**
   * Validates transport-specific configuration options.
   *
   * Performs validation of transport-specific parameters to ensure they meet
   * the requirements of each transport. This validation occurs before transport
   * instantiation to provide early error detection.
   *
   * Validation rules by transport:
   * - Console: No required options (uses sensible defaults)
   * - File:
   *   - filename: Required string (path to log file)
   * - Daily (future):
   *   - filename: Required string with %DATE% placeholder
   * - CloudWatch (future):
   *   - logGroupName: Required string
   *   - logStreamName: Required string
   * - Slack (future):
   *   - webhookUrl: Required string
   * - HTTP (future):
   *   - host or url: Required
   *
   * Custom transports skip validation and log a debug message.
   *
   * @param driverType - The transport type identifier to validate options for
   * @param driverOptions - The transport-specific configuration options to validate
   *
   * @throws {Error} If required options are missing or invalid
   *
   * @protected
   * @override Optional template method from BaseFactory
   *
   * @example
   * ```typescript
   * // Valid File options
   * this.validateDriverOptions('file', {
   *   type: TransportType.FILE,
   *   filename: './logs/app.log'
   * });
   * // No error thrown
   *
   * // Invalid File options (missing filename)
   * this.validateDriverOptions('file', { type: TransportType.FILE });
   * // Throws: Error: File transport requires filename
   * ```
   */
  protected validateDriverOptions(driverType: string, driverOptions?: Record<string, any>): void {
    switch (driverType) {
      case TransportType.CONSOLE:
        // Console transport validation is lenient as it has sensible defaults
        break;

      case TransportType.FILE:
        if (!driverOptions || !driverOptions.filename) {
          throw new Error('File transport requires filename option');
        }
        break;

      case TransportType.DAILY:
        if (!driverOptions || !driverOptions.filename) {
          throw new Error(
            'Daily rotate transport requires filename option with %DATE% placeholder'
          );
        }
        break;

      case TransportType.CLOUDWATCH:
        if (!driverOptions) {
          throw new Error('CloudWatch transport requires driverOptions');
        }
        if (!driverOptions.logGroupName) {
          throw new Error('CloudWatch transport requires logGroupName');
        }
        if (!driverOptions.logStreamName) {
          throw new Error('CloudWatch transport requires logStreamName');
        }
        break;

      case TransportType.SLACK:
        if (!driverOptions || !driverOptions.webhookUrl) {
          throw new Error('Slack transport requires webhookUrl option');
        }
        break;

      case TransportType.HTTP:
        if (!driverOptions || (!driverOptions.host && !driverOptions.url)) {
          throw new Error('HTTP transport requires host or url option');
        }
        break;

      case TransportType.CUSTOM:
        if (!driverOptions || !driverOptions.transport) {
          throw new Error('Custom transport requires a transport instance');
        }
        break;

      default:
        // For custom drivers registered at runtime, skip validation
        this.logger.debug(`Skipping validation for custom transport: ${driverType}`);
    }
  }

  /**
   * Creates a transport instance (alias for createDriver for interface compatibility).
   *
   * This method provides compatibility with the ITransportFactory interface
   * while delegating to the BaseFactory's createDriver method.
   *
   * @param options - Transport configuration options
   * @returns Configured transport instance
   *
   * @example
   * ```typescript
   * const transport = factory.create({
   *   type: TransportType.CONSOLE,
   *   level: LogLevel.DEBUG,
   *   colorize: true
   * });
   * ```
   */
  create(options: LoggerConfig): ITransport {
    return this.createDriver(options);
  }

  /**
   * Creates multiple transport instances from an array of options.
   *
   * This is a convenience method for creating multiple transports at once.
   * It's useful when configuring a logger with multiple destinations.
   *
   * @param optionsArray - Array of transport configuration options
   * @returns Array of configured transport instances
   *
   * @example
   * ```typescript
   * const transports = factory.createMultiple([
   *   { type: TransportType.CONSOLE, level: LogLevel.DEBUG },
   *   { type: TransportType.FILE, filename: './logs/app.log', level: LogLevel.INFO }
   * ]);
   *
   * logger.addTransports(transports);
   * ```
   */
  createMultiple(optionsArray: LoggerConfig[]): ITransport[] {
    return optionsArray.map((options) => this.create(options));
  }
}
