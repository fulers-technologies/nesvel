import { Injectable, Logger } from '@nestjs/common';
import type { IPubSubDriver } from '@interfaces/pubsub-driver.interface';
import type { IPubSubOptions } from '@interfaces/pubsub-options.interface';
import { PubSubDriverType } from '@enums/pubsub-driver-type.enum';
import { RedisPubSubDriver } from '@drivers/redis/redis-pubsub.driver';
import { KafkaPubSubDriver } from '@drivers/kafka/kafka-pubsub.driver';
import { GooglePubSubDriver } from '@drivers/google-pubsub/google-pubsub.driver';
import { DriverNotFoundException } from '@exceptions/driver-not-found.exception';

/**
 * Factory service for creating and configuring PubSub driver instances.
 *
 * This service is responsible for:
 * - Instantiating the appropriate driver based on configuration
 * - Validating driver options
 * - Providing a centralized point for driver creation
 * - Supporting custom driver implementations
 *
 * The factory pattern allows for flexible driver selection and makes it easy
 * to add new driver implementations without modifying existing code.
 */
@Injectable()
export class PubSubFactoryService {
  /**
   * Logger instance for factory operations.
   */
  private readonly logger = new Logger(PubSubFactoryService.name);

  /**
   * Registry of available driver constructors.
   * Maps driver type strings to their corresponding driver classes.
   */
  private readonly driverRegistry = new Map<string, any>([
    [PubSubDriverType.REDIS, RedisPubSubDriver],
    [PubSubDriverType.KAFKA, KafkaPubSubDriver],
    [PubSubDriverType.GOOGLE_PUBSUB, GooglePubSubDriver],
  ]);

  /**
   * Creates a driver instance based on the provided options.
   *
   * This method:
   * - Validates the driver type
   * - Retrieves the appropriate driver class from the registry
   * - Instantiates the driver with the provided options
   * - Returns the configured driver instance
   *
   * @param options - The PubSub module configuration options
   * @returns A configured driver instance
   *
   * @throws {Error} If the driver type is not supported or instantiation fails
   *
   * @example
   * ```typescript
   * const driver = factory.createDriver({
   *   driver: 'redis',
   *   driverOptions: { host: 'localhost', port: 6379 }
   * });
   * ```
   */
  createDriver(options: IPubSubOptions): IPubSubDriver {
    const driverType = options.driver;

    // Validate driver type
    if (!this.driverRegistry.has(driverType)) {
      const availableDrivers = Array.from(this.driverRegistry.keys());
      throw new DriverNotFoundException(driverType, availableDrivers);
    }

    try {
      // Get driver class from registry
      const DriverClass = this.driverRegistry.get(driverType);

      // Get driver-specific options (new pattern first, fallback to legacy driverOptions)
      const driverOptions = this.getDriverOptions(options);

      // Instantiate driver with options
      const driver = DriverClass.make(driverOptions);

      this.logger.log(`Created ${driverType} driver instance`);

      return driver;
    } catch (error: Error | any) {
      this.logger.error(`Failed to create ${driverType} driver:`, error);
      throw error;
    }
  }

  /**
   * Registers a custom driver implementation.
   *
   * This method allows applications to register their own driver implementations,
   * extending the built-in driver support. The custom driver must implement
   * the IPubSubDriver interface and provide a static make() method.
   *
   * @param driverType - The unique identifier for the custom driver
   * @param driverClass - The driver class constructor
   *
   * @example
   * ```typescript
   * class CustomPubSubDriver implements IPubSubDriver {
   *   static make(options: any) {
   *     return new CustomPubSubDriver(options);
   *   }
   *   // ... implement interface methods
   * }
   *
   * factory.registerDriver('custom', CustomPubSubDriver);
   * ```
   */
  registerDriver(driverType: string, driverClass: any): void {
    if (this.driverRegistry.has(driverType)) {
      this.logger.warn(`Driver type ${driverType} is already registered. Overwriting...`);
    }

    // Validate that the driver class has a make method
    if (typeof driverClass.make !== 'function') {
      throw new Error(`Driver class for ${driverType} must have a static make() method`);
    }

    this.driverRegistry.set(driverType, driverClass);
    this.logger.log(`Registered custom driver: ${driverType}`);
  }

