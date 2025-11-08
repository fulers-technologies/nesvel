import { HashAlgorithm, IHashingOptions } from '@nesvel/nestjs-hashing';

/**
 * Hashing Configuration
 *
 * Configuration for the hashing module with support for multiple algorithms.
 * Default algorithm is Bcrypt with 10 rounds for a good balance between
 * security and performance.
 *
 * **Supported Algorithms**:
 * - Bcrypt: Industry standard, well-tested (default)
 * - Argon2: Modern, memory-hard, resistant to GPU attacks
 * - Argon2id: Hybrid mode combining Argon2i and Argon2d
 * - Scrypt: Memory-hard, good for password hashing
 *
 * **Performance Considerations**:
 * - Bcrypt (10 rounds): ~100ms per hash
 * - Bcrypt (12 rounds): ~400ms per hash
 * - Argon2: ~200ms per hash (default settings)
 * - Scrypt: ~100-200ms per hash (default settings)
 *
 * **Security Recommendations**:
 * - Use at least 10 rounds for Bcrypt
 * - Increase rounds as hardware improves
 * - Consider Argon2id for new applications
 *
 * @see https://cheatsheetseries.owasp.org/cheatsheets/Password_Storage_Cheat_Sheet.html
 */
export const hashingConfig: IHashingOptions = {
  /**
   * Hash Algorithm
   *
   * The default hashing algorithm to use for password hashing.
   * Can be overridden per-operation by passing options to the service.
   *
   * Available options:
   * - HashAlgorithm.BCRYPT (default)
   * - HashAlgorithm.ARGON2
   * - HashAlgorithm.ARGON2ID
   * - HashAlgorithm.SCRYPT
   */
  driver: HashAlgorithm.BCRYPT,

  /**
   * Global Module Registration
   *
   * Set to true to make the hashing service available globally
   * across all modules without explicit imports.
   *
   * Recommended: true for most applications
   */
  global: true,

  /**
   * Bcrypt Options
   *
   * Configuration for the Bcrypt hashing algorithm.
   *
   * **rounds**: Cost factor (4-31)
   * - Higher values = more secure but slower
   * - Recommended: 10-12 for most applications
   * - Each increment doubles the time
   */
  bcrypt: {
    rounds: 10,
  },

  /**
   * Argon2 Options
   *
   * Configuration for the Argon2 hashing algorithm.
   *
   * **memory**: Memory usage in KiB (default: 65536 = 64 MiB)
   * **time**: Number of iterations (default: 3)
   * **parallelism**: Number of parallel threads (default: 4)
   * **hashLength**: Output hash length in bytes (default: 32)
   * **saltLength**: Salt length in bytes (default: 16)
   */
  argon2: {
    memory: 65536, // 64 MiB
    time: 3,
    parallelism: 4,
    hashLength: 32,
    saltLength: 16,
  },

  /**
   * Scrypt Options
   *
   * Configuration for the Scrypt hashing algorithm.
   *
   * **cost**: CPU/memory cost parameter (power of 2, e.g., 16384 = 2^14)
   * **blockSize**: Block size parameter (typically 8)
   * **parallelization**: Parallelization parameter (typically 1)
   * **keyLength**: Output key length in bytes (default: 64)
   */
  scrypt: {
    cost: 16384, // 2^14
    blockSize: 8,
    parallelization: 1,
    keyLength: 64,
  },
};
