import type { CircuitState } from '../../enums/client/circuit-state.enum';

/**
 * Configuration options for circuit breaker.
 */
export interface CircuitBreakerOptions {
  /**
   * Number of failures before opening circuit.
   * @default 5
   */
  failureThreshold?: number;

  /**
   * Number of successful requests to close circuit from half-open state.
   * @default 2
   */
  successThreshold?: number;

  /**
   * Time window in milliseconds for counting failures.
   * @default 60000 (1 minute)
   */
  failureWindowMs?: number;

  /**
   * Time to wait before transitioning from OPEN to HALF_OPEN.
   * @default 30000 (30 seconds)
   */
  openTimeoutMs?: number;

  /**
   * Time to wait before resetting success/failure counts in CLOSED state.
   * @default 60000 (1 minute)
   */
  resetTimeoutMs?: number;

  /**
   * HTTP status codes that should be counted as failures.
   * @default [500, 502, 503, 504]
   */
  failureStatusCodes?: number[];

  /**
   * Whether network errors should count as failures.
   * @default true
   */
  failOnNetworkError?: boolean;

  /**
   * Custom callback to determine if error should count as failure.
   */
  isFailure?: (error: any, statusCode?: number) => boolean;

  /**
   * Callback when circuit state changes.
   */
  onStateChange?: (from: CircuitState, to: CircuitState, reason: string) => void;
}
