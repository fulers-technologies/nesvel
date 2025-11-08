import { CipherAlgorithm } from '@enums';

/**
 * Dependency injection token for encryption module options.
 */
export const ENCRYPTION_MODULE_OPTIONS = Symbol('ENCRYPTION_MODULE_OPTIONS');

/**
 * Dependency injection token for encryption service.
 */
export const ENCRYPTION_SERVICE = Symbol('ENCRYPTION_SERVICE');

/**
 * Dependency injection token for encryption factory service.
 */
export const ENCRYPTION_FACTORY = Symbol('ENCRYPTION_FACTORY');

/**
 * Dependency injection token for encryption driver.
 */
export const ENCRYPTION_DRIVER = Symbol('ENCRYPTION_DRIVER');

/**
 * Default encryption configuration values.
 */
export const ENCRYPTION_DEFAULTS = {
  /**
   * Default cipher algorithm.
   */
  cipher: CipherAlgorithm.AES_256_GCM,

  /**
   * Default key length in bytes for AES-256.
   */
  keyLength: 32,

  /**
   * Default IV length in bytes for GCM mode.
   */
  ivLength: 12,

  /**
   * Default authentication tag length for GCM mode (in bytes).
   */
  tagLength: 16,

  /**
   * Default HMAC algorithm for CBC mode.
   */
  hmacAlgorithm: 'sha256' as const,

  /**
   * Serialize encrypted payloads as JSON by default.
   */
  serialize: true,
} as const;

/**
 * Cipher-specific configuration metadata.
 */
export const CIPHER_CONFIG = {
  [CipherAlgorithm.AES_128_CBC]: {
    keyLength: 16,
    ivLength: 16,
    requiresHmac: true,
    isAead: false,
  },
  [CipherAlgorithm.AES_256_CBC]: {
    keyLength: 32,
    ivLength: 16,
    requiresHmac: true,
    isAead: false,
  },
  [CipherAlgorithm.AES_128_GCM]: {
    keyLength: 16,
    ivLength: 12,
    tagLength: 16,
    requiresHmac: false,
    isAead: true,
  },
  [CipherAlgorithm.AES_256_GCM]: {
    keyLength: 32,
    ivLength: 12,
    tagLength: 16,
    requiresHmac: false,
    isAead: true,
  },
  [CipherAlgorithm.SODIUM]: {
    keyLength: 32,
    ivLength: 24,
    tagLength: 16,
    requiresHmac: false,
    isAead: true,
  },
} as const;
