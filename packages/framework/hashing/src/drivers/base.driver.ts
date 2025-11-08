import { HashInfo } from '@types';
import { HashAlgorithm } from '@enums';
import { IHashingDriver } from '@interfaces';

/**
 * Base Hashing Driver
 *
 * Abstract base class that all hashing drivers extend.
 * Provides common functionality and enforces the driver contract.
 *
 * @abstract
 * @class BaseHashingDriver
 */
export abstract class BaseHashingDriver implements IHashingDriver {
  /**
   * The algorithm this driver implements
   */
  protected abstract readonly algorithm: HashAlgorithm;

  /**
   * Hash a value
   *
   * @param value - The value to hash
   * @param options - Algorithm-specific options
   * @returns The hashed value
   */
  abstract make(value: string, options?: Record<string, any>): Promise<string>;

  /**
   * Verify a plain value against a hash
   *
   * @param value - The plain value
   * @param hashedValue - The hashed value
   * @param options - Algorithm-specific options
   * @returns True if the value matches the hash
   */
  abstract check(
    value: string,
    hashedValue: string,
    options?: Record<string, any>
  ): Promise<boolean>;

  /**
   * Check if a hash needs to be rehashed
   *
   * @param hashedValue - The hashed value
   * @param options - Current algorithm options to compare against
   * @returns True if the hash should be regenerated
   */
  abstract needsRehash(hashedValue: string, options?: Record<string, any>): Promise<boolean>;

  /**
   * Get information about a hashed value
   *
   * @param hashedValue - The hashed value
   * @returns Metadata about the hash
   */
  abstract info(hashedValue: string): Promise<HashInfo>;

  /**
   * Validate input value
   *
   * @param value - The value to validate
   * @throws Error if value is invalid
   * @protected
   */
  protected validateInput(value: string): void {
    if (typeof value !== 'string') {
      throw new Error('Value must be a string');
    }

    if (value.length === 0) {
      throw new Error('Value cannot be empty');
    }
  }
}
