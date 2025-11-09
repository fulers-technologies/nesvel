import { Injectable } from '@nestjs/common';
import { BaseFactory } from '@nesvel/shared';

import { CipherAlgorithm } from '@enums';
import type { IEncryptionDriver, EncryptionConfig } from '@interfaces';
import { AesCbcDriver, AesGcmDriver, SodiumDriver } from '@drivers';
import { UnsupportedCipherException } from '@exceptions';

/**
 * Factory service for creating and configuring Encryption driver instances.
 *
 * This service extends BaseFactory to provide a standardized factory pattern for
 * creating encryption driver instances. It manages the lifecycle and configuration
 * of various cipher algorithms including AES-CBC, AES-GCM, and libsodium.
 *
 * Architecture:
 * - Extends BaseFactory with encryption-specific configuration handling
 * - Maintains a registry of available cipher algorithms
 * - Provides cipher-specific validation and instantiation
 * - Supports custom driver registration at runtime
 *
 * Supported Cipher Algorithms:
 * - AES-128-CBC: AES with 128-bit key in CBC mode
 *   - Symmetric encryption with block cipher mode
 *   - Requires 16-byte IV
 *   - Good for general-purpose encryption
 *
 * - AES-256-CBC: AES with 256-bit key in CBC mode
 *   - Enhanced security with longer key length
 *   - Requires 16-byte IV
 *   - Recommended for sensitive data
 *
 * - AES-128-GCM: AES with 128-bit key in GCM mode (AEAD)
 *   - Authenticated Encryption with Associated Data
 *   - Requires 12-byte IV
 *   - Provides both confidentiality and integrity
 *
 * - AES-256-GCM: AES with 256-bit key in GCM mode (AEAD)
 *   - Enhanced security with authenticated encryption
 *   - Requires 12-byte IV
 *   - Recommended for high-security applications
 *
 * - Sodium: Modern authenticated encryption using libsodium
 *   - XChaCha20-Poly1305 algorithm
 *   - Resistant to timing attacks
 *   - Excellent performance on modern hardware
 *
 * Key Features:
 * - Automatic driver instantiation based on cipher selection
 * - Key validation (format and length)
 * - Support for key rotation with previous keys
 * - Type-safe operations with full TypeScript support
 * - Comprehensive error handling with descriptive messages
 * - Configurable payload serialization
 *
 * @extends BaseFactory<EncryptionConfig, IEncryptionDriver, { key: string; cipher: CipherAlgorithm }>
 *
 * @example
 * Basic usage with AES-256-GCM (recommended):
 * ```typescript
 * const driver = encryptionFactory.createDriver({
 *   key: 'base64EncodedKey',
 *   cipher: CipherAlgorithm.AES_256_GCM,
 *   serialize: true
 * });
 *
 * const encrypted = await driver.encrypt('secret data');
 * const decrypted = await driver.decrypt(encrypted);
 * ```
 *
 * @example
 * Using Sodium for modern authenticated encryption:
 * ```typescript
 * const driver = encryptionFactory.createDriver({
 *   key: 'base64EncodedKey',
 *   cipher: CipherAlgorithm.SODIUM
 * });
 * ```
 *
 * @example
 * Key rotation with previous keys:
 * ```typescript
 * const driver = encryptionFactory.createDriver({
 *   key: 'newBase64Key',
 *   cipher: CipherAlgorithm.AES_256_GCM,
 *   previousKeys: ['oldKey1', 'oldKey2']
 * });
 * // Can decrypt data encrypted with old keys
 * ```
 *
 * @example
 * Registering a custom encryption driver:
 * ```typescript
 * class CustomEncryptionDriver implements IEncryptionDriver {
 *   constructor(key: string, cipher: CipherAlgorithm) { ... }
 *   async encrypt(plaintext: string): Promise<string> { ... }
 *   async decrypt(payload: string): Promise<string> { ... }
 *   getCipher(): string { ... }
 * }
 *
 * encryptionFactory.registerDriver('custom-cipher', CustomEncryptionDriver);
 * ```
 *
 * @see {@link BaseFactory} For base factory implementation
 * @see {@link IEncryptionDriver} For driver interface specification
 * @see {@link EncryptionConfig} For configuration options
 *
 * @author Nesvel
 * @since 1.0.0
 */
@Injectable()
export class EncryptionFactoryService extends BaseFactory<
  EncryptionConfig,
  IEncryptionDriver,
  { key: string; cipher: CipherAlgorithm }
