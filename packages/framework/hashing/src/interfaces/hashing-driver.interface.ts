import { HashInfo } from '@types';

/**
 * Hashing Driver Interface
 *
 * Contract that all hashing drivers must implement.
 * Provides a consistent API across different hashing algorithms.
 *
 * @interface IHashingDriver
 */
export interface IHashingDriver {
  /**
   * Hash a value
   *
   * @param value - The value to hash
   * @param options - Algorithm-specific options
   * @returns The hashed value
   */
  make(value: string, options?: Record<string, any>): Promise<string>;

  /**
   * Verify a plain value against a hash
   *
   * @param value - The plain value
   * @param hashedValue - The hashed value
   * @param options - Algorithm-specific options
   * @returns True if the value matches the hash
   */
  check(value: string, hashedValue: string, options?: Record<string, any>): Promise<boolean>;

  /**
   * Check if a hash needs to be rehashed
   *
   * Useful when algorithm parameters change or you want to upgrade
   * from one algorithm to another.
   *
   * @param hashedValue - The hashed value
   * @param options - Current algorithm options to compare against
   * @returns True if the hash should be regenerated
   */
  needsRehash(hashedValue: string, options?: Record<string, any>): Promise<boolean>;

  /**
   * Get information about a hashed value
   *
   * @param hashedValue - The hashed value
   * @returns Metadata about the hash
   */
  info(hashedValue: string): Promise<HashInfo>;
}
