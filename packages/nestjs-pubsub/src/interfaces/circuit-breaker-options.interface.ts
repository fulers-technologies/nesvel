import { CircuitState } from '../enums';

/**
 * Configuration options for circuit breaker behavior.
 *
 * Controls failure thresholds, timeout periods, and recovery testing.
 */
export interface ICircuitBreakerOptions {
  /**
   * Number of consecutive failures required to open the circuit.
   * Once this threshold is reached, the circuit opens and rejects all requests.
   *
   * @default 5
   */
  failureThreshold: number;

  /**
   * Time in milliseconds to wait before attempting recovery after circuit opens.
   * After this timeout, the circuit transitions to HALF_OPEN state.
   *
   * @default 60000 (1 minute)
   */
  resetTimeout: number;

  /**
   * Number of successful requests required in HALF_OPEN state to close the circuit.
   * Once this many successes occur, the circuit closes and normal operation resumes.
   *
   * @default 1
   */
  successThreshold?: number;

  /**
   * Time window in milliseconds for tracking failures.
   * Failures outside this window are not counted toward the threshold.
   * If not specified, all failures since last success are counted.
   *
   * @default undefined (no window)
   */
  windowTime?: number;

  /**
   * Custom callback invoked when circuit state changes.
   * Useful for alerting, metrics, or logging state transitions.
   *
   * @param oldState - Previous circuit state
   * @param newState - New circuit state
   * @param reason - Reason for the state change
   *
   * @example
   * ```typescript
   * onStateChange: (oldState, newState, reason) => {
   *   metrics.gauge('circuit_breaker.state', newState === CircuitState.OPEN ? 1 : 0);
   *   if (newState === CircuitState.OPEN) {
   *     alerting.sendAlert('Circuit breaker opened: ' + reason);
   *   }
   * }
   * ```
   */
  onStateChange?: (oldState: CircuitState, newState: CircuitState, reason?: string) => void;
}
