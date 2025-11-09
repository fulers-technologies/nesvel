import { Logger } from '@nestjs/common';
import { IBackpressureOptions } from '../interfaces';
import { BackpressureTimeoutException } from '../exceptions';

/**
 * Backpressure controller for managing concurrent operations.
 *
 * Implements flow control by limiting the number of operations that can
 * execute simultaneously. When the limit is reached, new operations wait
 * until capacity becomes available, preventing system overload.
 *
 * @remarks
 * Backpressure is essential for preventing resource exhaustion in high-throughput
 * systems. By limiting concurrent operations, we ensure that the system operates
 * within its capacity and doesn't run out of memory or overwhelm downstream services.
 *
 * The controller tracks inflight operations and provides await-based flow control.
 * Operations are queued and resume automatically when capacity becomes available.
 *
 * @example
 * ```typescript
 * const backpressure = BackpressureController.make(logger, {
 *   maxInflight: 1000,
 *   waitTimeout: 30000 // 30 seconds
 * });
 *
 * async function publishMessage(data: any) {
 *   // Wait for capacity (throws BackpressureTimeoutException if timeout exceeded)
 *   await backpressure.waitForCapacity();
 *
 *   try {
 *     // Track this operation as inflight
 *     backpressure.incrementInflight();
 *
 *     // Execute the operation
 *     await driver.publish(topic, data);
 *   } finally {
 *     // Always release capacity when done
 *     backpressure.decrementInflight();
 *   }
 * }
 * ```
 */
export class BackpressureController {
  /**
   * Logger instance for recording backpressure events.
   */
  private readonly logger = new Logger(BackpressureController.name);

  /**
   * Backpressure configuration options.
   */
  private readonly options: {
    maxInflight: number;
    waitTimeout?: number;
    pollInterval: number;
  };

  /**
   * Current number of inflight operations.
   */
  private inflightCount: number = 0;

  /**
   * Peak number of inflight operations observed.
   * Used for monitoring and capacity planning.
   */
  private peakInflight: number = 0;

  /**
   * Timestamp of the last capacity warning.
   * Used to throttle warning messages.
   */
  private lastWarningTime: number = 0;

  /**
   * Total number of operations that had to wait for capacity.
   * Used for monitoring backpressure frequency.
   */
  private totalWaits: number = 0;

  /**
   * Creates a new BackpressureController instance.
   *
   * @param options - Backpressure configuration
   */
  constructor(options: IBackpressureOptions) {
    this.options = {
      maxInflight: options.maxInflight,
      waitTimeout: options.waitTimeout,
      pollInterval: options.pollInterval ?? 10,
    };
  }

  /**
   * Wait until capacity is available for a new operation.
   *
   * Blocks until the inflight count drops below the maximum, or until
   * the wait timeout is exceeded. This implements the core backpressure
   * flow control mechanism.
   *
   * @throws {BackpressureTimeoutException} When wait timeout is exceeded
   *
   * @example
   * ```typescript
   * await backpressure.waitForCapacity();
   * // Now we have capacity, proceed with operation
   * ```
   */
  async waitForCapacity(): Promise<void> {
    // Fast path: capacity available immediately
    if (this.inflightCount < this.options.maxInflight) {
      return;
    }

    // Track that we're waiting
    this.totalWaits++;
    const startWait = Date.now();

    // Log warning about backpressure (throttled to once per minute)
    const now = Date.now();
    if (now - this.lastWarningTime > 60000) {
      this.logger.warn(
        `Backpressure: System at capacity (${this.inflightCount}/${this.options.maxInflight} inflight)`,
        {
          inflightCount: this.inflightCount,
          maxInflight: this.options.maxInflight,
          totalWaits: this.totalWaits,
          peakInflight: this.peakInflight,
        },
      );
      this.lastWarningTime = now;
    }

    // Wait for capacity
    while (this.inflightCount >= this.options.maxInflight) {
      // Check timeout
      if (this.options.waitTimeout) {
        const elapsed = Date.now() - startWait;
        if (elapsed >= this.options.waitTimeout) {
          throw BackpressureTimeoutException.make(
            `Backpressure wait timeout exceeded: ${elapsed}ms (${this.inflightCount}/${this.options.maxInflight} inflight)`,
            this.inflightCount,
            this.options.maxInflight,
            elapsed,
          );
        }
      }

      // Sleep before checking again
      await this.sleep(this.options.pollInterval);
    }

    // Log if we waited a significant amount of time
    const waitTime = Date.now() - startWait;
    if (waitTime > 1000) {
      this.logger.debug(`Backpressure: Waited ${waitTime}ms for capacity`, {
        waitTime,
        inflightCount: this.inflightCount,
      });
    }
  }

