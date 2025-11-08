import { BaseException } from '@nesvel/exceptions';

import { CircuitState } from '../enums';

/**
 * Exception thrown when circuit breaker is open.
 *
 * Indicates that the operation was rejected by the circuit breaker
 * without being attempted, due to previous failures.
 */
export class CircuitOpenException extends BaseException {
  /**
   * Current state of the circuit (should be OPEN).
   */
  public readonly state: CircuitState;

  /**
   * Number of failures that caused the circuit to open.
   */
  public readonly failureCount: number;

  /**
   * Timestamp when the circuit will attempt recovery.
   */
  public readonly resetAt: Date;

  /**
   * Creates a new CircuitOpenException.
   *
   * @param message - Error message
   * @param state - Current circuit state
   * @param failureCount - Number of failures
   * @param resetAt - When circuit will attempt recovery
   *
   * @example
   * ```typescript
   * throw CircuitOpenException.make(
   *   'Circuit breaker is OPEN',
   *   CircuitState.OPEN,
   *   5,
   *   new Date(Date.now() + 60000)
   * );
   * ```
   */
  constructor(message: string, state: CircuitState, failureCount: number, resetAt: Date) {
    super(message);
    this.name = 'CircuitOpenException';
    this.state = state;
    this.failureCount = failureCount;
    this.resetAt = resetAt;

    // Maintains proper stack trace for where error was thrown (V8 only)
    if (Error.captureStackTrace) {
      Error.captureStackTrace(this, CircuitOpenException);
    }
  }
}
