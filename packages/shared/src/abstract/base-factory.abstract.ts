import { Logger } from '@nestjs/common';

/**
 * Abstract Base Factory Class
 *
 * Provides a standardized factory pattern implementation for creating and managing
 * driver/provider instances across different packages. This abstract class eliminates
 * code duplication and ensures consistent behavior for all factory services.
 *
 * Key Features:
 * - Driver/Provider registry with Map-based storage
 * - Dynamic driver instantiation based on configuration
 * - Custom driver registration support
 * - Built-in validation and error handling
 * - Comprehensive logging for all operations
 * - Type-safe operations with full TypeScript support
 *
 * Architecture:
 * - Factory Pattern: Centralized creation logic for drivers/providers
 * - Registry Pattern: Extensible driver registration system
 * - Template Method Pattern: Abstract methods for customization
 *
 * @template TConfig - The configuration type for driver creation
 * @template TDriver - The driver/provider interface type
 * @template TOptions - The driver-specific options type
 *
 * @example
 * ```typescript
 * @Injectable()
 * export class HashingFactoryService extends BaseFactory<
 *   IHashingConfig,
 *   IHashingDriver,
 *   Record<string, any>
 * > {
 *   protected readonly driverRegistry = new Map([
 *     [HashAlgorithm.BCRYPT, BcryptDriver],
 *     [HashAlgorithm.ARGON2ID, Argon2idDriver],
 *   ]);
 *
 *   protected getDriverType(config: IHashingConfig): string {
 *     return config.driver || HashAlgorithm.ARGON2ID;
 *   }
 *
 *   protected getDriverOptions(config: IHashingConfig): Record<string, any> | undefined {
 *     const algorithm = this.getDriverType(config);
 *     return algorithm === HashAlgorithm.BCRYPT ? config.bcrypt : config.argon2;
 *   }
 *
 *   protected instantiateDriver(
 *     DriverClass: any,
 *     options: Record<string, any> | undefined
 *   ): IHashingDriver {
 *     return new DriverClass(options);
 *   }
 *
 *   protected getNotFoundError(driverType: string): Error {
 *     return new UnsupportedAlgorithmException(driverType);
 *   }
 * }
 * ```
 *
 * @author Nesvel
 * @since 1.0.0
 */
export abstract class BaseFactory<TConfig, TDriver, TOptions = any> {
  /**
   * Logger instance for factory operations.
   *
   * Automatically configured with the factory class name as context.
   * Uses NestJS Logger which supports different log levels and can be
   * configured for different environments (development, production, etc.)
   *
   * @protected
   * @readonly
   */
  protected readonly logger = new Logger(this.constructor.name);

  /**
   * Registry of available driver/provider constructors.
   *
   * Maps driver type strings to their corresponding driver classes.
   * This registry can be extended at runtime using registerDriver().
   * Must be initialized in the subclass.
   *
   * @protected
   * @readonly
   * @abstract
   *
   * @example
   * ```typescript
   * export class MailFactoryService extends BaseFactory<...> {
   *   protected readonly driverRegistry = new Map([
   *     [MailTransportType.SMTP, SMTPProvider],
   *     [MailTransportType.SES, SESProvider],
   *   ]);
   * }
   * ```
   */
  protected abstract readonly driverRegistry: Map<string, any>;

