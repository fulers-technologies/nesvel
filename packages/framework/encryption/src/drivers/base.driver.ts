import { EncryptedPayload } from '@types';
import { IEncryptionDriver } from '@interfaces';
import { DecryptionException, InvalidKeyException } from '@exceptions';

/**
 * Abstract base class for encryption drivers.
 *
 * @remarks
 * Provides common functionality for all encryption drivers including:
 * - Key validation
 * - Payload serialization/deserialization
 * - Common error handling
 *
 * Concrete drivers must implement the actual encrypt/decrypt logic.
 */
export abstract class BaseEncryptionDriver implements IEncryptionDriver {
  /**
   * Creates a new encryption driver instance.
   *
   * @param key - The encryption key (base64-encoded)
   * @param cipher - The cipher algorithm identifier
   */
  constructor(
    protected readonly key: string,
    protected readonly cipher: string
  ) {
    this.validateKey();
  }

  /**
   * Validates that the encryption key is properly formatted and has the correct length.
   *
   * @throws {InvalidKeyException} If the key is invalid
   */
  protected abstract validateKey(): void;

  /**
   * Encrypts plaintext data.
   *
   * @param plaintext - The data to encrypt
   * @param serialize - Whether to serialize the result as JSON
   * @returns The encrypted payload
   */
  abstract encrypt(plaintext: string, serialize?: boolean): Promise<string | EncryptedPayload>;

  /**
   * Decrypts encrypted data.
   *
   * @param payload - The encrypted payload
   * @returns The decrypted plaintext
   */
  abstract decrypt(payload: string | EncryptedPayload): Promise<string>;

  /**
   * Gets the cipher algorithm used by this driver.
   *
   * @returns The cipher algorithm identifier
   */
  getCipher(): string {
    return this.cipher;
  }

  /**
   * Decodes the encryption key from base64 to a Buffer.
   *
   * @returns The decoded key as a Buffer
   * @throws {InvalidKeyException} If the key cannot be decoded
   */
  protected getKeyBuffer(): Buffer {
    try {
      return Buffer.from(this.key, 'base64');
    } catch (error: Error | any) {
      throw InvalidKeyException.make('Failed to decode encryption key from base64', error as Error);
    }
  }

  /**
   * Parses an encrypted payload from a string or object.
   *
   * @param payload - The payload to parse (JSON string or object)
   * @returns The parsed payload object
   * @throws {DecryptionException} If the payload cannot be parsed
   */
  protected parsePayload(payload: string | EncryptedPayload): EncryptedPayload {
    try {
      if (typeof payload === 'string') {
        return JSON.parse(payload) as EncryptedPayload;
      }
      return payload;
    } catch (error: Error | any) {
      throw DecryptionException.make('Invalid encrypted payload format', error as Error);
    }
  }

  /**
   * Serializes an encrypted payload to a JSON string.
   *
   * @param payload - The payload to serialize
   * @param serialize - Whether to serialize (if false, returns the object as-is)
   * @returns The serialized payload or the original object
   */
  protected serializePayload(
    payload: EncryptedPayload,
    serialize: boolean = true
  ): string | EncryptedPayload {
    return serialize ? JSON.stringify(payload) : payload;
  }

  /**
   * Validates that a payload has all required fields.
   *
   * @param payload - The payload to validate
   * @param requiredFields - Array of required field names
   * @throws {DecryptionException} If any required field is missing
   */
  protected validatePayload(
    payload: EncryptedPayload,
    requiredFields: (keyof EncryptedPayload)[]
  ): void {
    for (const field of requiredFields) {
      if (!payload[field]) {
        throw DecryptionException.make(`Missing required field in encrypted payload: ${field}`);
      }
    }
  }
}
