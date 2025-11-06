import { Logger } from '@nestjs/common';
import { CircuitState } from '../enums';
import { ICircuitBreakerOptions } from '../interfaces';
import { CircuitOpenException } from '../exceptions';

/**
 * Circuit breaker implementation for preventing cascading failures.
 *
 * Implements the classic circuit breaker pattern with three states (CLOSED, OPEN, HALF_OPEN).
 * Automatically stops calling a failing service to give it time to recover, preventing
 * resource exhaustion and cascading failures.
 *
 * @remarks
 * The circuit breaker pattern is essential for building resilient distributed systems.
 * It prevents a failing service from being overwhelmed with requests, giving it time
 * to recover while failing fast for callers.
 *
 * State transitions:
 * - CLOSED → OPEN: When failure threshold is exceeded
 * - OPEN → HALF_OPEN: After reset timeout expires
 * - HALF_OPEN → CLOSED: When success threshold is met
 * - HALF_OPEN → OPEN: On any failure during recovery testing
 *
 * @example
 * ```typescript
 * const breaker = new CircuitBreaker(logger, {
 *   failureThreshold: 5,
 *   resetTimeout: 60000,
 *   successThreshold: 2
 * });
 *
 * try {
 *   const result = await breaker.execute(async () => {
 *   return await callExternalService();
 *   });
 * } catch (error) {
 *   if (error instanceof CircuitOpenException) {
 *     // Circuit is open, service is down
 *     return fallbackValue;
 *   }
 *   throw error;
 * }
 * ```
 */
export class CircuitBreaker {
  /**
   * Logger instance for recording circuit state changes.
   */
  private readonly logger = new Logger(CircuitBreaker.name);

  /**
   * Circuit breaker configuration options.
   */
  private readonly options: {
    windowTime?: number;
    resetTimeout: number;
    failureThreshold: number;
    successThreshold: number;
    onStateChange: (oldState: CircuitState, newState: CircuitState, reason?: string) => void;
  };

  /**
   * Current state of the circuit breaker.
   */
  private state: CircuitState = CircuitState.CLOSED;

  /**
   * Count of consecutive failures in CLOSED state.
   */
  private failureCount: number = 0;

  /**
   * Count of consecutive successes in HALF_OPEN state.
   */
  private successCount: number = 0;

  /**
   * Timestamp of the most recent failure.
   */
  private lastFailureTime?: number;

  /**
   * Timestamp when the circuit opened.
   */
  private openedAt?: number;

  /**
   * Array of recent failure timestamps (for window-based tracking).
   */
  private recentFailures: number[] = [];

  /**
   * Creates a new CircuitBreaker instance.
   *
   * @param options - Circuit breaker configuration
   */
  constructor(options: ICircuitBreakerOptions) {
    // Apply defaults to options
    this.options = {
      failureThreshold: options.failureThreshold,
      resetTimeout: options.resetTimeout,
      successThreshold: options.successThreshold ?? 1,
      windowTime: options.windowTime,
      onStateChange: options.onStateChange ?? (() => {}),
    };
  }

  /**
   * Execute an operation through the circuit breaker.
   *
   * Attempts to execute the operation if the circuit allows it.
   * Tracks successes and failures to manage circuit state transitions.
   *
   * @template T - Return type of the operation
   * @param operation - Async operation to execute
   * @returns Promise resolving to operation result
   * @throws {CircuitOpenException} When circuit is open
   * @throws {Error} When operation fails (circuit remains closed or half-open)
   */
  async execute<T>(operation: () => Promise<T>): Promise<T> {
    // Check if we should attempt the operation
    if (this.state === CircuitState.OPEN) {
      if (this.shouldAttemptReset()) {
        // Transition to HALF_OPEN to test recovery
        this.transitionTo(CircuitState.HALF_OPEN, 'Reset timeout expired');
      } else {
        // Reject immediately - circuit is still open
        const resetAt = new Date(this.openedAt! + this.options.resetTimeout);
        throw CircuitOpenException.make(
          `Circuit breaker is OPEN. Retry after ${resetAt.toISOString()}`,
          this.state,
          this.failureCount,
          resetAt,
        );
      }
    }

    try {
      // Execute the operation
      const result = await operation();

      // Operation succeeded
      this.onSuccess();

      return result;
    } catch (error: any) {
      // Operation failed
      this.onFailure(error);

      throw error;
    }
  }