  /**
   * Creates a driver instance based on the provided configuration.
   *
   * This method:
   * - Extracts the driver type from configuration
   * - Validates the driver type exists in registry
   * - Retrieves the appropriate driver class
   * - Gets driver-specific options
   * - Instantiates the driver
   * - Returns the configured driver instance
   *
   * @param config - The configuration object
   * @returns A configured driver instance
   *
   * @throws {Error} If the driver type is not supported or instantiation fails
   *
   * @example
   * ```typescript
   * const driver = factory.createDriver({
   *   driver: 'bcrypt',
   *   bcrypt: { rounds: 10 }
   * });
   * ```
   */
  createDriver(config: TConfig): TDriver {
    const driverType = this.getDriverType(config);

    // Validate driver type
    if (!this.driverRegistry.has(driverType)) {
      const availableDrivers = Array.from(this.driverRegistry.keys());
      throw this.getNotFoundError(driverType, availableDrivers);
    }

    try {
      // Get driver class from registry
      const DriverClass = this.driverRegistry.get(driverType);

      // Get driver-specific options
      const driverOptions = this.getDriverOptions(config);

      // Instantiate driver with options
      const driver = this.instantiateDriver(DriverClass, driverOptions, config);

      this.logger.log(`Created ${driverType} driver instance`, {
        driverType,
        hasOptions: !!driverOptions,
      });

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
   * the required interface.
   *
   * @param driverType - The unique identifier for the custom driver
   * @param driverClass - The driver class constructor
   * @param validateMethod - Optional method name to validate (default: none)
   *
   * @example
   * ```typescript
   * class CustomDriver implements IDriver {
   *   async make(value: string) { ... }
   *   async check(value: string, hashed: string) { ... }
   * }
   *
   * factory.registerDriver('custom', CustomDriver, 'make');
   * ```
   */
  registerDriver(driverType: string, driverClass: any, validateMethod?: string): void {
    if (this.driverRegistry.has(driverType)) {
      this.logger.warn(`Driver type ${driverType} is already registered. Overwriting...`);
    }

    // Optional validation of driver class
    if (validateMethod) {
      this.validateDriverClass(driverType, driverClass, validateMethod);
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
   * if (factory.hasDriver('bcrypt')) {
   *   const driver = factory.createDriver({ driver: 'bcrypt', ... });
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
   * // Output: ['bcrypt', 'argon2id']
   * ```
   */
  getAvailableDrivers(): string[] {
    return Array.from(this.driverRegistry.keys());
  }

  /**
   * Validates configuration before driver creation.
   *
   * This method performs basic validation checks on the provided configuration.
   * Subclasses can override this method to add custom validation logic.
   *
   * @param config - The configuration to validate
   * @throws {Error} If the configuration is invalid
   *
   * @example
   * ```typescript
   * try {
   *   factory.validateConfig(config);
   *   const driver = factory.createDriver(config);
   * } catch (error: Error | any) {
   *   console.error('Invalid configuration:', error);
   * }
   * ```
   */
  validateConfig(config: TConfig): void {
    if (!config) {
      throw new Error('Configuration is required');
    }

    const driverType = this.getDriverType(config);

    if (!driverType) {
      throw new Error('Driver type is required in configuration');
    }

    if (typeof driverType !== 'string') {
      throw new Error('Driver type must be a string');
    }

    // Validate driver-specific options
    const driverOptions = this.getDriverOptions(config);
    this.validateDriverOptions(driverType, driverOptions, config);
  }

  // ============================================================================
  // ABSTRACT METHODS - Must be implemented by subclasses
  // ============================================================================

  /**
   * Extracts the driver type from configuration.
   *
   * Subclasses must implement this method to specify how to extract
   * the driver type identifier from their specific configuration object.
   *
   * @param config - The configuration object
   * @returns The driver type identifier
   *
   * @abstract
   *
   * @example
   * ```typescript
   * protected getDriverType(config: IHashingConfig): string {
   *   return config.driver || HashAlgorithm.ARGON2ID;
   * }
   * ```
   */
  protected abstract getDriverType(config: TConfig): string;

  /**
   * Extracts driver-specific options from configuration.
   *
   * Subclasses must implement this method to specify how to extract
   * the options specific to each driver type.
   *
   * @param config - The configuration object
   * @returns Driver-specific options or undefined
   *
   * @abstract
   *
   * @example
   * ```typescript
   * protected getDriverOptions(config: IMailConfig): any {
   *   switch (config.transporter) {
   *     case MailTransportType.SMTP:
   *       return config.smtp;
   *     case MailTransportType.SES:
   *       return config.ses;
   *     default:
   *       return undefined;
   *   }
   * }
   * ```
   */
  protected abstract getDriverOptions(config: TConfig): TOptions | undefined;

  /**
   * Instantiates a driver with the provided options.
   *
   * Subclasses must implement this method to specify how to instantiate
   * their specific driver types. This can vary from simple constructor calls
   * to complex factory methods.
   *
   * @param DriverClass - The driver class constructor
   * @param options - Driver-specific options
   * @param config - The full configuration object (for additional context)
   * @returns A configured driver instance
   *
   * @abstract
   *
   * @example
   * ```typescript
   * // Simple constructor instantiation
   * protected instantiateDriver(
   *   DriverClass: any,
   *   options: Record<string, any> | undefined
   * ): IHashingDriver {
   *   return new DriverClass(options);
   * }
   *
   * // Using static factory method
   * protected instantiateDriver(
   *   DriverClass: any,
   *   options: any,
   *   config: IPubSubOptions
   * ): IPubSubDriver {
   *   return DriverClass.make(options, config.baseOptions);
   * }
   * ```
   */
  protected abstract instantiateDriver(
    DriverClass: any,
    options: TOptions | undefined,
    config: TConfig,
  ): TDriver;

  /**
   * Creates the appropriate error for driver not found scenarios.
   *
   * Subclasses must implement this method to return their specific
   * exception type when a driver is not found.
   *
   * @param driverType - The requested driver type that wasn't found
   * @param availableDrivers - List of available driver types
   * @returns An Error instance to be thrown
   *
   * @abstract
   *
   * @example
   * ```typescript
   * protected getNotFoundError(
   *   driverType: string,
   *   availableDrivers: string[]
   * ): Error {
   *   return new UnsupportedAlgorithmException(driverType);
   * }
   * ```
   */
  protected abstract getNotFoundError(driverType: string, availableDrivers: string[]): Error;

  // ============================================================================
  // OPTIONAL TEMPLATE METHODS - Can be overridden by subclasses
  // ============================================================================

  /**
   * Validates driver-specific options.
   *
   * Subclasses can override this method to add validation logic specific
   * to each driver type. The default implementation does nothing.
   *
   * @param driverType - The driver type
   * @param options - The driver-specific options
   * @param config - The full configuration object
   * @throws {Error} If the options are invalid
   *
   * @protected
   *
   * @example
   * ```typescript
   * protected validateDriverOptions(
   *   driverType: string,
   *   options?: Record<string, any>,
   *   config?: IHashingConfig
   * ): void {
   *   if (driverType === 'bcrypt' && options?.rounds) {
   *     if (options.rounds < 4 || options.rounds > 31) {
   *       throw new Error('Bcrypt rounds must be between 4 and 31');
   *     }
   *   }
   * }
   * ```
   */
  protected validateDriverOptions(driverType: string, options?: TOptions, config?: TConfig): void {
    // Default implementation does nothing
    // Subclasses can override to add validation logic
  }

  /**
   * Validates the driver class has required methods.
   *
   * This method is called when registering custom drivers to ensure
   * they implement the required interface methods.
   *
   * @param driverType - The driver type being registered
   * @param driverClass - The driver class constructor
   * @param methodName - The method name to validate
   * @throws {Error} If validation fails
   *
   * @protected
   */
  protected validateDriverClass(driverType: string, driverClass: any, methodName: string): void {
    // Check if it's a static method
    if (typeof driverClass[methodName] === 'function') {
      return; // Static method exists
    }

    // Check if it's an instance method
    try {
      const instance = new driverClass({});
      if (typeof instance[methodName] !== 'function') {
        throw new Error(
          `Driver class for ${driverType} must have a ${methodName}() method (static or instance)`,
        );
      }
    } catch (error: Error | any) {
      throw new Error(
        `Driver class for ${driverType} validation failed: ${error.message || error}`,
      );
    }
  }
}
