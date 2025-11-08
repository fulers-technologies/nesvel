import { Inject, Injectable } from '@nestjs/common';

import { ENCRYPTION_DRIVER } from '@constants';
import type { IEncryptionDriver } from '@interfaces';
import type { EncryptedPayload } from '@types';

/**
 * Main encryption service providing encrypt/decrypt operations.
 *
 * @remarks
 * This service provides a high-level API for encryption and decryption
 * with support for multiple cipher algorithms (AES-CBC, AES-GCM, Sodium).
 *
 * The service uses the driver provided by the module configuration.
 *
 * @example
 * ```typescript
 * @Injectable()
 * export class MyService {
 *   constructor(private encryption: EncryptionService) {}
 *
 *   async saveData(data: string) {
 *     const encrypted = await this.encryption.encrypt(data);
 *     // Store encrypted data
 *   }
 *
 *   async loadData(encrypted: string) {
 *     return await this.encryption.decrypt(encrypted);
 *   }
 * }
 * ```
 */
@Injectable()
export class EncryptionService {
  /**
   * Creates a new EncryptionService instance.
   *
   * @param driver - The encryption driver instance
   */
  constructor(
    @Inject(ENCRYPTION_DRIVER)
    private readonly driver: IEncryptionDriver
  ) {}

  /**
   * Encrypts a plaintext string.
   *
   * @param plaintext - The data to encrypt
   * @param serialize - Whether to serialize the result as JSON
   * @returns The encrypted data
   *
   * @throws {EncryptionException} If encryption fails
   *
   * @example
   * ```typescript
   * const encrypted = await service.encrypt('secret data');
   * ```
   */
  async encrypt(plaintext: string, serialize?: boolean): Promise<string | EncryptedPayload> {
    return this.driver.encrypt(plaintext, serialize);
  }

  /**
   * Encrypts a plaintext string and ensures the result is serialized as a JSON string.
   *
   * @param plaintext - The data to encrypt
   * @returns The encrypted data as a JSON string
   *
   * @throws {EncryptionException} If encryption fails
   *
   * @example
   * ```typescript
   * const encrypted = await service.encryptString('secret data');
   * ```
   */
  async encryptString(plaintext: string): Promise<string> {
    return (await this.driver.encrypt(plaintext, true)) as string;
  }

  /**
   * Decrypts an encrypted payload.
   *
   * @param payload - The encrypted data (JSON string or object)
   * @returns The decrypted plaintext
   *
   * @throws {DecryptionException} If decryption fails
   *
   * @example
   * ```typescript
   * const plaintext = await service.decrypt(encryptedPayload);
   * ```
   */
  async decrypt(payload: string | EncryptedPayload): Promise<string> {
    return this.driver.decrypt(payload);
  }

  /**
   * Gets the cipher algorithm currently in use.
   *
   * @returns The cipher algorithm identifier
   *
   * @example
   * ```typescript
   * const cipher = service.getCipher();
   * ```
   */
  getCipher(): string {
    return this.driver.getCipher();
  }
}
