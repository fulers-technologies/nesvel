import { BaseException } from '@nesvel/exceptions';

/**
 * Exception thrown when decryption fails.
 *
 * @remarks
 * This exception is thrown when a decryption operation fails due to:
 * - Invalid ciphertext format
 * - Authentication tag verification failure (AEAD)
 * - HMAC verification failure (CBC)
 * - Corrupted or tampered data
 *
 * @example
 * ```typescript
 * throw new DecryptionException('MAC verification failed');
 * ```
 */
export class DecryptionException extends BaseException {
  /**
   * Creates a new DecryptionException instance.
   *
   * @param message - The error message describing what went wrong
   * @param cause - Optional underlying error that caused this exception
   */
  constructor(
    message: string,
    public readonly cause?: Error
  ) {
    super(message);
    this.name = 'DecryptionException';
    Object.setPrototypeOf(this, DecryptionException.prototype);
  }
}
