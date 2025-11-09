import { CircuitState } from '@/enums';
import type { CircuitBreakerOptions, CircuitBreakerMetrics } from '@/interfaces';

/**
 * Circuit breaker error thrown when circuit is open.
 */
export class CircuitBreakerOpenError extends Error {
  constructor(
    public readonly host: string,
    public readonly resetAt: Date
  ) {
    super(`Circuit breaker is OPEN for ${host}. Resets at ${resetAt.toISOString()}`);
    this.name = 'CircuitBreakerOpenError';
  }

  /**
   * Static factory method.
   */
  public static make(host: string, resetAt: Date): CircuitBreakerOpenError {
    return new CircuitBreakerOpenError(host, resetAt);
  }
}

/**
 * Circuit breaker implementation for preventing cascading failures.
 *
 * The circuit breaker pattern prevents an application from repeatedly
 * trying to execute an operation that's likely to fail. It monitors for
 * failures and opens the circuit when a threshold is reached, blocking
 * requests until the service has had time to recover.
 *
 * @example
 * ```typescript
 * const breaker = CircuitBreaker.make({
 *   failureThreshold: 5,
 *   openTimeoutMs: 30000,
 *   successThreshold: 2
 * });
 *
 * try {
 *   await breaker.execute(async () => {
 *     return await httpClient.get('https://api.example.com/data');
 *   });
 * } catch (error) {
 *   if (error instanceof CircuitBreakerOpenError) {
 *     console.log('Circuit is open, try again at:', error.resetAt);
 *   }
 * }
 * ```
 */
export class CircuitBreaker {
  private state: CircuitState = CircuitState.CLOSED;
  private failures: number = 0;
  private successes: number = 0;
  private totalRequests: number = 0;
  private lastFailureTime: number | null = null;
  private lastSuccessTime: number | null = null;
  private stateChangedAt: number = Date.now();
  private circuitOpenedAt: number | null = null;
  private failureTimestamps: number[] = [];

  private readonly failureThreshold: number;
  private readonly successThreshold: number;
  private readonly failureWindowMs: number;
  private readonly openTimeoutMs: number;
  private readonly resetTimeoutMs: number;
  private readonly failureStatusCodes: Set<number>;
  private readonly failOnNetworkError: boolean;
  private readonly isFailureFn?: (error: any, statusCode?: number) => boolean;
  private readonly onStateChange?: (from: CircuitState, to: CircuitState, reason: string) => void;

  /**
   * Create a new circuit breaker.
   *
   * @param options - Configuration options
   */
  constructor(private readonly options: CircuitBreakerOptions = {}) {
    this.failureThreshold = options.failureThreshold ?? 5;
    this.successThreshold = options.successThreshold ?? 2;
    this.failureWindowMs = options.failureWindowMs ?? 60000;
    this.openTimeoutMs = options.openTimeoutMs ?? 30000;
    this.resetTimeoutMs = options.resetTimeoutMs ?? 60000;
    this.failOnNetworkError = options.failOnNetworkError ?? true;
    this.isFailureFn = options.isFailure;
    this.onStateChange = options.onStateChange;
    this.failureStatusCodes = new Set(options.failureStatusCodes ?? [500, 502, 503, 504]);
  }

  /**
   * Static factory method to create a new circuit breaker.
   *
   * @param options - Configuration options
   * @returns New circuit breaker instance
   */
  public static make(options: CircuitBreakerOptions = {}): CircuitBreaker {
    return new CircuitBreaker(options);
  }

  /**
   * Execute a function with circuit breaker protection.
   *
   * @template T - Return type of the function
   * @param fn - Async function to execute
   * @param host - Optional host identifier for error messages
   * @returns Promise resolving to function result
   * @throws CircuitBreakerOpenError if circuit is open
   */
  public async execute<T>(fn: () => Promise<T>, host: string = 'unknown'): Promise<T> {
    // Check if circuit should transition from OPEN to HALF_OPEN
    this.checkOpenTimeout();

    // Block request if circuit is OPEN
    if (this.state === CircuitState.OPEN) {
      const resetAt = new Date(this.circuitOpenedAt! + this.openTimeoutMs);
      throw CircuitBreakerOpenError.make(host, resetAt);
    }

    this.totalRequests++;

    try {
      const result = await fn();
      this.onSuccess();
      return result;
    } catch (error: any) {
      const statusCode = error?.response?.status;
      if (this.isFailure(error, statusCode)) {
        this.onFailure();
      }
      throw error;
    }
  }

  /**
   * Get current circuit breaker metrics.
   *
   * @returns Metrics object
   */
  public getMetrics(): CircuitBreakerMetrics {
    return {
      state: this.state,
      failures: this.failures,
      successes: this.successes,
      totalRequests: this.totalRequests,
      lastFailureTime: this.lastFailureTime,
      lastSuccessTime: this.lastSuccessTime,
      stateChangedAt: this.stateChangedAt,
      circuitOpenedAt: this.circuitOpenedAt,
    };
  }

