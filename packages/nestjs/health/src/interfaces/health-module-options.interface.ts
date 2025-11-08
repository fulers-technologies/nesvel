import type { IHealthConfig } from '@interfaces';

/**
 * Health Module Options Interface
 *
 * Configuration options for registering the Health Module.
 * Combines module-level settings with health check configuration.
 *
 * **Module Settings**:
 * - **isGlobal**: Register module globally in the application
 *
 * **Health Configuration**:
 * - All options from IHealthConfig
 *
 * @interface IHealthModuleOptions
 * @extends {IHealthConfig}
 *
 * @example Basic module registration
 * ```typescript
 * HealthModule.forRoot({
 *   isGlobal: true,
 *   basePath: 'health',
 *   indicators: {
 *     database: true,
 *     memory: true,
 *   },
 * })
 * ```
 *
 * @example Global module with custom configuration
 * ```typescript
 * HealthModule.forRoot({
 *   isGlobal: true,  // Available in all modules
 *   basePath: 'status',
 *   apiTag: 'System Health',
 *   indicators: {
 *     database: true,
 *     memory: true,
 *     disk: true,
 *     http: true,
 *   },
 *   customIndicators: [
 *     RedisHealthIndicator,
 *   ],
 *   memoryThresholds: {
 *     heap: 512 * 1024 * 1024,
 *     rss: 1024 * 1024 * 1024,
 *   },
 * })
 * ```
 *
 * @author Nesvel
 * @since 1.0.0
 */
export interface IHealthModuleOptions extends IHealthConfig {
  /**
   * Register Module Globally
   *
   * When true, the HealthModule is registered as a global module,
   * making it available to all modules in the application without
   * needing to import it explicitly.
   *
   * **Benefits of Global Registration**:
   * - No need to import in feature modules
   * - Single health check endpoint for entire application
   * - Shared health indicators across modules
   *
   * **When to Use**:
   * - ✅ Application-wide health monitoring
   * - ✅ Kubernetes/cloud deployment with central health endpoint
   * - ✅ Single health configuration for all services
   *
   * **When Not to Use**:
   * - ❌ Multiple independent health check endpoints needed
   * - ❌ Module-specific health configurations required
   * - ❌ Micro-frontend or plugin architectures
   *
   * @default false
   *
   * @example Global registration
   * ```typescript
   * @Module({
   *   imports: [
   *     HealthModule.forRoot({
   *       isGlobal: true,  // Available in all modules
   *       basePath: 'health',
   *     }),
   *   ],
   * })
   * export class AppModule {}
   * ```
   *
   * @example Module-scoped registration
   * ```typescript
   * @Module({
   *   imports: [
   *     HealthModule.forRoot({
   *       isGlobal: false,  // Only available where imported
   *       basePath: 'health',
   *     }),
   *   ],
   * })
   * export class FeatureModule {}
   * ```
   */
  isGlobal?: boolean;
}
