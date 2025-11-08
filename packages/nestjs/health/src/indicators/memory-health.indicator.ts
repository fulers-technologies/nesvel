import { Injectable, Inject, Optional } from '@nestjs/common';
import { MemoryHealthIndicator as TerminusMemoryHealthIndicator } from '@nestjs/terminus';
import type { HealthIndicatorResult } from '@nestjs/terminus';
import type { IHealthIndicator, IHealthConfig } from '@interfaces';

/**
 * Memory Health Indicator
 *
 * Checks the health of memory usage (heap and RSS).
 * Wraps the @nestjs/terminus MemoryHealthIndicator with our IHealthIndicator interface.
 *
 * This indicator checks both heap and RSS memory usage against configurable thresholds.
 *
 * **Default Thresholds**:
 * - Heap: 150 MB
 * - RSS: 150 MB
 *
 * @class MemoryHealthIndicator
 * @implements {IHealthIndicator}
 *
 * @example Usage with HealthModule
 * ```typescript
 * @Module({
 *   imports: [
 *     HealthModule.forRoot({
 *       indicators: {
 *         memory: true,  // Enables this indicator
 *       },
 *       memoryThresholds: {
 *         heap: 200 * 1024 * 1024,  // 200 MB
 *         rss: 300 * 1024 * 1024,   // 300 MB
 *       },
 *     }),
 *   ],
 * })
 * export class AppModule {}
 * ```
 *
 * @example Health check response
 * ```json
 * {
 *   "status": "ok",
 *   "info": {
 *     "memory_heap": {
 *       "status": "up"
 *     },
 *     "memory_rss": {
 *       "status": "up"
 *     }
 *   }
 * }
 * ```
 *
 * @author Nesvel
 * @since 1.0.0
 */
@Injectable()
export class MemoryHealthIndicator implements IHealthIndicator {
  /**
   * Default heap memory threshold (150 MB)
   *
   * @private
   * @readonly
   */
  private readonly DEFAULT_HEAP_THRESHOLD = 150 * 1024 * 1024;

  /**
   * Default RSS memory threshold (150 MB)
   *
   * @private
   * @readonly
   */
  private readonly DEFAULT_RSS_THRESHOLD = 150 * 1024 * 1024;

  /**
   * Constructor
   *
   * Injects the MemoryHealthIndicator from @nestjs/terminus and the optional health configuration.
   * The configuration is used to override default memory thresholds.
   *
   * @param {TerminusMemoryHealthIndicator} terminusMemory - The memory health indicator from Terminus
   * @param {IHealthConfig} [config] - Optional health module configuration for memory thresholds
   */
  constructor(
    private readonly terminusMemory: TerminusMemoryHealthIndicator,
    @Optional()
    @Inject('HEALTH_MODULE_CONFIG')
    private readonly config?: IHealthConfig,
  ) {}

  /**
   * Check memory health
   *
   * Performs both heap and RSS memory checks.
   * Returns a combined result with both checks.
   *
   * @param {string} key - The key to use in the health check result (default: 'memory')
   * @returns {Promise<HealthIndicatorResult>} Health check result with both heap and RSS
   *
   * @example
   * ```typescript
   * const result = await indicator.check('memory');
   * // Returns: {
   * //   memory_heap: { status: 'up' },
   * //   memory_rss: { status: 'up' }
   * // }
   * ```
   */
  async check(key: string = 'memory'): Promise<HealthIndicatorResult> {
    // Get thresholds from config or use defaults
    const heapThreshold = this.config?.memoryThresholds?.heap || this.DEFAULT_HEAP_THRESHOLD;
    const rssThreshold = this.config?.memoryThresholds?.rss || this.DEFAULT_RSS_THRESHOLD;

    // Check both heap and RSS
    const heapResult = await this.terminusMemory.checkHeap(`${key}_heap`, heapThreshold);

    const rssResult = await this.terminusMemory.checkRSS(`${key}_rss`, rssThreshold);

    // Combine results
    return {
      ...heapResult,
      ...rssResult,
    };
  }
}
