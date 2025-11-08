/**
 * Disk Thresholds Configuration Interface
 *
 * Configuration for disk storage usage thresholds.
 * Used by DiskHealthIndicator to determine if disk space is acceptable.
 *
 * **Monitoring Approach**:
 * - Percentage-based threshold (0-1 scale)
 * - Checks specific path or current working directory
 *
 * @interface IDiskThresholds
 *
 * @example
 * ```typescript
 * const diskThresholds: IDiskThresholds = {
 *   thresholdPercent: 0.9,  // 90% usage threshold
 *   path: process.cwd(),    // Check current directory
 * };
 * ```
 *
 * @example Multiple paths
 * ```typescript
 * // Check data directory
 * const dataThresholds: IDiskThresholds = {
 *   thresholdPercent: 0.85,  // 85% threshold for data
 *   path: '/var/data',
 * };
 *
 * // Check application directory
 * const appThresholds: IDiskThresholds = {
 *   thresholdPercent: 0.9,   // 90% threshold for app
 *   path: '/app',
 * };
 * ```
 *
 * @author Nesvel
 * @since 1.0.0
 */
export interface IDiskThresholds {
  /**
   * Disk Usage Threshold Percentage
   *
   * Maximum acceptable disk usage as a percentage (0-1 scale).
   * If disk usage exceeds this threshold, health check fails.
   *
   * **Scale**:
   * - 0.0 = 0% usage (empty disk)
   * - 0.5 = 50% usage
   * - 0.9 = 90% usage
   * - 1.0 = 100% usage (full disk)
   *
   * **Recommendations**:
   * - Development: 0.9 (90%)
   * - Production: 0.8-0.85 (80-85%)
   * - Critical systems: 0.7-0.75 (70-75%)
   *
   * **Best Practices**:
   * - Leave buffer space for logs and temp files
   * - Consider application growth patterns
   * - Monitor trends, not just thresholds
   *
   * @default 0.9 (90%)
   *
   * @example
   * ```typescript
   * thresholdPercent: 0.85  // Alert when disk is 85% full
   * ```
   */
  thresholdPercent?: number;

  /**
   * Path to Monitor
   *
   * File system path to check for disk usage.
   * Can be a directory or mount point.
   *
   * **Behavior**:
   * - Checks the disk/partition containing this path
   * - Works with mount points and subdirectories
   * - Follows symlinks to actual location
   *
   * **Common Paths**:
   * - `process.cwd()` - Current working directory
   * - `/app` - Application directory (Docker/K8s)
   * - `/var/data` - Data directory
   * - `/tmp` - Temporary files directory
   * - `/` - Root filesystem
   *
   * @default process.cwd()
   *
   * @example
   * ```typescript
   * path: '/var/data'  // Check data partition
   * ```
   *
   * @example Dynamic path
   * ```typescript
   * path: process.env.DATA_DIR || '/var/data'
   * ```
   */
  path?: string;
}
