import { Inject, Injectable } from '@nestjs/common';
import { TerminusMikroOrmHealthIndicator } from '@nesvel/nestjs-health';
import type { IHealthConfig, HealthIndicatorResult, IHealthIndicator } from '@nesvel/nestjs-health';

/**
 * Database Health Indicator
 *
 * Checks the health of the MikroORM database connection.
 * Wraps the @nestjs/terminus TerminusMikroOrmHealthIndicator with our IHealthIndicator interface.
 *
 * This indicator performs a ping check to verify database connectivity.
 *
 * @class DatabaseHealthIndicator
 * @implements {IHealthIndicator}
 *
 * @example Usage with HealthModule
 * ```typescript
 * @Module({
 *   imports: [
 *     HealthModule.forRoot({
 *       indicators: {
 *         database: true,  // Enables this indicator
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
 *     "database": {
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
export class DatabaseHealthIndicator implements IHealthIndicator {
  /**
   * Constructor
   *
   * Injects the TerminusMikroOrmHealthIndicator from @nestjs/terminus.
   *
   * @param {TerminusMikroOrmHealthIndicator} mikroOrm - The MikroORM health indicator from Terminus
   */
  constructor(
    @Inject('HEALTH_MODULE_CONFIG')
    private readonly config: IHealthConfig,
    private readonly mikroOrm: TerminusMikroOrmHealthIndicator,
  ) {}

  /**
   * Check database health
   *
   * Performs a ping check on the MikroORM database connection.
   *
   * @param {string} key - The key to use in the health check result (default: 'database')
   * @returns {Promise<HealthIndicatorResult>} Health check result
   *
   * @example
   * ```typescript
   * const result = await indicator.check('database');
   * // Returns: { database: { status: 'up' } }
   * ```
   */
  async check(key: string = 'database'): Promise<HealthIndicatorResult> {
    return this.mikroOrm.pingCheck(key);
  }
}
