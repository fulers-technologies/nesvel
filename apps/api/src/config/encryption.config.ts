import { CipherAlgorithm, EncryptionModuleOptions } from '@nesvel/nestjs-encryption';
import { randomBytes } from 'crypto';

/**
 * Generate Encryption Key
 *
 * Generates a secure 32-byte (256-bit) encryption key.
 * In production, this should be loaded from environment variables
 * or a secure key management service (KMS).
 *
 * **Production Setup**:
 * ```bash
 * # Generate a key
 * node -e "console.log(require('crypto').randomBytes(32).toString('base64'))"
 *
 * # Add to .env
 * ENCRYPTION_KEY=your-base64-encoded-key-here
 * ```
 *
 * @returns A base64-encoded encryption key
 */
function generateEncryptionKey(): string {
  // SECURITY WARNING: In production, ALWAYS load keys from environment variables
  // This is for testing/development purposes only
  if (process.env.ENCRYPTION_KEY) {
    return process.env.ENCRYPTION_KEY;
  }

  console.warn(
    '⚠️  WARNING: Using a randomly generated encryption key. ' +
      'This is NOT suitable for production. ' +
      'Set ENCRYPTION_KEY environment variable.'
  );

  return randomBytes(32).toString('base64');
}

/**
 * Encryption Configuration
 *
 * Configuration for the encryption module with support for multiple cipher algorithms.
 * Default algorithm is AES-256-GCM for authenticated encryption with additional data.
 *
 * **Supported Algorithms**:
 * - AES-256-GCM: Authenticated encryption (recommended for most use cases)
 * - AES-256-CBC: Traditional block cipher mode
 * - Sodium: Modern NaCl-based encryption (libsodium)
 *
 * **Security Features**:
 * - Random IV/nonce generation for each encryption
 * - HMAC authentication (CBC mode)
 * - AEAD authentication (GCM mode)
 * - Key rotation support via previousKeys
 *
 * **Key Management**:
 * - Store keys in environment variables
 * - Use base64 encoding for keys
 * - Rotate keys periodically
 * - Keep old keys for decryption of existing data
 *
 * @see https://cheatsheetseries.owasp.org/cheatsheets/Cryptographic_Storage_Cheat_Sheet.html
 */
export const encryptionConfig: EncryptionModuleOptions = {
  /**
   * Encryption Key
   *
   * The primary encryption key used for all encryption operations.
   * Must be 32 bytes (256 bits) for AES-256.
   *
   * **IMPORTANT**: Store this securely in environment variables.
   * Never commit keys to version control.
   *
   * Generate a key:
   * ```bash
   * node -e "console.log(require('crypto').randomBytes(32).toString('base64'))"
   * ```
   */
  key: generateEncryptionKey(),

  /**
   * Cipher Algorithm
   *
   * The encryption algorithm to use for all operations.
   *
   * **Options**:
   * - CipherAlgorithm.AES_256_GCM (recommended): Authenticated encryption
   * - CipherAlgorithm.AES_256_CBC: Traditional AES
   * - CipherAlgorithm.SODIUM: Modern libsodium encryption
   *
   * **Recommendation**: Use AES-256-GCM for new applications.
   * It provides both encryption and authentication in one step.
   */
  cipher: CipherAlgorithm.AES_256_GCM,

  /**
   * Previous Keys
   *
   * Array of previous encryption keys for key rotation support.
   * When decrypting, if the primary key fails, these keys are tried in order.
   *
   * **Use Case**: Gradual key rotation
   * 1. Add old key to previousKeys array
   * 2. Update primary key to new key
   * 3. Re-encrypt data with new key over time
   * 4. Remove old key once all data is re-encrypted
   *
   * **Example**:
   * ```typescript
   * previousKeys: [
   *   'old-key-from-2023',
   *   'older-key-from-2022'
   * ]
   * ```
   */
  previousKeys: process.env.ENCRYPTION_PREVIOUS_KEYS
    ? process.env.ENCRYPTION_PREVIOUS_KEYS.split(',')
    : [],

  /**
   * Global Module Registration
   *
   * Set to true to make the encryption service available globally
   * across all modules without explicit imports.
   *
   * **Recommendation**: true for most applications
   */
  isGlobal: true,
};

/**
 * Encryption Configuration Notes
 *
 * **Environment Variables**:
 * - ENCRYPTION_KEY: Primary encryption key (base64, required)
 * - ENCRYPTION_PREVIOUS_KEYS: Comma-separated list of old keys (optional)
 * - ENCRYPTION_CIPHER: Override cipher algorithm (optional)
 *
 * **Key Rotation Strategy**:
 * 1. Generate new key
 * 2. Add current key to ENCRYPTION_PREVIOUS_KEYS
 * 3. Update ENCRYPTION_KEY to new key
 * 4. Deploy application
 * 5. Re-encrypt existing data
 * 6. Remove old keys after migration
 *
 * **Security Best Practices**:
 * - Use AES-256-GCM for authenticated encryption
 * - Rotate keys at least annually
 * - Store keys in a secure key management service (AWS KMS, Azure Key Vault, etc.)
 * - Use different keys for different environments (dev, staging, prod)
 * - Never log or expose encryption keys
 * - Use secure random number generators for key generation
 *
 * **Performance Considerations**:
 * - GCM mode: Faster and more secure than CBC
 * - CBC mode: Slightly slower due to separate HMAC
 * - Sodium: Very fast, modern implementation
 */
