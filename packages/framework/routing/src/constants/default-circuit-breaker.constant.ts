/**
 * Default circuit breaker configuration.
 *
 * Applied when circuit breaker is enabled but no specific settings are provided.
 * Implements the circuit breaker pattern to prevent cascading failures.
 *
 * @constant
 */
export const DEFAULT_CIRCUIT_BREAKER = {
  /**
   * Number of consecutive failures before opening the circuit.
   * After this threshold, requests fail immediately without execution.
   * @default 5 failures
   */
  threshold: 5,

  /**
   * Timeout duration in milliseconds before attempting to close the circuit.
   * After timeout, circuit enters half-open state for testing.
   * @default 3000ms (3 seconds)
   */
  timeout: 3000,
};
