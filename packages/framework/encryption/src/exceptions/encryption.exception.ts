import { BaseException } from '@nesvel/exceptions';

/**
 * Base exception for encryption-related errors.
 *
 * @remarks
 * This exception is thrown when an encryption operation fails.
 * It extends the standard Error class to provide additional context.
 *
 * @example
 * ```typescript
 * throw EncryptionException.make('Failed to encrypt data: invalid key format');
 * ```
 */
export class EncryptionException extends BaseException {
  /**
   * Creates a new EncryptionException instance.
   *
   * @param message - The error message describing what went wrong
   * @param cause - Optional underlying error that caused this exception
   */
  constructor(
    message: string,
    public readonly cause?: Error
  ) {
    super(message);
    this.name = 'EncryptionException';
    Object.setPrototypeOf(this, EncryptionException.prototype);
  }
}
