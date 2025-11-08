/**
 * Circuit breaker states based on the classic circuit breaker pattern.
 *
 * The circuit breaker transitions between these states based on success
 * and failure rates to prevent cascading failures in distributed systems.
 */
export enum CircuitState {
  /**
   * Normal operation state.
   * All requests are allowed through. Failures are counted and may
   * trigger a transition to OPEN state if threshold is exceeded.
   */
  CLOSED = 'CLOSED',

  /**
   * Failure state - circuit is "tripped".
   * All requests are immediately rejected without attempting the operation.
   * After a timeout period, transitions to HALF_OPEN to test recovery.
   */
  OPEN = 'OPEN',

  /**
   * Recovery testing state.
   * Limited requests are allowed through to test if the service has recovered.
   * Success transitions to CLOSED, failure transitions back to OPEN.
   */
  HALF_OPEN = 'HALF_OPEN',
}
