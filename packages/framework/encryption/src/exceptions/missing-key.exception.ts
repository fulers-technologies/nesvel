import { BaseException } from '@nesvel/exceptions';

/**
 * Exception thrown when no encryption key is configured.
 *
 * @remarks
 * This exception is thrown when:
 * - No encryption key is provided in configuration
 * - Environment variable for key is not set
 * - Key is empty or undefined
 *
 * @example
 * ```typescript
 * throw new MissingKeyException('No encryption key configured. Set APP_KEY environment variable.');
 * ```
 */
export class MissingKeyException extends BaseException {
  /**
   * Creates a new MissingKeyException instance.
   *
   * @param message - The error message describing what went wrong
   */
  constructor(message: string = 'No encryption key configured') {
    super(message);
    this.name = 'MissingKeyException';
    Object.setPrototypeOf(this, MissingKeyException.prototype);
  }
}