  /**
   * Increment the inflight operation counter.
   *
   * Call this when starting a new operation to track it as inflight.
   * Must be paired with a corresponding decrementInflight() call.
   *
   * @example
   * ```typescript
   * backpressure.incrementInflight();
   * try {
   *   await performOperation();
   * } finally {
   *   backpressure.decrementInflight();
   * }
   * ```
   */
  incrementInflight(): void {
    this.inflightCount++;

    // Track peak for monitoring
    if (this.inflightCount > this.peakInflight) {
      this.peakInflight = this.inflightCount;
    }

    // Log warning if approaching capacity (95% threshold)
    const utilizationPercent = (this.inflightCount / this.options.maxInflight) * 100;
    if (utilizationPercent >= 95) {
      const now = Date.now();
      // Throttle warnings to once per minute
      if (now - this.lastWarningTime > 60000) {
        this.logger.warn(
          `Backpressure: ${utilizationPercent.toFixed(1)}% capacity (${this.inflightCount}/${this.options.maxInflight})`,
          {
            inflightCount: this.inflightCount,
            maxInflight: this.options.maxInflight,
            utilizationPercent,
          },
        );
        this.lastWarningTime = now;
      }
    }
  }

  /**
   * Decrement the inflight operation counter.
   *
   * Call this when an operation completes (successfully or not) to
   * release capacity for waiting operations.
   *
   * @example
   * ```typescript
   * try {
   *   backpressure.incrementInflight();
   *   await performOperation();
   * } finally {
   *   backpressure.decrementInflight(); // Always release
   * }
   * ```
   */
  decrementInflight(): void {
    if (this.inflightCount > 0) {
      this.inflightCount--;
    } else {
      this.logger.warn('Attempted to decrement inflight count below zero');
    }
  }

  /**
   * Execute an operation with automatic backpressure control.
   *
   * Convenience method that handles waiting for capacity, tracking
   * the operation as inflight, and releasing capacity when done.
   * This is the recommended way to use backpressure control.
   *
   * @template T - Return type of the operation
   * @param operation - Async operation to execute
   * @returns Promise resolving to operation result
   * @throws {BackpressureTimeoutException} When wait timeout exceeded
   * @throws {Error} When operation fails
   *
   * @example
   * ```typescript
   * const result = await backpressure.execute(async () => {
   *   return await driver.publish(topic, data);
   * });
   * ```
   */
  async execute<T>(operation: () => Promise<T>): Promise<T> {
    // Wait for capacity
    await this.waitForCapacity();

    // Track as inflight
    this.incrementInflight();

    try {
      // Execute operation
      return await operation();
    } finally {
      // Always release capacity
      this.decrementInflight();
    }
  }

  /**
   * Get current backpressure statistics.
   *
   * Returns metrics about inflight operations and system utilization.
   * Useful for monitoring and capacity planning.
   *
   * @returns Object containing current statistics
   */
  getStats() {
    return {
      inflightCount: this.inflightCount,
      maxInflight: this.options.maxInflight,
      utilizationPercent: (this.inflightCount / this.options.maxInflight) * 100,
      peakInflight: this.peakInflight,
      totalWaits: this.totalWaits,
      availableCapacity: this.options.maxInflight - this.inflightCount,
    };
  }

  /**
   * Check if the system is currently at capacity.
   *
   * @returns True if at or above maximum inflight limit
   */
  isAtCapacity(): boolean {
    return this.inflightCount >= this.options.maxInflight;
  }

  /**
   * Reset statistics counters.
   *
   * Resets peak inflight and total waits counters.
   * Does not affect current inflight count.
   * Useful for testing or periodic stats reporting.
   */
  resetStats(): void {
    this.peakInflight = this.inflightCount;
    this.totalWaits = 0;
    this.lastWarningTime = 0;
    this.logger.debug('Backpressure statistics reset');
  }

  /**
   * Sleep for the specified duration.
   *
   * Helper method for implementing polling delays.
   *
   * @param ms - Duration to sleep in milliseconds
   * @returns Promise that resolves after the duration
   */
  private sleep(ms: number): Promise<void> {
    return new Promise((resolve) => setTimeout(resolve, ms));
  }
}
