import { createCipheriv, createDecipheriv, type CipherGCMTypes } from 'crypto';

import { IVGenerator } from '@utils';
import { CipherAlgorithm } from '@enums';
import { EncryptedPayload } from '@types';
import { CIPHER_CONFIG } from '@constants';
import { BaseEncryptionDriver } from './base.driver';
import { EncryptionException, DecryptionException, InvalidKeyException } from '@exceptions';

/**
 * AES-GCM encryption driver for AES-128-GCM and AES-256-GCM ciphers.
 *
 * @remarks
 * Implements AES encryption in GCM (Galois/Counter Mode) which provides
 * authenticated encryption with associated data (AEAD). This driver supports
 * both 128-bit and 256-bit key sizes and requires a 12-byte IV.
 *
 * Security features:
 * - AEAD provides both confidentiality and integrity
 * - Authentication tag is included in the payload and verified on decrypt
 *
 * @example
 * ```typescript
 * const driver = new AesGcmDriver(key, CipherAlgorithm.AES_256_GCM);
 * const encrypted = await driver.encrypt('secret data');
 * const decrypted = await driver.decrypt(encrypted);
 * ```
 */
export class AesGcmDriver extends BaseEncryptionDriver {
  private readonly keyLength: number;
  private readonly ivLength: number;
  private readonly tagLength: number;

  /**
   * Creates a new AES-GCM driver instance.
   *
   * @param key - The encryption key (base64-encoded)
   * @param cipher - The AES-GCM cipher variant (AES_128_GCM or AES_256_GCM)
   */
  constructor(key: string, cipher: CipherAlgorithm) {
    super(key, cipher);
    const config = CIPHER_CONFIG[cipher];
    this.keyLength = config.keyLength;
    this.ivLength = config.ivLength;

    // Type narrowing: GCM ciphers always have tagLength in their config
    if (!('tagLength' in config)) {
      throw new Error(`Invalid cipher for AES-GCM driver: ${cipher}`);
    }

    this.tagLength = config.tagLength;
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
   * Encrypts plaintext using AES-GCM (AEAD).
   *
   * @param plaintext - The data to encrypt
   * @param serialize - Whether to serialize the result as JSON (default: true)
   * @returns The encrypted payload with IV and authentication tag
   *
   * @throws {EncryptionException} If encryption fails
   */
  async encrypt(plaintext: string, serialize: boolean = true): Promise<string | EncryptedPayload> {
    try {
      const keyBuffer = this.getKeyBuffer();
      const iv = IVGenerator.generate(this.cipher as CipherAlgorithm);

      // Encrypt the plaintext with authentication tag length specification
      // Cast cipher to CipherGCMTypes for proper type inference
      const cipher = createCipheriv(this.cipher as CipherGCMTypes, keyBuffer, iv, {
        authTagLength: this.tagLength,
      });
      let encrypted = cipher.update(plaintext, 'utf8', 'base64');
      encrypted += cipher.final('base64');
      const tag = cipher.getAuthTag().toString('base64');

      const payload: EncryptedPayload = {
        iv: iv.toString('base64'),
        value: encrypted,
        tag,
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
   * Decrypts an encrypted payload using AES-GCM with tag verification.
   *
   * @param payload - The encrypted data (JSON string or object)
   * @returns The decrypted plaintext
   *
   * @throws {DecryptionException} If decryption or tag verification fails
   */
  async decrypt(payload: string | EncryptedPayload): Promise<string> {
    try {
      const parsed = this.parsePayload(payload);
      this.validatePayload(parsed, ['iv', 'value', 'tag']);

      const keyBuffer = this.getKeyBuffer();
      const iv = Buffer.from(parsed.iv, 'base64');
      const encrypted = Buffer.from(parsed.value, 'base64');
      const tag = Buffer.from(parsed.tag!, 'base64');

      // Decrypt the ciphertext with authentication tag length specification
      // Cast cipher to CipherGCMTypes for proper type inference
      const decipher = createDecipheriv(this.cipher as CipherGCMTypes, keyBuffer, iv, {
        authTagLength: this.tagLength,
      });
      decipher.setAuthTag(tag);
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
}
