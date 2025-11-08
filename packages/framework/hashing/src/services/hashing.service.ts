import { Injectable, Inject } from '@nestjs/common';

import type { HashInfo } from '@types';
import { HASHING_DRIVER } from '@constants';
import type { IHashingDriver } from '@interfaces';

/**
 * Hashing Service
 *
 * Main service for hashing and verifying values.
 * Provides a consistent API regardless of the underlying driver.
 *
 * @class HashingService
 */
@Injectable()
export class HashingService {
  constructor(
    @Inject(HASHING_DRIVER)
    private readonly driver: IHashingDriver
  ) {}

  /**
   * Hash a value
   *
   * @param value - The value to hash
   * @param options - Algorithm-specific options
   * @returns The hashed value
   */
  async make(value: string, options?: Record<string, any>): Promise<string> {
    return this.driver.make(value, options);
  }

  /**
   * Verify a plain value against a hash
   *
   * @param value - The plain value
   * @param hashedValue - The hashed value
   * @param options - Algorithm-specific options
   * @returns True if the value matches the hash
   */
  async check(value: string, hashedValue: string, options?: Record<string, any>): Promise<boolean> {
    return this.driver.check(value, hashedValue, options);
  }

  /**
   * Check if a hash needs to be rehashed
   *
   * @param hashedValue - The hashed value
   * @param options - Current algorithm options to compare against
   * @returns True if the hash should be regenerated
   */
  async needsRehash(hashedValue: string, options?: Record<string, any>): Promise<boolean> {
    return this.driver.needsRehash(hashedValue, options);
  }

  /**
   * Get information about a hashed value
   *
   * @param hashedValue - The hashed value
   * @returns Metadata about the hash
   */
  async info(hashedValue: string): Promise<HashInfo> {
    return this.driver.info(hashedValue);
  }

  /**
   * Check if a value is already hashed
   *
   * @param value - The value to check
   * @returns True if the value appears to be hashed
   */
  async isHashed(value: string): Promise<boolean> {
    const info = await this.info(value);
    return info.valid && info.algorithm !== null;
  }
}
