import { HashAlgorithm } from '@enums';

/**
 * Hash Information
 *
 * Metadata about a hashed value, including the algorithm used,
 * cost parameters, and other relevant information.
 *
 * @interface HashInfo
 */
export interface HashInfo {
  /**
   * The hashing algorithm used
   */
  algorithm: HashAlgorithm | null;

  /**
   * Algorithm-specific options
   */
  options?: {
    /**
     * Bcrypt: Cost factor (rounds)
     * Scrypt: Cost parameter
     */
    cost?: number;

    /**
     * Argon2: Memory cost in KiB
     */
    memory?: number;

    /**
     * Argon2: Time cost (iterations)
     */
    time?: number;

    /**
     * Argon2: Parallelism (threads)
     */
    parallelism?: number;

    /**
     * Salt length in bytes
     */
    saltLength?: number;
  };

  /**
   * Whether the hash is valid/recognized
   */
  valid: boolean;
}
