import { BaseException } from '@nesvel/exceptions';

/**
 * Exception thrown when an unsupported cipher algorithm is requested.
 *
 * This exception is thrown by the EncryptionFactoryService when attempting
 * to create a driver for a cipher algorithm that is not registered or supported.
 * It provides helpful information about available cipher algorithms.
 *
 * @example
 * ```typescript
 * throw UnsupportedCipherException.make('unknown-cipher');
 * // Error: Unsupported cipher algorithm: unknown-cipher.
 * // Available: aes-128-cbc, aes-256-cbc, aes-128-gcm, aes-256-gcm, sodium
 * ```
 *
 * @see {@link EncryptionFactoryService}
 */
export class UnsupportedCipherException extends BaseException {
  /**
   * Creates a new UnsupportedCipherException instance.
   *
   * @param cipher - The unsupported cipher algorithm that was requested
   */
  constructor(cipher: string) {
    const availableCiphers = ['aes-128-cbc', 'aes-256-cbc', 'aes-128-gcm', 'aes-256-gcm', 'sodium'];

    super(`Unsupported cipher algorithm: ${cipher}. Available: ${availableCiphers.join(', ')}`);
    this.name = 'UnsupportedCipherException';
    Object.setPrototypeOf(this, UnsupportedCipherException.prototype);
  }
}