> {
  /**
   * Registry of available encryption cipher drivers.
   *
   * Maps cipher algorithm identifiers to their corresponding driver classes.
   * This registry is used by BaseFactory to instantiate the appropriate
   * driver based on configuration.
   *
   * Available ciphers:
   * - AES_128_CBC: AES with 128-bit key in CBC mode
   * - AES_256_CBC: AES with 256-bit key in CBC mode (recommended)
   * - AES_128_GCM: AES with 128-bit key in GCM mode (AEAD)
   * - AES_256_GCM: AES with 256-bit key in GCM mode (AEAD, recommended)
   * - SODIUM: Modern authenticated encryption (XChaCha20-Poly1305)
   *
   * Note: Both AES-CBC variants use the same driver class (AesCbcDriver),
   * and both AES-GCM variants use the same driver class (AesGcmDriver).
   * The cipher parameter determines key length and specific behavior.
   *
   * @protected
   * @readonly
   */
  protected readonly driverRegistry = new Map<string, any>([
    [CipherAlgorithm.AES_128_CBC, AesCbcDriver],
    [CipherAlgorithm.AES_256_CBC, AesCbcDriver],
    [CipherAlgorithm.AES_128_GCM, AesGcmDriver],
    [CipherAlgorithm.AES_256_GCM, AesGcmDriver],
    [CipherAlgorithm.SODIUM, SodiumDriver],
  ]);

  /**
   * Extracts the cipher algorithm from configuration.
   *
   * Determines which encryption cipher should be used based on the provided
   * configuration. If no cipher is specified, defaults to AES-256-GCM, which
   * is the recommended cipher for most use cases due to its authenticated
   * encryption (AEAD) providing both confidentiality and integrity.
   *
   * @param config - The encryption configuration containing cipher selection
   * @returns The cipher algorithm identifier (e.g., 'aes-256-gcm', 'sodium')
   *
   * @protected
   * @override Implementation of BaseFactory abstract method
   *
   * @example
   * ```typescript
   * const cipher = this.getDriverType({ key: 'key', cipher: CipherAlgorithm.AES_256_GCM });
   * // Returns: 'aes-256-gcm'
   *
   * const defaultCipher = this.getDriverType({ key: 'key' });
   * // Returns: 'aes-256-gcm' (default)
   * ```
   */
  protected getDriverType(config: EncryptionConfig): string {
    return config.cipher || CipherAlgorithm.AES_256_GCM;
  }

  /**
   * Gets cipher-specific driver options.
   *
   * Extracts the encryption key and cipher algorithm from the configuration
   * to pass to the driver constructor. Unlike other factory services that
   * have different option structures per driver, encryption drivers all
   * require the same parameters (key and cipher).
   *
   * @param config - The encryption configuration containing key and cipher
   * @returns Driver options containing the key and cipher algorithm
   *
   * @protected
   * @override Implementation of BaseFactory abstract method
   *
   * @example
   * ```typescript
   * const options = this.getDriverOptions({
   *   key: 'base64Key',
   *   cipher: CipherAlgorithm.AES_256_GCM
   * });
   * // Returns: { key: 'base64Key', cipher: 'aes-256-gcm' }
   * ```
   */
  protected getDriverOptions(config: EncryptionConfig): { key: string; cipher: CipherAlgorithm } {
    const cipher = this.getDriverType(config) as CipherAlgorithm;
    return {
      key: config.key,
      cipher,
    };
  }

  /**
   * Instantiates an encryption driver with the provided options.
   *
   * Creates a new instance of the specified encryption driver class with
   * the encryption key and cipher algorithm. All encryption drivers follow
   * a consistent constructor pattern accepting (key, cipher).
   *
   * @param DriverClass - The driver class constructor (AesCbcDriver, AesGcmDriver, SodiumDriver)
   * @param options - Driver options containing key and cipher algorithm
   * @returns A fully configured encryption driver instance ready for use
   *
   * @protected
   * @override Implementation of BaseFactory abstract method
   *
   * @example
   * ```typescript
   * const driver = this.instantiateDriver(
   *   AesGcmDriver,
   *   { key: 'base64Key', cipher: CipherAlgorithm.AES_256_GCM }
   * );
   * // Returns: AesGcmDriver instance configured with key and cipher
   * ```
   */
  protected instantiateDriver(
    DriverClass: any,
    options: { key: string; cipher: CipherAlgorithm }
  ): IEncryptionDriver {
    return DriverClass.make(options.key, options.cipher);
  }

  /**
   * Creates the appropriate error for unsupported cipher.
   *
   * Generates a custom UnsupportedCipherException when a requested cipher
   * algorithm is not found in the driver registry. This error provides helpful
   * information about the invalid cipher and lists all available ciphers.
   *
   * @param cipher - The requested cipher identifier that wasn't found in the registry
   * @returns An UnsupportedCipherException instance with descriptive error message
   *
   * @protected
   * @override Implementation of BaseFactory abstract method
   *
   * @example
   * ```typescript
   * const error = this.getNotFoundError('unknown-cipher');
   * // Returns: UnsupportedCipherException with message:
   * // "Unsupported cipher algorithm: unknown-cipher. Available: aes-128-cbc, aes-256-cbc, ..."
   * ```
   */
  protected getNotFoundError(cipher: string): Error {
    return UnsupportedCipherException.make(cipher);
  }

  /**
   * Validates cipher-specific configuration options.
   *
   * Performs validation of encryption configuration to ensure required
   * parameters are present and valid. This validation occurs before driver
   * instantiation to provide early error detection.
   *
   * Validation rules:
   * - key: Required string (must be base64-encoded)
   * - cipher: Optional (defaults to AES-256-GCM if not specified)
   * - previousKeys: Optional array of base64-encoded strings
   * - serialize: Optional boolean
   *
   * Note: Detailed key format and length validation is performed by the
   * individual driver implementations.
   *
   * @param cipher - The cipher algorithm identifier to validate options for
   * @param options - The cipher-specific configuration options to validate
   * @param config - Full encryption configuration (used for additional validation)
   *
   * @throws {Error} If required key is missing or invalid
   *
   * @protected
   * @override Optional template method from BaseFactory
   *
   * @example
   * ```typescript
   * // Valid configuration
   * this.validateDriverOptions('aes-256-gcm', { key: 'base64Key', cipher: CipherAlgorithm.AES_256_GCM }, config);
   * // No error thrown
   *
   * // Invalid configuration (missing key)
   * this.validateDriverOptions('aes-256-gcm', { key: '', cipher: CipherAlgorithm.AES_256_GCM }, config);
   * // Throws: Error: Encryption key is required
   * ```
   */
  protected validateDriverOptions(
    cipher: string,
    options?: { key: string; cipher: CipherAlgorithm },
    config?: EncryptionConfig
  ): void {
    if (!config) {
      return;
    }

    /**
     * Validate encryption key presence.
     * The key is required for all encryption operations.
     */
    if (!config.key || config.key.trim().length === 0) {
      throw new Error('Encryption key is required');
    }

    /**
     * Validate previousKeys format if provided.
     * Previous keys must be an array of strings for key rotation support.
     */
    if (config.previousKeys !== undefined) {
      if (!Array.isArray(config.previousKeys)) {
        throw new Error('previousKeys must be an array of strings');
      }

      for (let i = 0; i < config.previousKeys.length; i++) {
        const key = config.previousKeys[i];
        if (typeof key !== 'string' || key.trim().length === 0) {
          throw new Error(`previousKeys[${i}] must be a non-empty string`);
        }
      }
    }

    /**
     * Note: Detailed validation of key format (base64) and length
     * is performed by individual driver implementations during instantiation.
     * This allows each cipher to enforce its specific key requirements.
     */
  }

  /**
   * Checks if a cipher algorithm is supported by the factory.
   *
   * Determines whether a given cipher algorithm identifier is registered
   * in the driver registry and can be used for encryption operations.
   *
   * @param cipher - The cipher algorithm to check
   * @returns True if the cipher is supported, false otherwise
   *
   * @example
   * ```typescript
   * if (factory.isCipherSupported(CipherAlgorithm.AES_256_GCM)) {
   *   const driver = factory.createDriver({ key, cipher: CipherAlgorithm.AES_256_GCM });
   * }
   *
   * if (!factory.isCipherSupported('unknown-cipher')) {
   *   console.log('Cipher not supported');
   * }
   * ```
   */
  isCipherSupported(cipher: string): cipher is CipherAlgorithm {
    return this.driverRegistry.has(cipher);
  }

  /**
   * Gets a list of all supported cipher algorithms.
   *
   * Returns an array of all cipher algorithm identifiers that are currently
   * registered and available for use. This is useful for displaying available
   * options to users or for validation purposes.
   *
   * @returns Array of supported cipher algorithm identifiers
   *
   * @example
   * ```typescript
   * const ciphers = factory.getSupportedCiphers();
   * console.log(ciphers);
   * // ['aes-128-cbc', 'aes-256-cbc', 'aes-128-gcm', 'aes-256-gcm', 'sodium']
   *
   * // Use for validation
   * const isValid = factory.getSupportedCiphers().includes(userInput);
   * ```
   */
  getSupportedCiphers(): CipherAlgorithm[] {
    return Array.from(this.driverRegistry.keys()) as CipherAlgorithm[];
  }
}
