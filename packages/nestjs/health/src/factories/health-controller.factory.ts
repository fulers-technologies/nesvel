import { ModuleRef } from '@nestjs/core';
import type { HealthCheckResult } from '@nestjs/terminus';
import { Controller, Get, Inject, Type } from '@nestjs/common';
import { HealthCheck, HealthCheckService } from '@nestjs/terminus';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';

import { InjectHealthService } from '@/decorators';
import { IndicatorRegistryService } from '@services';
import { HEALTH_MODULE_CONFIG } from '@constants';
import type { IHealthConfig, IHealthIndicator } from '@interfaces';

/**
 * Health Controller Factory
 *
 * Creates a dynamic health controller with fully configurable routes, tags, and endpoints.
 * Follows NestJS decorator composition patterns for production use.
 *
 * @param config - Health module configuration
 * @returns Configured controller class
 *
 * @example
 * ```typescript
 * const controller = createHealthController({
 *   basePath: 'status',
 *   apiTag: 'System Status',
 *   livenessPath: 'alive',
 *   readinessPath: 'ready',
 * });
 * ```
 */
export function createHealthController(config: IHealthConfig): Type<any> {
  const {
    probes = {},
    apiTag = 'Health',
    basePath = 'health',
    startupPath = 'startup',
    livenessPath = 'liveness',
    readinessPath = 'readiness',
  } = config;

  /**
   * Dynamic Health Controller
   *
   * Provides health check endpoints with dependency injection support.
   */
  @ApiTags(apiTag)
  @Controller(basePath)
  class DynamicHealthController {
    constructor(
      @InjectHealthService()
      private readonly health: HealthCheckService,
      @Inject(HEALTH_MODULE_CONFIG)
      private readonly moduleConfig: IHealthConfig,
      private readonly moduleRef: ModuleRef,
      private readonly registry: IndicatorRegistryService,
    ) {}

    /**
     * Full Health Check
     *
     * Performs comprehensive health checks on all enabled components.
     */
    @Get()
    @HealthCheck()
    @ApiOperation({
      summary: 'Full health check',
      description: 'Comprehensive health check including all enabled indicators',
    })
    @ApiResponse({
      status: 200,
      description: 'All health checks passed',
      schema: {
        type: 'object',
        properties: {
          status: { type: 'string', example: 'ok' },
          info: { type: 'object' },
          error: { type: 'object' },
          details: { type: 'object' },
        },
      },
    })
    @ApiResponse({
      status: 503,
      description: 'One or more health checks failed',
    })
    async check(): Promise<HealthCheckResult> {
      const checks: Array<() => Promise<any>> = [];

      // Add all registered indicators from registry
      const registeredIndicators = this.registry.getAll();
      for (const registration of registeredIndicators) {
        const indicator = this.getIndicatorInstance(registration.indicator);
        if (indicator && indicator.check) {
          checks.push(() => indicator.check(registration.name));
        }
      }

      // Add custom checks
      if (this.moduleConfig.customChecks?.length) {
        checks.push(...this.moduleConfig.customChecks);
      }

      return this.health.check(checks);
    }

    /**
     * Liveness Probe
     *
     * Lightweight check to verify application is running.
     * Used by orchestrators to restart unhealthy containers.
     */
    @Get(livenessPath)
    @HealthCheck()
    @ApiOperation({
      summary: 'Liveness probe',
      description: 'Lightweight check to verify application is running (no external dependencies)',
    })
    @ApiResponse({
      status: 200,
      description: 'Application is alive',
    })
    @ApiResponse({
      status: 503,
      description: 'Application is not responsive',
    })
    async checkLiveness(): Promise<HealthCheckResult> {
      const checks: Array<() => Promise<any>> = [];

      // Add custom liveness checks (lightweight only)
      if (this.moduleConfig.livenessChecks?.length) {
        checks.push(...this.moduleConfig.livenessChecks);
      }

      return this.health.check(checks);
    }

    /**
     * Readiness Probe
     *
     * Checks if application is ready to serve requests.
     * Includes checks for external dependencies.
     */
    @Get(readinessPath)
    @HealthCheck()
    @ApiOperation({
      summary: 'Readiness probe',
      description: 'Check if application is ready to serve requests (includes dependencies)',
    })
    @ApiResponse({
      status: 200,
      description: 'Application is ready',
    })
    @ApiResponse({
      status: 503,
      description: 'Application is not ready',
    })
    async checkReadiness(): Promise<HealthCheckResult> {
      const checks: Array<() => Promise<any>> = [];

      // Add all registered indicators from registry (readiness includes all checks)
      const registeredIndicators = this.registry.getAll();
      for (const registration of registeredIndicators) {
        const indicator = this.getIndicatorInstance(registration.indicator);
        if (indicator && indicator.check) {
          checks.push(() => indicator.check(registration.name));
        }
      }

      // Add custom readiness checks
      if (this.moduleConfig.readinessChecks?.length) {
        checks.push(...this.moduleConfig.readinessChecks);
      }

      return this.health.check(checks);
    }

    /**
     * Startup Probe
     *
     * Checks if application has completed initialization.
     * Used by orchestrators for slow-starting applications.
     */
    @Get(startupPath)
    @HealthCheck()
    @ApiOperation({
      summary: 'Startup probe',
      description: 'Check if application has completed initialization',
    })
    @ApiResponse({
      status: 200,
      description: 'Application has started successfully',
    })
    @ApiResponse({
      status: 503,
      description: 'Application is still starting',
    })
    async checkStartup(): Promise<HealthCheckResult> {
      const checks: Array<() => Promise<any>> = [];

      // Add all registered indicators from registry (startup includes all checks)
      const registeredIndicators = this.registry.getAll();
      for (const registration of registeredIndicators) {
        const indicator = this.getIndicatorInstance(registration.indicator);
        if (indicator && indicator.check) {
          checks.push(() => indicator.check(registration.name));
        }
      }

      // Add custom startup checks
      if (this.moduleConfig.startupChecks?.length) {
        checks.push(...this.moduleConfig.startupChecks);
      }

      return this.health.check(checks);
    }

    /**
     * Get indicator instance by class
     *
     * Retrieves the indicator instance from the dependency injection container.
     * Uses ModuleRef to dynamically resolve registered indicators.
     *
     * @private
     * @param indicatorClass - Indicator class type
     * @returns Indicator instance or undefined
     */
    private getIndicatorInstance(
      indicatorClass: Type<IHealthIndicator>,
    ): IHealthIndicator | undefined {
      try {
        // Use ModuleRef to get the indicator instance from DI container
        // This works because all registered indicators are added as providers
        return this.moduleRef.get(indicatorClass, { strict: false });
      } catch (error: Error | any) {
        // Indicator not found in DI container - skip silently
        return undefined;
      }
    }
  }

  // Conditionally remove probe methods if disabled
  if (probes.liveness === false) {
    (DynamicHealthController.prototype as any).checkLiveness = undefined;
  }

  if (probes.readiness === false) {
    (DynamicHealthController.prototype as any).checkReadiness = undefined;
  }

  if (probes.startup === false) {
    (DynamicHealthController.prototype as any).checkStartup = undefined;
  }

  return DynamicHealthController;
}
