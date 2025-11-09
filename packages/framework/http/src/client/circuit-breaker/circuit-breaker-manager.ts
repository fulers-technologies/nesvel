import { CircuitBreaker } from './circuit-breaker';

import { CircuitState } from '@/enums';
import type { CircuitBreakerOptions } from '@/interfaces';

/**
 * Manages multiple circuit breakers, typically one per host/service.
 *
 * This class provides a centralized way to manage circuit breakers
 * for different services, preventing the need to manually create
 * and track individual breakers for each endpoint.
 *
 * @example
 * ```typescript
 * const manager = CircuitBreakerManager.make({
 *   failureThreshold: 5,
 *   openTimeoutMs: 30000
 * });
 *
 * // Get or create breaker for a host
 * const breaker = manager.getBreaker('api.example.com');
 *
 * // Execute request with circuit breaker
 * await manager.execute('api.example.com', async () => {
 *   return await fetch('https://api.example.com/data');
 * });
 *
 * // Monitor all breakers
 * const metrics = manager.getAllMetrics();
 * console.log('Open circuits:', metrics.filter(m => m.state === 'OPEN'));
 * ```
 */
export class CircuitBreakerManager {
  private readonly breakers: Map<string, CircuitBreaker> = new Map();

  /**
   * Create a new circuit breaker manager.
   *
   * @param defaultOptions - Default options for all circuit breakers
   */
  constructor(private readonly defaultOptions: CircuitBreakerOptions = {}) {}

  /**
   * Static factory method to create a new manager.
   *
   * @param defaultOptions - Default options for all circuit breakers
   * @returns New manager instance
   */
  public static make(defaultOptions: CircuitBreakerOptions = {}): CircuitBreakerManager {
    return new CircuitBreakerManager(defaultOptions);
  }

  /**
   * Get or create a circuit breaker for a specific host.
   *
   * @param host - Host identifier (typically hostname or full URL)
   * @param options - Optional override options for this breaker
   * @returns Circuit breaker instance
   */
  public getBreaker(host: string, options?: CircuitBreakerOptions): CircuitBreaker {
    if (!this.breakers.has(host)) {
      const mergedOptions = { ...this.defaultOptions, ...options };
      this.breakers.set(host, CircuitBreaker.make(mergedOptions));
    }
    return this.breakers.get(host)!;
  }

  /**
   * Execute a function with circuit breaker protection for a specific host.
   *
   * @template T - Return type of the function
   * @param host - Host identifier
   * @param fn - Async function to execute
   * @returns Promise resolving to function result
   */
  public async execute<T>(host: string, fn: () => Promise<T>): Promise<T> {
    const breaker = this.getBreaker(host);
    return breaker.execute(fn, host);
  }

  /**
   * Check if a host's circuit breaker allows requests.
   *
   * @param host - Host identifier
   * @returns true if requests are allowed
   */
  public isRequestAllowed(host: string): boolean {
    const breaker = this.breakers.get(host);
    return breaker ? breaker.isRequestAllowed() : true;
  }

  /**
   * Get the current state of a host's circuit breaker.
   *
   * @param host - Host identifier
   * @returns Circuit state, or null if no breaker exists
   */
  public getState(host: string): CircuitState | null {
    const breaker = this.breakers.get(host);
    return breaker ? breaker.getState() : null;
  }

  /**
   * Reset a specific host's circuit breaker.
   *
   * @param host - Host identifier
   */
  public reset(host: string): void {
    const breaker = this.breakers.get(host);
    if (breaker) {
      breaker.reset();
    }
  }

  /**
   * Reset all circuit breakers.
   */
  public resetAll(): void {
    for (const breaker of this.breakers.values()) {
      breaker.reset();
    }
  }

  /**
   * Get metrics for a specific host's circuit breaker.
   *
   * @param host - Host identifier
   * @returns Metrics object, or null if no breaker exists
   */
  public getMetrics(host: string) {
    const breaker = this.breakers.get(host);
    return breaker ? { host, ...breaker.getMetrics() } : null;
  }

  /**
   * Get metrics for all circuit breakers.
   *
   * @returns Array of metrics objects with host identifiers
   */
  public getAllMetrics() {
    return Array.from(this.breakers.entries()).map(([host, breaker]) => ({
      host,
      ...breaker.getMetrics(),
    }));
  }

  /**
   * Get all hosts that have open circuits.
   *
   * @returns Array of host identifiers with open circuits
   */
  public getOpenCircuits(): string[] {
    return Array.from(this.breakers.entries())
      .filter(([_, breaker]) => breaker.getState() === CircuitState.OPEN)
      .map(([host]) => host);
  }

  /**
   * Remove a circuit breaker for a specific host.
   *
   * @param host - Host identifier
   * @returns true if breaker was removed, false if it didn't exist
   */
  public remove(host: string): boolean {
    return this.breakers.delete(host);
  }

  /**
   * Remove all circuit breakers.
   */
  public clear(): void {
    this.breakers.clear();
  }

  /**
   * Get the number of managed circuit breakers.
   *
   * @returns Number of breakers
   */
  public size(): number {
    return this.breakers.size;
  }

  /**
   * Check if a circuit breaker exists for a host.
   *
   * @param host - Host identifier
   * @returns true if breaker exists
   */
  public has(host: string): boolean {
    return this.breakers.has(host);
  }

  /**
   * Extract host from a URL.
   *
   * @param url - Full URL or hostname
   * @returns Hostname
   */
  public static extractHost(url: string): string {
    try {
      const parsed = new URL(url);
      return parsed.hostname;
    } catch {
      // If URL parsing fails, assume it's already a hostname
      return url;
    }
  }
}
