import { BaseException } from '@nesvel/shared';

/**
 * Exception thrown when maximum retry attempts are exceeded.
 *
 * Contains information about all retry attempts and the final error
 * that caused the operation to fail permanently.
 */
export class MaxRetriesExceededException extends BaseException {
  /**
   * The final error that occurred on the last retry attempt.
   */
  public readonly lastError: Error;

  /**
   * Number of retry attempts made before giving up.
   */
  public readonly attempts: number;

  /**
   * Creates a new MaxRetriesExceededException.
   *
   * @param message - Error message
   * @param lastError - The final error from the last attempt
   * @param attempts - Number of attempts made
   *
   * @example
   * ```typescript
   * throw MaxRetriesExceededException.make(
   *   'Operation failed after 3 attempts',
   *   new Error('Connection refused'),
   *   3
   * );
   * ```
   */
  constructor(message: string, lastError: Error, attempts: number) {
    super(message);
    this.name = 'MaxRetriesExceededException';
    this.lastError = lastError;
    this.attempts = attempts;

    // Maintains proper stack trace for where error was thrown (V8 only)
    if (Error.captureStackTrace) {
      Error.captureStackTrace(this, MaxRetriesExceededException);
    }
  }
}
