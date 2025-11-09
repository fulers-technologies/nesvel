import { promisify } from 'util';
import { Injectable } from '@nestjs/common';
import { scrypt, randomBytes, timingSafeEqual } from 'crypto';

import type { HashInfo } from '@types';
import { HashAlgorithm } from '@enums';
import { HashingException } from '@exceptions';
import type { ScryptConfig } from '@interfaces';
import { BaseHashingDriver } from './base.driver';

const scryptAsync = promisify(scrypt);

/**
 * Scrypt Hashing Driver
 *
 * Password hashing using Node.js native scrypt algorithm.
 *
 * **Features**:
 * - Memory-hard algorithm
 * - Native Node.js implementation (no external dependencies)
 * - Resistant to GPU/ASIC attacks
 * - Configurable cost parameters
 *
 * **When to use**:
 * - When avoiding external dependencies is important
 * - Memory-hard hashing requirements
 * - Alternative to Argon2
 *
 * **Note**: Argon2id is generally recommended over scrypt for new applications.
 *
 * @class ScryptDriver
 */
@Injectable()
export class ScryptDriver extends BaseHashingDriver {
  /**
   * The algorithm this driver implements
   */
  protected readonly algorithm = HashAlgorithm.SCRYPT;

  /**
   * Default scrypt configuration
   */
  private readonly defaultConfig: Required<ScryptConfig>;

  constructor(config?: ScryptConfig) {
    super();
    this.defaultConfig = {
      cost: config?.cost || 16384, // N parameter (CPU/memory cost)
      blockSize: config?.blockSize || 8, // r parameter
      parallelization: config?.parallelization || 1, // p parameter
      keyLength: config?.keyLength || 64, // Derived key length
    };
  }

  /**
   * Hash a value using scrypt
   *
   * Encodes the hash with parameters in the format:
   * $scrypt$N=16384$r=8$p=1$salt$hash
   *
   * @param value - The value to hash
   * @param options - Scrypt options
   * @returns The hashed value
   *
   * @example
   * ```typescript
   * const hash = await driver.make('password123', {
   *   cost: 16384,
   *   blockSize: 8,
   *   parallelization: 1,
   * });
   * ```
   */
  async make(value: string, options?: ScryptConfig): Promise<string> {
    this.validateInput(value);

    try {
      const config = { ...this.defaultConfig, ...options };

      // Generate random salt
      const salt = randomBytes(16);

      // Hash using scrypt
      const derivedKey = (await scryptAsync(value, salt, config.keyLength)) as Buffer;

      // Encode hash with parameters
      const saltBase64 = salt.toString('base64');
      const hashBase64 = derivedKey.toString('base64');

      return `$scrypt$N=${config.cost}$r=${config.blockSize}$p=${config.parallelization}$${saltBase64}$${hashBase64}`;
    } catch (error: any) {
      throw HashingException.make(`Failed to hash value: ${error.message}`);
    }
  }

  /**
   * Verify a plain value against a scrypt hash
   *
   * @param value - The plain value
   * @param hashedValue - The scrypt hash
   * @param options - Not used for scrypt verification
   * @returns True if the value matches the hash
   *
   * @example
   * ```typescript
   * const isValid = await driver.check('password123', hash);
   * ```
   */
  async check(value: string, hashedValue: string, options?: ScryptConfig): Promise<boolean> {
    this.validateInput(value);

    if (!hashedValue || typeof hashedValue !== 'string') {
      return false;
    }

    try {
      // Parse the hash format: $scrypt$N=16384$r=8$p=1$salt$hash
      const parts = hashedValue.split('$');

      if (parts.length !== 7 || parts[0] !== '' || parts[1] !== 'scrypt') {
        return false;
      }

      // Extract parameters
      const costPart = parts[2]?.split('=')[1];
      const blockSizePart = parts[3]?.split('=')[1];
      const parallelizationPart = parts[4]?.split('=')[1];
      const saltPart = parts[5];
      const hashPart = parts[6];

      if (!costPart || !blockSizePart || !parallelizationPart || !saltPart || !hashPart) {
        return false;
      }

      const cost = parseInt(costPart, 10);
      const blockSize = parseInt(blockSizePart, 10);
      const parallelization = parseInt(parallelizationPart, 10);
      const salt = Buffer.from(saltPart, 'base64');
      const expectedHash = Buffer.from(hashPart, 'base64');

      // Hash the input with the same parameters
      const derivedKey = (await scryptAsync(value, salt, expectedHash.length)) as Buffer;

      // Timing-safe comparison
      return timingSafeEqual(derivedKey, expectedHash);
    } catch (error: any) {
      // Invalid hash format or comparison error
      return false;
    }
  }

  /**
   * Check if a scrypt hash needs to be rehashed
   *
   * Returns true if the hash was created with different parameters
   * than the current configuration.
   *
   * @param hashedValue - The scrypt hash
   * @param options - Current scrypt options to compare against
   * @returns True if the hash should be regenerated
   *
   * @example
   * ```typescript
   * if (await driver.needsRehash(hash, { cost: 32768 })) {
   *   // Rehash with increased cost
   * }
   * ```
   */
  async needsRehash(hashedValue: string, options?: ScryptConfig): Promise<boolean> {
    const info = await this.info(hashedValue);

    if (!info.valid || !info.options) {
      return true;
    }

    const desiredConfig = { ...this.defaultConfig, ...options };

    // Check if any parameter has changed
    return (
      (info.options as any).cost !== desiredConfig.cost ||
      (info.options as any).blockSize !== desiredConfig.blockSize ||
      (info.options as any).parallelization !== desiredConfig.parallelization
    );
  }

  /**
   * Get information about a scrypt hash
   *
   * @param hashedValue - The scrypt hash
   * @returns Metadata about the hash
   *
   * @example
   * ```typescript
   * const info = await driver.info(hash);
   * console.log(info.options.cost);            // N parameter
   * console.log(info.options.blockSize);       // r parameter
   * console.log(info.options.parallelization); // p parameter
   * ```
   */
  async info(hashedValue: string): Promise<HashInfo> {
    if (!hashedValue || typeof hashedValue !== 'string') {
      return {
        algorithm: null,
        valid: false,
      };
    }

    // Scrypt hash format: $scrypt$N=16384$r=8$p=1$salt$hash
    const scryptRegex = /^\$scrypt\$N=(\d+)\$r=(\d+)\$p=(\d+)\$/;
    const match = hashedValue.match(scryptRegex);

    if (!match || !match[1] || !match[2] || !match[3]) {
      return {
        algorithm: null,
        valid: false,
      };
    }

    return {
      algorithm: HashAlgorithm.SCRYPT,
      options: {
        cost: parseInt(match[1], 10),
        blockSize: parseInt(match[2], 10),
        parallelization: parseInt(match[3], 10),
      } as any,
      valid: true,
    };
  }
}