  /**
   * Handle successful operation execution.
   *
   * Updates success counters and may transition circuit to CLOSED state.
   */
  private onSuccess(): void {
    if (this.state === CircuitState.HALF_OPEN) {
      // Increment success counter in HALF_OPEN state
      this.successCount++;

      this.logger.debug(
        `Circuit breaker success in HALF_OPEN state (${this.successCount}/${this.options.successThreshold})`,
      );

      // Check if we've met the success threshold
      if (this.successCount >= this.options.successThreshold) {
        // Close the circuit - service has recovered
        this.failureCount = 0;
        this.successCount = 0;
        this.recentFailures = [];
        this.transitionTo(
          CircuitState.CLOSED,
          `${this.successCount} consecutive successes in HALF_OPEN state`,
        );
      }
    } else if (this.state === CircuitState.CLOSED) {
      // Reset failure count on success in CLOSED state
      if (this.failureCount > 0) {
        this.logger.debug('Circuit breaker: Resetting failure count after success');
        this.failureCount = 0;
        this.recentFailures = [];
      }
    }
  }

  /**
   * Handle failed operation execution.
   *
   * Updates failure counters and may transition circuit to OPEN state.
   *
   * @param error - The error that occurred
   */
  private onFailure(error: Error): void {
    const now = Date.now();
    this.failureCount++;
    this.lastFailureTime = now;

    // Track failure timestamp for window-based tracking
    if (this.options.windowTime) {
      this.recentFailures.push(now);
      // Remove failures outside the window
      this.recentFailures = this.recentFailures.filter(
        (timestamp) => now - timestamp <= this.options.windowTime!,
      );
      // Use windowed failure count
      this.failureCount = this.recentFailures.length;
    }

    if (this.state === CircuitState.HALF_OPEN) {
      // Any failure in HALF_OPEN opens the circuit again
      this.successCount = 0;
      this.openedAt = now;
      this.transitionTo(CircuitState.OPEN, `Failure during recovery testing: ${error.message}`);
    } else if (this.state === CircuitState.CLOSED) {
      // Check if we've hit the failure threshold
      if (this.failureCount >= this.options.failureThreshold) {
        this.openedAt = now;
        this.transitionTo(
          CircuitState.OPEN,
          `Failure threshold exceeded (${this.failureCount}/${this.options.failureThreshold})`,
        );
      } else {
        this.logger.warn(
          `Circuit breaker failure (${this.failureCount}/${this.options.failureThreshold})`,
          { error: error.message, state: this.state },
        );
      }
    }
  }

  /**
   * Check if enough time has passed to attempt circuit reset.
   *
   * @returns True if reset should be attempted, false otherwise
   */
  private shouldAttemptReset(): boolean {
    if (!this.openedAt) {
      return false;
    }

    const now = Date.now();
    const timeSinceOpened = now - this.openedAt;

    return timeSinceOpened >= this.options.resetTimeout;
  }

  /**
   * Transition the circuit to a new state.
   *
   * Updates state, logs the transition, and invokes callbacks.
   *
   * @param newState - The state to transition to
   * @param reason - Reason for the transition
   */
  private transitionTo(newState: CircuitState, reason?: string): void {
    const oldState = this.state;

    if (oldState === newState) {
      return; // No change
    }

    this.state = newState;

    // Log state transition
    this.logger.log(`Circuit breaker: ${oldState} → ${newState}${reason ? `: ${reason}` : ''}`, {
      oldState,
      newState,
      reason,
      failureCount: this.failureCount,
      successCount: this.successCount,
    });

    // Invoke callback if provided
    if (this.options.onStateChange) {
      try {
        this.options.onStateChange(oldState, newState, reason);
      } catch (error: any) {
        this.logger.error('Error in circuit breaker onStateChange callback', error.stack, {
          oldState,
          newState,
          callbackError: error.message,
        });
      }
    }
  }

  /**
   * Get the current circuit breaker state.
   *
   * @returns Current state (CLOSED, OPEN, or HALF_OPEN)
   */
  getState(): CircuitState {
    return this.state;
  }

  /**
   * Get circuit breaker statistics.
   *
   * @returns Object containing current statistics
   */
  getStats() {
    return {
      state: this.state,
      failureCount: this.failureCount,
      successCount: this.successCount,
      lastFailureTime: this.lastFailureTime,
      openedAt: this.openedAt,
      resetAt: this.openedAt ? new Date(this.openedAt + this.options.resetTimeout) : undefined,
    };
  }

  /**
   * Manually reset the circuit breaker to CLOSED state.
   *
   * Useful for administrative purposes or testing.
   * Clears all failure and success counters.
   */
  reset(): void {
    this.failureCount = 0;
    this.successCount = 0;
    this.recentFailures = [];
    this.lastFailureTime = undefined;
    this.openedAt = undefined;
    this.transitionTo(CircuitState.CLOSED, 'Manual reset');
  }
}
