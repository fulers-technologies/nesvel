import * as bcrypt from 'bcrypt';
import { Injectable } from '@nestjs/common';

import type { HashInfo } from '@types';
import { HashAlgorithm } from '@enums';
import { HashingException } from '@exceptions';
import type { BcryptConfig } from '@interfaces';
import { BaseHashingDriver } from './base.driver';
import { DEFAULT_BCRYPT_ROUNDS } from '@constants';

/**
 * Bcrypt Hashing Driver
 *
 * Industry-standard password hashing using bcrypt algorithm.
 *
 * **Features**:
 * - Battle-tested and widely adopted
 * - Configurable work factor (rounds)
 * - Salt generation handled automatically
 * - Resistant to rainbow table attacks
 *
 * **Limitations**:
 * - Max input length: 72 bytes
 * - Slower than newer algorithms
 *
 * @class BcryptDriver
 */
@Injectable()
export class BcryptDriver extends BaseHashingDriver {
  /**
   * The algorithm this driver implements
   */
  protected readonly algorithm = HashAlgorithm.BCRYPT;

  /**
   * Default bcrypt rounds
   */
  private readonly defaultRounds: number;

  constructor(config?: BcryptConfig) {
    super();
    this.defaultRounds = config?.rounds || DEFAULT_BCRYPT_ROUNDS;
  }

  /**
   * Hash a value using bcrypt
   *
   * @param value - The value to hash
   * @param options - Bcrypt options
   * @returns The hashed value
   *
   * @example
   * ```typescript
   * const hash = await driver.make('password123', { rounds: 12 });
   * ```
   */
  async make(value: string, options?: BcryptConfig): Promise<string> {
    this.validateInput(value);

    try {
      const rounds = options?.rounds || this.defaultRounds;
      return await bcrypt.hash(value, rounds);
    } catch (error: any) {
      throw new HashingException(`Failed to hash value: ${error.message}`);
    }
  }

  /**
   * Verify a plain value against a bcrypt hash
   *
   * Uses constant-time comparison to prevent timing attacks.
   *
   * @param value - The plain value
   * @param hashedValue - The bcrypt hash
   * @param options - Not used for bcrypt verification
   * @returns True if the value matches the hash
   *
   * @example
   * ```typescript
   * const isValid = await driver.check('password123', hash);
   * ```
   */
  async check(value: string, hashedValue: string, options?: BcryptConfig): Promise<boolean> {
    this.validateInput(value);

    if (!hashedValue || typeof hashedValue !== 'string') {
      return false;
    }

    try {
      return await bcrypt.compare(value, hashedValue);
    } catch (error: any) {
      // Invalid hash format or comparison error
      return false;
    }
  }

  /**
   * Check if a bcrypt hash needs to be rehashed
   *
   * Returns true if the hash was created with different rounds
   * than the current configuration.
   *
   * @param hashedValue - The bcrypt hash
   * @param options - Current bcrypt options to compare against
   * @returns True if the hash should be regenerated
   *
   * @example
   * ```typescript
   * if (await driver.needsRehash(hash, { rounds: 12 })) {
   *   // Rehash the password with new rounds
   * }
   * ```
   */
  async needsRehash(hashedValue: string, options?: BcryptConfig): Promise<boolean> {
    const info = await this.info(hashedValue);

    if (!info.valid || !info.options?.cost) {
      return true;
    }

    const desiredRounds = options?.rounds || this.defaultRounds;
    return info.options.cost !== desiredRounds;
  }

  /**
   * Get information about a bcrypt hash
   *
   * @param hashedValue - The bcrypt hash
   * @returns Metadata about the hash
   *
   * @example
   * ```typescript
   * const info = await driver.info(hash);
   * console.log(info.options.cost); // Number of rounds
   * ```
   */
  async info(hashedValue: string): Promise<HashInfo> {
    if (!hashedValue || typeof hashedValue !== 'string') {
      return {
        algorithm: null,
        valid: false,
      };
    }

    // Bcrypt hash format: $2a$rounds$salt+hash
    const bcryptRegex = /^\$2[aby]?\$(\d{1,2})\$/;
    const match = hashedValue.match(bcryptRegex);

    if (!match || !match[1]) {
      return {
        algorithm: null,
        valid: false,
      };
    }

    return {
      algorithm: HashAlgorithm.BCRYPT,
      options: {
        cost: parseInt(match[1], 10),
      },
      valid: true,
    };
  }
}
