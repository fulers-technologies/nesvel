import { HttpStatus } from '@nestjs/common';
import { HttpMethod } from '@nesvel/shared';

import { RouteOptions } from '../interfaces/api-endpoint-options.interface';

/**
 * Health check endpoint preset configuration.
 *
 * Provides pre-configured settings for health monitoring endpoints.
 * Used by load balancers, orchestrators, and monitoring systems to
 * verify service availability and health status.
 *
 * Typically returns 200 OK when healthy or 503 Service Unavailable
 * when the service is degraded or unavailable.
 *
 * @example
 * ```typescript
 * @Route({ preset: EndpointPreset.HEALTH })
 * async healthCheck() {
 *   return { status: 'ok', timestamp: new Date() };
 * }
 * ```
 */
export const HEALTH_PRESET: Partial<RouteOptions> = {
  /**
   * GET method for health checks (safe, idempotent).
   */
  method: HttpMethod.GET,

  /**
   * 200 OK status for successful health checks.
   */
  httpCode: HttpStatus.OK,

  /**
   * Documentation configuration.
   */
  documentation: {
    summary: 'Health check',
    description: 'Checks the health and availability of the service',
  },

  /**
   * Response configurations.
   * - 200: Service is healthy and operational
   * - 503: Service is unavailable or degraded
   */
  responses: {
    ok: {
      description: 'Service is healthy',
    },
    serviceUnavailable: 'Service is unavailable',
  },
};
