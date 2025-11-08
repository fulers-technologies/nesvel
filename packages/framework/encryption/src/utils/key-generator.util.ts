import { randomBytes } from 'crypto';
import { CipherAlgorithm } from '@enums';
import { CIPHER_CONFIG } from '@constants';

/**
 * Utility class for generating encryption keys.
 *
 * @remarks
 * Provides methods to generate cryptographically secure random keys
 * for various cipher algorithms.
 */
export class KeyGenerator {
  /**
   * Generates a random encryption key for the specified cipher algorithm.
   *
   * @param cipher - The cipher algorithm to generate a key for
   * @param encoding - The encoding format for the key (default: 'base64')
   * @returns A randomly generated key in the specified encoding
   *
   * @example
   * ```typescript
   * const key = KeyGenerator.generate(CipherAlgorithm.AES_256_GCM);
   * console.log(key); // base64-encoded 32-byte key
   * ```
   */
  static generate(
    cipher: CipherAlgorithm = CipherAlgorithm.AES_256_GCM,
    encoding: BufferEncoding = 'base64'
  ): string {
    const config = CIPHER_CONFIG[cipher];
    const keyBuffer = randomBytes(config.keyLength);
    return keyBuffer.toString(encoding);
  }

  /**
   * Generates a random encryption key with a specific length.
   *
   * @param length - The key length in bytes
   * @param encoding - The encoding format for the key (default: 'base64')
   * @returns A randomly generated key in the specified encoding
   *
   * @example
   * ```typescript
   * const key = KeyGenerator.generateWithLength(32); // 32-byte key
   * ```
   */
  static generateWithLength(length: number, encoding: BufferEncoding = 'base64'): string {
    const keyBuffer = randomBytes(length);
    return keyBuffer.toString(encoding);
  }

  /**
   * Generates multiple encryption keys at once.
   *
   * @param count - Number of keys to generate
   * @param cipher - The cipher algorithm to generate keys for
   * @param encoding - The encoding format for the keys (default: 'base64')
   * @returns An array of randomly generated keys
   *
   * @example
   * ```typescript
   * const keys = KeyGenerator.generateMultiple(3, CipherAlgorithm.AES_256_GCM);
   * // Returns array of 3 base64-encoded 32-byte keys
   * ```
   */
  static generateMultiple(
    count: number,
    cipher: CipherAlgorithm = CipherAlgorithm.AES_256_GCM,
    encoding: BufferEncoding = 'base64'
  ): string[] {
    return Array.from({ length: count }, () => this.generate(cipher, encoding));
  }
}
