import { BaseException } from '@nesvel/exceptions';

/**
 * Exception thrown when an encryption key is invalid.
 *
 * @remarks
 * This exception is thrown when:
 * - Key length does not match cipher requirements
 * - Key format is invalid
 * - Key cannot be decoded from its encoding
 *
 * @example
 * ```typescript
 * throw InvalidKeyException.make('Key must be 32 bytes for AES-256-GCM');
 * ```
 */
export class InvalidKeyException extends BaseException {
  /**
   * Creates a new InvalidKeyException instance.
   *
   * @param message - The error message describing what went wrong
   * @param cause - Optional underlying error that caused this exception
   */
  constructor(
    message: string,
    public readonly cause?: Error
  ) {
    super(message);
    this.name = 'InvalidKeyException';
    Object.setPrototypeOf(this, InvalidKeyException.prototype);
  }
}
