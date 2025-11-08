/**
 * Hash Algorithm Enum
 *
 * Supported hashing algorithms for password hashing and data integrity.
 *
 * @enum HashAlgorithm
 */
export enum HashAlgorithm {
  /**
   * Bcrypt algorithm
   *
   * Industry standard for password hashing.
   * - Work factor (rounds): 10-12 recommended
   * - Slower than others but battle-tested
   * - Max input length: 72 bytes
   * - Best for: General password hashing
   */
  BCRYPT = 'bcrypt',

  /**
   * Argon2i algorithm
   *
   * Memory-hard hashing algorithm, resistant to side-channel attacks.
   * - Winner of Password Hashing Competition (2015)
   * - More resistant to cache-timing attacks
   * - Best for: Scenarios requiring side-channel resistance
   */
  ARGON2 = 'argon2',

  /**
   * Argon2id algorithm (recommended)
   *
   * Hybrid of Argon2i and Argon2d.
   * - Best of both worlds (GPU + side-channel resistance)
   * - Recommended by OWASP for password storage
   * - Configurable memory, time, and parallelism
   * - Best for: Modern password hashing (default choice)
   */
  ARGON2ID = 'argon2id',

  /**
   * Scrypt algorithm
   *
   * Memory-hard key derivation function.
   * - Native Node.js support (no external deps)
   * - Resistant to hardware brute-force attacks
   * - Configurable cost parameter
   * - Best for: Key derivation, no external dependencies
   */
  SCRYPT = 'scrypt',
}
