import * as argon2 from 'argon2';
import { Injectable } from '@nestjs/common';

import type { HashInfo } from '@types';
import { HashAlgorithm } from '@enums';
import { HashingException } from '@exceptions';
import type { Argon2Config } from '@interfaces';
import { BaseHashingDriver } from './base.driver';
import { DEFAULT_ARGON2_MEMORY, DEFAULT_ARGON2_TIME, DEFAULT_ARGON2_PARALLELISM } from '@constants';

/**
 * Argon2i Hashing Driver
 *
 * Password hashing using Argon2i algorithm (optimized for side-channel resistance).
 *
 * **Features**:
 * - Optimized for side-channel attack resistance
 * - Data-independent memory access
 * - Slower than Argon2d but more secure against timing attacks
 * - Winner of the Password Hashing Competition (2015)
 *
 * **When to use**:
 * - High-security environments
 * - Protection against side-channel attacks
 * - When Argon2id is not available
 *
 * **Note**: Argon2id is generally recommended over Argon2i as it provides
 * both side-channel and GPU resistance.
 *
 * @class ArgonDriver
 */
@Injectable()
export class ArgonDriver extends BaseHashingDriver {
  /**
   * The algorithm this driver implements
   */
  protected readonly algorithm: HashAlgorithm.ARGON2 | HashAlgorithm.ARGON2ID =
    HashAlgorithm.ARGON2;

  /**
   * Default Argon2 configuration
   */
  protected readonly defaultConfig: Required<Argon2Config>;

  /**
   * Whether to verify the algorithm type during check operations
   */
  protected readonly verifyAlgorithm: boolean;

  constructor(config?: Argon2Config & { verifyAlgorithm?: boolean }) {
    super();
    this.defaultConfig = {
      hashLength: config?.hashLength || 32,
      saltLength: config?.saltLength || 16,
      time: config?.time || DEFAULT_ARGON2_TIME,
      memory: config?.memory || DEFAULT_ARGON2_MEMORY,
      parallelism: config?.parallelism || DEFAULT_ARGON2_PARALLELISM,
    };
    this.verifyAlgorithm = config?.verifyAlgorithm || false;
  }

  /**
   * Hash a value using Argon2i
   *
   * @param value - The value to hash
   * @param options - Argon2 options
   * @returns The hashed value
   *
   * @example
   * ```typescript
   * const hash = await driver.make('password123', {
   *   memory: 65536,
   *   time: 3,
   *   parallelism: 4,
   * });
   * ```
   */
  async make(value: string, options?: Argon2Config): Promise<string> {
    this.validateInput(value);

    try {
      const config = { ...this.defaultConfig, ...options };

      return await argon2.hash(value, {
        timeCost: config.time,
        memoryCost: config.memory,
        type: this.getAlgorithmType(),
        hashLength: config.hashLength,
        parallelism: config.parallelism,
      });
    } catch (error: any) {
      throw new HashingException(`Failed to hash value: ${error.message}`);
    }
  }

  /**
   * Verify a plain value against an Argon2i hash
   *
   * @param value - The plain value
   * @param hashedValue - The Argon2i hash
   * @param options - Not used for Argon2 verification
   * @returns True if the value matches the hash
   *
   * @example
   * ```typescript
   * const isValid = await driver.check('password123', hash);
   * ```
   */
  async check(value: string, hashedValue: string, options?: Argon2Config): Promise<boolean> {
    this.validateInput(value);

    if (!hashedValue || typeof hashedValue !== 'string') {
      return false;
    }

    // Verify algorithm type if enabled
    if (this.shouldVerifyAlgorithm() && !(await this.isUsingCorrectAlgorithm(hashedValue))) {
      throw new HashingException('This password does not use the Argon2i algorithm.');
    }

    try {
      return await argon2.verify(hashedValue, value);
    } catch (error: any) {
      // Invalid hash format or comparison error
      return false;
    }
  }

  /**
   * Check if an Argon2i hash needs to be rehashed
   *
   * Returns true if the hash was created with different parameters
   * than the current configuration.
   *
   * @param hashedValue - The Argon2i hash
   * @param options - Current Argon2 options to compare against
   * @returns True if the hash should be regenerated
   *
   * @example
   * ```typescript
   * if (await driver.needsRehash(hash, { memory: 131072 })) {
   *   // Rehash with increased memory cost
   * }
   * ```
   */
  async needsRehash(hashedValue: string, options?: Argon2Config): Promise<boolean> {
    const info = await this.info(hashedValue);

    if (!info.valid || !info.options) {
      return true;
    }

    const desiredConfig = { ...this.defaultConfig, ...options };

    // Check if any parameter has changed
    return (
      info.options.memory !== desiredConfig.memory ||
      info.options.time !== desiredConfig.time ||
      info.options.parallelism !== desiredConfig.parallelism
    );
  }

  /**
   * Get information about an Argon2i hash
   *
   * @param hashedValue - The Argon2i hash
   * @returns Metadata about the hash
   *
   * @example
   * ```typescript
   * const info = await driver.info(hash);
   * console.log(info.options.memory);      // Memory cost in KiB
   * console.log(info.options.time);        // Time cost (iterations)
   * console.log(info.options.parallelism); // Parallelism (threads)
   * ```
   */
  async info(hashedValue: string): Promise<HashInfo> {
    if (!hashedValue || typeof hashedValue !== 'string') {
      return {
        algorithm: null,
        valid: false,
      };
    }

    // Argon2i hash format: $argon2i$v=19$m=65536,t=3,p=4$...
    const argon2Regex = /^\$argon2i\$v=\d+\$m=(\d+),t=(\d+),p=(\d+)\$/;
    const match = hashedValue.match(argon2Regex);

    if (!match || !match[1] || !match[2] || !match[3]) {
      return {
        algorithm: null,
        valid: false,
      };
    }

    return {
      algorithm: HashAlgorithm.ARGON2,
      options: {
        time: parseInt(match[2], 10),
        memory: parseInt(match[1], 10),
        parallelism: parseInt(match[3], 10),
      },
      valid: true,
    };
  }

  /**
   * Verify the hashed value uses the correct algorithm
   *
   * @param hashedValue - The Argon2i hash
   * @returns True if the hash uses Argon2i algorithm
   * @protected
   */
  protected async isUsingCorrectAlgorithm(hashedValue: string): Promise<boolean> {
    const info = await this.info(hashedValue);
    return info.algorithm === HashAlgorithm.ARGON2;
  }

  /**
   * Check if algorithm verification is enabled
   *
   * @returns True if algorithm verification should be performed
   * @protected
   */
  protected shouldVerifyAlgorithm(): boolean {
    return this.verifyAlgorithm;
  }

  /**
   * Get the Argon2 algorithm type to use for hashing
   *
   * @returns The Argon2i algorithm type
   * @protected
   */
  protected getAlgorithmType(): typeof argon2.argon2i | typeof argon2.argon2id {
    return argon2.argon2i;
  }
}