  /**
   * Reset circuit breaker to CLOSED state.
   */
  public reset(): void {
    this.transitionTo(CircuitState.CLOSED, 'Manual reset');
    this.failures = 0;
    this.successes = 0;
    this.failureTimestamps = [];
    this.lastFailureTime = null;
    this.circuitOpenedAt = null;
  }

  /**
   * Check if circuit breaker is currently accepting requests.
   *
   * @returns true if requests are allowed
   */
  public isRequestAllowed(): boolean {
    this.checkOpenTimeout();
    return this.state !== CircuitState.OPEN;
  }

  /**
   * Get current circuit state.
   *
   * @returns Current state
   */
  public getState(): CircuitState {
    return this.state;
  }

  /**
   * Handle successful request.
   */
  private onSuccess(): void {
    this.lastSuccessTime = Date.now();
    this.successes++;

    if (this.state === CircuitState.HALF_OPEN) {
      // Transition to CLOSED after success threshold
      if (this.successes >= this.successThreshold) {
        this.transitionTo(CircuitState.CLOSED, `${this.successes} consecutive successes`);
        this.failures = 0;
        this.successes = 0;
        this.failureTimestamps = [];
      }
    } else if (this.state === CircuitState.CLOSED) {
      // Reset counts after reset timeout
      const now = Date.now();
      if (this.lastFailureTime && now - this.lastFailureTime > this.resetTimeoutMs) {
        this.failures = 0;
        this.failureTimestamps = [];
      }
    }
  }

  /**
   * Handle failed request.
   */
  private onFailure(): void {
    const now = Date.now();
    this.lastFailureTime = now;
    this.failures++;
    this.failureTimestamps.push(now);

    // Remove old failures outside the time window
    this.failureTimestamps = this.failureTimestamps.filter(
      (timestamp) => now - timestamp <= this.failureWindowMs
    );

    if (this.state === CircuitState.HALF_OPEN) {
      // Any failure in HALF_OPEN reopens the circuit
      this.transitionTo(CircuitState.OPEN, 'Failure in HALF_OPEN state');
      this.circuitOpenedAt = now;
      this.successes = 0;
    } else if (this.state === CircuitState.CLOSED) {
      // Open circuit if failures exceed threshold within time window
      if (this.failureTimestamps.length >= this.failureThreshold) {
        this.transitionTo(
          CircuitState.OPEN,
          `${this.failureTimestamps.length} failures in ${this.failureWindowMs}ms`
        );
        this.circuitOpenedAt = now;
      }
    }
  }

  /**
   * Check if circuit should transition from OPEN to HALF_OPEN.
   */
  private checkOpenTimeout(): void {
    if (this.state === CircuitState.OPEN && this.circuitOpenedAt) {
      const now = Date.now();
      if (now - this.circuitOpenedAt >= this.openTimeoutMs) {
        this.transitionTo(CircuitState.HALF_OPEN, `Open timeout elapsed (${this.openTimeoutMs}ms)`);
        this.successes = 0;
      }
    }
  }

  /**
   * Transition circuit to new state.
   *
   * @param newState - New state to transition to
   * @param reason - Reason for state change
   */
  private transitionTo(newState: CircuitState, reason: string): void {
    const oldState = this.state;
    this.state = newState;
    this.stateChangedAt = Date.now();

    if (this.onStateChange && oldState !== newState) {
      this.onStateChange(oldState, newState, reason);
    }
  }

  /**
   * Determine if error/status should count as failure.
   *
   * @param error - Error object
   * @param statusCode - HTTP status code
   * @returns true if should count as failure
   */
  private isFailure(error: any, statusCode?: number): boolean {
    // Custom predicate takes precedence
    if (this.isFailureFn) {
      return this.isFailureFn(error, statusCode);
    }

    // Check status code
    if (statusCode !== undefined) {
      return this.failureStatusCodes.has(statusCode);
    }

    // Check if network error
    if (this.failOnNetworkError && this.isNetworkError(error)) {
      return true;
    }

    return false;
  }

  /**
   * Check if error is a network error.
   *
   * @param error - Error object
   * @returns true if network error
   */
  private isNetworkError(error: any): boolean {
    const networkErrorCodes = [
      'ECONNREFUSED',
      'ECONNRESET',
      'ETIMEDOUT',
      'ENOTFOUND',
      'ENETUNREACH',
      'EAI_AGAIN',
      'ECONNABORTED',
    ];

    return (
      error &&
      (networkErrorCodes.includes(error.code) ||
        error.message?.includes('network') ||
        error.message?.includes('timeout'))
    );
  }
}
