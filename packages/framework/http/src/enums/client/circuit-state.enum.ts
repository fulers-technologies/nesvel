/**
 * Circuit breaker state.
 *
 * - CLOSED: Normal operation, requests are allowed
 * - OPEN: Failures exceeded threshold, requests are blocked
 * - HALF_OPEN: Testing if service recovered, limited requests allowed
 */
export enum CircuitState {
  OPEN = 'OPEN',
  CLOSED = 'CLOSED',
  HALF_OPEN = 'HALF_OPEN',
}
