import { createCipheriv, createDecipheriv, createHmac, timingSafeEqual } from 'crypto';

import { IVGenerator } from '@utils';
import { CipherAlgorithm } from '@enums';
import { EncryptedPayload } from '@types';
import { CIPHER_CONFIG } from '@constants';
import { BaseEncryptionDriver } from './base.driver';
import { EncryptionException, DecryptionException, InvalidKeyException } from '@exceptions';

/**
 * AES-CBC encryption driver for AES-128-CBC and AES-256-CBC ciphers.
 *
 * @remarks
 * Implements AES encryption in CBC (Cipher Block Chaining) mode with HMAC
 * authentication for data integrity. This driver supports both 128-bit and
 * 256-bit key sizes.
 *
 * CBC mode requires:
 * - 16-byte IV (initialization vector)
 * - HMAC-SHA256 for authentication (not AEAD)
 * - Padding (PKCS#7)
 *
 * Security features:
 * - Encrypt-then-MAC pattern for authenticated encryption
 * - Timing-safe HMAC comparison to prevent timing attacks
 *
 * @example
 * ```typescript
 * const driver = new AesCbcDriver(key, CipherAlgorithm.AES_256_CBC);
 * const encrypted = await driver.encrypt('secret data');
 * const decrypted = await driver.decrypt(encrypted);
 * ```
 */
export class AesCbcDriver extends BaseEncryptionDriver {
  private readonly keyLength: number;
  private readonly ivLength: number;

  /**
   * Creates a new AES-CBC driver instance.
   *
   * @param key - The encryption key (base64-encoded)
   * @param cipher - The AES-CBC cipher variant (AES_128_CBC or AES_256_CBC)
   */
  constructor(key: string, cipher: CipherAlgorithm) {
    super(key, cipher);
    const config = CIPHER_CONFIG[cipher];
    this.keyLength = config.keyLength;
    this.ivLength = config.ivLength;
  }

  /**
   * Validates the encryption key format and length.
   *
   * @throws {InvalidKeyException} If the key is invalid
   */
  protected validateKey(): void {
    try {
      const keyBuffer = Buffer.from(this.key, 'base64');
      if (keyBuffer.length !== this.keyLength) {
        throw new InvalidKeyException(
          `Invalid key length for ${this.cipher}. Expected ${this.keyLength} bytes, got ${keyBuffer.length} bytes`
        );
      }
    } catch (error: Error | any) {
      if (error instanceof InvalidKeyException) {
        throw error;
      }
      throw new InvalidKeyException('Failed to decode encryption key from base64', error as Error);
    }
  }

  /**
   * Encrypts plaintext using AES-CBC with HMAC authentication.
   *
   * @param plaintext - The data to encrypt
   * @param serialize - Whether to serialize the result as JSON (default: true)
   * @returns The encrypted payload with IV and MAC
   *
   * @throws {EncryptionException} If encryption fails
   *
   * @example
   * ```typescript
   * const encrypted = await driver.encrypt('secret data');
   * // Returns: '{"iv":"...","value":"...","mac":"..."}'
   * ```
   */
  async encrypt(plaintext: string, serialize: boolean = true): Promise<string | EncryptedPayload> {
    try {
      const keyBuffer = this.getKeyBuffer();
      const iv = IVGenerator.generate(this.cipher as CipherAlgorithm);

      // Encrypt the plaintext
      const cipher = createCipheriv(this.cipher, keyBuffer, iv);
      let encrypted = cipher.update(plaintext, 'utf8', 'base64');
      encrypted += cipher.final('base64');

      // Create HMAC for authentication (encrypt-then-MAC)
      const mac = this.generateMac(iv.toString('base64'), encrypted);

      const payload: EncryptedPayload = {
        iv: iv.toString('base64'),
        value: encrypted,
        mac,
      };

      return this.serializePayload(payload, serialize);
    } catch (error: Error | any) {
      if (error instanceof EncryptionException) {
        throw error;
      }
      throw new EncryptionException(`Failed to encrypt data using ${this.cipher}`, error as Error);
    }
  }

  /**
   * Decrypts an encrypted payload using AES-CBC with HMAC verification.
   *
   * @param payload - The encrypted data (JSON string or object)
   * @returns The decrypted plaintext
   *
   * @throws {DecryptionException} If decryption or MAC verification fails
   *
   * @example
   * ```typescript
   * const plaintext = await driver.decrypt(encryptedPayload);
   * // Returns: 'secret data'
   * ```
   */
  async decrypt(payload: string | EncryptedPayload): Promise<string> {
    try {
      const parsed = this.parsePayload(payload);
      this.validatePayload(parsed, ['iv', 'value', 'mac']);

      // Verify HMAC before decrypting
      this.verifyMac(parsed.iv, parsed.value, parsed.mac!);

      const keyBuffer = this.getKeyBuffer();
      const iv = Buffer.from(parsed.iv, 'base64');
      const encrypted = Buffer.from(parsed.value, 'base64');

      // Decrypt the ciphertext
      const decipher = createDecipheriv(this.cipher, keyBuffer, iv);
      let decrypted = decipher.update(encrypted);
      decrypted = Buffer.concat([decrypted, decipher.final()]);

      return decrypted.toString('utf8');
    } catch (error: Error | any) {
      if (error instanceof DecryptionException) {
        throw error;
      }
      throw new DecryptionException(`Failed to decrypt data using ${this.cipher}`, error as Error);
    }
  }

  /**
   * Generates an HMAC-SHA256 authentication tag for the encrypted data.
   *
   * @param iv - The initialization vector (base64-encoded)
   * @param ciphertext - The encrypted ciphertext (base64-encoded)
   * @returns The HMAC tag (base64-encoded)
   */
  private generateMac(iv: string, ciphertext: string): string {
    const keyBuffer = this.getKeyBuffer();
    const hmac = createHmac('sha256', keyBuffer);
    hmac.update(iv);
    hmac.update(ciphertext);
    return hmac.digest('base64');
  }

  /**
   * Verifies the HMAC authentication tag using timing-safe comparison.
   *
   * @param iv - The initialization vector (base64-encoded)
   * @param ciphertext - The encrypted ciphertext (base64-encoded)
   * @param expectedMac - The expected HMAC tag (base64-encoded)
   *
   * @throws {DecryptionException} If MAC verification fails
   */
  private verifyMac(iv: string, ciphertext: string, expectedMac: string): void {
    const computedMac = this.generateMac(iv, ciphertext);
    const computedBuffer = Buffer.from(computedMac, 'base64');
    const expectedBuffer = Buffer.from(expectedMac, 'base64');

    // Use timing-safe comparison to prevent timing attacks
    if (
      computedBuffer.length !== expectedBuffer.length ||
      !timingSafeEqual(computedBuffer, expectedBuffer)
    ) {
      throw new DecryptionException('MAC verification failed - data may be corrupted or tampered');
    }
  }
}
