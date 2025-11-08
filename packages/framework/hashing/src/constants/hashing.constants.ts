/**
 * Hashing Module Constants
 *
 * Injection tokens and default configuration values.
 *
 * @module constants
 */

/**
 * Injection token for the hashing driver instance
 */
export const HASHING_DRIVER = 'HASHING_DRIVER';

/**
 * Injection token for the hashing service
 */
export const HASHING_SERVICE = 'HASHING_SERVICE';

/**
 * Injection token for module options
 */
export const HASHING_MODULE_OPTIONS = 'HASHING_MODULE_OPTIONS';

/**
 * Default configuration values
 */

// Bcrypt defaults
export const DEFAULT_BCRYPT_ROUNDS = 10;

// Argon2 defaults (OWASP recommended)
export const DEFAULT_ARGON2_MEMORY = 65536; // 64 MB
export const DEFAULT_ARGON2_TIME = 3; // iterations
export const DEFAULT_ARGON2_PARALLELISM = 4; // threads
export const DEFAULT_ARGON2_HASH_LENGTH = 32; // bytes
export const DEFAULT_ARGON2_SALT_LENGTH = 16; // bytes

// Scrypt defaults
export const DEFAULT_SCRYPT_COST = 16384; // N parameter
export const DEFAULT_SCRYPT_BLOCK_SIZE = 8; // r parameter
export const DEFAULT_SCRYPT_PARALLELIZATION = 1; // p parameter
export const DEFAULT_SCRYPT_KEY_LENGTH = 64; // output length in bytes
