/**
 * Circuit breaker configuration for API endpoints.
 *
 * Implements the circuit breaker pattern to prevent cascading failures
 * by temporarily blocking requests to failing endpoints.
 */
export interface CircuitBreakerOptions {
  /**
   * Failure threshold before opening the circuit.
   *
   * Number of consecutive failures required to trip the circuit breaker.
   * Once tripped, subsequent requests fail immediately without execution.
   *
   * @example 5 // Open circuit after 5 consecutive failures
   * @default 5
   */
  threshold?: number;

  /**
   * Timeout duration in milliseconds.
   *
   * How long the circuit remains open before attempting to close.
   * After timeout, the circuit enters half-open state for testing.
   *
   * @example 3000 // 3 seconds
   * @default 3000
   */
  timeout?: number;
}
