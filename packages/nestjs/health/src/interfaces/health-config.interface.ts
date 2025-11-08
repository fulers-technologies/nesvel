import type { Type } from '@nestjs/common';
import type { IHealthIndicator } from '@interfaces';
import type { IProbeConfig } from '@interfaces';
import type { IIndicatorsConfig } from '@interfaces';
import type { IMemoryThresholds } from '@interfaces';
import type { IDiskThresholds } from '@interfaces';
import type { HealthCheckFunction } from '@interfaces';

/**
 * Health Configuration Interface
 *
 * Core configuration options for health checks and monitoring.
 * Used to configure health indicators, thresholds, and custom checks.
 *
 * **Configuration Sections**:
 * - **Routing**: Base path, probe paths, API tags
 * - **Probes**: Enable/disable liveness, readiness, startup
 * - **Indicators**: Built-in and custom health indicators
 * - **Thresholds**: Memory and disk usage limits
 * - **Custom Checks**: User-defined health check functions
 *
 * @interface IHealthConfig
 *
 * @example Basic configuration
 * ```typescript
 * const healthConfig: IHealthConfig = {
 *   basePath: 'health',
 *   indicators: {
 *     database: true,
 *     memory: true,
 *     disk: true,
 *   },
 * };
 * ```
 *
 * @example Advanced configuration
 * ```typescript
 * const healthConfig: IHealthConfig = {
 *   basePath: 'status',
 *   apiTag: 'System Health',
 *   probes: {
 *     liveness: true,
 *     readiness: true,
 *     startup: false,
 *   },
 *   indicators: {
 *     database: true,
 *     memory: true,
 *     disk: true,
 *     http: true,
 *   },
 *   customIndicators: [
 *     RedisHealthIndicator,
 *     KafkaHealthIndicator,
 *   ],
 *   memoryThresholds: {
 *     heap: 512 * 1024 * 1024,   // 512 MB
 *     rss: 1024 * 1024 * 1024,   // 1 GB
 *   },
 *   diskThresholds: {
 *     thresholdPercent: 0.85,    // 85%
 *     path: '/var/data',
 *   },
 *   customChecks: [
 *     async () => ({ version: { value: '1.0.0' } }),
 *   ],
 * };
 * ```
 *
 * @author Nesvel
 * @since 1.0.0
 */
export interface IHealthConfig {
  /**
   * Base Route Path
   *
   * Base path for all health check endpoints.
   * All probe endpoints will be relative to this base path.
   *
   * **Default**: `'health'`
   *
   * **Examples**:
   * - `'health'` → `/health`, `/health/liveness`, `/health/readiness`
   * - `'status'` → `/status`, `/status/liveness`, `/status/readiness`
   * - `'api/health'` → `/api/health`, `/api/health/liveness`
   *
   * @default 'health'
   *
   * @example
   * ```typescript
   * basePath: 'health'  // Standard health endpoint
   * basePath: 'status'  // Alternative status endpoint
   * basePath: 'healthz' // Kubernetes-style naming
   * ```
   */
  basePath?: string;

  /**
   * Swagger API Tag
   *
   * Tag name for grouping health endpoints in Swagger/OpenAPI documentation.
   *
   * **Default**: `'Health'`
   *
   * @default 'Health'
   *
   * @example
   * ```typescript
   * apiTag: 'Health'          // Default grouping
   * apiTag: 'System Status'   // Custom grouping
   * apiTag: 'Monitoring'      // Alternative grouping
   * ```
   */
  apiTag?: string;

  /**
   * Liveness Probe Path
   *
   * Relative path for the liveness probe endpoint.
   * Combined with basePath to form full endpoint URL.
   *
   * **Default**: `'liveness'`
   *
   * **Full URL**: `/${basePath}/${livenessPath}`
   *
   * @default 'liveness'
   *
   * @example
   * ```typescript
   * livenessPath: 'liveness'  // /health/liveness
   * livenessPath: 'alive'     // /health/alive
   * livenessPath: 'live'      // /health/live
   * ```
   */
  livenessPath?: string;

  /**
   * Readiness Probe Path
   *
   * Relative path for the readiness probe endpoint.
   * Combined with basePath to form full endpoint URL.
   *
   * **Default**: `'readiness'`
   *
   * **Full URL**: `/${basePath}/${readinessPath}`
   *
   * @default 'readiness'
   *
   * @example
   * ```typescript
   * readinessPath: 'readiness'  // /health/readiness
   * readinessPath: 'ready'      // /health/ready
   * ```
   */
  readinessPath?: string;

  /**
   * Startup Probe Path
   *
   * Relative path for the startup probe endpoint.
   * Combined with basePath to form full endpoint URL.
   *
   * **Default**: `'startup'`
   *
   * **Full URL**: `/${basePath}/${startupPath}`
   *
   * @default 'startup'
   *
   * @example
   * ```typescript
   * startupPath: 'startup'   // /health/startup
   * startupPath: 'started'   // /health/started
   * startupPath: 'init'      // /health/init
   * ```
   */
  startupPath?: string;

