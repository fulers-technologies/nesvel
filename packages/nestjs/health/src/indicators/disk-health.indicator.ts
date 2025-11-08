import { Injectable, Inject, Optional } from '@nestjs/common';
import { DiskHealthIndicator as TerminusDiskHealthIndicator } from '@nestjs/terminus';
import type { HealthIndicatorResult } from '@nestjs/terminus';
import type { IHealthIndicator, IHealthConfig } from '@interfaces';

/**
 * Disk Health Indicator
 *
 * Checks the health of disk storage usage.
 * Wraps the @nestjs/terminus DiskHealthIndicator with our IHealthIndicator interface.
 *
 * This indicator checks disk storage usage against a configurable threshold percentage.
 *
 * **Default Configuration**:
 * - Path: `/` (root directory)
 * - Threshold: 90% (0.9)
 *
 * @class DiskHealthIndicator
 * @implements {IHealthIndicator}
 *
 * @example Usage with HealthModule
 * ```typescript
 * @Module({
 *   imports: [
 *     HealthModule.forRoot({
 *       indicators: {
 *         disk: true,  // Enables this indicator
 *       },
 *       diskThresholds: {
 *         path: '/var/data',
 *         thresholdPercent: 0.85,  // 85%
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
 *     "disk": {
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
export class DiskHealthIndicator implements IHealthIndicator {
  /**
   * Default disk path to check (root directory)
   *
   * @private
   * @readonly
   */
  private readonly DEFAULT_PATH = '/';

  /**
   * Default threshold percentage (90%)
   *
   * @private
   * @readonly
   */
  private readonly DEFAULT_THRESHOLD = 0.9;

  /**
   * Constructor
   *
   * Injects the DiskHealthIndicator from @nestjs/terminus and the optional health configuration.
   * The configuration is used to override default disk thresholds and path.
   *
   * @param {TerminusDiskHealthIndicator} terminusDisk - The disk health indicator from Terminus
   * @param {IHealthConfig} [config] - Optional health module configuration for disk thresholds
   */
  constructor(
    private readonly terminusDisk: TerminusDiskHealthIndicator,
    @Optional()
    @Inject('HEALTH_MODULE_CONFIG')
    private readonly config?: IHealthConfig,
  ) {}

  /**
   * Check disk health
   *
   * Performs a disk storage check against the configured threshold.
   *
   * @param {string} key - The key to use in the health check result (default: 'disk')
   * @returns {Promise<HealthIndicatorResult>} Health check result
   *
   * @example
   * ```typescript
   * const result = await indicator.check('disk');
   * // Returns: { disk: { status: 'up' } }
   * ```
   */
  async check(key: string = 'disk'): Promise<HealthIndicatorResult> {
    // Get thresholds from config or use defaults
    const path = this.config?.diskThresholds?.path || this.DEFAULT_PATH;
    const thresholdPercent =
      this.config?.diskThresholds?.thresholdPercent || this.DEFAULT_THRESHOLD;

    return this.terminusDisk.checkStorage(key, {
      path,
      thresholdPercent,
    });
  }
}
