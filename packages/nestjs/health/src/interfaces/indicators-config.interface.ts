/**
 * Built-in Indicators Configuration Interface
 *
 * Configuration for enabling/disabling built-in health indicators.
 *
 * **Available Indicators**:
 * - **Database**: MikroORM database connectivity check
 * - **Memory**: Heap and RSS memory usage monitoring
 * - **Disk**: Disk storage usage monitoring
 * - **HTTP**: External HTTP service health checks
 *
 * @interface IIndicatorsConfig
 *
 * @example
 * ```typescript
 * const indicatorsConfig: IIndicatorsConfig = {
 *   database: true,  // Enable database checks
 *   memory: true,    // Enable memory checks
 *   disk: true,      // Enable disk checks
 *   http: false,     // Disable HTTP checks
 * };
 * ```
 *
 * @author Nesvel
 * @since 1.0.0
 */
export interface IIndicatorsConfig {
  /**
   * Enable Memory Health Checks
   *
   * Enables heap and RSS memory usage monitoring.
   * Compares current memory usage against configurable thresholds.
   *
   * **Checks**:
   * - Heap memory usage (default: 150 MB threshold)
   * - RSS memory usage (default: 300 MB threshold)
   *
   * **Use Case**: Monitor memory leaks and ensure adequate resources
   *
   * @default true
   *
   * @example
   * ```typescript
   * memory: true  // Enables MemoryHealthIndicator
   * ```
   */
  memory?: boolean;

  /**
   * Enable Disk Health Check
   *
   * Enables disk storage usage monitoring.
   * Checks available disk space against configurable percentage threshold.
   *
   * **Checks**:
   * - Disk usage percentage (default: 90% threshold)
   * - Available space vs total space
   *
   * **Use Case**: Prevent disk space exhaustion
   *
   * @default true
   *
   * @example
   * ```typescript
   * disk: true  // Enables DiskHealthIndicator
   * ```
   */
  disk?: boolean;

  /**
   * Enable HTTP Health Check
   *
   * Enables external HTTP service health checks.
   * Useful for monitoring dependencies on external APIs.
   *
   * **Requirements**:
   * - @nestjs/axios must be installed
   * - axios must be installed
   *
   * **Checks**:
   * - External service availability
   * - Response time monitoring
   * - Response status validation
   *
   * **Use Case**: Monitor external service dependencies
   *
   * @default false
   *
   * @example
   * ```typescript
   * http: true  // Enables HttpHealthIndicator
   * ```
   */
  http?: boolean;
}