  /**
   * Probe Configuration
   *
   * Enable or disable specific probe endpoints.
   * Allows selective activation of liveness, readiness, and startup probes.
   *
   * @see {@link IProbeConfig}
   *
   * @example
   * ```typescript
   * probes: {
   *   liveness: true,
   *   readiness: true,
   *   startup: false,  // Disable startup probe
   * }
   * ```
   */
  probes?: IProbeConfig;

  /**
   * Custom Health Indicators
   *
   * Array of custom health indicator classes to register.
   * Each indicator must implement the IHealthIndicator interface.
   *
   * **Note**: Indicators can also be registered using `HealthModule.registerIndicator()`
   *
   * @see {@link IHealthIndicator}
   *
   * @example
   * ```typescript
   * customIndicators: [
   *   RedisHealthIndicator,
   *   KafkaHealthIndicator,
   *   ElasticsearchHealthIndicator,
   * ]
   * ```
   */
  customIndicators?: Type<IHealthIndicator>[];

  /**
   * Built-in Indicators Configuration
   *
   * Enable or disable built-in health indicators.
   * Includes database, memory, disk, and HTTP service checks.
   *
   * @see {@link IIndicatorsConfig}
   *
   * @example
   * ```typescript
   * indicators: {
   *   database: true,  // Enable MikroORM check
   *   memory: true,    // Enable memory check
   *   disk: true,      // Enable disk check
   *   http: false,     // Disable HTTP check
   * }
   * ```
   */
  indicators?: IIndicatorsConfig;

  /**
   * Memory Thresholds Configuration
   *
   * Configure heap and RSS memory usage thresholds in bytes.
   * Used by MemoryHealthIndicator to determine acceptable memory levels.
   *
   * @see {@link IMemoryThresholds}
   *
   * @example
   * ```typescript
   * memoryThresholds: {
   *   heap: 512 * 1024 * 1024,   // 512 MB
   *   rss: 1024 * 1024 * 1024,   // 1 GB
   * }
   * ```
   */
  memoryThresholds?: IMemoryThresholds;

  /**
   * Disk Thresholds Configuration
   *
   * Configure disk usage threshold percentage and monitored path.
   * Used by DiskHealthIndicator to determine acceptable disk space levels.
   *
   * @see {@link IDiskThresholds}
   *
   * @example
   * ```typescript
   * diskThresholds: {
   *   thresholdPercent: 0.85,  // 85% usage threshold
   *   path: '/var/data',       // Monitor data directory
   * }
   * ```
   */
  diskThresholds?: IDiskThresholds;

  /**
   * HTTP Request Timeout
   *
   * Timeout in milliseconds for HTTP health checks.
   * Applied to external service health check requests.
   *
   * **Default**: 3000 (3 seconds)
   *
   * **Recommendations**:
   * - Fast services: 1000-2000ms
   * - Normal services: 3000-5000ms
   * - Slow services: 5000-10000ms
   *
   * @default 3000
   *
   * @example
   * ```typescript
   * httpTimeout: 5000  // 5 second timeout
   * ```
   */
  httpTimeout?: number;

  /**
   * Custom Health Check Functions
   *
   * Array of custom health check functions for the full health endpoint.
   * Executed alongside built-in indicators on GET /health.
   *
   * @see {@link HealthCheckFunction}
   *
   * @example
   * ```typescript
   * customChecks: [
   *   async () => ({ version: { value: '1.0.0' } }),
   *   async () => ({ uptime: { value: process.uptime() } }),
   * ]
   * ```
   */
  customChecks?: HealthCheckFunction[];

  /**
   * Liveness Health Check Functions
   *
   * Array of custom health check functions for the liveness probe.
   * Executed on GET /health/liveness.
   *
   * **Best Practice**: Keep lightweight, check internal state only
   *
   * @see {@link HealthCheckFunction}
   *
   * @example
   * ```typescript
   * livenessChecks: [
   *   async () => ({ app: { status: 'up', uptime: process.uptime() } }),
   * ]
   * ```
   */
  livenessChecks?: HealthCheckFunction[];

  /**
   * Readiness Health Check Functions
   *
   * Array of custom health check functions for the readiness probe.
   * Executed on GET /health/readiness.
   *
   * **Best Practice**: Check all critical dependencies
   *
   * @see {@link HealthCheckFunction}
   *
   * @example
   * ```typescript
   * readinessChecks: [
   *   async () => {
   *     const cacheOk = await cache.ping();
   *     return { cache: { status: cacheOk ? 'up' : 'down' } };
   *   },
   * ]
   * ```
   */
  readinessChecks?: HealthCheckFunction[];

  /**
   * Startup Health Check Functions
   *
   * Array of custom health check functions for the startup probe.
   * Executed on GET /health/startup.
   *
   * **Best Practice**: Verify initialization completion
   *
   * @see {@link HealthCheckFunction}
   *
   * @example
   * ```typescript
   * startupChecks: [
   *   async () => {
   *     const initialized = await checkInitialization();
   *     return { startup: { status: initialized ? 'up' : 'down' } };
   *   },
   * ]
   * ```
   */
  startupChecks?: HealthCheckFunction[];
}
