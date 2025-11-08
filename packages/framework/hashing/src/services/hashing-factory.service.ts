import { Injectable } from '@nestjs/common';
import { BaseFactory } from '@nesvel/shared';

import { HashAlgorithm } from '@enums';
import { UnsupportedAlgorithmException } from '@exceptions';
import type { IHashingDriver, IHashingConfig } from '@interfaces';
import { BcryptDriver, ArgonDriver, Argon2idDriver, ScryptDriver } from '@drivers';

/**
 * Factory service for creating and configuring Hashing driver instances.
 *
 * This service extends BaseFactory to provide a standardized factory pattern for
 * creating hashing driver instances. It manages the lifecycle and configuration of
 * various hashing algorithms including Bcrypt, Argon2, Argon2id, and Scrypt.
 *
 * Architecture:
 * - Extends BaseFactory with hashing-specific configuration handling
 * - Maintains a registry of available hashing algorithms
 * - Provides algorithm-specific validation and instantiation
 * - Supports custom driver registration at runtime
 *
 * Supported Algorithms:
 * - Bcrypt: Industry-standard password hashing with configurable rounds
 * - Argon2: Winner of Password Hashing Competition, memory-hard function
 * - Argon2id: Hybrid variant of Argon2 (recommended for password hashing)
 * - Scrypt: Memory-hard key derivation function
 *
 * Key Features:
 * - Automatic driver instantiation based on configuration
 * - Algorithm-specific option validation (rounds, memory, cost, etc.)
 * - Runtime driver registration for custom implementations
 * - Type-safe operations with full TypeScript support
 * - Detailed error messages with algorithm availability information
 *
 * @extends BaseFactory<IHashingConfig, IHashingDriver, Record<string, any>>
 *
 * @example
 * Basic usage with Argon2id (recommended):
 * ```typescript
 * const driver = hashingFactory.createDriver({
 *   driver: HashAlgorithm.ARGON2ID,
 *   argon2: {
 *     memory: 65536,    // 64 MB
 *     time: 3,          // 3 iterations
 *     parallelism: 4    // 4 parallel threads
 *   }
 * });
 *
 * const hash = await driver.make('password');
 * const isValid = await driver.check('password', hash);
 * ```
 *
 * @example
 * Using Bcrypt with custom rounds:
 * ```typescript
 * const driver = hashingFactory.createDriver({
 *   driver: HashAlgorithm.BCRYPT,
 *   bcrypt: {
 *     rounds: 12  // Higher rounds = slower but more secure
 *   }
 * });
 * ```
 *
 * @example
 * Registering a custom hashing driver:
 * ```typescript
 * class CustomHashingDriver implements IHashingDriver {
 *   async make(value: string): Promise<string> { ... }
 *   async check(value: string, hash: string): Promise<boolean> { ... }
 *   needsRehash(hash: string): boolean { ... }
 * }
 *
 * hashingFactory.registerDriver('custom', CustomHashingDriver);
 * const driver = hashingFactory.createDriver({ driver: 'custom' });
 * ```
 *
 * @see {@link BaseFactory} For base factory implementation
 * @see {@link IHashingDriver} For driver interface specification
 * @see {@link IHashingConfig} For configuration options
 *
 * @author Nesvel
 * @since 1.0.0
 */
@Injectable()
export class HashingFactoryService extends BaseFactory<
  IHashingConfig,
  IHashingDriver,
  Record<string, any>
