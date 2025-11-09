import { Module } from '@nestjs/common';
import { HttpModule } from '@nestjs/axios';
import { TerminusModule } from '@nestjs/terminus';
import type { DynamicModule } from '@nestjs/common';

import {
  DiskHealthIndicator,
  HttpHealthIndicator,
  MemoryHealthIndicator,
  TerminusDiskHealthIndicator,
  TerminusHttpHealthIndicator,
  TerminusMemoryHealthIndicator,
} from '@indicators';
import { HEALTH_MODULE_CONFIG } from '@constants';
import { createHealthController } from '@factories';
import { IndicatorRegistryService } from './services';
import type { IHealthModuleOptions, IIndicatorRegistrationOptions } from '@interfaces';

/**
 * Health Module
 *
 * Production-ready health check module for NestJS applications.
 * Provides comprehensive monitoring for all critical components.
 *
 * Features:
 * - Database health checks (MikroORM)
 * - Memory usage monitoring (Heap & RSS)
 * - Disk storage monitoring
 * - HTTP service health checks
 * - Kubernetes-compatible probes (liveness, readiness, startup)
 * - Swagger documentation
 *
 * @module HealthModule
 *
 * @example
 * ```typescript
 * import { HealthModule } from './modules/health/health.module';
 *
 * @Module({
 *   imports: [HealthModule],
 * })
 * export class AppModule {}
 * ```
 *
 * @example Health Check Endpoints
 * ```
 * GET /health            - Full health check
 * GET /health/liveness   - Liveness probe
 * GET /health/readiness  - Readiness probe
 * GET /health/startup    - Startup probe
 * ```
 *
 * @example Kubernetes Configuration
 * ```yaml
 * livenessProbe:
 *   httpGet:
 *     path: /health/liveness
 *     port: 3000
 *   initialDelaySeconds: 30
 *   periodSeconds: 10
 *
 * readinessProbe:
 *   httpGet:
 *     path: /health/readiness
 *     port: 3000
 *   initialDelaySeconds: 5
 *   periodSeconds: 5
 *
 * startupProbe:
 *   httpGet:
 *     path: /health/startup
 *     port: 3000
 *   failureThreshold: 30
 *   periodSeconds: 10
 * ```
 */
@Module({})
export class HealthModule {
  /**
   * Global indicator registry instance
   *
   * Shared across all module instances to manage registered indicators.
   *
   * @private
   * @static
   */
  private static registry = IndicatorRegistryService.make();
  /**
   * Register Health Module with Configuration
   *
   * @param config - Health module configuration
   * @returns Dynamic module
   *
   * @example
   * ```typescript
   * import { HealthModule } from './modules/health';
   * import { healthConfig } from './config/health.config';
   *
   * @Module({
   *   imports: [
   *     HealthModule.forRoot(healthConfig)
   *   ]
   * })
   * export class AppModule {}
   * ```
   */
  static forRoot(config: IHealthModuleOptions = {}): DynamicModule {
    // Merge with defaults
    const mergedConfig: IHealthModuleOptions = {
      basePath: config.basePath || 'health',
      probes: {
        startup: config.probes?.startup !== false,
        liveness: config.probes?.liveness !== false,
        readiness: config.probes?.readiness !== false,
      },
      indicators: {
        disk: config.indicators?.disk !== false,
        http: config.indicators?.http === true,
        memory: config.indicators?.memory !== false,
      },
      httpTimeout: config.httpTimeout,
      diskThresholds: config.diskThresholds,
      customChecks: config.customChecks || [],
      startupChecks: config.startupChecks || [],
      memoryThresholds: config.memoryThresholds,
      livenessChecks: config.livenessChecks || [],
      readinessChecks: config.readinessChecks || [],
      customIndicators: config.customIndicators || [],
    };

    // Build providers array - always include Terminus indicators
    const providers: any[] = [
      TerminusDiskHealthIndicator,
      TerminusHttpHealthIndicator,
      TerminusMemoryHealthIndicator,
    ];

    if (mergedConfig.indicators?.memory) {
      providers.push(MemoryHealthIndicator);
      HealthModule.registry.register({
        indicator: MemoryHealthIndicator,
        name: 'memory',
      });
    }

    if (mergedConfig.indicators?.disk) {
      providers.push(DiskHealthIndicator);
      HealthModule.registry.register({
        indicator: DiskHealthIndicator,
        name: 'disk',
      });
    }

    if (mergedConfig.indicators?.http) {
      providers.push(HttpHealthIndicator);
      HealthModule.registry.register({
        indicator: HttpHealthIndicator,
        name: 'http',
      });
    }

    // Add custom indicators
    if (mergedConfig.customIndicators) {
      providers.push(...mergedConfig.customIndicators);
    }

    // Add indicator registry service
    providers.push({
      provide: IndicatorRegistryService,
      useValue: HealthModule.registry,
    });

    // Add configuration provider
    providers.push({
      provide: HEALTH_MODULE_CONFIG,
      useValue: mergedConfig,
    });

    // Add all registered indicators from registry
    const registeredIndicators = HealthModule.registry.getAllIndicatorClasses();
    providers.push(...registeredIndicators);

    // Create dynamic controller with config
    const DynamicController = createHealthController(mergedConfig);

    return {
      module: HealthModule,
      imports: [TerminusModule, HttpModule],
      controllers: [DynamicController],
      providers,
      exports: providers.filter((p) => typeof p !== 'object' || p.provide !== HEALTH_MODULE_CONFIG),
    };
  }

