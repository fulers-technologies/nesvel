import { Injectable, Inject, Optional } from '@nestjs/common';
import { HttpHealthIndicator as TerminusHttpHealthIndicator } from '@nestjs/terminus';
import type { HealthIndicatorResult } from '@nestjs/terminus';
import type { IHealthIndicator, IHealthConfig } from '@interfaces';

/**
 * HTTP Health Indicator
 *
 * Checks the health of external HTTP services.
 * Wraps the @nestjs/terminus HttpHealthIndicator with our IHealthIndicator interface.
 *
 * This indicator performs HTTP requests to external services to verify their availability.
 *
 * **Default Configuration**:
 * - Timeout: 3000ms (3 seconds)
 *
 * @class HttpHealthIndicator
 * @implements {IHealthIndicator}
 *
 * @example Usage with HealthModule
 * ```typescript
 * @Module({
 *   imports: [
 *     HealthModule.forRoot({
 *       indicators: {
 *         http: true,  // Enables this indicator
 *       },
 *       httpTimeout: 5000,  // 5 second timeout
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
 *     "http": {
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
export class HttpHealthIndicator implements IHealthIndicator {
  /**
   * Default HTTP timeout (3 seconds)
   *
   * @private
   * @readonly
   */
  private readonly DEFAULT_TIMEOUT = 3000;

  /**
   * Constructor
   *
   * Injects the HttpHealthIndicator from @nestjs/terminus and the optional health configuration.
   * The configuration is used to override default HTTP timeout.
   *
   * @param {TerminusHttpHealthIndicator} terminusHttp - The HTTP health indicator from Terminus
   * @param {IHealthConfig} [config] - Optional health module configuration for HTTP timeout
   */
  constructor(
    private readonly terminusHttp: TerminusHttpHealthIndicator,
    @Optional()
    @Inject('HEALTH_MODULE_CONFIG')
    private readonly config?: IHealthConfig,
  ) {}

  /**
   * Check HTTP service health
   *
   * Performs an HTTP ping check to verify external service availability.
   *
   * **Note**: This is a generic HTTP check. For specific URLs, you should create
   * custom indicators or use the `customChecks` configuration option.
   *
   * @param {string} key - The key to use in the health check result (default: 'http')
   * @param {string} [url] - Optional URL to check. If not provided, returns a placeholder result.
   * @returns {Promise<HealthIndicatorResult>} Health check result
   *
   * @example
   * ```typescript
   * const result = await indicator.check('http', 'https://api.example.com/health');
   * // Returns: { http: { status: 'up' } }
   * ```
   *
   * @example Without URL (placeholder)
   * ```typescript
   * const result = await indicator.check('http');
   * // Returns: { http: { status: 'up', message: 'No URL configured' } }
   * ```
   */
  async check(key: string = 'http', url?: string): Promise<HealthIndicatorResult> {
    // If no URL provided, return a placeholder result
    if (!url) {
      return {
        [key]: {
          status: 'up',
          message: 'No URL configured for HTTP health check',
        },
      };
    }

    // Get timeout from config or use default
    const timeout = this.config?.httpTimeout || this.DEFAULT_TIMEOUT;

    // Perform HTTP ping check
    return this.terminusHttp.pingCheck(key, url, { timeout });
  }
}
