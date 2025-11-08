import { EncryptedPayload } from '@types';

/**
 * Interface that all encryption drivers must implement.
 *
 * @remarks
 * This interface defines the contract for encryption drivers.
 * Each driver implements a specific cipher algorithm (AES-CBC, AES-GCM, Sodium, etc.)
 * and must provide encrypt and decrypt methods.
 */
export interface IEncryptionDriver {
  /**
   * Encrypts a plaintext string using the configured cipher.
   *
   * @param plaintext - The data to encrypt
   * @param serialize - Whether to serialize the result as JSON (default: true)
   * @returns The encrypted payload (serialized as JSON string or as object)
   *
   * @throws {EncryptionException} If encryption fails
   *
   * @example
   * ```typescript
   * const encrypted = await driver.encrypt('secret data');
   * // Returns: '{"iv":"...","value":"...","tag":"..."}'
   * ```
   */
  encrypt(plaintext: string, serialize?: boolean): Promise<string | EncryptedPayload>;

  /**
   * Decrypts an encrypted payload back to plaintext.
   *
   * @param payload - The encrypted data (JSON string or object)
   * @returns The decrypted plaintext string
   *
   * @throws {DecryptionException} If decryption fails or authentication fails
   *
   * @example
   * ```typescript
   * const plaintext = await driver.decrypt(encryptedPayload);
   * // Returns: 'secret data'
   * ```
   */
  decrypt(payload: string | EncryptedPayload): Promise<string>;

  /**
   * Gets the cipher algorithm name used by this driver.
   *
   * @returns The cipher algorithm identifier
   */
  getCipher(): string;
}
