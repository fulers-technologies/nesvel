import { randomBytes } from 'crypto';
import { CipherAlgorithm } from '@enums';
import { CIPHER_CONFIG } from '@constants';

/**
 * Utility class for generating initialization vectors (IVs).
 *
 * @remarks
 * Provides methods to generate cryptographically secure random IVs
 * for various cipher algorithms. IVs must be unique for each encryption
 * operation to ensure security.
 */
export class IVGenerator {
  /**
   * Generates a random IV for the specified cipher algorithm.
   *
   * @param cipher - The cipher algorithm to generate an IV for
   * @returns A Buffer containing the randomly generated IV
   *
   * @example
   * ```typescript
   * const iv = IVGenerator.generate(CipherAlgorithm.AES_256_GCM);
   * console.log(iv.length); // 12 bytes for GCM
   * ```
   */
  static generate(cipher: CipherAlgorithm): Buffer {
    const config = CIPHER_CONFIG[cipher];
    return randomBytes(config.ivLength);
  }

  /**
   * Generates a random IV with a specific length.
   *
   * @param length - The IV length in bytes
   * @returns A Buffer containing the randomly generated IV
   *
   * @example
   * ```typescript
   * const iv = IVGenerator.generateWithLength(16); // 16-byte IV
   * ```
   */
  static generateWithLength(length: number): Buffer {
    return randomBytes(length);
  }

  /**
   * Generates a random IV and returns it as a string in the specified encoding.
   *
   * @param cipher - The cipher algorithm to generate an IV for
   * @param encoding - The encoding format for the IV (default: 'base64')
   * @returns A string representation of the IV in the specified encoding
   *
   * @example
   * ```typescript
   * const iv = IVGenerator.generateString(CipherAlgorithm.AES_256_GCM, 'hex');
   * console.log(iv); // Hex-encoded IV string
   * ```
   */
  static generateString(cipher: CipherAlgorithm, encoding: BufferEncoding = 'base64'): string {
    const ivBuffer = this.generate(cipher);
    return ivBuffer.toString(encoding);
  }
}
