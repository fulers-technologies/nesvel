import { Injectable } from '@nestjs/common';
import * as argon2 from 'argon2';

import type { HashInfo } from '@types';
import { HashAlgorithm } from '@enums';
import { ArgonDriver } from './argon.driver';
import { HashingException } from '@exceptions';
import type { Argon2Config } from '@interfaces';

/**
 * Argon2id Hashing Driver (Recommended)
 *
 * Modern password hashing using Argon2id algorithm.
 * Winner of the Password Hashing Competition (2015).
 *
 * **Features**:
 * - Hybrid of Argon2i and Argon2d
 * - Resistant to GPU cracking attacks
 * - Resistant to side-channel attacks
 * - OWASP recommended for password storage
 * - Configurable memory, time, and parallelism
 *
 * **Why Argon2id?**:
 * - Best of both Argon2i (side-channel resistance) and Argon2d (GPU resistance)
 * - More secure than bcrypt for modern applications
 * - Industry standard for new implementations
 *
 * **Implementation Note**:
 * This driver extends ArgonDriver and overrides only the algorithm-specific
 * parts, following the same pattern as Laravel's Argon2IdHasher.
 *
 * @class Argon2idDriver
 * @extends {ArgonDriver}
 */
@Injectable()
export class Argon2idDriver extends ArgonDriver {
  /**
   * The algorithm this driver implements
   */
  protected readonly algorithm = HashAlgorithm.ARGON2ID;

  /**
   * Verify a plain value against an Argon2id hash
   *
   * Overrides the parent method to add algorithm verification.
   * Ensures the hash uses the Argon2id algorithm before verification.
   *
   * @param value - The plain value
   * @param hashedValue - The Argon2id hash
   * @param options - Not used for Argon2 verification
   * @returns True if the value matches the hash
   * @throws {HashingException} If verifyAlgorithm is enabled and hash uses wrong algorithm
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
      throw new HashingException('This password does not use the Argon2id algorithm.');
    }

    try {
      return await argon2.verify(hashedValue, value);
    } catch (error: any) {
      // Invalid hash format or comparison error
      return false;
    }
  }

  /**
   * Verify the hashed value uses the correct algorithm
   *
   * @param hashedValue - The Argon2id hash
   * @returns True if the hash uses Argon2id algorithm
   * @protected
   */
  protected async isUsingCorrectAlgorithm(hashedValue: string): Promise<boolean> {
    const info = await this.info(hashedValue);
    return info.algorithm === HashAlgorithm.ARGON2ID;
  }

  /**
   * Get the Argon2 algorithm type to use for hashing
   *
   * @returns The Argon2id algorithm type
   * @protected
   */
  protected getAlgorithmType(): typeof argon2.argon2i | typeof argon2.argon2id {
    return argon2.argon2id;
  }

  /**
   * Get information about an Argon2id hash
   *
   * Overrides the parent method to parse Argon2id-specific hash format.
   *
   * @param hashedValue - The Argon2id hash
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

    // Argon2id hash format: $argon2id$v=19$m=65536,t=3,p=4$...
    const argon2Regex = /^\$argon2id\$v=\d+\$m=(\d+),t=(\d+),p=(\d+)\$/;
    const match = hashedValue.match(argon2Regex);

    if (!match || !match[1] || !match[2] || !match[3]) {
      return {
        valid: false,
        algorithm: null,
      };
    }

    return {
      algorithm: HashAlgorithm.ARGON2ID,
      options: {
        time: parseInt(match[2], 10),
        memory: parseInt(match[1], 10),
        parallelism: parseInt(match[3], 10),
      },
      valid: true,
    };
  }
}
