import sodium from 'libsodium-wrappers';

import { CipherAlgorithm } from '@enums';
import { EncryptedPayload } from '@types';
import { CIPHER_CONFIG } from '@constants';
import { BaseEncryptionDriver } from './base.driver';
import { EncryptionException, DecryptionException, InvalidKeyException } from '@exceptions';

/**
 * Sodium encryption driver using libsodium (XChaCha20-Poly1305).
 *
 * @remarks
 * Implements modern authenticated encryption using libsodium's secretbox,
 * which uses XChaCha20-Poly1305 for AEAD. This is the recommended
 * encryption method for new applications due to its security and performance.
 *
 * Features:
 * - XChaCha20 stream cipher (256-bit key, 192-bit nonce)
 * - Poly1305 MAC for authentication
 * - AEAD (Authenticated Encryption with Associated Data)
 * - Resistant to timing attacks
 * - Modern cryptographic primitives
 *
 * @example
 * ```typescript
 * const driver = new SodiumDriver(key, CipherAlgorithm.SODIUM);
 * const encrypted = await driver.encrypt('secret data');
 * const decrypted = await driver.decrypt(encrypted);
 * ```
 */
export class SodiumDriver extends BaseEncryptionDriver {
  private readonly keyLength: number;
  private readonly ivLength: number;
  private sodiumReady: Promise<void>;

  /**
   * Creates a new Sodium driver instance.
   *
   * @param key - The encryption key (base64-encoded, must be 32 bytes)
   * @param cipher - The cipher algorithm (must be SODIUM)
   */
  constructor(key: string, cipher: CipherAlgorithm = CipherAlgorithm.SODIUM) {
    super(key, cipher);
    const config = CIPHER_CONFIG[cipher];
    this.keyLength = config.keyLength;
    this.ivLength = config.ivLength;
    this.sodiumReady = sodium.ready;
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
   * Encrypts plaintext using libsodium's secretbox (XChaCha20-Poly1305).
   *
   * @param plaintext - The data to encrypt
   * @param serialize - Whether to serialize the result as JSON (default: true)
   * @returns The encrypted payload with nonce and authentication tag
   *
   * @throws {EncryptionException} If encryption fails
   *
   * @example
   * ```typescript
   * const encrypted = await driver.encrypt('secret data');
   * // Returns: '{"iv":"...","value":"...","tag":"..."}'
   * ```
   */
  async encrypt(plaintext: string, serialize: boolean = true): Promise<string | EncryptedPayload> {
    try {
      await this.sodiumReady;

      const keyBuffer = this.getKeyBuffer();
      const nonce = sodium.randombytes_buf(this.ivLength);
      const messageBytes = sodium.from_string(plaintext);

      // Encrypt using secretbox (XChaCha20-Poly1305)
      const ciphertext = sodium.crypto_secretbox_easy(messageBytes, nonce, keyBuffer);

      const payload: EncryptedPayload = {
        iv: sodium.to_base64(nonce, sodium.base64_variants.ORIGINAL),
        value: sodium.to_base64(ciphertext, sodium.base64_variants.ORIGINAL),
        tag: '', // Sodium includes the tag in the ciphertext, but we keep this for compatibility
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
   * Decrypts an encrypted payload using libsodium's secretbox.
   *
   * @param payload - The encrypted data (JSON string or object)
   * @returns The decrypted plaintext
   *
   * @throws {DecryptionException} If decryption or authentication fails
   *
   * @example
   * ```typescript
   * const plaintext = await driver.decrypt(encryptedPayload);
   * // Returns: 'secret data'
   * ```
   */
  async decrypt(payload: string | EncryptedPayload): Promise<string> {
    try {
      await this.sodiumReady;

      const parsed = this.parsePayload(payload);
      this.validatePayload(parsed, ['iv', 'value']);

      const keyBuffer = this.getKeyBuffer();
      const nonce = sodium.from_base64(parsed.iv, sodium.base64_variants.ORIGINAL);
      const ciphertext = sodium.from_base64(parsed.value, sodium.base64_variants.ORIGINAL);

      // Decrypt using secretbox
      const decrypted = sodium.crypto_secretbox_open_easy(ciphertext, nonce, keyBuffer);

      if (!decrypted) {
        throw new DecryptionException('Decryption failed - authentication tag verification failed');
      }

      return sodium.to_string(decrypted);
    } catch (error: Error | any) {
      if (error instanceof DecryptionException) {
        throw error;
      }
      throw new DecryptionException(`Failed to decrypt data using ${this.cipher}`, error as Error);
    }
  }
}
