import { BaseException } from '@nesvel/exceptions';

/**
 * Exception thrown when backpressure wait timeout is exceeded.
 *
 * Indicates that the system is overloaded and cannot accept new operations.
 */
export class BackpressureTimeoutException extends BaseException {
  /**
   * Current number of inflight operations.
   */
  public readonly currentInflight: number;

  /**
   * Maximum allowed inflight operations.
   */
  public readonly maxInflight: number;

  /**
   * How long the operation waited before timing out (ms).
   */
  public readonly waitedMs: number;

  /**
   * Creates a new BackpressureTimeoutException.
   *
   * @param message - Error message
   * @param currentInflight - Current inflight count
   * @param maxInflight - Maximum allowed
   * @param waitedMs - Time waited
   *
   * @example
   * ```typescript
   * throw BackpressureTimeoutException.make(
   *   'Backpressure wait timeout exceeded: 30000ms',
   *   1000,
   *   1000,
   *   30000
   * );
   * ```
   */
  constructor(message: string, currentInflight: number, maxInflight: number, waitedMs: number) {
    super(message);
    this.name = 'BackpressureTimeoutException';
    this.currentInflight = currentInflight;
    this.maxInflight = maxInflight;
    this.waitedMs = waitedMs;

    // Maintains proper stack trace for where error was thrown (V8 only)
    if (Error.captureStackTrace) {
      Error.captureStackTrace(this, BackpressureTimeoutException);
    }
  }
}