  /**
   * Register a custom health indicator
   *
   * Registers a health indicator to be used across the application.
   * The indicator will be automatically available in the health controller.
   *
   * This method follows the same pattern as SearchModule.registerIndex() from
   * @nesvel/nestjs-search, providing a clean way to register custom indicators
   * without manual dependency injection.
   *
   * @static
   * @param {IIndicatorRegistrationOptions} options - Indicator registration options
   * @returns {DynamicModule} A dynamic module with the registered indicator
   *
   * @example Register a custom indicator
   * ```typescript
   * @Module({
   *   imports: [
   *     HealthModule.forRoot({ ... }),
   *     HealthModule.registerIndicator({
   *       indicator: RedisHealthIndicator,
   *       name: 'redis',
   *     }),
   *   ],
   * })
   * export class AppModule {}
   * ```
   *
   * @example Register multiple indicators
   * ```typescript
   * @Module({
   *   imports: [
   *     HealthModule.forRoot({ ... }),
   *     HealthModule.registerIndicator({
   *       indicator: RedisHealthIndicator,
   *       name: 'redis',
   *     }),
   *     HealthModule.registerIndicator({
   *       indicator: KafkaHealthIndicator,
   *       name: 'kafka',
   *     }),
   *   ],
   * })
   * export class AppModule {}
   * ```
   */
  static registerIndicator(options: IIndicatorRegistrationOptions): DynamicModule {
    // Register the indicator in the global registry
    HealthModule.registry.register(options);

    return {
      module: HealthModule,
      providers: [options.indicator],
      exports: [options.indicator],
    };
  }

  /**
   * Register multiple custom health indicators
   *
   * Convenience method to register multiple health indicators at once.
   * Functionally equivalent to calling registerIndicator() multiple times.
   *
   * @static
   * @param {IIndicatorRegistrationOptions[]} optionsArray - Array of indicator registration options
   * @returns {DynamicModule} A dynamic module with all registered indicators
   *
   * @example
   * ```typescript
   * @Module({
   *   imports: [
   *     HealthModule.forRoot({ ... }),
   *     HealthModule.registerIndicators([
   *       { indicator: RedisHealthIndicator, name: 'redis' },
   *       { indicator: KafkaHealthIndicator, name: 'kafka' },
   *       { indicator: ElasticsearchHealthIndicator, name: 'elasticsearch' },
   *     ]),
   *   ],
   * })
   * export class AppModule {}
   * ```
   */
  static registerIndicators(optionsArray: IIndicatorRegistrationOptions[]): DynamicModule {
    // Register all indicators in the global registry
    HealthModule.registry.registerMultiple(optionsArray);

    // Extract all indicator classes
    const indicators = optionsArray.map((options) => options.indicator);

    return {
      module: HealthModule,
      providers: indicators,
      exports: indicators,
    };
  }
}
