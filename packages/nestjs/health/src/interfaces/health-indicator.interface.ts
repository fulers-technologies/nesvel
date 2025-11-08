import type { HealthIndicatorResult } from '@nestjs/terminus';

/**
 * Health Indicator Interface
 *
 * Base interface that all health indicators must implement.
 * Provides a standardized contract for health check operations.
 *
 * **Purpose**:
 * - Ensures consistent API across all health indicators
 * - Allows type-safe health indicator registration
 * - Enables polymorphic health checks
 *
 * **Implementation Requirements**:
 * - Must implement the `check()` method
 * - Must return a Promise<HealthIndicatorResult>
 * - Key parameter should identify the health check uniquely
 *
 * @interface IHealthIndicator
 *
 * @example
 * ```typescript
 * @Injectable()
 * export class CustomHealthIndicator implements IHealthIndicator {
 *   async check(key?: string): Promise<HealthIndicatorResult> {
 *     const isHealthy = await this.performHealthCheck();
 *     return {
 *       [key || 'custom']: {
 *         status: isHealthy ? 'up' : 'down'
 *       }
 *     };
 *   }
 * }
 * ```
 *
 * @example With BaseHealthIndicator
 * ```typescript
 * @Injectable()
 * export class RedisHealthIndicator
 *   extends BaseHealthIndicator
 *   implements IHealthIndicator
 * {
 *   constructor(
 *     healthIndicatorService: HealthIndicatorService,
 *     private readonly redis: RedisService,
 *   ) {
 *     super(healthIndicatorService);
 *   }
 *
 *   async check(key: string = 'redis'): Promise<HealthIndicatorResult> {
 *     return this.safeExecute(
 *       key,
 *       async () => {
 *         const pong = await this.redis.ping();
 *         return pong === 'PONG';
 *       },
 *       'Redis connection failed'
 *     );
 *   }
 * }
 * ```
 *
 * @author Nesvel
 * @since 1.0.0
 */
export interface IHealthIndicator {
  /**
   * Perform Health Check
   *
   * Executes a health check operation and returns the result.
   * The result must conform to the Terminus HealthIndicatorResult format.
   *
   * **Requirements**:
   * - Must be asynchronous (return Promise)
   * - Must return HealthIndicatorResult with status information
   * - Must use the provided key or a default key
   * - Should not throw errors (catch and return 'down' status instead)
   *
   * **Result Format**:
   * ```typescript
   * {
   *   [key]: {
   *     status: 'up' | 'down',
   *     // ... additional metadata
   *   }
   * }
   * ```
   *
   * @param key - Unique identifier for this health check (optional)
   * @param args - Additional arguments specific to the indicator
   * @returns Health indicator result with status information
   *
   * @example Basic implementation
   * ```typescript
   * async check(key: string = 'service'): Promise<HealthIndicatorResult> {
   *   try {
   *     const isHealthy = await this.service.ping();
   *     return {
   *       [key]: {
   *         status: isHealthy ? 'up' : 'down',
   *         timestamp: Date.now()
   *       }
   *     };
   *   } catch (error: Error | any) {
   *     return {
   *       [key]: {
   *         status: 'down',
   *         error: error.message
   *       }
   *     };
   *   }
   * }
   * ```
   *
   * @example With additional parameters
   * ```typescript
   * async check(
   *   key: string = 'database',
   *   timeout?: number
   * ): Promise<HealthIndicatorResult> {
   *   return this.db.pingCheck(key, { timeout });
   * }
   * ```
   */
  check(key?: string, ...args: any[]): Promise<HealthIndicatorResult>;
}
