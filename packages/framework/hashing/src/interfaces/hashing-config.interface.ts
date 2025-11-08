import { HashAlgorithm } from '@enums';

/**
 * Bcrypt Configuration
 */
export interface BcryptConfig {
  /**
   * Number of rounds (cost factor)
   * @default 10
   */
  rounds?: number;
}

/**
 * Argon2 Configuration
 */
export interface Argon2Config {
  /**
   * Memory cost in KiB
   * @default 65536 (64 MB)
   */
  memory?: number;

  /**
   * Time cost (iterations)
   * @default 3
   */
  time?: number;

  /**
   * Degree of parallelism
   * @default 4
   */
  parallelism?: number;

  /**
   * Hash length in bytes
   * @default 32
   */
  hashLength?: number;

  /**
   * Salt length in bytes
   * @default 16
   */
  saltLength?: number;
}

/**
 * Scrypt Configuration
 */
export interface ScryptConfig {
  /**
   * CPU/memory cost parameter
   * @default 16384
   */
  cost?: number;

  /**
   * Block size parameter
   * @default 8
   */
  blockSize?: number;

  /**
   * Parallelization parameter
   * @default 1
   */
  parallelization?: number;

  /**
   * Derived key length in bytes
   * @default 64
   */
  keyLength?: number;
}

/**
 * Hashing Configuration
 *
 * Main configuration for the hashing module.
 *
 * @interface IHashingConfig
 */
export interface IHashingConfig {
  /**
   * Default hashing algorithm to use
   * @default HashAlgorithm.ARGON2ID
   */
  driver?: HashAlgorithm;

  /**
   * Bcrypt configuration
   */
  bcrypt?: BcryptConfig;

  /**
   * Argon2/Argon2id configuration
   */
  argon2?: Argon2Config;

  /**
   * Scrypt configuration
   */
  scrypt?: ScryptConfig;
}
