import type { CircuitState } from '../../enums/client/circuit-state.enum';

/**
 * Circuit breaker metrics for monitoring.
 */
export interface CircuitBreakerMetrics {
  state: CircuitState;
  failures: number;
  successes: number;
  totalRequests: number;
  lastFailureTime: number | null;
  lastSuccessTime: number | null;
  stateChangedAt: number;
  circuitOpenedAt: number | null;
}