> {
  /**
   * Registry of available hashing algorithm drivers.
   *
   * Maps algorithm identifiers to their corresponding driver classes.
   * This registry is used by BaseFactory to instantiate the appropriate
   * driver based on configuration.
   *
   * Available algorithms:
   * - BCRYPT: Industry-standard password hashing
   * - ARGON2: Memory-hard function (Password Hashing Competition winner)
   * - ARGON2ID: Hybrid variant (recommended for password hashing)
   * - SCRYPT: Memory-hard key derivation function
   *
   * @protected
   * @readonly
   */
  protected readonly driverRegistry = new Map<string, any>([
    [HashAlgorithm.BCRYPT, BcryptDriver],
    [HashAlgorithm.ARGON2, ArgonDriver],
    [HashAlgorithm.SCRYPT, ScryptDriver],
    [HashAlgorithm.ARGON2ID, Argon2idDriver],
  ]);

  /**
   * Extracts the algorithm type from configuration.
   *
   * This method determines which hashing algorithm should be used based on
   * the provided configuration. If no algorithm is specified, it defaults
   * to Argon2id, which is the recommended algorithm for password hashing
   * due to its resistance to GPU attacks and side-channel attacks.
   *
   * @param config - The hashing configuration object containing algorithm selection
   * @returns The algorithm identifier string (e.g., 'bcrypt', 'argon2id', 'scrypt')
   *
   * @protected
   * @override Implementation of BaseFactory abstract method
   *
   * @example
   * ```typescript
   * const algorithm = this.getDriverType({ driver: HashAlgorithm.BCRYPT });
   * // Returns: 'bcrypt'
   *
   * const defaultAlg = this.getDriverType({});
   * // Returns: 'argon2id' (default)
   * ```
   */
  protected getDriverType(config: IHashingConfig): string {
    return config.driver || HashAlgorithm.ARGON2ID;
  }

  /**
   * Gets algorithm-specific options from configuration.
   *
   * Extracts and returns the configuration options specific to the selected
   * hashing algorithm. Each algorithm has its own set of configurable parameters:
   *
   * - Bcrypt: rounds (4-31)
   * - Argon2/Argon2id: memory, time, parallelism
   * - Scrypt: cost, blockSize, parallelization
   *
   * @param config - The hashing module configuration containing algorithm-specific options
   * @returns Algorithm-specific configuration options, or undefined for custom drivers
   *
   * @protected
   * @override Implementation of BaseFactory abstract method
   *
   * @example
   * ```typescript
   * const options = this.getDriverOptions({
   *   driver: HashAlgorithm.BCRYPT,
   *   bcrypt: { rounds: 12 }
   * });
   * // Returns: { rounds: 12 }
   *
   * const argonOptions = this.getDriverOptions({
   *   driver: HashAlgorithm.ARGON2ID,
   *   argon2: { memory: 65536, time: 3, parallelism: 4 }
   * });
   * // Returns: { memory: 65536, time: 3, parallelism: 4 }
   * ```
   */
  protected getDriverOptions(config: IHashingConfig): Record<string, any> | undefined {
    /**
     * Determine which algorithm is being used to extract the correct
     * configuration options. Falls back to Argon2id if no algorithm specified.
     */
    const algorithm = this.getDriverType(config);

    switch (algorithm) {
      case HashAlgorithm.BCRYPT:
        /**
         * Bcrypt algorithm options.
         * Configuration includes: rounds (4-31)
         * Higher rounds = slower but more secure hashing
         */
        return config.bcrypt;
      case HashAlgorithm.ARGON2:
      case HashAlgorithm.ARGON2ID:
        /**
         * Argon2 and Argon2id algorithm options.
         * Configuration includes: memory (KB), time (iterations), parallelism (threads)
         * Argon2id is recommended for password hashing as it combines resistance
         * to both GPU attacks and side-channel attacks
         */
        return config.argon2;
      case HashAlgorithm.SCRYPT:
        /**
         * Scrypt algorithm options.
         * Configuration includes: cost, blockSize, parallelization
         * Memory-hard key derivation function
         */
        return config.scrypt;
      default:
        /**
         * Custom or unsupported algorithm.
         * Returns undefined for custom drivers that may not have
         * predefined configuration structure.
         */
        return undefined;
    }
  }

  /**
   * Instantiates a hashing driver with the provided options.
   *
   * Creates a new instance of the specified hashing driver class with the
   * algorithm-specific configuration options. Each driver implements the
   * IHashingDriver interface, providing make(), check(), and needsRehash() methods.
   *
   * @param DriverClass - The driver class constructor (BcryptDriver, ArgonDriver, etc.)
   * @param options - Algorithm-specific configuration options (rounds, memory, time, etc.)
   * @returns A fully configured hashing driver instance ready for use
   *
   * @protected
   * @override Implementation of BaseFactory abstract method
   *
   * @example
   * ```typescript
   * const driver = this.instantiateDriver(BcryptDriver, { rounds: 12 });
   * // Returns: BcryptDriver instance configured with 12 rounds
   *
   * const argon2Driver = this.instantiateDriver(Argon2idDriver, {
   *   memory: 65536,
   *   time: 3,
   *   parallelism: 4
   * });
   * // Returns: Argon2idDriver instance with custom parameters
   * ```
   */
  protected instantiateDriver(
    DriverClass: any,
    options: Record<string, any> | undefined
  ): IHashingDriver {
    return new DriverClass(options);
  }

  /**
   * Creates the appropriate error for unsupported algorithm.
   *
   * Generates a custom UnsupportedAlgorithmException when a requested hashing
   * algorithm is not found in the driver registry. This error provides helpful
   * information about the invalid algorithm and available alternatives.
   *
   * @param algorithm - The requested algorithm identifier that wasn't found in the registry
   * @returns An UnsupportedAlgorithmException instance with descriptive error message
   *
   * @protected
   * @override Implementation of BaseFactory abstract method
   *
   * @example
   * ```typescript
   * const error = this.getNotFoundError('unknown-algo');
   * // Returns: UnsupportedAlgorithmException with message:
   * // "Unsupported hashing algorithm: unknown-algo. Available: bcrypt, argon2, argon2id, scrypt"
   * ```
   */
  protected getNotFoundError(algorithm: string): Error {
    return new UnsupportedAlgorithmException(algorithm);
  }

  /**
   * Validates algorithm-specific configuration options.
   *
   * Performs comprehensive validation of algorithm-specific parameters to ensure
   * they meet the requirements of each hashing algorithm. This validation occurs
   * before driver instantiation to provide early error detection.
   *
   * Validation rules by algorithm:
   * - Bcrypt:
   *   - rounds: Must be a number between 4 and 31 (inclusive)
   *   - Higher rounds = slower but more secure
   *
   * - Argon2/Argon2id:
   *   - memory: Must be a number (KB of memory to use)
   *   - time: Must be a number (number of iterations)
   *   - parallelism: Must be a number (degree of parallelism)
   *
   * - Scrypt:
   *   - cost: Must be a number (CPU/memory cost parameter)
   *   - blockSize: Must be a number (block size parameter)
   *   - parallelization: Must be a number (parallelization parameter)
   *
   * Custom drivers skip validation and log a debug message.
   *
   * @param algorithm - The algorithm identifier to validate options for
   * @param options - The algorithm-specific configuration options to validate
   *
   * @throws {Error} If options contain invalid values (wrong type or out of range)
   *
   * @protected
   * @override Optional template method from BaseFactory
   *
   * @example
   * ```typescript
   * // Valid bcrypt options
   * this.validateDriverOptions('bcrypt', { rounds: 12 });
   * // No error thrown
   *
   * // Invalid bcrypt rounds (out of range)
   * this.validateDriverOptions('bcrypt', { rounds: 50 });
   * // Throws: Error: Bcrypt rounds must be between 4 and 31
   *
   * // Invalid argon2 memory type
   * this.validateDriverOptions('argon2id', { memory: '64MB' });
   * // Throws: Error: Argon2 memory must be a number
   * ```
   */
  protected validateDriverOptions(algorithm: string, options?: Record<string, any>): void {
    switch (algorithm) {
      case HashAlgorithm.BCRYPT:
        /**
         * Bcrypt validation:
         * - rounds: Must be a number between 4 and 31 (inclusive)
         * - Default is typically 10
         * - Each increment doubles hashing time (exponential complexity)
         */
        if (options && options.rounds !== undefined) {
          if (typeof options.rounds !== 'number') {
            throw new Error('Bcrypt rounds must be a number');
          }
          if (options.rounds < 4 || options.rounds > 31) {
            throw new Error('Bcrypt rounds must be between 4 and 31');
          }
        }
        break;

      case HashAlgorithm.ARGON2:
      case HashAlgorithm.ARGON2ID:
        /**
         * Argon2/Argon2id validation:
         * - memory: Must be a number (KB of memory to use)
         * - time: Must be a number (number of iterations)
         * - parallelism: Must be a number (degree of parallelism)
         * All parameters are optional; drivers provide sensible defaults
         */
        if (options) {
          if (options.memory !== undefined && typeof options.memory !== 'number') {
            throw new Error('Argon2 memory must be a number');
          }
          if (options.time !== undefined && typeof options.time !== 'number') {
            throw new Error('Argon2 time must be a number');
          }
          if (options.parallelism !== undefined && typeof options.parallelism !== 'number') {
            throw new Error('Argon2 parallelism must be a number');
          }
        }
        break;

      case HashAlgorithm.SCRYPT:
        /**
         * Scrypt validation:
         * - cost: Must be a number (CPU/memory cost parameter, power of 2)
         * - blockSize: Must be a number (block size parameter)
         * - parallelization: Must be a number (parallelization parameter)
         * All parameters are optional; driver provides sensible defaults
         */
        if (options) {
          if (options.cost !== undefined && typeof options.cost !== 'number') {
            throw new Error('Scrypt cost must be a number');
          }
          if (options.blockSize !== undefined && typeof options.blockSize !== 'number') {
            throw new Error('Scrypt blockSize must be a number');
          }
          if (
            options.parallelization !== undefined &&
            typeof options.parallelization !== 'number'
          ) {
            throw new Error('Scrypt parallelization must be a number');
          }
        }
        break;

      default:
        /**
         * Custom drivers skip validation.
         * Custom implementations are responsible for their own validation logic.
         */
        this.logger.debug(`Skipping validation for custom algorithm: ${algorithm}`);
    }
  }
}