  /**
   * Checks if a driver type is registered.
   *
   * This method can be used to verify if a driver is available before
   * attempting to create it.
   *
   * @param driverType - The driver type to check
   * @returns true if the driver is registered, false otherwise
   *
   * @example
   * ```typescript
   * if (factory.hasDriver('redis')) {
   *   const driver = factory.createDriver({ driver: 'redis', ... });
   * }
   * ```
   */
  hasDriver(driverType: string): boolean {
    return this.driverRegistry.has(driverType);
  }

  /**
   * Gets the list of all registered driver types.
   *
   * This method returns an array of driver type identifiers that are
   * currently available for use.
   *
   * @returns An array of registered driver type strings
   *
   * @example
   * ```typescript
   * const drivers = factory.getAvailableDrivers();
   * console.log('Available drivers:', drivers);
   * // Output: ['redis', 'kafka', 'google-pubsub']
   * ```
   */
  getAvailableDrivers(): string[] {
    return Array.from(this.driverRegistry.keys());
  }

  /**
   * Validates PubSub options before driver creation.
   *
   * This method performs validation checks on the provided options to ensure
   * they meet the minimum requirements for driver creation.
   *
   * @param options - The options to validate
   * @throws {Error} If the options are invalid
   *
   * @example
   * ```typescript
   * try {
   *   factory.validateOptions(options);
   *   const driver = factory.createDriver(options);
   * } catch (error: Error | any) {
   *   console.error('Invalid options:', error);
   * }
   * ```
   */
  validateOptions(options: IPubSubOptions): void {
    if (!options) {
      throw new Error('PubSub options are required');
    }

    if (!options.driver) {
      throw new Error('Driver type is required in PubSub options');
    }

    if (typeof options.driver !== 'string') {
      throw new Error('Driver type must be a string');
    }

    // Driver-specific validation can be added here
    const driverOptions = this.getDriverOptions(options);
    this.validateDriverOptions(options.driver, driverOptions);
  }

  /**
   * Gets driver-specific options from configuration.
   *
   * This method supports both the new pattern (specific driver properties)
   * and the legacy pattern (driverOptions property) for backward compatibility.
   *
   * @param options - The PubSub module configuration options
   * @returns Driver-specific options
   */
  private getDriverOptions(options: IPubSubOptions): Record<string, any> {
    switch (options.driver) {
      case PubSubDriverType.REDIS:
        return options.redis || options.driverOptions || {};
      case PubSubDriverType.KAFKA:
        return options.kafka || options.driverOptions || {};
      case PubSubDriverType.GOOGLE_PUBSUB:
        return options.googlePubSub || options.driverOptions || {};
      default:
        return options.driverOptions || {};
    }
  }

  /**
   * Validates driver-specific options.
   *
   * This method performs validation checks specific to each driver type,
   * ensuring that required options are provided and have valid values.
   *
   * @param driverType - The driver type
   * @param driverOptions - The driver-specific options
   * @throws {Error} If the driver options are invalid
   */
  private validateDriverOptions(driverType: string, driverOptions?: Record<string, any>): void {
    switch (driverType) {
      case PubSubDriverType.REDIS:
        // Redis validation is lenient as it has sensible defaults
        break;

      case PubSubDriverType.KAFKA:
        if (!driverOptions) {
          throw new Error('Kafka driver requires driverOptions');
        }
        if (!driverOptions.clientId) {
          throw new Error('Kafka driver requires clientId in driverOptions');
        }
        if (!driverOptions.brokers || !Array.isArray(driverOptions.brokers)) {
          throw new Error('Kafka driver requires brokers array in driverOptions');
        }
        if (driverOptions.brokers.length === 0) {
          throw new Error('Kafka driver requires at least one broker');
        }
        break;

      case PubSubDriverType.GOOGLE_PUBSUB:
        if (!driverOptions) {
          throw new Error('Google PubSub driver requires driverOptions');
        }
        if (!driverOptions.projectId) {
          throw new Error('Google PubSub driver requires projectId in driverOptions');
        }
        break;

      default:
        // For custom drivers, skip validation
        this.logger.debug(`Skipping validation for custom driver: ${driverType}`);
    }
  }
}
